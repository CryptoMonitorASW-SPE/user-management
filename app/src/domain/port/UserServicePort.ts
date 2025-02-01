export interface UserServicePort {
  createUser(data: { userId: string; email: string }): Promise<JSON>
  updateProfile(data: {
    userId: string
    profile: { name: string; surname: string; dateOfBirth: string }
  }): Promise<void>
  getProfile(data: { userId: string }): Promise<JSON | null>
}
