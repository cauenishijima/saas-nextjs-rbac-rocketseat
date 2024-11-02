'use server'

import { env } from '@csn/env'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const googleOAuthURL = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleOAuthURL.searchParams.set('access_type', 'online')
  googleOAuthURL.searchParams.set(
    'scope',
    'https://www.googleapis.com/auth/userinfo.email',
  )
  googleOAuthURL.searchParams.set('include_granted_scopes', 'true')
  googleOAuthURL.searchParams.set(
    'state',
    '6a3b9d5f80f0d262b7371e182735b85cd1fa928658c3f1b41562fdf6e96ed56e',
  )
  googleOAuthURL.searchParams.set('response_type', 'code')

  googleOAuthURL.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
  googleOAuthURL.searchParams.set(
    'redirect_uri',
    env.GOOGLE_CLIENT_REDIRECT_URI,
  )

  redirect(googleOAuthURL.toString())
}
