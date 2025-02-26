/**
 * Interface representing the Watchlist Service Port.
 * This service provides methods to manage a user's watchlist.
 */
export interface WatchlistServicePort {
  /**
   * Adds an item to the user's watchlist.
   *
   * @param data - An object containing the user ID and the crypto ID to be added.
   * @returns A promise that resolves when the item is added.
   */
  addItem(data: { userId: string; cryptoId: string }): Promise<void>

  /**
   * Removes an item from the user's watchlist.
   *
   * @param data - An object containing the user ID and the item ID to be removed.
   * @returns A promise that resolves when the item is removed.
   */
  removeItem(data: { userId: string; itemId: string }): Promise<void>

  /**
   * Retrieves the user's watchlist.
   *
   * @param data - An object containing the user ID.
   * @returns A promise that resolves to the user's watchlist in JSON format, or null if the watchlist is empty.
   */
  getWatchlist(data: { userId: string }): Promise<JSON | null>
}
