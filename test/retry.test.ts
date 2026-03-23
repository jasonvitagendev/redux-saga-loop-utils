import { describe, expect, it } from 'vitest'
import { retry } from '../src/retry'

function* okSaga(value: number) {
  return value * 2
}

function* errSaga() {
  throw new Error('boom')
}

describe('retry', () => {
  it('yields apply to saga and returns result when succeeds immediately', () => {
    const genFactory: any = retry(okSaga as any, { interval: 10, maxRetries: 3 }, 5)
    const gen = genFactory()

    // First yield is an effect (apply) to call the saga
    const first = gen.next()
    expect(first.done).toBe(false)

    // Send back the result that saga would return (10)
    const second = gen.next(10)
    expect(second.done).toBe(true)
    expect(second.value).toBe(10)
  })

  it('retries and throws when max retries reached', () => {
    const genFactory: any = retry(errSaga as any, { interval: 1, maxRetries: 2 })
    const gen = genFactory()

    // 1st attempt: yield apply, then inject error
    let step = gen.next()
    expect(step.done).toBe(false)
    // Inject an error as if saga threw
    step = gen.throw(new Error('boom'))
    // After catching, it should yield a timeout effect (we can just advance)
    expect(step.done).toBe(false)

    // 2nd attempt: yield apply again
    step = gen.next()
    expect(step.done).toBe(false)
    // Inject error again -> then a timeout
    step = gen.throw(new Error('boom'))
    expect(step.done).toBe(false)

    // Next step should throw Max retries reached
    expect(() => gen.next()).toThrowError(/Max retries reached/)
  })
})
