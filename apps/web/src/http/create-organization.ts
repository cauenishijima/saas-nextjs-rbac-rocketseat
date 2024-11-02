import { api } from './api-client'

interface CreateOrganizationRequest {
  name: string
  domain: string | null | undefined
  shouldAttachUserByDomain: boolean | null
}

interface CreateOrganizationResponse {
  organizationId: string
}

export async function createOrganization({
  name,
  domain,
  shouldAttachUserByDomain,
}: CreateOrganizationRequest) {
  const { organizationId } = await api
    .post('organizations', {
      json: {
        name,
        domain,
        shouldAttachUserByDomain,
      },
    })
    .json<CreateOrganizationResponse>()

  return {
    organizationId,
  }
}
