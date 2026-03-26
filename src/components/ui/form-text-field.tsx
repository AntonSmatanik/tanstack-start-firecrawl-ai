import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import type { AnyFieldApi } from '@tanstack/react-form'

type FormTextFieldProps = {
  field: AnyFieldApi
  label: string
} & Omit<
  React.ComponentProps<'input'>,
  'id' | 'name' | 'value' | 'onBlur' | 'onChange'
>

export function FormTextField({
  field,
  label,
  ...inputProps
}: FormTextFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...inputProps}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
