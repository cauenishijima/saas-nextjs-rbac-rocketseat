import { roleSchema } from '@csn/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getInvites(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/organizations/:slug/invites', {
    schema: {
      tags: ['Invites'],
      summary: 'Get all organization invites',
      security: [{ bearerAuth: [] }],
      params: z.object({
        slug: z.string(),
      }),
      response: {
        200: z.object({
          invites: z.array(
            z.object({
              id: z.string().uuid(),
              email: z.string().email(),
              role: roleSchema,
              createdAt: z.date(),
              author: z
                .object({
                  id: z.string().uuid(),
                  name: z.string().nullable(),
                })
                .nullable(),
            }),
          ),
        }),
      },
    },
    handler: async (request, reply) => {
      const { slug } = request.params
      const userId = await request.getCurrentUserId()
      const { organization, membership } = await request.getUserMembership(slug)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('read', 'Invite')) {
        throw new UnauthorizedError(
          `You're not allow to get organization invites.`,
        )
      }

      const invites = await prisma.invite.findMany({
        where: {
          organizationId: organization.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return reply.status(200).send({ invites })
    },
  })
}
