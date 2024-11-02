'use client'
import { ChevronsUpDown, CirclePlus } from 'lucide-react'
import Link from 'next/link'

import { useOrganization } from '@/context/organization-context'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function OrganizationSwitcher() {
  // const activedOrg = cookies().get('org')?.value

  // const organizations = await getOrganizations()

  // const currentOrganization = organizations.find(
  //   (organization) => organization.slug === activedOrg,
  // )

  const {
    organizationActived: currentOrganization,
    organizations,
    setOrganizationActived,
  } = useOrganization()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-[220px] items-center gap-2 rounded p-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {currentOrganization ? (
          <>
            <Avatar className="mr-2 size-5">
              {currentOrganization.avatarUrl && (
                <AvatarImage src={currentOrganization.avatarUrl} />
              )}
              <AvatarFallback />
            </Avatar>

            <span className="line-clamp-1">{currentOrganization.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground">
            Selecione uma organização
          </span>
        )}
        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        alignOffset={-16}
        sideOffset={16}
        className="w-[252px]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground">
            Organizações
          </DropdownMenuLabel>
          {organizations.map((organization) => (
            <div key={organization.id} className="group flex justify-between">
              <DropdownMenuItem
                asChild
                className="cursor-pointer group-hover:rounded-r-none group-hover:bg-muted"
              >
                <Link
                  href={`/org/${organization.slug}`}
                  className="flex w-full items-center"
                  onClick={() => setOrganizationActived(organization)}
                >
                  <div className="flex items-center">
                    <Avatar className="mr-2 size-5">
                      {organization.avatarUrl &&
                        organization.avatarUrl !== '' && (
                          <AvatarImage src={organization.avatarUrl} />
                        )}
                      <AvatarFallback />
                    </Avatar>
                    <span className="line-clamp-1">{organization.name}</span>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                asChild
                className="group-hover:rounded-l-none group-hover:bg-muted"
              >
                <Link
                  href={`/org/${organization.slug}/config`}
                  className="ml-auto cursor-pointer text-xs hover:underline"
                  onClick={() => setOrganizationActived(organization)}
                >
                  Editar
                </Link>
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={'/create-organization'}>
            <CirclePlus className="mr-2 size-5" />
            Criar organização
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
