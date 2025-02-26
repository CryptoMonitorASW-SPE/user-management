/**
 * Interface representing the user service port.
 */
export interface UserServicePort {
  /**
   * Creates a new user.
   * @param data - The data required to create a user.
   * @param data.userId - The unique identifier for the user.
   * @param data.email - The email address of the user.
   * @returns A promise that resolves to a JSON object containing the created user details.
   */
  createUser(data: { userId: string; email: string }): Promise<JSON>

  /**
   * Updates the profile of an existing user.
   * @param data - The data required to update the user's profile.
   * @param data.userId - The unique identifier for the user.
   * @param data.profile - The profile information to update.
   * @param data.profile.name - The name of the user.
   * @param data.profile.surname - The surname of the user.
   * @param data.profile.dateOfBirth - The date of birth of the user.
   * @returns A promise that resolves when the profile update is complete.
   */
  updateProfile(data: {
    userId: string
    profile: { name: string; surname: string; dateOfBirth: string }
  }): Promise<void>

  /**
   * Retrieves the profile of a user.
   * @param data - The data required to retrieve the user's profile.
   * @param data.userId - The unique identifier for the user.
   * @returns A promise that resolves to a JSON object containing the user's profile, or null if the user does not exist.
   */
  getProfile(data: { userId: string }): Promise<JSON | null>
}
