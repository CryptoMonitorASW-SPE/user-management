import mongoose, { Schema, Model } from 'mongoose'
import {
  UserDocument,
  ProfileDocument,
  WalletDocument,
  WatchlistDocument,
  TransactionDocument,
  WatchlistItemDocument
} from './MongooseDocuments'

// Profile Schema
const ProfileSchema = new Schema<ProfileDocument>(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    dateOfBirth: { type: Date, required: true }
  },
  { _id: false }
)

// Transaction Schema
const TransactionSchema = new Schema<TransactionDocument>(
  {
    transactionId: { type: String, required: true },
    cryptoId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.00000001 },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    doneAt: { type: Date, required: true },
    priceAtPurchase: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD' }
  },
  { _id: false }
)

// Wallet Schema
const WalletSchema = new Schema<WalletDocument>(
  {
    id: { type: String, required: true, unique: true }, // Maps to WalletDTO.id
    transactions: { type: [TransactionSchema], default: [] }
  },
  { _id: false }
)

// Watchlist Item Schema
const WatchlistItemSchema = new Schema<WatchlistItemDocument>(
  {
    itemId: { type: String, required: true },
    cryptoId: { type: String, required: true },
    addedAt: { type: Date, required: true }
  },
  { _id: false }
)

// Watchlist Schema
const WatchlistSchema = new Schema<WatchlistDocument>(
  {
    id: { type: String, required: true, unique: true }, // Maps to WatchlistDTO.id
    items: { type: [WatchlistItemSchema], default: [] }
  },
  { _id: false }
)

// Main User Schema
const UserSchema = new Schema<UserDocument>(
  {
    userId: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email']
    },
    profile: { type: ProfileSchema, required: false },
    wallet: { type: WalletSchema, required: true },
    watchlist: { type: WatchlistSchema, required: true }
  },
  { timestamps: true }
)

// Create and export the User Model
export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>(
  'User',
  UserSchema,
  'User'
)
