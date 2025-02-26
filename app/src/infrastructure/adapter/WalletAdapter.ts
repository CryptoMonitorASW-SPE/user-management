import { injectable, inject } from 'tsyringe'
import { Router, Request, Response } from 'express'
import { AuthenticatedRequest } from '../../domain/port/AuthServicePort'
import { WalletServicePort } from '../../domain/port/WalletServicePort'
import { authenticate } from '../middleware/AuthMiddleware'

/**
 * WalletAdapter exposes HTTP endpoints for wallet-related operations.
 *
 * This adapter integrates with WalletServicePort to handle operations such as
 * retrieving wallet data, adding new transactions, and removing transactions.
 */
@injectable()
export class WalletAdapter {
  private router: Router

  /**
   * Constructs a new WalletAdapter.
   *
   * @param walletService - The service handling wallet operations.
   */
  constructor(@inject('WalletServicePort') private walletService: WalletServicePort) {
    this.router = Router()
  }

  /**
   * Initializes the wallet-related endpoints.
   *
   * Registers the following routes:
   *
   * - **GET /api/wallet**
   *   Retrieves the user's wallet, including transactions and balances.
   *   *Requires authentication.*
   *
   * - **POST /api/wallet/transaction**
   *   Adds a new wallet transaction (e.g. a buy or sell operation).
   *   *Expects transaction details in the request body and requires authentication.*
   *
   * - **DELETE /api/wallet/transaction/:transactionId**
   *   Removes a wallet transaction given its ID.
   *   *Requires authentication.*
   *
   * @returns {void}
   */
  public initialize(): void {
    this.router.get('/wallet', authenticate, this.getWallet)
    this.router.post('/wallet/transaction', authenticate, this.addTransaction)
    this.router.delete('/wallet/transaction/:transactionId', authenticate, this.removeTransaction)
  }

  /**
   * Returns the Express router instance with all registered wallet endpoints.
   *
   * @returns {Router} The configured Express router.
   */
  public getRouter(): Router {
    return this.router
  }

  /**
   * Handler for retrieving the user's wallet.
   *
   * **Route:** GET /api/wallet
   *
   * **Description:** Retrieves the user's wallet, including all transactions and current balances.
   *
   * **Remarks:**
   * - Requires authentication.
   *
   * @param req - Express Request object extended with authentication details.
   * @param res - Express Response object.
   * @returns {Promise<void>} A promise that resolves with the wallet data on success.
   */
  private getWallet = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('getWallet')
      const userId = (req as AuthenticatedRequest).userId
      const wallet = await this.walletService.getWallet({ userId })
      res.status(200).json(wallet)
    } catch (error) {
      console.error('Error retrieving wallet:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Handler for adding a new wallet transaction.
   *
   * **Route:** POST /api/wallet/transaction
   *
   * **Description:** Adds a new transaction to the user's wallet.
   *
   * **Remarks:**
   * - Expects transaction details (e.g. cryptoId, quantity, price, type, doneAt, currency) in the request body.
   * - Requires authentication.
   *
   * @param req - Express Request object containing transaction details.
   * @param res - Express Response object.
   * @returns {Promise<void>} A promise that resolves with a success message upon addition.
   */
  private addTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId
      const { cryptoId, quantity, priceAtPurchase, type, doneAt, currency } = req.body
      await this.walletService.addTransaction({
        userId,
        transaction: { cryptoId, quantity, priceAtPurchase, type, doneAt, currency }
      })
      res.status(201).json({ message: 'Transaction added successfully.' })
    } catch (error) {
      console.error('Error adding transaction:', error)
      res.status(400).json(error)
    }
  }

  /**
   * Handler for removing a wallet transaction.
   *
   * **Route:** DELETE /api/wallet/transaction/:transactionId
   *
   * **Description:** Removes a wallet transaction identified by its transaction ID.
   *
   * **Remarks:**
   * - Requires authentication.
   *
   * @param req - Express Request object with `transactionId` provided in URL parameters.
   * @param res - Express Response object.
   * @returns {Promise<void>} A promise that resolves with a success message upon removal.
   */
  private removeTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId
      const { transactionId } = req.params
      await this.walletService.removeTransaction({ userId, transactionId })
      res.status(200).json({ message: 'Transaction removed successfully.' })
    } catch (error) {
      console.error('Error removing transaction:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
