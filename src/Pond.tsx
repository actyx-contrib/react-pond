import { Pond as PondType } from '@actyx/pond'
import * as React from 'react'

type PondContext = PondType | undefined

export const pondContext = React.createContext<PondContext>(undefined)

type Props = {
  children: React.ReactNode
}

export const Pond = (props: Props) => {
  const [pond, setPond] = React.useState<PondType>()
  React.useEffect(() => {
    // tslint:disable-next-line: no-floating-promises
    PondType.default().then(setPond)
  }, [])
  if (pond) {
    return <pondContext.Provider value={pond}>{props.children}</pondContext.Provider>
  } else {
    return <></>
  }
}
