import { injectable, inject } from 'tsyringe'
import { Router, Request, Response } from 'express'
import { UserServicePort } from '../../domain/port/UserServicePort'
import { AuthServicePort, AuthenticatedRequest } from '../../domain/port/AuthServicePort'
import { Error as MongooseError } from 'mongoose'
import { authenticate } from '../middleware/AuthMiddleware'

@injectable()
export class UserAdapter {
  private router: Router

  constructor(@inject('UserServicePort') private userService: UserServicePort) {
    this.router = Router()
  }

  public initialize(): void {
    this.router.get('/health', this.healthCheck)

    // User routes with authorization
    // Create a new user
    this.router.post('/users', this.createUser)

    // Retrieve the authenticated user's profile
    this.router.get('/users/profile', authenticate, this.getProfile)

    // Update the authenticated user's profile
    this.router.put('/users/profile', authenticate, this.updateProfile)
  }

  public getRouter(): Router {
    return this.router
  }

  /**
   * Handler for creating a new user.
   * Route: POST /api/users
   */
  private createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('createUser')
      console.log('Request body:', req.body)
      const email = req.body.email
      const userId = req.body.userId
      console.log('userId:', userId)
      console.log('email:', email)
      if (!userId || !email) {
        res.status(400).json({ error: 'userId and email are required.' })
        return // Ensure the function exits after sending the response
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
   * Handler for retrieving user profile.
   * Route: GET /api/users/profile
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
   * Handler for updating user profile.
   * Route: PUT /api/users/profile
   */
  private updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('updateProfile')
      console.log(req.body)
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
   * Route: GET /health
   */
  private healthCheck = (req: Request, res: Response): void => {
    res.status(200).json({ status: 'OK' })
  }
}
