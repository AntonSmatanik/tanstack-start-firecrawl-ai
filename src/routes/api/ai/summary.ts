import { prisma } from '#/db'
import { operRouter } from '#/lib/operRouter'
import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'

export const Route = createFileRoute('/api/ai/summary')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const { itemId, prompt } = await request.json()

        if (!itemId || !prompt) {
          return new Response('Missing prompt or itemId', { status: 400 })
        }

        const item = await prisma.savedItem.findUnique({
          where: {
            id: itemId,
            userId: context?.session.user.id,
          },
        })

        if (!item) {
          return new Response('Item not found', { status: 404 })
        }

        const result = streamText({
          model: operRouter.chat('nvidia/nemotron-3-nano-30b-a3b:free'),
          system: `You are a helpful assistant that creates concise, informative summaries of web content.
                    Your summaries should:
                    - Be 2-3 paragraphs long
                    - Capture the main points and key takeaways
                    - Be written in a clear, professional tone`,
          prompt: `Please summarize the following content: \n\n${prompt}`,
        })

        return result.toTextStreamResponse()
      },
    },
  },
})
