import { organizationSchema } from '@csn/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function transferOrganization(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch('/organizations/:slug/owner', {
    schema: {
      tags: ['Organizations'],
      summary: 'Transfer organization ownership',
      security: [{ bearerAuth: [] }],
      body: z.object({
        transferToUserId: z.string().uuid(),
      }),
      params: z.object({
        slug: z.string(),
      }),
      response: {
        204: z.null(),
      },
    },
    handler: async (request, reply) => {
      const { slug } = request.params
      const { transferToUserId } = request.body

      const userId = await request.getCurrentUserId()
      const { membership, organization } = await request.getUserMembership(slug)

      const authOrganization = organizationSchema.parse(organization)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('transfer_ownership', authOrganization)) {
        throw new UnauthorizedError(
          'You do not have permission to transfer this organization',
        )
      }

      const transferToMember = await prisma.member.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: transferToUserId,
          },
        },
      })

      if (!transferToMember) {
        throw new BadRequestError(
          'Target user is not a member of this organization',
        )
      }

      await prisma.$transaction([
        prisma.member.update({
          where: {
            id: transferToMember.id,
          },
          data: {
            role: 'ADMIN',
          },
        }),
        prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            ownerId: transferToUserId,
          },
        }),
      ])

      return reply.status(204).send()
    },
  })
}
