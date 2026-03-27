import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldDescription, FieldGroup } from '#/components/ui/field'
import { FormTextField } from '#/components/ui/form-text-field'
import { authClient } from '#/lib/auth-client'
import { LoginSchema } from '#/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { LoadingButton } from './ui/loading-button'

export function LoginForm() {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: LoginSchema,
      onChange: LoginSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await authClient.signIn.email({
          email: value.email,
          password: value.password,
          fetchOptions: {
            onSuccess: () => {
              toast.success('Logged in successfully')
              navigate({ to: '/dashboard' })
            },
            onError: ({ error }) => {
              toast.error(error.message)
            },
          },
        })
      })
    },
  })

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="email"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Email"
                  placeholder="john@john.com"
                  type="email"
                  autoComplete="off"
                />
              )}
            />

            <form.Field
              name="password"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Password"
                  placeholder="******"
                  type="password"
                  autoComplete="off"
                />
              )}
            />

            <Field>
              <LoadingButton
                isPending={isPending}
                pendingText="Logging in..."
                type="submit"
              >
                Login
              </LoadingButton>

              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link to="/signup">Sign up</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
