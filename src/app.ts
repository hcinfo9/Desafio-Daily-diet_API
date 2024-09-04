import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from '../src/routes/users'
import { mealsRouter } from '../src/routes/meals'

export const app = fastify()

app.register(cookie)
app.register(usersRoutes, { prefix: 'users' })
app.register(mealsRouter, { prefix: 'meals' })
