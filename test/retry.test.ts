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

  it('retries after a failure and then returns the successful result', () => {
    let attempts = 0
    function* flakySaga(x: number) {
      attempts += 1
      if (attempts === 1) {
        throw new Error('first boom')
      }
      return x + 2
    }

    const genFactory: any = retry(flakySaga as any, { interval: 5, maxRetries: 3 }, 5)
    const gen = genFactory()

    // 1st attempt: yield apply
    let step = gen.next()
    expect(step.done).toBe(false)
    // Inject error -> should yield a timeout before retrying
    step = gen.throw(new Error('first boom'))
    expect(step.done).toBe(false)

    // 2nd attempt: yield apply again
    step = gen.next()
    expect(step.done).toBe(false)
    // Send back the saga result (7)
    step = gen.next(7)
    expect(step.done).toBe(true)
    expect(step.value).toBe(7)
  })

  it('throws immediately when maxRetries is 0 (no attempt)', () => {
    const genFactory: any = retry(function* () { throw new Error('x') } as any, { interval: 1, maxRetries: 0 })
    const gen = genFactory()
    // On first next, it should throw Max retries reached without yielding apply
    expect(() => gen.next()).toThrowError(/Max retries reached/)
  })

  it('forwards additional arguments to the target saga', () => {
    function* argSaga(a: number, b: number, c: number) {
      return a + b + c
    }

    const genFactory: any = retry(argSaga as any, { interval: 1, maxRetries: 1 }, 1)
    const gen = genFactory(2, 3)

    // First yield: apply effect with args [1, 2, 3]
    let step = gen.next()
    expect(step.done).toBe(false)
    const args = (step as any).value?.payload?.args
    expect(args).toEqual([1, 2, 3])

    // Complete and send back the computed result
    step = gen.next(6)
    expect(step.done).toBe(true)
    expect(step.value).toBe(6)
  })
})
