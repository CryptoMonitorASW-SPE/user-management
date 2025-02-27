import { injectable, inject } from 'tsyringe'
import { UserServicePort } from '../domain/port/UserServicePort'
import { WalletServicePort } from '../domain/port/WalletServicePort'
import { WatchlistServicePort } from '../domain/port/WatchlistServicePort'
import { UserFactory } from '../domain/factories/UserFactory'
import { UserRepositoryPort } from '../domain/port/UserRepositoryPort'
import { Profile } from '../domain/model/user/Profile'
import { Transaction } from '../domain/model/wallet/Transaction'
import { WatchlistItem } from '../domain/model/watchlist/WatchlistItem'
import { parseTransactionType, TransactionType } from '../domain/model/wallet/TransactionType'

@injectable()
export class UserManagementService
  implements UserServicePort, WalletServicePort, WatchlistServicePort
{
  private userFactory: UserFactory

  constructor(@inject('UserRepositoryPort') private repository: UserRepositoryPort) {
    this.userFactory = UserFactory.init()
  }

  async createUser(data: { userId: string; email: string }): Promise<JSON> {
    try {
      const { user, wallet, watchlist } = this.userFactory.createUser(data.userId, data.email)
      await this.repository.saveUser(user, wallet, watchlist)
      return JSON.parse(JSON.stringify(user.toJSON()))
    } catch (error) {
      console.error('Error in UserManagementService.createUser:', error)
      throw error
    }
  }

  async updateProfile(data: {
    userId: string
    profile: { name: string; surname: string; dateOfBirth: string }
  }): Promise<void> {
    try {
      const { userId, profile } = data
      const profileEntity = new Profile(
        profile.name,
        profile.surname,
        new Date(profile.dateOfBirth)
      )
      await this.repository.updateProfile(userId, profileEntity)
    } catch (error) {
      throw new Error(`Failed to update profile: ${(error as Error).message}`)
    }
  }

  async getProfile(data: { userId: string }): Promise<JSON | null> {
    try {
      console.log('getting profile')
      console.log(data)

      const profile = await this.repository.getProfile(data.userId)
      if (!profile) {
        return null
      }
      return JSON.parse(JSON.stringify(profile.toJSON()))
    } catch (error) {
      throw new Error(`Failed to get profile: ${(error as Error).message}`)
    }
  }

  async addTransaction(data: {
    userId: string
    transaction: {
      cryptoId: string
      quantity: number
      type: string // accept a string for runtime validation
      doneAt: Date | string
      priceAtPurchase: number
      currency: string
    }
  }): Promise<void> {
    try {
      // Validate cryptoId
      if (!data.transaction.cryptoId || data.transaction.cryptoId.trim() === '') {
        throw new Error('Invalid cryptoId')
      }

      // Validate quantity
      if (typeof data.transaction.quantity !== 'number' || data.transaction.quantity <= 0) {
        throw new Error('Invalid quantity')
      }
      // Validate transaction type using the helper
      let transactionType: TransactionType
      try {
        transactionType = parseTransactionType(data.transaction.type)
      } catch {
        throw new Error('Invalid transaction type')
      }

      // Validate doneAt date
      const doneAtDate = new Date(data.transaction.doneAt)
      if (isNaN(doneAtDate.getTime())) {
        throw new Error('Invalid doneAt date')
      }

      // Validate priceAtPurchase
      if (
        typeof data.transaction.priceAtPurchase !== 'number' ||
        data.transaction.priceAtPurchase <= 0
      ) {
        throw new Error('Invalid priceAtPurchase')
      }
      // Validate currency
      if (
        !data.transaction.currency ||
        typeof data.transaction.currency !== 'string' ||
        data.transaction.currency.trim() === ''
      ) {
        throw new Error('Invalid currency')
      }
      const transaction = new Transaction(
        undefined,
        data.transaction.cryptoId,
        data.transaction.quantity,
        transactionType,
        doneAtDate,
        data.transaction.priceAtPurchase,
        data.transaction.currency
      )
      await this.repository.addTransaction(data.userId, transaction)
    } catch (error) {
      console.error('Error in addTransaction:', error)
      throw new Error(`Failed to add transaction: ${(error as Error).message}`)
    }
  }

  async removeTransaction(data: { userId: string; transactionId: string }): Promise<void> {
    try {
      const { userId, transactionId } = data
      await this.repository.removeTransaction(userId, transactionId)
    } catch (error) {
      throw new Error(`Failed to remove transaction: ${(error as Error).message}`)
    }
  }

  async getWallet(data: { userId: string }): Promise<JSON | null> {
    try {
      const wallet = await this.repository.getWallet(data.userId)
      if (!wallet) {
        return null
      }
      return JSON.parse(JSON.stringify(wallet.toJSON()))
    } catch (error) {
      throw new Error(`Failed to get wallet: ${(error as Error).message}`)
    }
  }

  // Method for adding an item to the watchlist
  async addItem(data: { userId: string; cryptoId: string }): Promise<void> {
    try {
      const { userId, cryptoId } = data
      // Create a new WatchlistItem; itemId is autogenerated if not provided
      const watchlistItem = new WatchlistItem(undefined, cryptoId, undefined)
      await this.repository.addToWatchlist(userId, watchlistItem)
    } catch (error) {
      throw new Error(`Failed to add item to watchlist: ${(error as Error).message}`)
    }
  }

  // Method for removing an item from the watchlist using itemId
  async removeItem(data: { userId: string; itemId: string }): Promise<void> {
    try {
      const { userId, itemId } = data
      await this.repository.removeFromWatchlist(userId, itemId)
    } catch (error) {
      throw new Error(`Failed to remove item from watchlist: ${(error as Error).message}`)
    }
  }

  // Method for retrieving the watchlist
  async getWatchlist(data: { userId: string }): Promise<JSON | null> {
    try {
      const watchlist = await this.repository.getWatchlist(data.userId)
      if (!watchlist) {
        return null
      }
      return JSON.parse(JSON.stringify(watchlist.toJSON()))
    } catch (error) {
      throw new Error(`Failed to get watchlist: ${(error as Error).message}`)
    }
  }
}
