import { Request } from 'express'

export interface AuthServicePort {
  validateToken(token: string): Promise<{ userId: string } | null>
}

export interface AuthenticatedRequest extends Request {
  userId: string
}
