import { roleSchema } from '@csn/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/organizations/:slug/invites', {
    schema: {
      tags: ['Invites'],
      summary: 'Create a new invite',
      security: [{ bearerAuth: [] }],
      params: z.object({
        slug: z.string(),
      }),
      body: z.object({
        email: z.string().email(),
        role: roleSchema,
      }),
      response: {
        201: z.object({
          inviteId: z.string().uuid(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { slug } = request.params
      const userId = await request.getCurrentUserId()
      const { organization, membership } = await request.getUserMembership(slug)

      const { cannot } = getUserPermissions(membership.userId, membership.role)

      if (cannot('create', 'Invite')) {
        throw new UnauthorizedError(
          'You do not have permission to create a new invite',
        )
      }

      const { email, role } = request.body

      const [, domain] = email.split('@')

      if (
        organization.shouldAttachUserByDomain &&
        organization.domain === domain
      ) {
        throw new BadRequestError(
          `User with ${domain} domain will join your organization automatically on login!`,
        )
      }

      const inviteWithSameEmail = await prisma.invite.findUnique({
        where: {
          email_organizationId: {
            email,
            organizationId: organization.id,
          },
        },
      })

      if (inviteWithSameEmail) {
        throw new BadRequestError(
          'Another invite with same email already exists.',
        )
      }

      const memberWithSameEmail = await prisma.member.findFirst({
        where: {
          organizationId: organization.id,
          user: {
            email,
          },
        },
      })

      if (memberWithSameEmail) {
        throw new BadRequestError(
          'A member with this e-mail already belongs to your organization.',
        )
      }

      const { id } = await prisma.invite.create({
        data: {
          email,
          role,
          organizationId: membership.organizationId,
          authorId: userId,
        },
        select: {
          id: true,
        },
      })

      return reply.status(201).send({ inviteId: id })
    },
  })
}
