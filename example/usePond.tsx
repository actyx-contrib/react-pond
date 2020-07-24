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
import { ConnectivityStatus } from '@actyx/pond'
import { PondState } from '@actyx/pond/lib/pond-state'

export const App = () => {
  const { info, getNodeConnectivity, getPondState } = usePond()
  const [nodeConnectivity, setNodeConnectivity] = React.useState<ConnectivityStatus>()
  const [pondState, setPondState] = React.useState<PondState>()
  React.useEffect(() => {
    getNodeConnectivity({ callback: setNodeConnectivity })
    getPondState(setPondState)
  })

  return (
    <div>
      <h3>Node Connectivity</h3>
      <pre>{JSON.stringify(nodeConnectivity, undefined, 2)}</pre>
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
  <Pond>
    <App />
  </Pond>,
  document.getElementById('root')
)
