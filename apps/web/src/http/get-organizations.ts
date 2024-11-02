import { api } from './api-client'

interface Organization {
  id: string
  name: string
  slug: string
  domain: string
  avatarUrl: string | null
  role: string
  shouldAttachUserByDomain: boolean
  stripePriceId: string | null
}

interface GetOrganizationsResponse {
  organizations: Organization[]
}

export async function getOrganizations() {
  const { organizations } = await api
    .get('organizations')
    .json<GetOrganizationsResponse>()

  return organizations
}
