import { api } from './api-client'

interface CreateOrganizationRequest {
  slug: string
}

export async function deleteOrganization({ slug }: CreateOrganizationRequest) {
  await api.delete(`organizations/${slug}`)
}
