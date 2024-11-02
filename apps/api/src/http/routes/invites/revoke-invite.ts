import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/organizations/:slug/invites/:inviteId', {
      schema: {
        tags: ['Invites'],
        summary: 'Revoke an invite',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
          inviteId: z.string().uuid(),
        }),
        response: {
          204: z.null(),
        },
      },
      handler: async (request, reply) => {
        const { slug, inviteId } = request.params

        const userId = await request.getCurrentUserId()

        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', 'Invite')) {
          throw new UnauthorizedError(
            'You do not have permission to delete an invite',
          )
        }

        const invite = await prisma.invite.findUnique({
          where: {
            id: inviteId,
            organizationId: organization.id,
          },
        })

        if (!invite) {
          throw new BadRequestError('Invite not found')
        }

        await prisma.invite.delete({
          where: {
            id: inviteId,
            organizationId: organization.id,
          },
        })

        return reply.status(204).send()
      },
    })
}
