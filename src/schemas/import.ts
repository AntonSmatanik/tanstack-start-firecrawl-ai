import z from 'zod'

export const ImportSchema = z.object({
  url: z.string().url(),
})

export const BulkImportSchema = z.object({
  url: z.string().url(),
  search: z.string(),
})

export const BulkScrapeSchema = z.object({
  urls: z.array(z.string().url()),
})

export const ExtractSchema = z.object({
  author: z.string().nullable(),
  publishedAt: z.string().nullable(),
})

export const SearchSchema = z.object({
  query: z.string().min(1),
})
