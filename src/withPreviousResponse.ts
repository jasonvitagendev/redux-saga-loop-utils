import { call } from 'redux-saga/effects'

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
        const response = yield call(saga, ...[...rest, ...sagaRest])
        const result = {
            prev: previousResponse,
            next: response
        }
        previousResponse = response
        return result
    }
}
