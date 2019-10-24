import { take, race, apply } from 'redux-saga/effects'

export const restartable = (
    saga: (...args: any[]) => any,
    {
        restartAction,
        noAutoStart,
        noReturn = false
    }: {
        restartAction: string | string[]
        noAutoStart?: boolean
        noReturn?: boolean
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
                start: apply(null, saga, rest.concat(sagaRest).concat(actions)),
                restart: take(restartAction)
            })
            if (!restart) {
                if (noReturn) {
                    const action = yield take(restartAction)
                    actions = [action]
                } else {
                    return start
                }
            } else {
                actions = [restart]
            }
        }
    }
}
