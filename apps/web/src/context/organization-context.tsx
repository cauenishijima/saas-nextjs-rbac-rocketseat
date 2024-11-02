'use client'

import { getCookie, setCookie } from 'cookies-next'
import { createContext, useContext, useEffect, useState } from 'react'

import type { Organization } from '@/http/get-organization'
import { getOrganizations } from '@/http/get-organizations'

interface OrganizationContextProps {
  organizationActived: Organization | null
  setOrganizationActived: (organization: Organization | null) => void
  organizations: Organization[]
}

const OrganizationContext = createContext({} as OrganizationContextProps)

export const OrganizationProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [slugActivedOrg, setSlugActivedOrg] = useState(() => {
    return getCookie('org')
  })

  const [organizations, setOrganizations] = useState<Organization[]>([])

  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null)

  useEffect(() => {
    getOrganizations().then((orgs) => {
      setOrganizations(orgs)

      setCurrentOrganization(() => {
        return orgs.find((org) => org.slug === slugActivedOrg) || null
      })
    })
  }, [])

  const setOrganizationActived = (organization: Organization | null) => {
    setSlugActivedOrg(organization?.slug || '')
    setCurrentOrganization(organization)
    setCookie('org', organization?.slug || '', { maxAge: 31536000 })
  }

  return (
    <OrganizationContext.Provider
      value={{
        organizationActived: currentOrganization,
        setOrganizationActived,
        organizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export const useOrganization = () => {
  return useContext(OrganizationContext)
}
