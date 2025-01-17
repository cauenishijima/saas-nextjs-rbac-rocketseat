import { z } from 'zod'

export const inviteSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('read'),
    z.literal('create'),
    z.literal('delete'),
  ]),
  z.literal('Invite'),
])

export type InviteSubject = z.infer<typeof inviteSubjectSchema>
