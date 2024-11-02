import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function removeMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/organizations/:slug/member/:memberId', {
      schema: {
        tags: ['Members'],
        summary: 'Remove a member from the organization',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
          memberId: z.string().uuid(),
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

        if (cannot('delete', 'User')) {
          throw new UnauthorizedError(
            `You're not allowed to remove this member from the organization`,
          )
        }

        await prisma.member.delete({
          where: {
            id: memberId,
          },
        })

        return reply.status(204).send()
      },
    })
}
