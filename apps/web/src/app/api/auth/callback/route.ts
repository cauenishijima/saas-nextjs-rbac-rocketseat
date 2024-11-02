import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'

import { signInWithGoogle } from '@/http/sign-in-with-google'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { message: 'Google OAuth code was not found' },
      { status: 400 },
    )
  }

  const { token } = await signInWithGoogle({ code })

  cookies().set('@csn:jupiter:token', token, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  redirect('/')
  // const redirectUrl = request.nextUrl.clone()

  // redirectUrl.pathname = '/'
  // redirectUrl.search = ''

  // return NextResponse.redirect(redirectUrl)
}
