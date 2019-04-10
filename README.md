# redux-saga-loop-utils

A library that provides a better pattern to manage(start, stop, restart) loops in your redux-saga application, for example: <br>

- HTTP request that occurs at every x inverval
- HTTP request that retries itself upon failure at every x interval

Available APIs:
- [repeatable](#repeatable)
- [stoppable](#stoppable)
- [restartable](#restartable)
- [retry](#retry)
- [withPreviousAction](#withPreviousAction)
- [withPreviousResponse](#withPreviousResponse)


## Installation
	
	npm i redux-saga-loop-utils


## Usage

Import,

	import {
        repeatable,
	    stoppable,
	    restartable,
	    retry,
	    withPreviousAction,
	    withPreviousResponse
	} from 'redux-saga-loop-utils'


Decorate and compose your saga functions,

#### Use case 1: Make an HTTP request every minute

	function* callAPI() {
        const {data} = yield axios.get(API_URL);
	    yield put(someAction(data));
        return data;
	}
	
	function* saga() {
        yield call(
            repeatable(callAPI, {
                interval: 60000
	        })
        );
	}

#### Use case 2: Make an HTTP request every minute, and stop the loop on STOP_ACTION

    function* saga() {
	    yield call(
            stoppable(
            	repeatable(callAPI, {
                    interval: 60000
                }),
	            {
	                stopAction: 'STOP_ACTION'
	            }
	        )
	    );
	}

#### Use case 3: Make an HTTP request every minute, and restart the loop on RESTART_ACTION

    function* saga() {
        yield call(
            restartable(
                repeatable(callAPI, {
	                interval: 60000
	            }),
	            {
	                restartAction: 'RESTART_ACTION'
	            }
	        )
	    );
	}

#### Use case 4: Compose stoppable and restartable together

	function* saga() {
        yield call(
	        stoppable(
	            restartable(callAPI, {
	                restartAction: 'RESTART_ACTION'
	            }),
	            {
	                stopAction: 'STOP_ACTION'
	            }
	        )
	    );
	}

#### Use case 5: Handle HTTP request error

	const handleApiError = saga =>
        function*() {
            try {
                const {response} = yield call(saga);
                return response;
            } catch (err) {
                const {response: {status} = {}, config} = err;
                if (status === 401) {
                    yield showModal('Unauthenticated');
                    yield put({type: 'STOP_ACTION'});
                }
                if (!status) {
                    yield showModal('Network error');
                }
                throw err;
            }
        };

	function* saga() {
        yield call(
            stoppable(
	            repeatable(handleApiError(callAPI), {
	                interval: 60000
	            }),
	            {stopAction: 'STOP_ACTION'}
	        )
        );
	}


## APIs

- <a name="repeatable">repeatable(saga, config, …args)</a>

	**config**
	
		{
            interval: number | (() => number)
            maxRepeats?: number
    	}

	- **interval** is a number in milliseconds or a saga function that returns a number in milliseconds

<br>

- <a name="stoppable">stoppable(saga, config, …args)</a>
	
	**config**
		
		{
            startAction: string | string[]
            stopAction: string | string[]
            noAutoStart?: boolean
    	}
	
	- By default, it commences execution without waiting for **startAction**, unless **noAutoStart: true** is specified
	- Stopped saga can always start again using **startAction**
	
<br>

- <a name="restartable">restartable(saga, config, …args)</a>
	
	**config**

		{
            restartAction: string | string[]
            noAutoStart?: boolean
    	}
    	
	- By default, it commences execution without waiting for **restartAction**, unless **noAutoStart: true** is specified
    - Saga can always restart again using **restartAction**
    - **restartable** is almost identical to **takeLatest**, the difference is with **restartable** you can compose your saga functions like so,

			function* saga() {
    		    yield call(
                    restartable(
                        stoppable(
			                restartable(
			                    function*() {
			                        // do something
			                    },
			                    {
			                        restartAction: 'RESTART_ACTION_2'
			                    }
			                ),
			                {
			                    stopAction: 'STOP_ACTION'
			                }
			            ),
			            {
			                restartAction: 'RESTART_ACTION_1'
			            }
			        )
			    );
			}
	
<br>

- <a name="retry">retry(saga, config, …args)</a>

	**config**

		{
            interval: number
            maxRetries?: number
    	}
	- **interval** is a number in milliseconds
	- **retry** will catch error thrown from within your saga, and retry accordingly
	- If **maxRetries** is specified, **retry** will throw a **Max retries reached** error after all retries are unsuccessful, therefore you need to handle the error on your side
	- If **retry** is successful, it will *return* the result returned from the callee saga

<br>

- <a name="withPreviousAction">withPreviousAction(saga, config, …args)</a>

	**config**
	
		{
            initialAction?: any
    	}
	- **withPreviousAction** caches the last dispatched action and passes it to the callee saga like so,

			function* saga() {
                yield takeLatest(
                    'SOME_ACTION',
			        withPreviousAction(function*(action, previousAction) {
			            // do something
			        })
			    );
			}
	- **initialAction** is *undefined* if not provided
		

- <a name="withPreviousResponse">withPreviousResponse(saga, config, …args)</a>

	**config**

		{
            initialResponse?: any
    	}
	- **withPreviousResponse** caches the last response returned from the callee saga and passes it to the caller saga like so,

			function* saga() {
                yield call(function*() {
                    const {prev, next} = yield call(withPreviousResponse(callAPI));
                });
			}
	- **initialResponse** is *undefined* if not provided
