import { z } from 'zod'

export const bankSchema = z.object({
  __typename: z.literal('Bank').default('Bank'),
  id: z.string(),
  ownerId: z.string(),
})

export type Bank = z.infer<typeof bankSchema>
