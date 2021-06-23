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
import { Pond, usePond } from '../src'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { PondState } from '@actyx/pond/lib/pond-state'

export const App = () => {
  const { info, getPondState } = usePond()
  const [pondState, setPondState] = React.useState<PondState>()
  React.useEffect(() => {
    getPondState(setPondState)
  }, [])

  return (
    <div>
      <hr />
      <h3>Pond State</h3>
      <pre>{JSON.stringify(pondState, undefined, 2)}</pre>
      <hr />
      <h3>Pond Info</h3>
      <pre>{JSON.stringify(info(), undefined, 2)}</pre>
    </div>
  )
}

ReactDOM.render(
  <Pond
    onError={e => {
      setTimeout(() => location.reload(), 5000)
      return (
        <div>Connection to Actyx rejected: {JSON.stringify(e)}. Next reconnect in 5 seconds.</div>
      )
    }}
  >
    <App />
  </Pond>,
  document.getElementById('root')
)
