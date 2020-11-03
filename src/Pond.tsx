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
  /** React application. Components are shown when the initialize is done */
  children: React.ReactNode
  /** Component to show during the connect (very shortly) */
  loadComponent?: JSX.Element
  /** Error callback the the pond is not able to reach actyxOS locally */
  onError?: (error: unknown) => void
  /** optional url to overwrite to local connection and connect to an other peer (default: `ws://localhost:4243/store_api`) */
  url?: string
  /** Hook, when the connection to the store is closed */
  onStoreConnectionClosed?: () => void
}

/** @internal */
let singletonPond: PondType | undefined = undefined

/**
 * Top level component to initialize the pond
 *
 * ## Example:
 * ```js
 * ReactDOM.render(
 *   <Pond>
 *     <App />
 *   </Pond>,
 *   document.getElementById('root')
 * )
 * ```
 *
 * @param __namedParameters reactProperties for the pond @see PondProps
 * @param children React application. Components are shown when the initialize is done
 * @param loadComponent Component to show during the connect (very shortly)
 * @param onError Error callback the the pond is not able to reach actyxOS locally
 * @returns React component
 */
export const Pond = ({
  children,
  loadComponent,
  onError,
  url,
  onStoreConnectionClosed
}: PondProps) => {
  const [pond, setPond] = React.useState<PondType>()
  React.useEffect(() => {
    if (singletonPond) {
      console.error(
        'Warning: Reuse existing pond, Please initialize the Pond only once at top level'
      )
      setPond(singletonPond)
      return
    }

    PondType.of({ url: url || 'ws://localhost:4243/store_api', onStoreConnectionClosed }, {})
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
 * Learn more about the pond: https://developer.actyx.com/docs/pond/getting-started
 *
 * ```typescript
 * emit<E>(tags: Tags<E>, event: E): PendingEmission;
 * observe<S, E>(fish: Fish<S, E>, callback: (newState: S) => void): CancelSubscription;
 * run<S, EWrite>(fish: Fish<S, any>, fn: StateEffect<S, EWrite>): PendingEmission;
 * keepRunning<S, EWrite>(fish: Fish<S, any>, fn: StateEffect<S, EWrite>, autoCancel?: (state: S) => boolean): CancelSubscription;
 * dispose(): void;
 * info(): PondInfo;
 * getPondState(callback: (newState: PondState) => void): CancelSubscription;
 * getNodeConnectivity(params: GetNodeConnectivityParams): CancelSubscription;
 * waitForSwarmSync(params: WaitForSwarmSyncParams): void;
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
