import { organizationSchema } from '@csn/auth'
import { config, stripe } from '@csn/stripe'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateOrganization(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/organizations/:slug', {
    schema: {
      tags: ['Organizations'],
      summary: 'Update organization details',
      security: [{ bearerAuth: [] }],
      body: z.object({
        name: z.string(),
        domain: z.string().nullish(),
        shouldAttachUserByDomain: z.boolean().default(false),
        priceId: z.string().nullish(),
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
      const { name, domain, shouldAttachUserByDomain, priceId } = request.body

      const userId = await request.getCurrentUserId()
      const { membership, organization } = await request.getUserMembership(slug)

      const authOrganization = organizationSchema.parse(organization)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('update', authOrganization)) {
        throw new UnauthorizedError(
          'You do not have permission to update this organization',
        )
      }

      if (priceId && organization.stripePriceId !== priceId) {
        await stripe.subscriptions.update(config.prices.free.id, {
          items: [{ price: config.prices.pro.id }],
          proration_behavior: 'create_prorations',
          billing_cycle_anchor: 'unchanged',
        })
      }

      if (domain) {
        const organizationByDomain = await prisma.organization.findFirst({
          where: {
            domain,
            id: {
              not: organization.id,
            },
          },
        })

        if (organizationByDomain) {
          throw new BadRequestError(
            'Organization with same domain already exists',
          )
        }
      }

      await prisma.organization.update({
        where: {
          id: organization.id,
        },
        data: {
          name,
          domain,
          shouldAttachUserByDomain,
        },
      })

      return reply.status(204).send()
    },
  })
}
