'use server'

import { HTTPError } from 'ky'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { signUp } from '@/http/sign-up'

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nome obrigatório')
      .refine(
        (value) => value.trim().split(' ').length >= 2,
        'Preencha seu nome completo',
      )
      .refine((value) => {
        const [firstName, lastName] = value.trim().split(' ')

        return firstName?.length >= 3 && lastName?.length >= 3
      }, 'Nome e/ou sobrenome muito curto'),
    email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
    password: z
      .string()
      .min(1, 'Senha obrigatória')
      .min(6, 'Senha muito curta'),
    password_confirmation: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'As senhas precisam ser iguais',
  })

export async function signUpAction(_: unknown, formData: FormData) {
  const { success, error, data } = signUpSchema.safeParse(
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
  const { name, email, password } = data

  try {
    await signUp({
      name,
      email,
      password,
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message, error } = await err.response.json()

      console.log(error)

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

  redirect('/auth/sign-in')
}
