import { TransactionType } from '../model/wallet/TransactionType'

/**
 * Interface representing the Wallet Service Port.
 */
export interface WalletServicePort {
  /**
   * Adds a transaction to the user's wallet.
   *
   * @param data - The data required to add a transaction.
   * @param data.userId - The ID of the user.
   * @param data.transaction - The transaction details.
   * @param data.transaction.cryptoId - The ID of the cryptocurrency.
   * @param data.transaction.quantity - The quantity of the cryptocurrency.
   * @param data.transaction.type - The type of the transaction (e.g., buy, sell).
   * @param data.transaction.doneAt - The date and time when the transaction was done.
   * @param data.transaction.priceAtPurchase - The price of the cryptocurrency at the time of purchase.
   * @param data.transaction.currency - The currency used for the transaction.
   *
   * @returns A promise that resolves when the transaction is added.
   */
  addTransaction(data: {
    userId: string
    transaction: {
      cryptoId: string
      quantity: number
      type: TransactionType
      doneAt: Date
      priceAtPurchase: number
      currency: string
    }
  }): Promise<void>

  /**
   * Removes a transaction from the user's wallet.
   *
   * @param data - The data required to remove a transaction.
   * @param data.userId - The ID of the user.
   * @param data.transactionId - The ID of the transaction to be removed.
   *
   * @returns A promise that resolves when the transaction is removed.
   */
  removeTransaction(data: { userId: string; transactionId: string }): Promise<void>

  /**
   * Retrieves the wallet of the user.
   *
   * @param data - The data required to get the wallet.
   * @param data.userId - The ID of the user.
   *
   * @returns A promise that resolves to the wallet data in JSON format, or null if the wallet is not found.
   */
  getWallet(data: { userId: string }): Promise<JSON | null>
}
