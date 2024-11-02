import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with e-mail & password',
        description: 'Authenticate with password',
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (user && !user.passwordHash) {
        throw new BadRequestError(
          'Usuário não possui senha. Tente com o login social.',
        )
      }

      if (!user || !user.passwordHash) {
        throw new BadRequestError('Credenciais inválidas.')
      }

      const passwordMatch = await compare(password, user.passwordHash)

      if (!passwordMatch) {
        throw new BadRequestError('Credenciais inválidas.')
      }

      const token = await reply.jwtSign(
        {
          name: user.name,
          email: user.email,
        },
        {
          sub: user.id,
          expiresIn: '7 days',
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
