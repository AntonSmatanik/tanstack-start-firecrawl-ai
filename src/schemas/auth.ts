import z from 'zod'

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(5),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
