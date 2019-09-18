import {call} from 'redux-saga/effects'

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
        const data = yield call(saga, action, previousAction, ...rest)
        previousAction = action
        return data
    }
}
