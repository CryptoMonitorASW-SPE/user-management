import { v4 as uuidv4 } from 'uuid'
import { TransactionType } from './TransactionType'

export class Transaction {
  public transactionId: string

  constructor(
    transactionId: string | undefined,
    public cryptoId: string,
    public quantity: number,
    public type: TransactionType,
    public doneAt: Date,
    public priceAtPurchase: number
  ) {
    this.transactionId = transactionId ? transactionId : uuidv4()
  }

  toJSON() {
    return {
      transactionId: this.transactionId,
      cryptoId: this.cryptoId,
      quantity: this.quantity,
      type: this.type,
      doneAt: this.doneAt.toISOString(),
      priceAtPurchase: this.priceAtPurchase
    }
  }
}
