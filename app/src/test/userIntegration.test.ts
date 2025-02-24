import 'reflect-metadata'
import { expect } from 'chai'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import sinon from 'sinon'
import { container } from 'tsyringe'
import { testApp as app } from './testApp'
import { UserRepositoryPort } from '../domain/port/UserRepositoryPort'
import { Profile } from '../domain/model/user/Profile'

describe('User API Integration Tests (Stubbed DB, Real UserService)', () => {
  const JWT_KEY = process.env.JWT_SIMMETRIC_KEY || 'changeme'
  const validTestToken = jwt.sign({ userId: 'testUserId' }, JWT_KEY, { expiresIn: '1h' })
  const expiredToken = jwt.sign({ userId: 'testUserId' }, JWT_KEY, { expiresIn: '-1h' })
  const invalidToken = jwt.sign({ userId: 'testUserId' }, 'wrongkey', { expiresIn: '1h' })

  let mockUserRepository: UserRepositoryPort

  before(() => {
    // Get the same repository instance used by the app
    mockUserRepository = container.resolve<UserRepositoryPort>('UserRepositoryPort')
  })

  beforeEach(() => {
    sinon.resetHistory()
  })

  after(() => {
    sinon.restore()
  })

  it('should respond with 201 when creating a new user with valid payload', async () => {
    // Call the endpoint; the real service returns an object with a message.
    const response = await request(app)
      .post('/users')
      .send({ userId: 'testUser123', email: 'test@example.com' })
      .expect(201)

    // Expect the returned JSON to have the success message.
    expect(response.body).to.have.property('message', 'User created successfully.')

    // Verify the repository call.
    sinon.assert.calledOnce(mockUserRepository.saveUser as sinon.SinonStub)
    sinon.assert.calledWith(
      mockUserRepository.saveUser as sinon.SinonStub,
      sinon.match({
        userId: 'testUser123',
        email: 'test@example.com'
      })
    )
  })

  it('should respond with 400 if sending invalid payload when creating a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: '' }) // invalid payload
      .expect(400)

    expect(response.body).to.have.property('error')
    sinon.assert.notCalled(mockUserRepository.saveUser as sinon.SinonStub)
  })

  it('should respond with 401 if trying to get profile without auth token', async () => {
    const response = await request(app).get('/users/profile').expect(401)

    expect(response.body).to.have.property('error')
    expect(response.body.error).to.match(/Unauthorized/i)
  })

  it('should respond with 401 if token is expired when getting profile', async () => {
    await request(app)
      .get('/users/profile')
      .set('Cookie', [`authToken=${expiredToken}`])
      .expect(401)
  })

  it('should respond with 401 if token is invalid when getting profile', async () => {
    await request(app)
      .get('/users/profile')
      .set('Cookie', [`authToken=${invalidToken}`])
      .expect(401)
  })

  it('should respond with 404 if the user does not exist when hitting GET /users/profile', async () => {
    // Set getProfile to resolve null.
    ;(mockUserRepository.getProfile as sinon.SinonStub).resolves(null)

    const response = await request(app)
      .get('/users/profile')
      .set('Cookie', [`authToken=${validTestToken}`])
      .expect(404)

    expect(response.body).to.have.property('error')
    expect(response.body.error).to.equal('Profile not found.')

    const getProfileStub = mockUserRepository.getProfile as sinon.SinonStub
    const [queriedUserId] = getProfileStub.firstCall.args
    expect(queriedUserId).to.equal('testUserId')
  })

  it('should update the authenticated user profile', async () => {
    // Directly set new behavior for getProfile and updateProfile.
    ;(mockUserRepository.getProfile as sinon.SinonStub).resolves(
      new Profile('oldName', 'oldSurname', new Date())
    )
    ;(mockUserRepository.updateProfile as sinon.SinonStub).resolves()

    const response = await request(app)
      .put('/users/profile')
      .set('Cookie', [`authToken=${validTestToken}`])
      .send({ name: 'John', surname: 'Doe', dateOfBirth: '1985-01-01' })
      .expect(200)

    expect(response.body).to.have.property('message')
    expect(response.body.message).to.equal('Profile updated successfully.')

    const updateProfileStub = mockUserRepository.updateProfile as sinon.SinonStub
    const [updatedUserId, updatedProfile] = updateProfileStub.firstCall.args
    expect(updatedUserId).to.equal('testUserId')
    expect(updatedProfile.name).to.equal('John')
    expect(updatedProfile.surname).to.equal('Doe')
    expect(updatedProfile.dateOfBirth.toISOString()).to.match(/1985-01-01/)
  })

  it('should respond with 200 and the user profile when hitting GET /users/profile', async () => {
    const profileData = new Profile('John', 'Doe', new Date('1990-01-01'))
    ;(mockUserRepository.getProfile as sinon.SinonStub).resolves(profileData)

    const response = await request(app)
      .get('/users/profile')
      .set('Cookie', [`authToken=${validTestToken}`])
      .expect(200)

    expect(response.body).to.have.property('name', 'John')
    expect(response.body).to.have.property('surname', 'Doe')
  })
})
