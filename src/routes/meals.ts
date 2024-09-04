import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'
import { randomUUID } from 'node:crypto'

export async function mealsRouter(app: FastifyInstance) {
  app.post('/', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const createMealsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      dateHour: z.coerce.date(),
      isInTheDiet: z.boolean(),
    })

    const { name, description, isInTheDiet, dateHour } =
      createMealsBodySchema.parse(req.body)
    // let { sessionId } = req.cookies

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      dateHour: dateHour.getTime(),
      isInTheDiet,
      user_id: req.user?.id,
    })

    return res.status(201).send({ Message: 'Refeição incluida na dieta' })
  })

  app.put(
    '/:mealsId',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const paramsSchema = z.object({ mealsId: z.string().uuid() })

      const { mealsId } = paramsSchema.parse(req.params)

      const alterMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateHour: z.coerce.date(),
        isInTheDiet: z.boolean(),
      })

      const { name, description, isInTheDiet, dateHour } =
        alterMealsBodySchema.parse(req.body)

      const meals = await knex('meals').where({ id: mealsId }).first()

      if (!meals) {
        return res.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where({ id: mealsId }).update({
        name,
        description,
        isInTheDiet,
        dateHour: dateHour.getTime(),
      })
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const deleteMealsBodySchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMealsBodySchema.parse(req.params)

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        return res.status(404).send({ error: 'unathorized' })
      }

      await knex('meals').where({ id }).delete()

      return res.status(204).send({ message: 'delete sucess meals' })
    },
  )

  app.get('/', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const meals = await knex('meals')
      .where({ user_id: req.user?.id })
      .orderBy('dateHour', 'desc')

    return res.send({ meals })
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const listMealBodySchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = listMealBodySchema.parse(req.params)

    const mealsId = await knex('meals')
      .where({ id, user_id: req.user?.id })
      .first()

    res.status(201).send({ mealsId })
  })

  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const totalMealsOnRegister = await knex('meals')
        .where({
          user_id: req.user?.id,
          isInTheDiet: true,
        })
        .count('id', { as: 'total' })
        .first()

      const totalMealsOffRegister = await knex('meals')
        .where({
          user_id: req.user?.id,
          isInTheDiet: false,
        })
        .count('id', { as: 'total' })
        .first()

      const totalMeals = await knex('meals')
        .where({
          user_id: req.user?.id,
        })
        .orderBy('dateHour', 'desc')

      const { bestOnDietSequence } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.isInTheDiet) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        { bestOnDietSequence: 0, currentSequence: 0 },
      )
      return res.send({
        totalMeals: totalMeals.length,
        totalMealsOnRegister: totalMealsOnRegister?.total,
        totalMealsOffRegister: totalMealsOffRegister?.total,
        bestOnDietSequence,
      })
    },
  )
}
