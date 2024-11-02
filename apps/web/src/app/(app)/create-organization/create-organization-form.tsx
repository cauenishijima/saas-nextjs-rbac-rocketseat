'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useActionState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

import { createOrganizationAction } from './actions'
export function CreateOrganizationForm() {
  const [state, formAction, isPending] = useActionState(
    createOrganizationAction,
    {
      success: false,
      message: null,
      errors: null,
    },
  )

  // const [prices, getActionPrice] = useActionState(getListPrices, [])

  // useEffect(() => {
  //   getActionPrice()
  // }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formaData = new FormData(event.currentTarget)

    formAction(formaData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Criar Organização</h1>
      {!state.success && state.message && (
        <Alert className="mb-4 border-red-500 text-red-500">
          <AlertTriangle className="size-4 stroke-red-500" />
          <AlertTitle className="text-red-500">
            Falha ao criar organização
          </AlertTitle>
          <AlertDescription>
            <p className="text-red-500">{state.message}</p>
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-1">
        <Label htmlFor="name">Nome</Label>
        <Input type="text" id="name" name="name" />
        {state.errors?.name && (
          <p className="text-xs font-medium text-red-500">
            {state.errors.name[0]}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="domain">Domínio</Label>
        <Input
          type="text"
          id="domain"
          name="domain"
          inputMode="url"
          placeholder="example.com"
        />
        {state.errors?.domain && (
          <p className="text-xs font-medium text-red-500">
            {state.errors.domain[0]}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <Switch id="shouldAttachUserByDomain" name="shouldAttachUserByDomain" />
        <label htmlFor="shouldAttachUserByDomain">
          <span className="text-sm font-medium leading-none">
            Incluir automaticamente novos membros
          </span>
          <p className="text-xs text-muted-foreground">
            Isso convidará automaticamente todos os membros com o mesmo domínio
            de e-mail para esta organização.
          </p>
        </label>
        {state.errors?.shouldAttachUserByDomain && (
          <p className="text-xs font-medium text-red-500">
            {state.errors.shouldAttachUserByDomain[0]}
          </p>
        )}
      </div>

      <div className="space-y-4 border-y-2 py-6">
        <Label htmlFor="name" className="flex gap-4">
          Plano
        </Label>

        <RadioGroup
          className="flex flex-wrap items-center justify-between"
          id="price"
          name="price"
          defaultChecked
          defaultValue={'plano-free'}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={'plano-free'} id={`price-free}`} />
            <label htmlFor={`price-free`}>
              <span className="text-sm font-medium leading-none">Free</span>
              <p className="text-xs text-muted-foreground">R$0,00 a.m.</p>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value={'plano-pro'} id={`price-pro}`} />
            <label htmlFor={`price-pro`}>
              <span className="text-sm font-medium leading-none">Pro</span>
              <p className="text-xs text-muted-foreground">R$199,90 a.m.</p>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value={'plano-ultimate'} id={`price-ultimate}`} />
            <label htmlFor={`price-ultimate`}>
              <span className="text-sm font-medium leading-none">Ultimate</span>
              <p className="text-xs text-muted-foreground">R$349,90 a.m.</p>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value={'plano-infinity'} id={`price-infinity}`} />
            <label htmlFor={`price-infinity`}>
              <span className="text-sm font-medium leading-none">Infinity</span>
              <p className="text-xs text-muted-foreground">R$499,90 a.m.</p>
            </label>
          </div>

          {/* {prices.map((price) => (
            <div key={price.id} className="flex items-center space-x-2">
              <RadioGroupItem value={price.id} id={`price-${price.id}`} />
              <label htmlFor={`price-${price.id}`}>
                <span className="text-sm font-medium leading-none">
                  {price.nickname}
                </span>
                <p className="text-xs text-muted-foreground">
                  R${price.unit_amount} por mês
                </p>
              </label>
            </div>
          ))} */}
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full">
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          'Salvar organização'
        )}
      </Button>
    </form>
  )
}
