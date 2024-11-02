import { config, stripe } from '@csn/stripe'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function createOrganization(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/organizations', {
    schema: {
      tags: ['Organizations'],
      summary: 'Create organization',
      security: [{ bearerAuth: [] }],
      body: z.object({
        name: z.string(),
        domain: z.string().nullish(),
        shouldAttachUserByDomain: z.boolean().default(false),
      }),
      response: {
        201: z.object({
          organizationId: z.string().uuid(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { name, domain, shouldAttachUserByDomain } = request.body

      const userId = await request.getCurrentUserId()

      if (domain) {
        const organizationByDomain = await prisma.organization.findUnique({
          where: {
            domain,
          },
        })

        if (organizationByDomain) {
          throw new BadRequestError(
            'Organization with same domain already exists',
          )
        }
      }

      const { id: organizationId } = await prisma.organization.createWithSlug({
        data: {
          name,
          domain: domain || null,
          shouldAttachUserByDomain,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: 'ADMIN',
            },
          },
        },
        sourceField: 'name',
        targetField: 'slug',
        unique: true,
        select: {
          id: true,
        },
      })

      let user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          name: true,
          email: true,
          stripeCustomerId: true,
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name as string,
        })

        user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            stripeCustomerId: customer.id,
          },
          select: {
            name: true,
            email: true,
            stripeCustomerId: true,
          },
        })
      }

      const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId as string,
        items: [{ plan: config.prices.free.id }],
      })

      if (!subscription) {
        throw new Error('Failed to create subscription on Stripe')
      }

      await prisma.organization.update({
        where: {
          id: organizationId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          stripePriceId: config.prices.free.id,
          stripeStatus: subscription.status,
        },
      })

      return reply.status(201).send({ organizationId })
    },
  })
}
