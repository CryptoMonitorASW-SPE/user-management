export interface WatchlistServicePort {
  addItem(data: { userId: string; cryptoId: string }): Promise<void>
  removeItem(data: { userId: string; itemId: string }): Promise<void>
  getWatchlist(data: { userId: string }): Promise<JSON | null>
}
