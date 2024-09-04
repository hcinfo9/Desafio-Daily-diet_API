import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      nameUser: string
      email: string
      session_id?: string
      created_at: string
      updated_at: string
    }

    meals: {
      id: string
      user_id: string
      name: string
      description: string
      dateHour: number
      isInTheDiet: boolean
      created_at: string
      updated_at: string
    }
  }
}
