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
import { Pond, usePond, useStream } from '@actyx-contrib/react-pond'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

export const App = () => {
  const { getNodeConnectivity, getPondState, info } = usePond()
  const [nodeConnectivity] = useStream(getNodeConnectivity())
  const [pondState] = useStream(getPondState())

  return (
    <div>
      <div>{JSON.stringify(nodeConnectivity)}</div>
      <div>{JSON.stringify(pondState)}</div>
      <div>{JSON.stringify(info())}</div>
    </div>
  )
}

export const wireUI = () => {
  ReactDOM.render(
    <Pond>
      <App />
    </Pond>,
    document.getElementById('root')!
  )
}
