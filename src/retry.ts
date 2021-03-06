import { apply } from 'redux-saga/effects'
import { timeout } from './utils/timeout'

export const retry = (
    saga: (...args: any[]) => any,
    {
        interval,
        maxRetries = Infinity
    }: {
        interval: number
        maxRetries?: number
    },
    ...rest: any[]
) => {
    return function*(...sagaRest: any[]) {
        let tempRetries
        while (true) {
            tempRetries = maxRetries--
            try {
                if (tempRetries) {
                    return yield apply(null, saga, rest.concat(sagaRest))
                }
            } catch (err) {
                yield timeout(interval)
            }
            if (!tempRetries) {
                throw new Error('Max retries reached')
            }
        }
    }
}
