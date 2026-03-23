import { describe, expect, it, vi } from 'vitest'
import { repeatable } from '../src/repeatable'

describe('repeatable', () => {
  it('repeats a fixed number of times with fixed interval and then completes', () => {
    function* work(n: number) {
      return n * 10
    }

    const genFactory: any = repeatable(work as any, { interval: 5, maxRepeats: 2 }, 3)
    const gen = genFactory()

    // 1st run: yield apply to saga
    let step = gen.next()
    expect(step.done).toBe(false)
    // send back result 30
    step = gen.next(30)
    // then yield timeout(5)
    expect(step.done).toBe(false)

    // 2nd run: yield apply again
    step = gen.next()
    expect(step.done).toBe(false)
    // send back result 30 again
    step = gen.next(30)
    // yield timeout again
    expect(step.done).toBe(false)

    // After maxRepeats reached, repeatable hits a return inside try,
    // but it still executes finally and yields a timeout once more.
    // So we need one extra next() before completion.
    step = gen.next()
    expect(step.done).toBe(false)
    step = gen.next()
    expect(step.done).toBe(true)
    expect(step.value).toBeUndefined()
  })

  it('uses interval as a function of response (via call) and waits accordingly', () => {
    function* work() {
      return 3
    }
    const intervalFn = vi.fn().mockImplementation((resp: number) => resp * 10)

    const genFactory: any = repeatable(work as any, { interval: intervalFn as any, maxRepeats: 1 })
    const gen = genFactory()

    // apply to work
    let step = gen.next()
    expect(step.done).toBe(false)
    // work returns 3
    step = gen.next(3)
    // next it should evaluate interval via call(intervalFn, 3), which we simulate by sending back 30
    expect(step.done).toBe(false)
    step = gen.next(30)
    // then yield timeout(30)
    expect(step.done).toBe(false)

    // after one repeat, it will yield a final timeout (from finally) before completing
    step = gen.next()
    expect(step.done).toBe(false)
    step = gen.next()
    expect(step.done).toBe(true)
  })

  it('still yields a timeout in finally even if the saga throws', () => {
    function* boom() {
      throw new Error('fail')
    }

    const genFactory: any = repeatable(boom as any, { interval: 5, maxRepeats: 1 })
    const gen = genFactory()

    // First yield apply, then throw into it
    let step = gen.next()
    expect(step.done).toBe(false)
    step = gen.throw(new Error('fail'))

    // Should go to finally and yield a timeout (we just observe it didn't complete yet)
    expect(step.done).toBe(false)

    // Next it will hit the termination path and still yield a final timeout from finally
    step = gen.next()
    expect(step.done).toBe(false)
    // Then it completes
    step = gen.next()
    expect(step.done).toBe(true)
  })
})
