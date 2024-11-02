import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import Header from '@/components/header'
import { OrganizationProvider } from '@/context/organization-context'

export default function AppLayout({
  children,
  sheet,
}: Readonly<{
  children: React.ReactNode
  sheet?: React.ReactNode
}>) {
  if (!cookies().has('@csn:jupiter:token')) {
    redirect('/auth/sign-in')
  }

  return (
    <OrganizationProvider>
      <div className="space-y-4 py-4">
        <Header />
        {sheet}
        {children}
      </div>
    </OrganizationProvider>
  )
}
