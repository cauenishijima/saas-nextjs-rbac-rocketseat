import { env } from '@csn/env'
import Stripe from 'stripe'

export const stripe = new Stripe(env.STRIPE_API_KEY, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})
