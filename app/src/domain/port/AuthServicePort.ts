export interface AuthServicePort {
  validateToken(token: string): Promise<{ userId: string } | null>
}
