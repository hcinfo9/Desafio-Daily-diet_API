import { env } from './env'
import { app } from '../src/app'

app.listen({ port: env.PORT }).then(() => {
  console.log('HTTP Server Run!')
})
