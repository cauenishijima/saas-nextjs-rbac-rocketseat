'use client'
import { useRouter } from 'next/navigation'

import { Sheet, SheetContent } from '@/components/ui/sheet'

import { CreateOrganizationForm } from '../../create-organization/create-organization-form'

export default function CreateOrganizationFormSheet() {
  const router = useRouter()

  function onDismiss() {
    router.back()
  }

  return (
    <Sheet defaultOpen onOpenChange={(open) => !open && onDismiss()}>
      <SheetContent>
        <CreateOrganizationForm />
      </SheetContent>
    </Sheet>
  )
}
