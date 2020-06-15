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
import { Pond as PondType } from '@actyx/pond'
import * as React from 'react'

/** @internal */
type PondContext = PondType | undefined

/** @internal */
export const pondContext = React.createContext<PondContext>(undefined)

/**
 * Pond component properties to get some feedback
 */
type PondProps = {
  /** children components are shown when the init is done */
  children: React.ReactNode
  /** component to show during the connect (very quick) */
  loadComponent?: JSX.Element
  /** error callback the the pond is not able to reach actyxOS locally */
  onError?: (error: unknown) => void
}

/** @internal */
let singletonPond: PondType | undefined = undefined

/**
 * Top level component to initialize the pond
 * @param properties {children, loadComponent, onError} @see PondProps
 */
export const Pond = ({ children, loadComponent, onError }: PondProps) => {
  const [pond, setPond] = React.useState<PondType>()
  React.useEffect(() => {
    if (singletonPond) {
      console.error(
        'Warning: Reuse existing pond, Please initialize the Pond only once at top level'
      )
      setPond(singletonPond)
      return
    }

    PondType.default()
      .then(p => {
        singletonPond = p
        setPond(p)
      })
      .catch(e => {
        if (onError) {
          onError(e)
        } else {
          throw new Error(`Is ActyxOS running ${e}`)
        }
      })
  }, [])

  if (pond) {
    return <pondContext.Provider value={pond}>{children}</pondContext.Provider>
  } else {
    return loadComponent !== undefined ? loadComponent : <></>
  }
}

/**
 * Get the pond in your react application.
 *
 * Get more info about the pond: https://developer.actyx.com/docs/pond/getting-started
 *
 * ```typescript
 * observe<C, E, P>(fish: FishType<C, E, P>, name: string): Observable<P>;
 * feed<C, E, P>(fish: FishType<C, E, P>, name: string): (command: C) => Observable<void>;
 * commands(): Observable<SendCommand<any>>;
 * dump(): Observable<string>;
 * dispose(): Promise<void>;
 * info(): PondInfo;
 * getPondState(): Observable<PondState>;
 * getNodeConnectivity(...specialSources: ReadonlyArray<SourceId>): Observable<ConnectivityStatus>;
 * waitForSwarmSync(config?: WaitForSwarmConfig): Observable<SplashState>;
 * ```
 *
 * @returns pond instance
 * @throws Error if <Pond></Pond> is not used before
 */
export const usePond = (): PondType => {
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
