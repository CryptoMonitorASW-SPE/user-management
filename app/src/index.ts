import 'reflect-metadata'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import http from 'http'
import { container, InjectionToken } from 'tsyringe'
import { resolve } from 'path'
import dotenv from 'dotenv'
import { AuthServicePort } from './domain/port/AuthServicePort'
import { UserServicePort } from './domain/port/UserServicePort'
import { AuthServiceImpl } from './infrastructure/adapter/AuthServiceImpl'
import { UserManagementService } from './application/UserManagementService'
import { MongoUserRepository } from './infrastructure/database/MongoUserRepository'
import { UserAdapter } from './infrastructure/adapter/UserAdapter'
import { WalletServicePort } from './domain/port/WalletServicePort'
import { WatchlistServicePort } from './domain/port/WatchlistServicePort'
import { WalletAdapter } from './infrastructure/adapter/WalletAdapter'
import { WatchlistAdapter } from './infrastructure/adapter/WatchlistAdapter'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../../../.env') })

// Validate essential environment variables
const jwtKey = process.env.JWT_SIMMETRIC_KEY
if (!jwtKey) {
  throw new Error('JWT_SIMMETRIC_KEY is not defined in the environment variables')
}

// Initialize Express app
const app = express()
app.use(bodyParser.json())
app.use(cookieParser())

// Create HTTP server
const server = http.createServer(app)
container.registerInstance('HttpServer', server)

// Register JWT Key as a constant in the DI container
const JWT_KEY_TOKEN: InjectionToken<string> = 'JWT_SIMMETRIC_KEY'
container.registerInstance(JWT_KEY_TOKEN, jwtKey)

// Register AuthService implementation with dependencies
container.registerSingleton<AuthServicePort>('AuthService', AuthServiceImpl)

// Register UserServicePort with AppService
container.registerSingleton<UserServicePort>('UserServicePort', UserManagementService)
container.registerSingleton<WalletServicePort>('WalletServicePort', UserManagementService)
container.registerSingleton<WatchlistServicePort>('WatchlistServicePort', UserManagementService)

// Register UserRepositoryPort with MongoUserRepository
container.registerSingleton('UserRepositoryPort', MongoUserRepository)

// Resolve and initialize UserAdapter
const userAdapter = container.resolve(UserAdapter)
const walletAdapter = container.resolve(WalletAdapter)
const watchlistAdapter = container.resolve(WatchlistAdapter)
userAdapter.initialize()
walletAdapter.initialize()
watchlistAdapter.initialize()

// Mount adapters' routers
app.use('/', userAdapter.getRouter())
app.use('/', walletAdapter.getRouter())
app.use('/', watchlistAdapter.getRouter())

// Start server after all initializations
server.listen(3000, () => {
  console.log(`Server running on port 3000`)
})
