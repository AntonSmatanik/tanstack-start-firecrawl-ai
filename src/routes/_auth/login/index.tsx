import { LoginForm } from '#/components/login-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login/')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Log in',
      },
      {
        property: 'og:title',
        content: 'Log in',
      },
    ],
  }),
})

function RouteComponent() {
  return <LoginForm />
}
