import { SignupForm } from '#/components/signup-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/signup/')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Sign up',
      },
      {
        property: 'og:title',
        content: 'Sign up',
      },
    ],
  }),
})

function RouteComponent() {
  return <SignupForm />
}
