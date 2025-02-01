import { User } from '../model/user/User'
import { Wallet } from '../model/wallet/Wallet'
import { Watchlist } from '../model/watchlist/Watchlist'

export class UserFactory {
  private static instance: UserFactory

  public static init(): UserFactory {
    if (!UserFactory.instance) {
      UserFactory.instance = new UserFactory()
    }
    return UserFactory.instance
  }

  /**
   * Creates a new User along with associated Wallet and Watchlist.
   * @param userId - The unique identifier for the user.
   * @param email - The user's email address.
   * @returns An object containing the User, Wallet, and Watchlist entities.
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

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }
}
