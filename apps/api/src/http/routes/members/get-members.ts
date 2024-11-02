import { roleSchema } from '@csn/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getMembers(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/organizations/:slug/members', {
    schema: {
      tags: ['Members'],
      summary: 'Get all organization members',
      security: [{ bearerAuth: [] }],
      params: z.object({
        slug: z.string(),
      }),
      response: {
        200: z.object({
          members: z.array(
            z.object({
              id: z.string().uuid(),
              role: roleSchema,
              userId: z.string().uuid(),
              name: z.string().nullable(),
              email: z.string().email(),
              avatarUrl: z.string().url().nullable(),
            }),
          ),
        }),
      },
    },
    handler: async (request, reply) => {
      const { slug } = request.params

      const { organization, membership } = await request.getUserMembership(slug)
      const { cannot } = getUserPermissions(membership.userId, membership.role)

      if (cannot('read', 'User')) {
        throw new UnauthorizedError(
          `You're not allowed to see organization members`,
        )
      }

      const members = await prisma.member.findMany({
        select: {
          id: true,
          role: true,
          userId: true,
          user: {
            select: {
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        where: {
          organizationId: organization.id,
        },
        orderBy: {
          role: 'asc',
        },
      })

      const memberWithRole = members.map(({ user, ...member }) => ({
        ...member,
        ...user,
      }))

      return reply.status(200).send({ members: memberWithRole })
    },
  })
}
