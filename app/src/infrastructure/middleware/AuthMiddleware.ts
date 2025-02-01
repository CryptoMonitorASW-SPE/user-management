import { Request, Response, NextFunction } from 'express'
import { container } from 'tsyringe'
import { AuthServicePort, AuthenticatedRequest } from '../../domain/port/AuthServicePort'

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authService = container.resolve<AuthServicePort>('AuthService')
    const authToken = req.cookies.authToken
    if (!authToken) {
      res.status(401).json({ error: 'Unauthorized: No auth token provided.' })
      return
    }
    const validated = await authService.validateToken(authToken)
    if (!validated) {
      res.status(401).json({ error: 'Unauthorized: Invalid auth token.' })
      return
    }
    ;(req as AuthenticatedRequest).userId = validated.userId
    next()
  } catch (error) {
    console.error('Authentication middleware error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
