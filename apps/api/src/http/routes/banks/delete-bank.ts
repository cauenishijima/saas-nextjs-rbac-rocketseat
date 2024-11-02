import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteBank(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/organizations/:slug/banks/:bankId', {
      schema: {
        tags: ['Banks'],
        summary: 'Delete bank',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
          bankId: z.string().uuid(),
        }),
        response: {
          204: z.null(),
        },
      },
      handler: async (request, reply) => {
        const { slug, bankId } = request.params
        const { membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(
          membership.userId,
          membership.role,
        )

        if (cannot('delete', 'Bank')) {
          throw new UnauthorizedError(
            'You do not have permission to delete a bank',
          )
        }

        await prisma.bank.delete({
          where: {
            id: bankId,
            organizationId: membership.organizationId,
          },
        })

        return reply.status(204).send()
      },
    })
}
