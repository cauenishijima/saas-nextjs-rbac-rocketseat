import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function rejectInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/invites/:inviteId/reject', {
    schema: {
      tags: ['Invites'],
      security: [{ bearerAuth: [] }],
      summary: 'Reject an invite',
      params: z.object({
        inviteId: z.string().uuid(),
      }),
      response: {
        204: z.null(),
      },
    },
    handler: async (request, reply) => {
      const { inviteId } = request.params

      const invite = await prisma.invite.findUnique({
        where: {
          id: inviteId,
        },
      })

      if (!invite) {
        throw new BadRequestError('Invite not found')
      }

      const userId = await request.getCurrentUserId()

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!user) {
        throw new BadRequestError('User not found')
      }

      if (invite.email !== user.email) {
        throw new BadRequestError('This invite belongs to another user')
      }

      await prisma.invite.delete({
        where: {
          id: inviteId,
        },
      })

      return reply.code(204).send()
    },
  })
}
