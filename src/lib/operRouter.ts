import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export const operRouter = createOpenRouter({
  apiKey: process.env.AI_API_KEY,
})
