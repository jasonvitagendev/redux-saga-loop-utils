import { apply, race, take } from 'redux-saga/effects'

export const stoppable = (
    saga: (...args: any[]) => any,
    {
        startAction,
        stopAction,
        noAutoStart,
        noReturn = false
    }: {
        startAction: string | string[]
        stopAction: string | string[]
        noAutoStart?: boolean
        noReturn?: boolean
    },
    ...rest: any[]
) => {
    return function*(...sagaRest: any[]) {
        let actions: any[] = []
        if (noAutoStart) {
            const action = yield take(startAction)
            actions = [action]
        }
        while (true) {
            const { start, stop } = yield race({
                start: apply(null, saga, rest.concat(sagaRest).concat(actions)),
                stop: take(stopAction)
            })
            if (!stop && !noReturn) {
                return start
            } else {
                const action = yield take(startAction)
                actions = [action]
            }
        }
    }
}
