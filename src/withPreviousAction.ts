import { apply, fork } from 'redux-saga/effects'

export const withPreviousAction = (
    saga: (...args: any[]) => any,
    {
        initialAction,
        noReturn = false
    }: {
        initialAction?: any
        noReturn?: boolean
    } = {},
    ...rest: any[]
) => {
    let previousAction = initialAction
    return function*(action: any) {
        if (noReturn) {
            yield fork(saga, action, previousAction, rest)
            previousAction = action
        } else {
            const data = yield apply(
                null,
                saga,
                [action, previousAction].concat(rest)
            )
            previousAction = action
            return data
        }
    }
}
