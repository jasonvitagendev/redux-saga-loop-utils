import { call, apply } from 'redux-saga/effects'
import { timeout } from './utils/timeout'

export const repeatable = (
    saga: (...args: any[]) => any,
    {
        interval,
        maxRepeats = Infinity
    }: {
        interval: number | ((response: any) => number)
        maxRepeats?: number
    },
    ...rest: any[]
) => {
    return function*(...sagaRest: any[]) {
        while (true) {
            let finalInterval
            try {
                if (maxRepeats--) {
                    const response = yield apply(
                        null,
                        saga,
                        rest.concat(sagaRest)
                    )
                    finalInterval =
                        typeof interval === 'function'
                            ? yield call(interval, response)
                            : interval
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
