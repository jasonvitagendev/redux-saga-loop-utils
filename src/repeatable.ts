import { call } from 'redux-saga/effects'
import { timeout } from './utils/timeout'

export const repeatable = (
    saga: (...args: any[]) => any,
    {
        interval,
        maxRepeats = Infinity
    }: {
        interval: number | (() => number)
        maxRepeats?: number
    },
    ...rest: any[]
) => {
    return function*(...sagaRest: any[]) {
        while (true) {
            const finalInterval =
                typeof interval === 'function' ? yield call(interval) : interval
            try {
                if (maxRepeats--) {
                    yield call(saga, ...[rest, ...sagaRest])
                } else {
                    return
                }
            } catch (err) {
                //
            } finally {
                yield timeout(finalInterval)
            }
        }
    }
}
