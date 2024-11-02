'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useActionState } from 'react'

import googleIcon from '@/assets/google-logo.svg'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { signInWithGoogle } from '../actions'
import { signUpAction } from './actions'
export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    success: true,
    message: null,
    errors: null,
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formaData = new FormData(event.currentTarget)
    formAction(formaData)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!state.success && state.message && (
          <Alert className="mb-4 border-red-500 text-red-500">
            <AlertTriangle className="size-4 stroke-red-500" />
            <AlertTitle className="text-red-500">Falha no login!</AlertTitle>
            <AlertDescription>
              <p className="text-red-500">{state.message}</p>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-1">
          <Label htmlFor="name">Nome</Label>
          <Input type="text" id="name" name="name" />
          {state.errors?.name && (
            <p className="text-xs font-medium text-red-500">
              {state.errors.name[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">E-mail</Label>
          <Input type="email" id="email" name="email" />
          {state.errors?.email && (
            <p className="text-xs font-medium text-red-500">
              {state.errors.email[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Senha</Label>
          <Input type="password" id="password" name="password" />
          {state.errors?.password && (
            <p className="text-xs font-medium text-red-500">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password_confirmation">Confirme sua senha</Label>
          <Input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
          />
          {state.errors?.password_confirmation && (
            <p className="text-xs font-medium text-red-500">
              {state.errors.password_confirmation[0]}
            </p>
          )}
        </div>

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Criar conta'
          )}
        </Button>

        <Button className="w-full" variant="link" size={'sm'} asChild>
          <Link href={'/auth/sign-in'}>Já tem uma conta? Acessar</Link>
        </Button>
      </form>

      <Separator className="my-8" />

      <form action={signInWithGoogle}>
        <Button className="w-full" variant="outline" type="submit">
          <Image src={googleIcon} alt="Google logo" className="mr-2 size-4" />
          Acessar com Google
        </Button>
      </form>
    </>
  )
}
