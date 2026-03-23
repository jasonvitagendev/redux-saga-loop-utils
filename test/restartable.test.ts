import { describe, expect, it } from 'vitest'
import { restartable } from '../src/restartable'

describe('restartable', () => {
  it('auto-starts and returns start result when no restart occurs', () => {
    function* job(a: number) {
      return a * 2
    }

    const genFactory: any = restartable(job as any, { restartAction: 'RESTART' }, 3)
    const gen = genFactory()

    // First yield is a race effect; we simulate completion via start
    const step1 = gen.next()
    expect(step1.done).toBe(false)
    const step2 = gen.next({ start: 6, restart: undefined })
    expect(step2.done).toBe(true)
    expect(step2.value).toBe(6)
  })

  it('restarts when restart action wins the race and passes it as an arg to next run', () => {
    function* job() {
      return 'OK'
    }

    const genFactory: any = restartable(job as any, { restartAction: 'RESTART' })
    const gen = genFactory('x')

    // First race: restart wins
    let step = gen.next()
    expect(step.done).toBe(false)
    const restartAction = { type: 'RESTART', payload: 1 }
    step = gen.next({ restart: restartAction })
    expect(step.done).toBe(false)

    // Next iteration: race again, but now the start apply should include previous restart action as an extra arg
    // We can't easily assert effect structure, but we can drive completion by sending a start result
    step = gen.next({ start: 'OK', restart: undefined })
    expect(step.done).toBe(true)
    expect(step.value).toBe('OK')
  })

  it('waits for first restart action when noAutoStart is set', () => {
    function* job() {
      return 'RUN'
    }
    const genFactory: any = restartable(job as any, { restartAction: 'GO', noAutoStart: true })
    const gen = genFactory()

    // Should first yield a take for GO; we simulate by sending an action back
    let step = gen.next()
    expect(step.done).toBe(false)
    step = gen.next({ type: 'GO' })

    // Now we should get the race; we resolve with start
    expect(step.done).toBe(false)
    step = gen.next({ start: 'RUN', restart: undefined })
    expect(step.done).toBe(true)
    expect(step.value).toBe('RUN')
  })

  it('when noReturn is true, it does not return but waits for next restart after finishing', () => {
    function* job() {
      return 'DONE'
    }
    const genFactory: any = restartable(job as any, { restartAction: 'R', noReturn: true })
    const gen = genFactory()

    // First race -> start wins
    let step = gen.next()
    expect(step.done).toBe(false)
    step = gen.next({ start: 'DONE', restart: undefined })

    // Since noReturn is true, it should yield a take(restartAction) instead of returning
    expect(step.done).toBe(false)

    // After we provide the restart action, it should loop again and race
    step = gen.next({ type: 'R' })
    expect(step.done).toBe(false)

    // Resolve the next race again with start and then it should again continue (still not done)
    step = gen.next({ start: 'DONE', restart: undefined })
    expect(step.done).toBe(false)
  })
})
