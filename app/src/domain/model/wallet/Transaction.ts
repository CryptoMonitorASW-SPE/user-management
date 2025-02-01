import { TransactionType } from './TransactionType'

export class Transaction {
  constructor(
    public transactionId: string,
    public cryptoId: string,
    public quantity: number,
    public type: TransactionType,
    public addedAt: Date
  ) {}

  toJSON() {
    return {
      transactionId: this.transactionId,
      cryptoId: this.cryptoId,
      quantity: this.quantity,
      type: this.type,
      addedAt: this.addedAt.toISOString()
    }
  }
}
