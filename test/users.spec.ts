import { afterAll, beforeAll, beforeEach, expect, describe, it } from 'vitest'
import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest --all')
  })

  it('should be able to create a new  user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ nameUser: 'fulano', email: 'fulano893@gmail.com' })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining('sessionId')]),
    )
  })
})
