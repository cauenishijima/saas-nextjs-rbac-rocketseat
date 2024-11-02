'use server'

import { HTTPError } from 'ky'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createOrganization } from '@/http/create-organization'
import { stripe } from '@/lib/stripe'

const organizationSchema = z
  .object({
    name: z.string().min(1, 'Nome obrigatório').min(3, 'Nome muito curto'),
    domain: z
      .string()
      .nullish()
      .refine((value) => {
        if (value) {
          const domainRegex =
            /^(?=.{1,253}$)((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,63}$/
          return domainRegex.test(value)
        }
        return true
      }, 'Domínio inválido'),
    shouldAttachUserByDomain: z
      .boolean({
        coerce: true,
      })
      .default(false),
    price: z.string({
      required_error: 'Plano obrigatório',
    }),
  })
  .refine((data) => !(data.shouldAttachUserByDomain && !data.domain), {
    path: ['domain'],
    message:
      'Domínio é obrigatório para que novos membros sejam incluídos automaticamente',
  })

export async function createOrganizationAction(_: unknown, formData: FormData) {
  const { success, error, data } = organizationSchema.safeParse(
    Object.fromEntries(formData),
  )

  if (!success) {
    const errors = error.flatten().fieldErrors

    return {
      success: false,
      message: null,
      errors,
    }
  }
  const { name, domain, shouldAttachUserByDomain } = data

  try {
    await createOrganization({
      name,
      domain,
      shouldAttachUserByDomain,
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()
      return {
        success: false,
        message,
        errors: null,
      }
    }

    console.log(err)

    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes',
      errors: null,
    }
  }

  redirect('/')
}

interface Price {
  id: string
  nickname: string | null
  unit_amount: number
}

export async function getListPrices() {
  const products = await stripe.prices.list({
    product: 'prod_O11JzLe0kS0IZu',
  })

  const prices: Price[] = products.data.map((price) => ({
    id: price.id,
    nickname: price.nickname,
    unit_amount: price.unit_amount! / 100,
  }))

  return prices
}
