import { BankType } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getBank(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/organizations/:slug/banks/:bankId', {
      schema: {
        tags: ['Banks'],
        summary: 'Get bank',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
          bankId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            bank: z.object({
              id: z.string().uuid(),
              name: z.string(),
              code: z.number().int().gt(0),
              type: z.nativeEnum(BankType),
              actived: z.boolean(),
              initialDate: z.coerce.date(),
              initialBalance: z.coerce.number(),
              organizationId: z.string().uuid(),
            }),
          }),
        },
      },
      handler: async (request, reply) => {
        const { slug, bankId } = request.params
        const { membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(
          membership.userId,
          membership.role,
        )

        if (cannot('read', 'Bank')) {
          throw new UnauthorizedError(
            'You do not have permission to get a bank',
          )
        }

        const bank = await prisma.bank.findUnique({
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            actived: true,
            initialDate: true,
            initialBalance: true,
            organizationId: true,
          },
          where: {
            id: bankId,
            organizationId: membership.organizationId,
          },
        })

        if (!bank) {
          throw new BadRequestError('Bank not found')
        }

        return reply.status(200).send({
          bank: {
            ...bank,
            initialBalance: Number(bank.initialBalance),
          },
        })
      },
    })
}
