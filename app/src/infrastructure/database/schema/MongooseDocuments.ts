import { Document } from 'mongoose'
import { TransactionType } from '../../../domain/model/wallet/TransactionType'

// Profile Document Interface
export interface ProfileDocument extends Document {
  readonly name: string
  readonly surname: string
  readonly dateOfBirth: Date
}

// Transaction Document Interface
export interface TransactionDocument extends Document {
  readonly transactionId: string
  readonly cryptoId: string
  readonly quantity: number
  readonly type: TransactionType
  readonly doneAt: Date
  readonly priceAtPurchase: number
  readonly currency: string
}

// Wallet Document Interface
export interface WalletDocument extends Document {
  readonly id: string
  readonly transactions: TransactionDocument[]
}

// Watchlist Item Document Interface
export interface WatchlistItemDocument extends Document {
  readonly itemId: string
  readonly cryptoId: string
  readonly addedAt: Date
}

// Watchlist Document Interface
export interface WatchlistDocument extends Document {
  readonly id: string
  readonly items: WatchlistItemDocument[]
}

// User Document Interface
export interface UserDocument extends Document {
  readonly userId: string
  readonly email: string
  readonly profile?: ProfileDocument
  readonly wallet: WalletDocument
  readonly watchlist: WatchlistDocument
  readonly createdAt: Date
  readonly updatedAt: Date
}
