import { roleSchema } from '@csn/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/organizations/:slug/member/:memberId', {
      schema: {
        tags: ['Members'],
        summary: 'Update an organization members',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
          memberId: z.string().uuid(),
        }),
        body: z.object({
          role: roleSchema,
        }),
        response: {
          204: z.null(),
        },
      },
      handler: async (request, reply) => {
        const { slug, memberId } = request.params

        const { membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(
          membership.userId,
          membership.role,
        )

        if (cannot('update', 'User')) {
          throw new UnauthorizedError(
            `You're not allowed to update this organization members`,
          )
        }

        const { role } = request.body

        await prisma.member.update({
          data: {
            role,
          },
          where: {
            id: memberId,
          },
        })

        return reply.status(204).send()
      },
    })
}
