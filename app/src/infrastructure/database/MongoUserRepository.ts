import { injectable } from 'tsyringe'
import { UserRepositoryPort } from '../../domain/port/UserRepositoryPort'
import { UserModel } from './schema/MongooseSchemas'
import { User } from '../../domain/model/user/User'
import { Wallet } from '../../domain/model/wallet/Wallet'
import { Watchlist } from '../../domain/model/watchlist/Watchlist'
import { Transaction } from '../../domain/model/wallet/Transaction'
import { WatchlistItem } from '../../domain/model/watchlist/WatchlistItem'
import { Profile } from '../../domain/model/user/Profile'
import mongoose from 'mongoose'
import { TransactionType } from '../../domain/model/wallet/TransactionType'

@injectable()
export class MongoUserRepository implements UserRepositoryPort {
  ready: Promise<void>
  constructor() {
    const uri = 'mongodb://mongodb:27017/dbsa'
    this.ready = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then(() => {
        console.log('Connected to MongoDB')
      })
      .catch(err => {
        console.error('MongoDB connection error:', err)
        throw err
      })
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const doc = await UserModel.findOne({ userId }).select('profile -_id').lean().exec()

      if (!doc || !doc.profile) return null

      return new Profile(doc.profile.name, doc.profile.surname, new Date(doc.profile.dateOfBirth))
    } catch (error) {
      throw new Error(`Failed to get profile: ${error}`)
    }
  }
  async saveUser(user: User, wallet: Wallet, watchlist: Watchlist): Promise<void> {
    const userProfile = user.getProfile()
    const updateData: {
      email: string
      wallet: {
        id: string
        transactions: {
          transactionId: string
          cryptoId: string
          quantity: number
          type: string
          doneAt: Date
          priceAtPurchase: number
        }[]
      }
      watchlist: {
        id: string
        items: {
          itemId: string
          cryptoId: string
          addedAt: Date
        }[]
      }
      profile?: {
        name: string
        surname: string
        dateOfBirth: Date
      }
    } = {
      email: user.email,
      wallet: {
        id: wallet.id,
        transactions: wallet.getTransactions().map(tx => ({
          transactionId: tx.transactionId,
          cryptoId: tx.cryptoId,
          quantity: tx.quantity,
          type: tx.type,
          doneAt: tx.doneAt,
          priceAtPurchase: tx.priceAtPurchase
        }))
      },
      watchlist: {
        id: watchlist.id,
        items: watchlist.getItems().map(item => ({
          itemId: item.itemId,
          cryptoId: item.cryptoId,
          addedAt: item.addedAt
        }))
      },
      profile: userProfile
        ? {
            name: userProfile.name,
            surname: userProfile.surname,
            dateOfBirth: userProfile.dateOfBirth
          }
        : undefined
    }

    await UserModel.updateOne(
      { userId: user.userId },
      { $set: updateData },
      { upsert: true, runValidators: true }
    ).exec()
  }

  /**
   * Retrieves a user by userId.
   * @param userId - The ID of the user.
   * @returns The User domain entity or null if not found.
   */
  async getUser(
    userId: string
  ): Promise<{ user: User; watchlist: Watchlist; wallet: Wallet } | null> {
    try {
      const doc = await UserModel.findOne({ userId })
        .select('-__v -_id -createdAt -updatedAt')
        .lean()
        .exec()
      if (!doc) return null

      const user = new User(doc.userId, doc.email, doc.wallet.id, doc.watchlist.id)

      if (doc.profile) {
        user.createProfile(doc.profile.name, doc.profile.surname, new Date(doc.profile.dateOfBirth))
      }

      const wallet = new Wallet(
        doc.wallet.id,
        doc.wallet.transactions.map(
          (tx: {
            transactionId: string
            cryptoId: string
            quantity: number
            type: string
            doneAt: Date
            priceAtPurchase: number
          }) => this.mapTransaction(tx)
        )
      )

      const watchlist = new Watchlist(
        doc.watchlist.id,
        doc.watchlist.items.map((item: { itemId: string; cryptoId: string; addedAt: Date }) =>
          this.mapWatchlistItem(item)
        )
      )

      return { user, watchlist, wallet }
    } catch (error) {
      throw new Error(`Failed to get user: ${error}`)
    }
  }

  /**
   * Maps a transaction document from MongoDB to the Transaction domain entity.
   * @param tx - The transaction document from the database.
   * @returns A Transaction domain entity.
   */
  private mapTransaction(tx: {
    transactionId: string
    cryptoId: string
    quantity: number
    type: string
    doneAt: Date
    priceAtPurchase: number
  }): Transaction {
    return new Transaction(
      tx.transactionId,
      tx.cryptoId,
      tx.quantity,
      TransactionType[tx.type as keyof typeof TransactionType],
      new Date(tx.doneAt),
      tx.priceAtPurchase
    )
  }

  /**
   * Maps a watchlist item document from MongoDB to the WatchlistItem domain entity.
   * @param item - The watchlist item document from the database.
   * @returns A WatchlistItem domain entity.
   */
  private mapWatchlistItem(item: {
    itemId: string
    cryptoId: string
    addedAt: Date
  }): WatchlistItem {
    return new WatchlistItem(item.itemId, item.cryptoId, new Date(item.addedAt))
  }

  /**
   * Updates the profile of a user.
   * @param userId - The ID of the user.
   * @param profile - The updated UserProfile domain entity.
   */
  async updateProfile(userId: string, profile: Profile): Promise<void> {
    try {
      await UserModel.updateOne(
        { userId },
        {
          $set: {
            'profile.name': profile.name,
            'profile.surname': profile.surname,
            'profile.dateOfBirth': profile.dateOfBirth
          }
        },
        { runValidators: true }
      ).exec()
    } catch (error) {
      throw new Error(`Failed to update profile: ${error}`)
    }
  }

  /**
   * Retrieves the Wallet of a user.
   * @param userId - The ID of the user.
   * @returns The Wallet domain entity or null if not found.
   */
  async getWallet(userId: string): Promise<Wallet | null> {
    try {
      const doc = await UserModel.findOne({ userId }).select('wallet -_id').lean().exec()

      if (!doc || !doc.wallet) return null

      const wallet = new Wallet(doc.wallet.id, doc.wallet.transactions.map(this.mapTransaction))

      return wallet
    } catch (error) {
      throw new Error(`Failed to get wallet: ${error}`)
    }
  }

  /**
   * Adds a transaction to the user's wallet.
   * @param userId - The ID of the user.
   * @param transaction - The Transaction domain entity to add.
   */
  async addTransaction(userId: string, transaction: Transaction): Promise<void> {
    try {
      await UserModel.updateOne(
        { userId },
        {
          $push: {
            'wallet.transactions': {
              transactionId: transaction.transactionId,
              cryptoId: transaction.cryptoId,
              quantity: transaction.quantity,
              type: transaction.type,
              doneAt: transaction.doneAt,
              priceAtPurchase: transaction.priceAtPurchase
            }
          }
        },
        { runValidators: true }
      ).exec()
    } catch (error) {
      throw new Error(`Failed to add transaction: ${error}`)
    }
  }

  /**
   * Removes a transaction from the user's wallet by transactionId.
   * @param userId - The ID of the user.
   * @param transactionId - The ID of the transaction to remove.
   */
  async removeTransaction(userId: string, transactionId: string): Promise<void> {
    try {
      await UserModel.updateOne(
        { userId },
        {
          $pull: {
            'wallet.transactions': { transactionId }
          }
        },
        { runValidators: true }
      ).exec()
    } catch (error) {
      throw new Error(`Failed to remove transaction: ${error}`)
    }
  }

  /**
   * Retrieves the Watchlist of a user.
   * @param userId - The ID of the user.
   * @returns The Watchlist domain entity or null if not found.
   */
  async getWatchlist(userId: string): Promise<Watchlist | null> {
    try {
      const doc = await UserModel.findOne({ userId }).select('watchlist -_id').lean().exec()

      if (!doc || !doc.watchlist) return null

      const watchlist = new Watchlist(
        doc.watchlist.id,
        doc.watchlist.items.map(this.mapWatchlistItem)
      )

      return watchlist
    } catch (error) {
      throw new Error(`Failed to get watchlist: ${error}`)
    }
  }

  /**
   * Adds an item to the user's watchlist.
   * @param userId - The ID of the user.
   * @param item - The WatchlistItem domain entity to add.
   */
  async addToWatchlist(userId: string, item: WatchlistItem): Promise<void> {
    try {
      await UserModel.updateOne(
        { userId },
        {
          $push: {
            'watchlist.items': {
              itemId: item.itemId,
              cryptoId: item.cryptoId,
              addedAt: item.addedAt
            }
          }
        },
        { runValidators: true }
      ).exec()
    } catch (error) {
      throw new Error(`Failed to add to watchlist: ${error}`)
    }
  }

  /**
   * Removes an item from the user's watchlist by itemId.
   * @param userId - The ID of the user.
   * @param itemId - The ID of the watchlist item to remove.
   */
  async removeFromWatchlist(userId: string, itemId: string): Promise<void> {
    try {
      await UserModel.updateOne(
        { userId },
        {
          $pull: {
            'watchlist.items': { itemId }
          }
        },
        { runValidators: true }
      ).exec()
    } catch (error) {
      throw new Error(`Failed to remove from watchlist: ${error}`)
    }
  }
}
