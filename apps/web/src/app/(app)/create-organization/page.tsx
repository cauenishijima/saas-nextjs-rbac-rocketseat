import { CreateOrganizationForm } from './create-organization-form'

export default async function CreateOrganization() {
  // const products = await stripe.prices.list({
  //   product: 'prod_O11JzLe0kS0IZu',
  // })

  // const prices: planes[] = products.data.map((price) => ({
  //   id: price.id,
  //   nickname: price.nickname,
  //   unit_amount: price.unit_amount! / 100,
  // }))

  return (
    <main className="mx-auto w-full max-w-7xl px-4">
      <CreateOrganizationForm />
    </main>
  )
}
