'use server'

import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { signInWithPassword } from '@/http/sign-in-with-password'

const signInSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória').min(6, 'Senha muito curta'),
})

export async function signInWithEmailAndPassword(
  _: unknown,
  formData: FormData,
) {
  const { success, error, data } = signInSchema.safeParse(
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
  const { email, password } = data

  try {
    const { token } = await signInWithPassword({
      email,
      password,
    })

    cookies().set('@csn:jupiter:token', token, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()

      return {
        success: false,
        message,
        errors: null,
      }
    }

    console.error(error)

    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes',
      errors: null,
    }
  }

  redirect('/')
}
