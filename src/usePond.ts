/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pond } from '@actyx/pond'
import * as React from 'react'
import { pondContext } from './Pond'

export const usePond = (): Pond => {
  const pond = React.useContext(pondContext)
  if (!pond) {
    throw new Error(
      `Your Application should be wrapped with one <Pond></Pond> tag on top level:

ReactDOM.render(
    <Pond>
      <App />
    </Pond>,
    document.getElementById('root')!
)
`
    )
  }
  return pond
}
