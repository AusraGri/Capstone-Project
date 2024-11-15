import { hash } from 'bcrypt'
import { publicProcedure } from '@server/trpc'
import config from '@server/config'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import { assertError } from '@server/utils/errors'
import { userSchema } from '@server/entities/user'
import { idSchema } from '@server/entities/shared'
import z from 'zod'

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .meta({
    openapi: {
      method: 'POST',
      path: '/user/signup',
      tags: ['user'],
      summary: 'Signup user',
      example: {
        request: {
          email: 'some@email.com',
          password: 'password',
          firstName: 'Name',
          lastName: 'LastName',
        },
      },
    },
  })
  .input(
    userSchema.pick({
      email: true,
      password: true,
      firstName: true,
      lastName: true,
    })
  )
  .output(
    z.object({
      id: idSchema,
    })
  )
  .mutation(async ({ input: user, ctx: { repos } }) => {
    const passwordHash = await hash(user.password, config.auth.passwordCost)

    const userCreated = await repos.userRepository
      .create({
        ...user,
        password: passwordHash,
      })
      // handling errors using the Promise.catch method
      .catch((error: unknown) => {
        assertError(error)

        // wrapping an ugly error into a user-friendly one
        if (error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User with this email already exists',
            cause: error,
          })
        }

        throw error
      })

    return {
      id: userCreated.id,
    }
  })
