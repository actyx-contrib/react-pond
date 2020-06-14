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
