export class WatchlistItem {
  constructor(
    public itemId: string,
    public cryptoId: string,
    public addedAt: Date
  ) {}

  toJSON() {
    return {
      itemId: this.itemId,
      cryptoId: this.cryptoId,
      addedAt: this.addedAt.toISOString()
    }
  }
}
