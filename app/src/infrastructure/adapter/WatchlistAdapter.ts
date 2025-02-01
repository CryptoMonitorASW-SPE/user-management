import { injectable, inject } from 'tsyringe'
import { Router, Request, Response } from 'express'
import { AuthServicePort, AuthenticatedRequest } from '../../domain/port/AuthServicePort'
import { WatchlistServicePort } from '../../domain/port/WatchlistServicePort'
import { authenticate } from '../middleware/AuthMiddleware'

@injectable()
export class WatchlistAdapter {
  private router: Router

  constructor(
    @inject('WatchlistServicePort') private watchlistService: WatchlistServicePort,
    @inject('AuthService') private authService: AuthServicePort
  ) {
    this.router = Router()
  }

  public initialize(): void {
    /**
     * GET /api/watchlist
     * Purpose: List the user's favorite cryptos.
     */
    this.router.get('/watchlist', authenticate, this.getWatchlist)

    /**
     * POST /api/watchlist
     * Purpose: Add a crypto to the watchlist.
     * Body: { cryptoId }
     */
    this.router.post('/watchlist', authenticate, this.addItem)

    /**
     * DELETE /api/watchlist/:itemId
     * Purpose: Remove a crypto from the watchlist.
     */
    this.router.delete('/watchlist/:itemId', authenticate, this.removeItem)
  }

  public getRouter(): Router {
    return this.router
  }

  private getWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId
      const watchlist = await this.watchlistService.getWatchlist({ userId })
      res.status(200).json(watchlist)
    } catch (error) {
      console.error('Error retrieving watchlist:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  private addItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId
      const { cryptoId } = req.body
      if (!cryptoId) {
        res.status(400).json({ error: 'cryptoId is required.' })
        return
      }
      await this.watchlistService.addItem({ userId, cryptoId })
      res.status(201).json({ message: 'Crypto added to watchlist successfully.' })
    } catch (error) {
      console.error('Error adding item to watchlist:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  private removeItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId
      // Use itemId as defined in the domain model and service port
      const { itemId } = req.params
      if (!itemId) {
        res.status(400).json({ error: 'itemId parameter is required.' })
        return
      }
      await this.watchlistService.removeItem({ userId, itemId })
      res.status(200).json({ message: 'Item removed from watchlist successfully.' })
    } catch (error) {
      console.error('Error removing item from watchlist:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
