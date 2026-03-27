import { prisma } from '#/db'
import { firecrawl } from '#/lib/firecrawl'
import { operRouter } from '#/lib/operRouter'
import { authFnMiddleware } from '#/middlewares/auth'
import {
  BulkImportSchema,
  BulkScrapeSchema,
  ExtractSchema,
  ImportSchema,
  SearchSchema,
} from '#/schemas/import'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { generateText } from 'ai'
import z from 'zod'

export const scrapeUrlFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(ImportSchema)
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.create({
      data: {
        url: data.url,
        userId: context.session.user.id,
        status: 'PROCESSING',
      },
    })

    try {
      const result = await firecrawl.scrape(data.url, {
        formats: ['markdown', { type: 'json', schema: ExtractSchema }],
        location: { country: 'US', languages: ['en'] },
        onlyMainContent: true,
        proxy: 'auto',
      })

      const jsonData = result.json as z.infer<typeof ExtractSchema>
      let publishedAt: Date | null = null

      if (jsonData.publishedAt) {
        const parsed = new Date(jsonData.publishedAt)

        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed
        }
      }

      const updatedItem = await prisma.savedItem.update({
        where: { id: item.id },
        data: {
          title: result.metadata?.title || null,
          content: result.markdown || null,
          ogImage: result.metadata?.ogImage || null,
          author: jsonData.author || null,
          publishedAt: publishedAt,
          status: 'COMPLETED',
        },
      })

      return updatedItem
    } catch (error) {
      const failedItem = await prisma.savedItem.update({
        where: { id: item.id },
        data: {
          status: 'FAILED',
        },
      })

      return failedItem
    }
  })

export const mapUrlFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(BulkImportSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.map(data.url, {
      limit: 25,
      search: data.search,
      location: {
        country: 'US',
        languages: ['en'],
      },
    })

    return result.links
  })

export type BulkScrapeProgress = {
  completed: number
  total: number
  url: string
  status: 'success' | 'failed'
}

export const bulkScrapeUrlFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(BulkScrapeSchema)
  .handler(async function* ({ data, context }) {
    const total = data.urls.length

    for (let i = 0; i < data.urls.length; i++) {
      const url = data.urls[i]
      const item = await prisma.savedItem.create({
        data: {
          url,
          userId: context.session.user.id,
          status: 'PENDING',
        },
      })

      let status: BulkScrapeProgress['status'] = 'success'

      try {
        const result = await firecrawl.scrape(url, {
          formats: ['markdown', { type: 'json', schema: ExtractSchema }],
          location: { country: 'US', languages: ['en'] },
          onlyMainContent: true,
          proxy: 'auto',
        })

        const jsonData = result.json as z.infer<typeof ExtractSchema>
        let publishedAt: Date | null = null

        if (jsonData.publishedAt) {
          const parsed = new Date(jsonData.publishedAt)

          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed
          }
        }

        await prisma.savedItem.update({
          where: { id: item.id },
          data: {
            title: result.metadata?.title || null,
            content: result.markdown || null,
            ogImage: result.metadata?.ogImage || null,
            author: jsonData.author || null,
            publishedAt: publishedAt,
            status: 'COMPLETED',
          },
        })
      } catch (error) {
        status = 'failed'
        await prisma.savedItem.update({
          where: { id: item.id },
          data: { status: 'FAILED' },
        })
      }

      const progress: BulkScrapeProgress = {
        completed: i + 1,
        total,
        url,
        status,
      }

      yield progress
    }
  })

export const getItemsFn = createServerFn({
  method: 'GET',
})
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const items = await prisma.savedItem.findMany({
      where: { userId: context.session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return items
  })

export const getItemByIdFn = createServerFn({
  method: 'GET',
})
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const item = await prisma.savedItem.findFirst({
      where: { id: data.id, userId: context.session.user.id },
    })

    if (!item) {
      throw notFound()
    }

    return item
  })

export const saveSummaryAndGenerateTagsFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      summary: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    const existing = await prisma.savedItem.findUnique({
      where: { id: data.id, userId: context.session.user.id },
    })

    if (!existing) {
      throw notFound()
    }

    const { text } = await generateText({
      model: operRouter.chat('nvidia/nemotron-3-nano-30b-a3b:free'),
      system: `You are a helpful assistant that extracts relevant tags from content summaries. 
                Extract 3-5 short, relevant tags that capture the main topics.
                Return ONLY a comma-separated list of tags, with no explanation or additional text.
                Example output: technology, AI, machine learning`,
      prompt: `Extract tags from the following summary: \n\n${data.summary}`,
    })

    const tags = text
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 5)

    const item = await prisma.savedItem.update({
      where: { id: data.id, userId: context.session.user.id },
      data: {
        summary: data.summary,
        tags: tags,
      },
    })

    return item
  })

export const deleteItemFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.findFirst({
      where: { id: data.id, userId: context.session.user.id },
    })

    if (!item) {
      throw notFound()
    }

    await prisma.savedItem.delete({
      where: { id: data.id },
    })
  })

export const searchWebFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(SearchSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.search(data.query, {
      limit: 15,
      tbs: 'qdr:y',
    })

    return result.web?.map((item) => ({
      url: (item as SearchResultWeb).url,
      title: (item as SearchResultWeb).title,
      description: (item as SearchResultWeb).description,
    })) as SearchResultWeb[]
  })
