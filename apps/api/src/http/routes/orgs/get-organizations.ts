import { roleSchema } from '@csn/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

export async function getOrganizations(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/organizations', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get all organizations user belongs to',
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({
          organizations: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              slug: z.string(),
              domain: z.string().nullable(),
              avatarUrl: z.string().url().nullable(),
              role: roleSchema,
            }),
          ),
        }),
      },
    },
    handler: async (request, reply) => {
      const userId = await request.getCurrentUserId()

      const organizations = await prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          domain: true,
          avatarUrl: true,
          members: {
            select: {
              role: true,
            },
            where: {
              userId,
            },
          },
        },
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
      })

      const organizationWithUserRole = organizations.map(
        ({ members, ...organization }) => {
          return {
            ...organization,
            role: members[0].role,
          }
        },
      )

      return reply.status(200).send({ organizations: organizationWithUserRole })
    },
  })
}
