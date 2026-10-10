import { redirect } from 'next/navigation'

/** Legacy Vite path `/product/:id` → Next `/products/:id` */
export default async function LegacyProductRedirect({ params }) {
  const id = params?.id
  redirect(`/products/${id}`)
}
