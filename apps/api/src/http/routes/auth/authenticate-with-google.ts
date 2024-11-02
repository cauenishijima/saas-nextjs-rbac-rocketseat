import { env } from '@csn/env'
import { stripe } from '@csn/stripe'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function authenticateWithGoogle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/google',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with Google',
        body: z.object({
          code: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const googleOAuthURL = new URL(
        'https://www.googleapis.com/oauth2/v4/token',
      )

      googleOAuthURL.searchParams.append('client_id', env.GOOGLE_CLIENT_ID)
      googleOAuthURL.searchParams.append(
        'client_secret',
        env.GOOGLE_CLIENT_SECRET,
      )
      googleOAuthURL.searchParams.append('grant_type', 'authorization_code')
      googleOAuthURL.searchParams.append('code', code)
      googleOAuthURL.searchParams.append(
        'redirect_uri',
        env.GOOGLE_CLIENT_REDIRECT_URI,
      )

      const googleAccessTokenResponse = await fetch(googleOAuthURL, {
        method: 'POST',
      })

      const googleAccessTokenData = await googleAccessTokenResponse.json()

      const { access_token: googleAccessToken } = z
        .object({
          access_token: z.string().nullable(),
          token_type: z.literal('Bearer'),
          expires_in: z.number().nullable(),
          id_token: z.string().nullable(),
        })
        .parse(googleAccessTokenData)

      const googleUserResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        },
      )

      const googleUserData = await googleUserResponse.json()

      const {
        sub: googleId,
        name,
        email,
        picture,
      } = z
        .object({
          sub: z.string(),
          name: z.string(),
          given_name: z.string(),
          family_name: z.string().nullable(),
          picture: z.string().url().nullable(),
          email: z.string().email(),
          email_verified: z.boolean(),
        })
        .parse(googleUserData)

      let user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            avatarUrl: picture,
            oauthAccounts: {
              create: {
                provider: 'GOOGLE',
                providerAccountId: googleId,
              },
            },
          },
        })
      }

      const account = await prisma.oAuthAccount.findUnique({
        where: {
          provider_userId: {
            provider: 'GOOGLE',
            userId: user.id,
          },
        },
      })

      if (!account) {
        await prisma.oAuthAccount.create({
          data: {
            provider: 'GOOGLE',
            providerAccountId: googleId,
            userId: user.id,
          },
        })
      }

      const customerStrip = await stripe.customers.create({
        email,
        name,
      })

      if (!customerStrip) {
        throw new Error('Failed to create customer on Stripe')
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripeCustomerId: customerStrip.id,
        },
      })

      const token = await reply.jwtSign(
        {
          name: user.name,
          email: user.email,
        },
        {
          sub: user.id,
          expiresIn: '7 days',
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
