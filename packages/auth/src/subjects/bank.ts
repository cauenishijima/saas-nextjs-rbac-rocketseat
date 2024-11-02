import { z } from 'zod'

import { bankSchema } from '../models/bank'

export const bankSubjectSchema = z.tuple([
  z.enum(['manage', 'read', 'create', 'update', 'delete']),
  z.union([z.literal('Bank'), bankSchema]),
])

export type BankSubject = z.infer<typeof bankSubjectSchema>
