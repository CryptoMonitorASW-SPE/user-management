import { User } from '../model/user/User'
import { Wallet } from '../model/wallet/Wallet'
import { Watchlist } from '../model/watchlist/Watchlist'

/**
 * UserFactory is a singleton responsible for creating new User entities
 * along with their associated Wallet and Watchlist.
 *
 * @example
 * const factory = UserFactory.init()
 * const { user, wallet, watchlist } = factory.createUser('user1', 'email@example.com')
 */
export class UserFactory {
  private static instance: UserFactory

  /**
   * Returns the singleton instance of the UserFactory.
   *
   * @returns {UserFactory} The singleton UserFactory instance.
   */
  public static init(): UserFactory {
    if (!UserFactory.instance) {
      UserFactory.instance = new UserFactory()
    }
    return UserFactory.instance
  }

  /**
   * Creates a new User along with an associated Wallet and Watchlist.
   *
   * @param userId - The unique identifier for the user.
   * @param email - The user's email address.
   * @returns An object containing the User, Wallet, and Watchlist entities.
   *
   * @remarks
   * The Wallet and Watchlist are created with newly generated IDs.
   */
  public createUser(
    userId: string,
    email: string
  ): { user: User; wallet: Wallet; watchlist: Watchlist } {
    const wallet = new Wallet(this.generateId())
    const watchlist = new Watchlist(this.generateId())
    const user = new User(userId, email, wallet.id, watchlist.id)
    return { user, wallet, watchlist }
  }

  /**
   * Generates a unique identifier.
   *
   * @returns {string} A randomly generated ID string.
   *
   * @remarks
   * The ID is generated using Math.random and converted to a base-36 string.
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }
}
