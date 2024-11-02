'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { deleteOrganization } from '@/http/delete-organization'
import { getOrganization, type Organization } from '@/http/get-organization'

export default function UpdateOrganizationForm() {
  const { slug } = useParams()

  const [organization, setOrganization] = useState<Organization>(
    {} as Organization,
  )

  useEffect(() => {
    getOrganization({ slug: slug as string }).then((org) => {
      setOrganization(org)
    })
  }, [])

  async function handleRemoveOrganization() {
    await deleteOrganization({ slug: slug as string })
    useRouter().push('/')
  }

  return (
    <div className="flex flex-col gap-4">
      <form className="space-y-4">
        <h1 className="text-xl font-bold">Editar organização</h1>
        <div className="space-y-1">
          <Label htmlFor="name">Nome</Label>
          <Input type="text" id="name" name="name" value={organization.name} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="domain">Domínio</Label>
          <Input
            type="text"
            id="domain"
            name="domain"
            inputMode="url"
            placeholder="example.com"
            value={organization.domain}
          />
        </div>
        <div className="flex items-center space-x-4">
          <Switch
            id="shouldAttachUserByDomain"
            name="shouldAttachUserByDomain"
            defaultChecked={organization.shouldAttachUserByDomain}
          />
          <label htmlFor="shouldAttachUserByDomain">
            <span className="text-sm font-medium leading-none">
              Incluir automaticamente novos membros
            </span>
            <p className="text-xs text-muted-foreground">
              Isso convidará automaticamente todos os membros com o mesmo
              domínio de e-mail para esta organização.
            </p>
          </label>
        </div>
        <Button type="submit" className="w-full">
          {/* {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : ( */}
          Salvar organização
          {/* )} */}
        </Button>
      </form>
      <form
        onSubmit={handleRemoveOrganization}
        className="flex w-full items-center justify-center"
      >
        <Button
          variant="link"
          className="text-xs font-medium text-red-600"
          type="submit"
        >
          Excluir organização
        </Button>
      </form>
    </div>
  )
}
