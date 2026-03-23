import { describe, expect, it } from 'vitest'
import { withPreviousResponse } from '../src/withPreviousResponse'

describe('withPreviousResponse', () => {
  it('returns prev as undefined initially when no initialResponse is provided', () => {
    function* calc(x: number) {
      return x * 2
    }

    const genFactory: any = withPreviousResponse(calc as any)

    // 1st run
    let gen = genFactory(3)
    let step = gen.next()
    expect(step.done).toBe(false)
    step = gen.next(6)
    expect(step.done).toBe(true)
    expect(step.value).toEqual({ prev: undefined, next: 6 })

    // 2nd run should see previous next (6) as prev
    gen = genFactory(5)
    step = gen.next()
    expect(step.done).toBe(false)
    step = gen.next(10)
    expect(step.done).toBe(true)
    expect(step.value).toEqual({ prev: 6, next: 10 })
  })

  it('seeds previousResponse with initialResponse option', () => {
    function* id(x: number) {
      return x
    }

    const genFactory: any = withPreviousResponse(id as any, { initialResponse: 'seed' })
    const gen = genFactory(1)

    let step = gen.next()
    expect(step.done).toBe(false)
    step = gen.next(1)
    expect(step.done).toBe(true)
    expect(step.value).toEqual({ prev: 'seed', next: 1 })
  })
})
