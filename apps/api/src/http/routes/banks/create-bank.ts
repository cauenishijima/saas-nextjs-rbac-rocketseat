import { BankType } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createBank(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/organizations/:slug/banks', {
    schema: {
      tags: ['Banks'],
      summary: 'Create bank',
      security: [{ bearerAuth: [] }],
      params: z.object({
        slug: z.string(),
      }),
      body: z.object({
        code: z.number().int().gt(0),
        name: z.string(),
        initialBalance: z.number().optional(),
        initialDate: z.coerce.date(),
        type: z.nativeEnum(BankType),
        hasAutomaticRescue: z.boolean().optional(),
      }),
      response: {
        201: z.object({
          bankId: z.string().uuid(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { slug } = request.params
      const { membership } = await request.getUserMembership(slug)

      const { cannot } = getUserPermissions(membership.userId, membership.role)

      if (cannot('create', 'Bank')) {
        throw new UnauthorizedError(
          'You do not have permission to create a bank',
        )
      }

      const {
        code,
        name,
        initialBalance,
        initialDate,
        type,
        hasAutomaticRescue,
      } = request.body

      const { id } = await prisma.bank.create({
        data: {
          code,
          name,
          initialBalance,
          initialDate,
          type,
          hasAutomaticRescue,
          organizationId: membership.organizationId,
        },
        select: {
          id: true,
        },
      })

      return reply.status(201).send({ bankId: id })
    },
  })
}
