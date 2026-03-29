import * as Index from '#/routes/index'
import { describe, expect, it } from 'vitest'

describe('routes/index', () => {
  it('exports a Route', () => {
    expect(Index.Route).toBeDefined()
    expect(Index.Route.isRoot).toBe(false)
  })
})
