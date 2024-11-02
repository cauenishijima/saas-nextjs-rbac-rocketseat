import { z } from 'zod'

export const billingSubjectSchema = z.tuple([
  z.enum(['manage', 'read', 'export', 'delete']),
  z.literal('Billing'),
])

export type BillingSubject = z.infer<typeof billingSubjectSchema>
