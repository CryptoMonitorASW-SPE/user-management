import { injectable, inject } from 'tsyringe'
import { Router, Request, Response } from 'express'
import { AuthenticatedRequest } from '../../domain/port/AuthServicePort'
import { WatchlistServicePort } from '../../domain/port/WatchlistServicePort'
import { authenticate } from '../middleware/AuthMiddleware'

/**
 * WatchlistAdapter exposes HTTP endpoints for watchlist-related operations.
 *
 * This adapter integrates with WatchlistServicePort to manage the user's watchlist,
 * including listing items, adding a new crypto, and removing an item.
 */
@injectable()
export class WatchlistAdapter {
  private router: Router

  /**
   * Constructs a new WatchlistAdapter.
   *
   * @param watchlistService - The service handling watchlist operations.
   */
  constructor(@inject('WatchlistServicePort') private watchlistService: WatchlistServicePort) {
    this.router = Router()
  }

  /**
   * Initializes the watchlist-related endpoints.
   *
   * Registers the following routes:
   *
   * - **GET /api/watchlist**
   *   Retrieves the user's watchlist.
   *   *Requires authentication.*
   *
   * - **POST /api/watchlist**
   *   Adds a crypto to the watchlist.
   *   *Expects the request body to include `cryptoId` and requires authentication.*
   *
   * - **DELETE /api/watchlist/:itemId**
   *   Removes a crypto from the watchlist given its item ID.
   *   *Requires authentication.*
   *
   * @returns {void}
   */
  public initialize(): void {
    this.router.get('/watchlist', authenticate, this.getWatchlist)
    this.router.post('/watchlist', authenticate, this.addItem)
    this.router.delete('/watchlist/:itemId', authenticate, this.removeItem)
  }

  /**
   * Returns the Express router instance with all registered watchlist endpoints.
   *
   * @returns {Router} The configured Express router.
   */
  public getRouter(): Router {
    return this.router
  }

  /**
   * Handler for retrieving the user's watchlist.
   *
   * **Route:** GET /api/watchlist
   *
   * **Description:** Retrieves the user's favorite cryptos from the watchlist.
   *
   * **Remarks:**
   * - Requires authentication.
   *
   * @param req - Express Request object extended with authentication details.
   * @param res - Express Response object.
   * @returns {Promise<void>} A promise that resolves with the watchlist data on success.
   */
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

  /**
   * Handler for adding a crypto to the watchlist.
   *
   * **Route:** POST /api/watchlist
   *
   * **Description:** Adds a crypto to the user's watchlist.
   *
   * **Remarks:**
   * - Expects the request body to include `cryptoId`.
   * - Requires authentication.
   *
   * @param req - Express Request object containing the cryptoId in the body.
   * @param res - Express Response object.
   * @returns {Promise<void>} A promise that resolves with a success message upon addition.
   */
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

  /**
   * Handler for removing a crypto from the watchlist.
   *
   * **Route:** DELETE /api/watchlist/:itemId
   *
   * **Description:** Removes a crypto from the user's watchlist identified by its item ID.
   *
   * **Remarks:**
   * - Requires authentication.
   *
   * @param req - Express Request object with `itemId` provided in the URL parameters.
   * @param res - Express Response object.
   * @returns {Promise<void>} A promise that resolves with a success message upon removal.
   */
  private removeItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId
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
