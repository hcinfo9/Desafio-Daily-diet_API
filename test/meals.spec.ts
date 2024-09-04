import { afterAll, beforeAll, beforeEach, expect, describe, it } from 'vitest'
import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/app'
import { randomUUID } from 'crypto'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback 20240901013510_create_users.ts')
    execSync('npm run knex migrate:rollback 20240901013521_meals.ts ')
    execSync('npm run knex migrate:latest --all')
  })

  it('should be able to create a new meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ nameUser: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isInTheDiet: true,
        dateHour: new Date(),
      })
      .expect(201)
  })

  it('should be able to list all meals from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ nameUser: 'jorgisandfisa', email: 'fasdfssdfs@gmail.com' })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        id: randomUUID(),
        name: 'Breakfast',
        description: "It's a breakfast",
        isInTheDiet: true,
        dateHour: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Lunch',
        description: "It's a lunch",
        isInTheDiet: true,
        dateHour: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day after
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies as string[])
      .expect(200)

    expect(mealsResponse.body.meals).toHaveLength(2)

    // This validate if the order is correct
    expect(mealsResponse.body.meals[0].name).toBe('Lunch')
    expect(mealsResponse.body.meals[1].name).toBe('Breakfast')
  })

  it('should be able to show a single meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ nameUser: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isInTheDiet: true,
        dateHour: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies as string[])
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id
    console.log(mealId)

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies as string[])
      .expect(201)

    expect(mealResponse.body).toEqual({
      mealsId: expect.objectContaining({
        name: 'Breakfast',
        description: "It's a breakfast",
        isInTheDiet: 1,
        dateHour: expect.any(Number),
      }),
    })
  })

  it('should be able to update a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ nameUser: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isInTheDiet: true,
        dateHour: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies as string[])
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id
    console.log(mealId, cookies)

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies as string[])
      .send({
        name: 'Dinner',
        description: "It's a dinner",
        isInTheDiet: true,
        dateHour: new Date(),
      })
      .expect(200)
  })

  it('should be able to delete a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ nameUser: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isInTheDiet: true,
        dateHour: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies as string[])
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies as string[])
      .expect(204)
  })

  it('should be able to get metrics from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ nameUser: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isInTheDiet: true,
        dateHour: new Date('2021-01-01T08:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Lunch',
        description: "It's a lunch",
        isInTheDiet: false,
        dateHour: new Date('2021-01-01T12:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Snack',
        description: "It's a snack",
        isInTheDiet: true,
        dateHour: new Date('2021-01-01T15:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Dinner',
        description: "It's a dinner",
        isInTheDiet: true,
        dateHour: new Date('2021-01-01T20:00:00'),
      })

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isInTheDiet: true,
        dateHour: new Date('2021-01-02T08:00:00'),
      })

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies as string[])
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 5,
      totalMealsOnRegister: 4,
      totalMealsOffRegister: 1,
      bestOnDietSequence: 3,
    })
  })
})
