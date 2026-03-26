import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldDescription, FieldGroup } from '#/components/ui/field'
import { FormTextField } from '#/components/ui/form-text-field'
import { LoadingButton } from '#/components/ui/loading-button'
import { authClient } from '#/lib/auth-client'
import { SignupSchema } from '#/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function SignupForm() {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: SignupSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.fullName,
          callbackURL: '/dashboard',
          fetchOptions: {
            onSuccess: () => {
              toast.success('Account created successfully')
              navigate({ to: '/' })
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
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
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
              name="fullName"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Full Name"
                  placeholder="John Fisher"
                  autoComplete="off"
                />
              )}
            />

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

            <FieldGroup>
              <Field>
                <LoadingButton
                  isPending={isPending}
                  pendingText="Creating Account..."
                  type="submit"
                >
                  Create Account
                </LoadingButton>

                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link to="/login">Log in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
