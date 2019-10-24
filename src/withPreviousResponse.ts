import { apply } from 'redux-saga/effects'

export const withPreviousResponse = (
    saga: (...args: any[]) => any,
    {
        initialResponse
    }: {
        initialResponse?: any
    } = {},
    ...rest: any[]
) => {
    let previousResponse = initialResponse
    return function*(...sagaRest: any[]) {
        const response = yield apply(null, saga, rest.concat(sagaRest))
        const result = {
            prev: previousResponse,
            next: response
        }
        previousResponse = response
        return result
    }
}
