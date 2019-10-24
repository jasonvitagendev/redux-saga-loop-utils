import { apply } from 'redux-saga/effects'

export const withPreviousAction = (
    saga: (...args: any[]) => any,
    {
        initialAction
    }: {
        initialAction?: any
    } = {},
    ...rest: any[]
) => {
    let previousAction = initialAction
    return function*(action: any) {
        const data = yield apply(
            null,
            saga,
            [action, previousAction].concat(rest)
        )
        previousAction = action
        return data
    }
}
