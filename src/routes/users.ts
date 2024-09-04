import { FastifyInstance } from 'fastify'
import { knex } from '../database'
// import { randomUUID } from 'node:crypto'
import z from 'zod'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const usersBodySchema = z.object({
      nameUser: z.string(),
      email: z.string().email(),
    })

    const { nameUser, email } = usersBodySchema.parse(req.body)

    let { sessionId } = req.cookies

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      nameUser,
      session_id: sessionId,
      email,
    })

    return res.status(201).send({ message: 'Users create success' })
  })
}
