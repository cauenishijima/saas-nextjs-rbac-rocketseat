import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recover',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Request password recover',
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const user = await prisma.user.findUnique({
        where: {
          email,
        },

        select: {
          id: true,
        },
      })

      if (!user) {
        return reply.status(201).send()
      }

      const { id: code } = await prisma.token.create({
        data: {
          userId: user.id,
          type: 'PASSWORD_RECOVER',
        },
      })

      // TODO: send email

      console.log(`Recover password code: ${code}`)

      return reply.status(201).send()
    },
  )
}
