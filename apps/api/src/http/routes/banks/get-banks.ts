import { BankType } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getBanks(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/organizations/:slug/banks', {
    schema: {
      tags: ['Banks'],
      summary: 'Get all banks',
      security: [{ bearerAuth: [] }],
      params: z.object({
        slug: z.string(),
      }),
      response: {
        200: z.object({
          banks: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              code: z.number().int().gt(0),
              type: z.nativeEnum(BankType),
              actived: z.boolean(),
              initialDate: z.coerce.date(),
              initialBalance: z.coerce.number(),
            }),
          ),
        }),
      },
    },
    handler: async (request, reply) => {
      const { slug } = request.params

      const { membership } = await request.getUserMembership(slug)
      const { cannot } = getUserPermissions(membership.userId, membership.role)

      if (cannot('read', 'Bank')) {
        throw new UnauthorizedError(
          `You're not allowed to see organization banks`,
        )
      }

      const banks = await prisma.bank.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          actived: true,
          initialDate: true,
          initialBalance: true,
        },
        where: {
          organizationId: membership.organizationId,
        },
      })

      return reply.status(200).send({
        banks: banks.map((bank) => ({
          ...bank,
          initialBalance: Number(bank.initialBalance),
        })),
      })
    },
  })
}
