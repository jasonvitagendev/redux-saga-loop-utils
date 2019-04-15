import { take, race, call } from 'redux-saga/effects'

export const stoppable = (
    saga: (...args: any[]) => any,
    {
        startAction,
        stopAction,
        noAutoStart
    }: {
        startAction: string | string[]
        stopAction: string | string[]
        noAutoStart?: boolean
    },
    ...rest: any[]
) => {
    return function*(...sagaRest: any[]) {
        let actions = []
        if (noAutoStart) {
            const action = yield take(startAction)
            actions = [action]
        }
        while (true) {
            const { start, stop } = yield race({
                start: call(saga, ...[...rest, ...sagaRest], ...actions),
                stop: take(stopAction)
            })
            if (!stop) {
                return start
            }
            const action = yield take(startAction)
            actions = [action]
        }
    }
}
