import { Profile } from './Profile'

export class User {
  private profile: Profile | null = null

  constructor(
    public userId: string,
    public email: string,
    public walletId: string,
    public watchlistId: string
  ) {}

  public linkWallet(walletId: string): void {
    this.walletId = walletId
  }

  public linkWatchlist(watchlistId: string): void {
    this.watchlistId = watchlistId
  }

  public createProfile(name: string, surname: string, dateOfBirth: Date): void {
    this.profile = new Profile(name, surname, dateOfBirth)
  }

  public getProfile(): Profile | null {
    return this.profile
  }

  public setProfile(profile: Profile): void {
    this.profile = profile
  }

  toJSON() {
    return {
      userId: this.userId,
      email: this.email,
      profile: this.profile ? this.profile.toJSON() : undefined
    }
  }
}
