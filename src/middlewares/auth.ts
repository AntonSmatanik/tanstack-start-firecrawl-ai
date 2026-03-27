import { auth } from '@/lib/auth'
import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

const publicPaths = ['/api/auth']
const privatePaths = ['/dashboard', '/api']

export const authFnMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({ to: '/login' })
  }

  return next({ context: { session } })
})

export const authMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ next, request }) => {
  const url = new URL(request.url)

  if (publicPaths.some((path) => url.pathname.startsWith(path))) {
    return next()
  }

  if (!privatePaths.some((path) => url.pathname.startsWith(path))) {
    return next()
  }

  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({ to: '/login' })
  }

  return next({ context: { session } })
})
