import bcrypt from 'bcrypt'
import config from '@server/config'
import jsonwebtoken from 'jsonwebtoken'
import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import { userSchema } from '@server/entities/user'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import { prepareTokenPayload } from '@server/trpc/tokenPayload'
import z from 'zod'

const { expiresIn, tokenKey } = config.auth

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .meta({
    openapi: {
      method: 'POST',
      path: '/user/login',
      tags: ['user'],
      summary: 'Login user',
      description: 'You can use provided example for login',
      example: {
        request: {
          email: 'some@email.com',
          password: 'password',
        },
      },
    },
  })
  .input(
    userSchema.pick({
      email: true,
      password: true,
    })
  )
  .output(
    z.object({
      accessToken: z.string(),
    })
  )
  .mutation(async ({ input: { email, password }, ctx: { repos } }) => {
    const user = await repos.userRepository.findByEmail(email)

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'We could not find an account with this email address',
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Incorrect password. Please try again.',
      })
    }

    // What we will include in the token.
    const payload = prepareTokenPayload(user)

    const accessToken = jsonwebtoken.sign(payload, tokenKey, {
      expiresIn,
    })

    return {
      accessToken,
    }
  })
