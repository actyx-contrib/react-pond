/*
 * Copyright 2020 Actyx AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { useStream } from '@actyx-contrib/react-pond'
import { interval } from 'rxjs/observable/interval'

const Example = () => {
  // create a ticker with rxjs
  const [ticks, setStream] = useStream(interval(1000))

  // exchange stream after 10 seconds
  React.useEffect(() => {
    const timeout = setTimeout(() => setStream(interval(100)), 10_000)
    return () => clearTimeout(timeout)
  }, [])

  return <div>ticks: {ticks}</div>
}

ReactDOM.render(<Example />, document.getElementById('root'))
