import {call, race, take} from 'redux-saga/effects'

export const restartable = (
    saga: (...args: any[]) => any,
    {
        restartAction,
        noAutoStart
    }: {
        restartAction: string | string[]
        noAutoStart?: boolean
    },
    ...rest: any[]
) => {
    return function*(...sagaRest: any[]) {
        let actions: any[] = []
        if (noAutoStart) {
            const action = yield take(restartAction)
            actions = [action]
        }
        while (true) {
            const {
                start,
                restart
            }: {
                start: any
                restart: any
            } = yield race({
                start: call(saga, ...[...rest, ...sagaRest], ...actions),
                restart: take(restartAction)
            })
            if (!restart) {
                return start
            }
            actions = [restart]
        }
    }
}
