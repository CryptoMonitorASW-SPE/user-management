import { injectable, inject } from 'tsyringe'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AuthServicePort } from '../../domain/port/AuthServicePort'

@injectable()
export class AuthServiceImpl implements AuthServicePort {
  private jwtKey: string

  constructor(@inject('JWT_SIMMETRIC_KEY') jwtKey: string) {
    this.jwtKey = jwtKey
  }

  /**
   * Validates the auth token by verifying the JWT signature and payload.
   * @param token - The JWT token to validate.
   * @returns An object containing userId if valid, otherwise null.
   */
  public async validateToken(token: string): Promise<{ userId: string } | null> {
    try {
      const decoded = jwt.verify(token, this.jwtKey) as JwtPayload

      if (decoded && decoded.userId) {
        return { userId: decoded.userId }
      }

      return null
    } catch (error) {
      console.error('JWT validation error:', error)
      return null
    }
  }
}
