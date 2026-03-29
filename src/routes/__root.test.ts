import * as Index from '#/routes/__root'
import { describe, expect, it } from 'vitest'

describe('routes/__root', () => {
  it('exports a Route', () => {
    expect(Index.Route).toBeDefined()
    expect(Index.Route.isRoot).toBe(true)
  })
})
