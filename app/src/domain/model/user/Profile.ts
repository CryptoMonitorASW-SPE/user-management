export class Profile {
  constructor(
    public name: string,
    public surname: string,
    public dateOfBirth: Date
  ) {}

  toJSON() {
    return {
      name: this.name,
      surname: this.surname,
      dateOfBirth: this.dateOfBirth.toISOString()
    }
  }
}
