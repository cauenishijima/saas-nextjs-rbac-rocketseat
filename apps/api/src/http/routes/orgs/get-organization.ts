import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getOrganization(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/organizations/:slug', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get details of an organization',
      security: [{ bearerAuth: [] }],
      params: z.object({
        slug: z.string(),
      }),
      response: {
        200: z.object({
          organization: z.object({
            id: z.string().uuid(),
            name: z.string(),
            slug: z.string(),
            domain: z.string().nullable(),
            shouldAttachUserByDomain: z.boolean(),
            avatarUrl: z.string().url().nullable(),
            createdAt: z.date(),
            updatedAt: z.date(),
            ownerId: z.string().uuid(),
            stripePriceId: z.string().nullable(),
            stripeStatus: z.string().nullable(),
            stripeSubscriptionId: z.string().nullable(),
          }),
        }),
      },
    },
    handler: async (request, reply) => {
      const { slug } = request.params
      const { organization } = await request.getUserMembership(slug)

      return reply.status(200).send({ organization })
    },
  })
}
