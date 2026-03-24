import { ItemStatus } from '#/generated/prisma/enums'
import z from 'zod'

export const ItemsSearchSchema = z.object({
  query: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
})
