export enum TransactionType {
  Buy = 'BUY',
  Sell = 'SELL'
}

export function parseTransactionType(value: string): TransactionType {
  switch (value.toUpperCase()) {
    case 'BUY':
      return TransactionType.Buy
    case 'SELL':
      return TransactionType.Sell
    default:
      throw new Error(`Invalid TransactionType: ${value}`)
  }
}
