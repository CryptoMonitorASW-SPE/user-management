import { injectable, inject } from 'tsyringe'
import { Router, Request, Response } from 'express'
import { UserServicePort } from '../../domain/port/UserServicePort'
import { AuthenticatedRequest } from '../../domain/port/AuthServicePort'
import { Error as MongooseError } from 'mongoose'
import { authenticate } from '../middleware/AuthMiddleware'

/**
 * Adapter class for exposing user-related HTTP endpoints.
 *
 * This class integrates with the UserServicePort to handle core user operations,
 * such as creation, retrieving and updating profiles, and basic health checks.
 */
@injectable()
export class UserAdapter {
  private router: Router

  /**
   * Constructs a new UserAdapter.
   *
   * @param userService - Service for handling core user operations.
   */
  constructor(@inject('UserServicePort') private userService: UserServicePort) {
    this.router = Router()
  }

  /**
   * Initializes the route endpoints.
   *
   * Registers the following routes:
   *
   * - **GET /health**
   *   Provides a basic health status of the service.
   *
   * - **POST /api/users**
   *   Creates a new user.
   *   *Expects the request body to include an email and a userId.*
   *
   * - **GET /api/users/profile**
   *   Retrieves the authenticated user's profile.
   *   *Requires authentication.*
   *
   * - **PUT /api/users/profile**
   *   Updates the authenticated user's profile.
   *   *Expects profile fields (name, surname, dateOfBirth) in the request body and requires authentication.*
   *
   * @returns {void}
   */
  public initialize(): void {
    this.router.get('/health', this.healthCheck)
    this.router.post('/users', this.createUser)
    this.router.get('/users/profile', authenticate, this.getProfile)
    this.router.put('/users/profile', authenticate, this.updateProfile)
  }

  /**
   * Returns the Express router instance with all registered endpoints.
   *
   * @returns {Router} The configured Express router.
   */
  public getRouter(): Router {
    return this.router
  }

  /**
   * Handler for creating a new user.
   *
   * **Route:** POST /api/users
   *
   * **Description:** Creates a new user in the system.
   *
   * **Remarks:**
   * - Expects the request body to include both `email` and `userId`.
   *
   * @param req - Express Request object containing the new user data.
   * @param res - Express Response object for sending back the result.
   * @returns {Promise<void>} A promise that resolves after sending a response with the appropriate status code and message.
   */
  private createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('createUser')
      const email = req.body.email
      const userId = req.body.userId
      if (!userId || !email) {
        res.status(400).json({ error: 'userId and email are required.' })
        return
      }
      await this.userService.createUser({ userId, email })
      res.status(201).json({ message: 'User created successfully.' })
    } catch (error) {
      console.error('Error creating user:', error)
      if (error instanceof MongooseError.ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal Server Error' })
      }
    }
  }

  /**
   * Handler for retrieving the authenticated user's profile.
   *
   * **Route:** GET /api/users/profile
   *
   * **Description:** Retrieves the profile of the authenticated user.
   *
   * **Remarks:**
   * - Requires that the authenticated request includes a valid `userId`.
   *
   * @param req - Express Request object extended with authentication details.
   * @param res - Express Response object for sending back the user profile.
   * @returns {Promise<void>} A promise that resolves with the user profile or an error response.
   */
  private getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('getProfile')
      const userId = (req as AuthenticatedRequest).userId
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: No user ID provided.' })
        return
      }
      const profile = await this.userService.getProfile({ userId })
      if (!profile) {
        res.status(404).json({ error: 'Profile not found.' })
        return
      }
      res.status(200).json(profile)
    } catch (error) {
      console.error('Error retrieving profile:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Handler for updating the authenticated user's profile.
   *
   * **Route:** PUT /api/users/profile
   *
   * **Description:** Updates the profile of the authenticated user.
   *
   * **Remarks:**
   * - Expects the request body to include profile details such as `name`, `surname`, and `dateOfBirth`.
   *
   * @param req - Express Request object extended with authentication details containing the new profile data.
   * @param res - Express Response object for sending back the update status.
   * @returns {Promise<void>} A promise that resolves with a confirmation message upon successful update.
   */
  private updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('updateProfile')
      const userId = (req as AuthenticatedRequest).userId
      const { name, surname, dateOfBirth } = req.body as {
        name: string
        surname: string
        dateOfBirth: string
      }
      await this.userService.updateProfile({
        userId,
        profile: { name, surname, dateOfBirth }
      })
      res.status(200).json({ message: 'Profile updated successfully.' })
    } catch (error) {
      console.error('Error updating profile:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Health check handler.
   *
   * **Route:** GET /health
   *
   * **Description:** Provides a basic health status of the service.
   *
   * @param req - Express Request object.
   * @param res - Express Response object for sending back the health status.
   * @returns {void} Sends a JSON response indicating that the service is operational.
   */
  private healthCheck = (req: Request, res: Response): void => {
    res.status(200).json({ status: 'OK' })
  }
}
