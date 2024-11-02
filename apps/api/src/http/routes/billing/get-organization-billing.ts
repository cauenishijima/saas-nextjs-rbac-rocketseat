import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getOrganizationBilling(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/organizations/:slug/billinf', {
    schema: {
      tags: ['Billing'],
      summary: 'Get billing information from organization',
      security: [{ bearerAuth: [] }],
      params: z.object({
        slug: z.string(),
      }),
      response: {
        200: z.object({
          billing: z.object({
            sets: z.object({
              amount: z.number(),
              unit: z.number(),
              price: z.number(),
            }),
            banks: z.object({
              amount: z.number(),
              unit: z.number(),
              price: z.number(),
            }),
            total: z.number(),
          }),
        }),
      },
    },
    handler: async (request, reply) => {
      const { slug } = request.params
      const userId = await request.getCurrentUserId()
      const { organization, membership } = await request.getUserMembership(slug)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('read', 'Billing')) {
        throw new UnauthorizedError(
          `You're not allow to get billing details from this organization.`,
        )
      }

      const [amountOfMembers, amountOfBanks] = await Promise.all([
        prisma.member.count({
          where: {
            organizationId: organization.id,
            role: {
              not: 'BILLING',
            },
          },
        }),

        prisma.bank.count({
          where: {
            organizationId: organization.id,
          },
        }),
      ])

      return reply.status(200).send({
        billing: {
          sets: {
            amount: amountOfMembers,
            unit: 10,
            price: 10 * amountOfMembers,
          },
          banks: {
            amount: amountOfBanks,
            unit: 20,
            price: 20 * amountOfBanks,
          },
          total: 10 * amountOfMembers + 20 * amountOfBanks,
        },
      })
    },
  })
}
