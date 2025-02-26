import { User } from '../model/user/User'
import { Wallet } from '../model/wallet/Wallet'
import { Watchlist } from '../model/watchlist/Watchlist'
import { Transaction } from '../model/wallet/Transaction'
import { WatchlistItem } from '../model/watchlist/WatchlistItem'
import { Profile } from '../model/user/Profile'

/**
 * Interface representing the UserRepositoryPort.
 */
export interface UserRepositoryPort {
  /**
   * Saves or updates a user along with their Wallet and Watchlist.
   * @param user - The User domain entity to save.
   * @param wallet - The Wallet domain entity to save.
   * @param watchlist - The Watchlist domain entity to save.
   * @returns A promise that resolves when the operation is complete.
   */
  saveUser(user: User, wallet: Wallet, watchlist: Watchlist): Promise<void>

  /**
   * Retrieves a user by their userId.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an object containing the User, Watchlist, and Wallet domain entities if found, otherwise null.
   */
  getUser(userId: string): Promise<{ user: User; watchlist: Watchlist; wallet: Wallet } | null>

  /**
   * Updates the profile of a user.
   * @param userId - The ID of the user.
   * @param profile - The updated UserProfile domain entity.
   * @returns A promise that resolves when the operation is complete.
   */
  updateProfile(userId: string, profile: Profile): Promise<void>

  /**
   * Retrieves the Wallet of a user.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to the Wallet domain entity if found, otherwise null.
   */
  getWallet(userId: string): Promise<Wallet | null>

  /**
   * Adds a transaction to the user's wallet.
   * @param userId - The ID of the user.
   * @param transaction - The Transaction domain entity to add.
   * @returns A promise that resolves when the operation is complete.
   */
  addTransaction(userId: string, transaction: Transaction): Promise<void>

  /**
   * Removes a transaction from the user's wallet by transactionId.
   * @param userId - The ID of the user.
   * @param transactionId - The ID of the transaction to remove.
   * @returns A promise that resolves when the operation is complete.
   */
  removeTransaction(userId: string, transactionId: string): Promise<void>

  /**
   * Retrieves the Watchlist of a user.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to the Watchlist domain entity if found, otherwise null.
   */
  getWatchlist(userId: string): Promise<Watchlist | null>

  /**
   * Adds an item to the user's watchlist.
   * @param userId - The ID of the user.
   * @param item - The WatchlistItem domain entity to add.
   * @returns A promise that resolves when the operation is complete.
   */
  addToWatchlist(userId: string, item: WatchlistItem): Promise<void>

  /**
   * Removes an item from the user's watchlist by itemId.
   * @param userId - The ID of the user.
   * @param itemId - The ID of the watchlist item to remove.
   * @returns A promise that resolves when the operation is complete.
   */
  removeFromWatchlist(userId: string, itemId: string): Promise<void>

  /**
   * Retrieves the profile of a user.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to the Profile domain entity if found, otherwise null.
   */
  getProfile(userId: string): Promise<Profile | null>
}
