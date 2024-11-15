import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type { UserGroups } from '@server/database/types'
import { idSchema } from './shared'

export const userGroupsSchema = z.object({
  groupId: idSchema,
  userId: idSchema,
})

export const userGroupsKeysAll = Object.keys(
  userGroupsSchema.shape
) as (keyof UserGroups)[]

export const userGroupsKeysPublic = ['groupId', 'userId', 'role'] as const

export type UserGroupsPublic = Pick<
  Selectable<UserGroups>,
  (typeof userGroupsKeysPublic)[number]
>

export type InsertableGroups = Insertable<UserGroups>
