import 'reflect-metadata'
import { expect } from 'chai'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import sinon from 'sinon'
import { container } from 'tsyringe'
import { testApp as app } from './testApp'
import { UserRepositoryPort } from '../domain/port/UserRepositoryPort'
import { Wallet } from '../domain/model/wallet/Wallet'

describe('Wallet API Integration Tests (Stubbed DB, Real WalletService)', () => {
  const JWT_KEY = process.env.JWT_SIMMETRIC_KEY || 'changeme'
  const validTestToken = jwt.sign({ userId: 'testWalletUser' }, JWT_KEY, { expiresIn: '1h' })
  const expiredToken = jwt.sign({ userId: 'testWalletUser' }, JWT_KEY, { expiresIn: '-1h' })
  const invalidToken = jwt.sign({ userId: 'testWalletUser' }, 'wrongkey', { expiresIn: '1h' })

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

  describe('GET /wallet', () => {
    it('should respond with 401 if trying to get wallet without auth token', async () => {
      const response = await request(app).get('/wallet').expect(401)
      expect(response.body).to.have.property('error')
      expect(response.body.error).to.match(/Unauthorized/i)
    })

    it('should respond with 401 if token is expired', async () => {
      await request(app)
        .get('/wallet')
        .set('Cookie', [`authToken=${expiredToken}`])
        .expect(401)
    })

    it('should respond with 401 if token is invalid', async () => {
      await request(app)
        .get('/wallet')
        .set('Cookie', [`authToken=${invalidToken}`])
        .expect(401)
    })

    it('should respond with 200 and a wallet object when a valid token is provided', async () => {
      const walletData = new Wallet('wallet123', [])
      ;(mockUserRepository.getWallet as sinon.SinonStub).resolves(walletData)

      const response = await request(app)
        .get('/wallet')
        .set('Cookie', [`authToken=${validTestToken}`])
        .expect(200)

      expect(response.body).to.be.an('object')
      expect(response.body).to.have.property('id', 'wallet123')
    })
  })

  describe('POST /wallet/transaction', () => {
    const validTransaction = {
      cryptoId: 'BTC',
      quantity: 0.001,
      type: 'BUY',
      doneAt: new Date().toISOString(),
      priceAtPurchase: 30000,
      currency: 'USD'
    }

    it('should respond with 401 if trying to add a transaction without auth token', async () => {
      await request(app).post('/wallet/transaction').send(validTransaction).expect(401)
    })

    it('should respond with 401 if token is expired', async () => {
      await request(app)
        .post('/wallet/transaction')
        .set('Cookie', [`authToken=${expiredToken}`])
        .send(validTransaction)
        .expect(401)
    })

    it('should respond with 400 for an invalid transaction payload', async () => {
      const invalidTransaction = {
        cryptoId: '', // invalid cryptoId
        quantity: -10, // invalid quantity
        type: 'INVALID', // unsupported type
        doneAt: 'not-a-date',
        priceAtPurchase: 0,
        currency: 'USD'
      }

      await request(app)
        .post('/wallet/transaction')
        .set('Cookie', [`authToken=${validTestToken}`])
        .send(invalidTransaction)
        .expect(400)
    })

    it('should add a transaction successfully with valid payload', async () => {
      ;(mockUserRepository.addTransaction as sinon.SinonStub).resolves()

      const response = await request(app)
        .post('/wallet/transaction')
        .set('Cookie', [`authToken=${validTestToken}`])
        .send(validTransaction)
        .expect(201)

      expect(response.body).to.have.property('message')
      expect(response.body.message).to.equal('Transaction added successfully.')
    })
  })

  describe('DELETE /wallet/transaction/:transactionId', () => {
    const transactionId = 'abc123'

    it('should respond with 401 if trying to remove a transaction without auth token', async () => {
      await request(app).delete(`/wallet/transaction/${transactionId}`).expect(401)
    })

    it('should respond with 401 if token is invalid when removing a transaction', async () => {
      await request(app)
        .delete(`/wallet/transaction/${transactionId}`)
        .set('Cookie', [`authToken=${invalidToken}`])
        .expect(401)
    })

    it('should remove a transaction successfully with valid token', async () => {
      ;(mockUserRepository.removeTransaction as sinon.SinonStub).resolves()

      const response = await request(app)
        .delete(`/wallet/transaction/${transactionId}`)
        .set('Cookie', [`authToken=${validTestToken}`])
        .expect(200)

      expect(response.body).to.have.property('message')
      expect(response.body.message).to.equal('Transaction removed successfully.')
    })
  })
})
