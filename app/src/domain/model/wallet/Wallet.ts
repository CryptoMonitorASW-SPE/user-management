import { Transaction } from './Transaction'

export class Wallet {
  constructor(
    public id: string,
    private transactions: Transaction[] = []
  ) {}

  public addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction)
  }

  public getTransactions(): Transaction[] {
    return this.transactions
  }

  public removeTransaction(transactionId: string): void {
    this.transactions = this.transactions.filter(
      transaction => transaction.transactionId !== transactionId
    )
  }

  toJSON() {
    return {
      id: this.id,
      transactions: this.transactions.map(transaction => transaction.toJSON())
    }
  }
}
