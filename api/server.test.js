const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')

const userA = { username: 'batman', password: '1234' }
const userB = {username: 'china', password: '1234'}

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})

it('correct env var', () => {
  expect(process.env.NODE_ENV).toBe('testing')
})

test('sanity', () => {
  expect(true).not.toBe(false)
})

describe('server.js', () => {
  describe('auth endpoints', () => {
    describe('[POST] api/auth/register', () => {
      beforeEach(async () => {
        await db('users').truncate()
      })
      it('adds a new user with a username, password, and id, to the table on success', async () => {
        await request(server).post('/api/auth/register').send(userA)
        const user = await db('users').first()
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('username')
        expect(user).toHaveProperty('password')
        expect(user.username).toBe(userA.username)
        expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/)
      })
      it('responds with the new user on success', async () => {
        const { body } = await request(server).post('/api/auth/register').send(userA)
        expect(body).toHaveProperty('id')
        expect(body).toHaveProperty('username')
        expect(body).toHaveProperty('password')
        expect(body.username).toBe(userA.username)
        expect(body.password).toMatch(/^\$2[ayb]\$.{56}$/)
      })
    })
    describe('[POST] /api/auth/login', () => {
      beforeEach(async () => {
        await db('users').truncate()
        await request(server).post('/api/auth/register').send(userB)
      })
      it('responds with a proper status code on successful login', async () => {
        const res = await request(server).post('/api/auth/login').send(userB)
        expect(res.status).toBe(200)
      })
      it('responds with a welcome message', async () => {
        const res = await request(server).post('/api/auth/login').send(userB)
        expect(res.body).toHaveProperty('message')
        expect(res.body).toHaveProperty('token')
      })
    })
    describe('[GET] /api/jokes', () => {
      beforeEach(async () => {
        await db('users').truncate()
        await request(server).post('/api/auth/register').send(userB)
        
      })
      it('responds with token required without token', async () => {
        const res = await request(server).get('/api/jokes')
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('token required')
      })
      it('responds on a error status code on missing token', async () => {
        const res = await request(server).get('/api/jokes')
        expect(res.status).toBe(401)
      })
    })
  })
})