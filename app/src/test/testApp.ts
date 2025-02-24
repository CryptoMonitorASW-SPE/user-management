import 'reflect-metadata'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { container, InjectionToken } from 'tsyringe'
import sinon from 'sinon'

// Import your adapters, services, and ports
import { UserAdapter } from '../infrastructure/adapter/UserAdapter'
import { WalletAdapter } from '../infrastructure/adapter/WalletAdapter'
import { WatchlistAdapter } from '../infrastructure/adapter/WatchlistAdapter'
import { UserManagementService } from '../application/UserManagementService'
import { AuthServiceImpl } from '../infrastructure/adapter/AuthServiceImpl'
import { UserRepositoryPort } from '../domain/port/UserRepositoryPort'
import { AuthServicePort } from '../domain/port/AuthServicePort'
import { UserServicePort } from '../domain/port/UserServicePort'
import { WalletServicePort } from '../domain/port/WalletServicePort'
import { WatchlistServicePort } from '../domain/port/WatchlistServicePort'

// Create a mock repository object that replicates the methods from UserRepositoryPort.
const mockUserRepository = {
  saveUser: sinon.stub().resolves(),
  getUser: sinon.stub().resolves(null),
  updateProfile: sinon.stub().resolves(),
  getWallet: sinon.stub().resolves(null),
  addTransaction: sinon.stub().resolves(),
  removeTransaction: sinon.stub().resolves(),
  getWatchlist: sinon.stub().resolves(null),
  addToWatchlist: sinon.stub().resolves(),
  removeFromWatchlist: sinon.stub().resolves(),
  getProfile: sinon.stub().resolves(null)
} as unknown as UserRepositoryPort

const jwtKey = process.env.JWT_SIMMETRIC_KEY || 'changeme'

// Register JWT Key as a constant in the DI container
const JWT_KEY_TOKEN: InjectionToken<string> = 'JWT_SIMMETRIC_KEY'
container.registerInstance(JWT_KEY_TOKEN, jwtKey)

// Register necessary dependencies in the DI container
container.registerSingleton<AuthServicePort>('AuthService', AuthServiceImpl)
container.registerSingleton<UserServicePort>('UserServicePort', UserManagementService)
container.registerSingleton<WalletServicePort>('WalletServicePort', UserManagementService)
container.registerSingleton<WatchlistServicePort>('WatchlistServicePort', UserManagementService)

// Use container.registerInstance for the mock repository
container.registerInstance<UserRepositoryPort>('UserRepositoryPort', mockUserRepository)

// Initialize Express app
export const testApp = express()
testApp.use(bodyParser.json())
testApp.use(cookieParser())

// Resolve and initialize adapters
const userAdapter = container.resolve(UserAdapter)
const walletAdapter = container.resolve(WalletAdapter)
const watchlistAdapter = container.resolve(WatchlistAdapter)

userAdapter.initialize()
walletAdapter.initialize()
watchlistAdapter.initialize()

// Mount adapters’ routers
testApp.use('/', userAdapter.getRouter())
testApp.use('/', walletAdapter.getRouter())
testApp.use('/', watchlistAdapter.getRouter())
