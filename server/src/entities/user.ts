import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { User } from '@server/database/types'
import { idSchema } from './shared'

export const userSchema = z.object({
  id: idSchema,
  email: z.string().trim().toLowerCase().email(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must be at most 64 characters long'),

  firstName: z.string().min(1).max(500),
  lastName: z.string().min(1).max(500),
  auth0Id: z.string(),
  createdAt: z.date(),
  provider: z.string(),
  updatedAt: z.date(),
})

export const userKeysAll = Object.keys(userSchema.shape) as (keyof User)[]

export const userKeysPublic = ['id', 'firstName', 'lastName', 'email'] as const

export type UserPublic = Pick<Selectable<User>, (typeof userKeysPublic)[number]>

export const authUserSchema = userSchema.pick({ id: true })
export const authUserEmail = userSchema.pick({ email: true })
export type AuthUser = z.infer<typeof authUserSchema>
export type AuthUserEmail = z.infer<typeof authUserEmail>
