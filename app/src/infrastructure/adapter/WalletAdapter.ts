import { injectable, inject } from 'tsyringe'
import { Router, Request, Response } from 'express'
import { AuthServicePort, AuthenticatedRequest } from '../../domain/port/AuthServicePort'
import { WalletServicePort } from '../../domain/port/WalletServicePort'
import { authenticate } from '../middleware/AuthMiddleware'

@injectable()
export class WalletAdapter {
  private router: Router

  constructor(
    @inject('WalletServicePort') private walletService: WalletServicePort,
    @inject('AuthService') private authService: AuthServicePort
  ) {
    this.router = Router()
  }

  public initialize(): void {
    /**
     * GET /api/wallet
     * Retrieves the user’s wallet (transactions, balances).
     */
    this.router.get('/wallet', authenticate, this.getWallet)

    /**
     * POST /api/wallet/transaction
     * Adds a new transaction (buy/sell).
     */
    this.router.post('/wallet/transaction', authenticate, this.addTransaction)

    /**
     * DELETE /api/wallet/transaction/:transactionId
     * Removes a transaction by its ID.
     */
    this.router.delete('/wallet/transaction/:transactionId', authenticate, this.removeTransaction)
  }

  public getRouter(): Router {
    return this.router
  }

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

  private addTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId
      const { cryptoId, quantity, priceAtPurchase, type, doneAt } = req.body

      await this.walletService.addTransaction({
        userId,
        transaction: {
          cryptoId,
          quantity,
          type,
          doneAt,
          priceAtPurchase
        }
      })

      res.status(201).json({ message: 'Transaction added successfully.' })
    } catch (error) {
      console.error('Error adding transaction:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

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
