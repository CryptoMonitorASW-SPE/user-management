import { TransactionType } from '../model/wallet/TransactionType'

export interface WalletServicePort {
  addTransaction(data: {
    userId: string
    transaction: {
      cryptoId: string
      quantity: number
      type: TransactionType
      doneAt: Date
      priceAtPurchase: number
    }
  }): Promise<void>
  removeTransaction(data: { userId: string; transactionId: string }): Promise<void>
  getWallet(data: { userId: string }): Promise<JSON | null>
}
