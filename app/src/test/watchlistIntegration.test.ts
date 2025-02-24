import 'reflect-metadata'
import { expect } from 'chai'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import sinon from 'sinon'
import { container } from 'tsyringe'
import { testApp as app } from './testApp'
import { UserRepositoryPort } from '../domain/port/UserRepositoryPort'
import { Watchlist } from '../domain/model/watchlist/Watchlist'

describe('Watchlist API Integration Tests (Stubbed DB, Real WatchlistService)', () => {
  const JWT_KEY = process.env.JWT_SIMMETRIC_KEY || 'changeme'
  const validTestToken = jwt.sign({ userId: 'testWatchlistUser' }, JWT_KEY, { expiresIn: '1h' })
  const expiredToken = jwt.sign({ userId: 'testWatchlistUser' }, JWT_KEY, { expiresIn: '-1h' })
  const invalidToken = jwt.sign({ userId: 'testWatchlistUser' }, 'wrongkey', { expiresIn: '1h' })

  let mockUserRepository: UserRepositoryPort

  before(() => {
    mockUserRepository = container.resolve<UserRepositoryPort>('UserRepositoryPort')
  })

  beforeEach(() => {
    sinon.resetHistory()
  })

  after(() => {
    sinon.restore()
  })

  describe('GET /watchlist', () => {
    it('should retrieve the watchlist for an authenticated user', async () => {
      const watchlistData = new Watchlist('watchlist123', [])
      ;(mockUserRepository.getWatchlist as sinon.SinonStub).resolves(watchlistData)

      const response = await request(app)
        .get('/watchlist')
        .set('Cookie', [`authToken=${validTestToken}`])
        .expect(200)

      expect(response.body).to.be.an('object')
      expect(response.body).to.have.property('id', 'watchlist123')
    })

    it('should respond with 401 if no auth token is provided', async () => {
      await request(app).get('/watchlist').expect(401)
    })

    it('should respond with 401 if token is expired', async () => {
      await request(app)
        .get('/watchlist')
        .set('Cookie', [`authToken=${expiredToken}`])
        .expect(401)
    })

    it('should respond with 401 if auth token is invalid', async () => {
      await request(app)
        .get('/watchlist')
        .set('Cookie', [`authToken=${invalidToken}`])
        .expect(401)
    })
  })

  describe('POST /watchlist', () => {
    it('should add a crypto to the watchlist successfully', async () => {
      ;(mockUserRepository.addToWatchlist as sinon.SinonStub).resolves()

      const response = await request(app)
        .post('/watchlist')
        .set('Cookie', [`authToken=${validTestToken}`])
        .send({ cryptoId: 'DOGE' })
        .expect(201)

      expect(response.body).to.have.property('message')
      expect(response.body.message).to.equal('Crypto added to watchlist successfully.')
    })

    it('should respond with 400 for an invalid payload (missing cryptoId)', async () => {
      await request(app)
        .post('/watchlist')
        .set('Cookie', [`authToken=${validTestToken}`])
        .send({ wrongField: 'value' })
        .expect(400)
    })

    it('should respond with 401 when adding an item without auth token', async () => {
      await request(app).post('/watchlist').send({ cryptoId: 'DOGE' }).expect(401)
    })
  })

  describe('DELETE /watchlist/:itemId', () => {
    it('should remove an item from the watchlist successfully', async () => {
      ;(mockUserRepository.removeFromWatchlist as sinon.SinonStub).resolves()

      const itemId = 'someItemId'
      const response = await request(app)
        .delete(`/watchlist/${itemId}`)
        .set('Cookie', [`authToken=${validTestToken}`])
        .expect(200)

      expect(response.body).to.have.property('message')
      expect(response.body.message).to.equal('Item removed from watchlist successfully.')
    })

    it('should respond with 401 when trying to remove an item without auth token', async () => {
      await request(app).delete('/watchlist/someItemId').expect(401)
    })

    it('should respond with 401 if token is invalid when removing an item', async () => {
      await request(app)
        .delete('/watchlist/someItemId')
        .set('Cookie', [`authToken=${invalidToken}`])
        .expect(401)
    })
  })
})
