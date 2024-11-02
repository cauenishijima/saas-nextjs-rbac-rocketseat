import { api } from './api-client'

export interface Organization {
  id: string
  name: string
  slug: string
  domain: string
  avatarUrl: string | null
  shouldAttachUserByDomain: boolean
  stripePriceId: string | null
  role: string
}
interface GetOrganizationRequest {
  slug: string
}

interface GetOrganizationResponse {
  organization: Organization
}

export async function getOrganization({ slug }: GetOrganizationRequest) {
  const { organization } = await api
    .get(`organizations/${slug}`)
    .json<GetOrganizationResponse>()

  return organization
}
