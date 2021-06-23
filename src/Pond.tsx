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
import { ActyxOpts, AppManifest, Pond as PondType, PondOptions } from '@actyx/pond'
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
  onError?: (error: unknown) => void | JSX.Element
  /**
   * Optionally change the Actyx endpoint the Pond connects to
   * and provide an error handler if the connection to Actyx is dropped.
   * Defaults to `{}`
   * */
  connectionOpts?: ActyxOpts
  /** 
   * Advanced Pond configuration options.
   * Defaults to `{}`
   *  */
  opts?: PondOptions
  /**
   * Manifest describing an Actyx application. Used for authorizing API access.
   * Use `com.example.<somestring>` as `appId` for testing and development purposes,
   * so you don't require a signed certificate.
   * 
   * Defaults to
   * ```
   * {
   *   appId: 'com.example.react-pond-example',
   *   displayName: 'React Pond Example',
   *   version: '0.0.1'
   * }
   * ```
   * */
  manifest?: AppManifest
}

const defaultManifest : AppManifest = {
  appId: 'com.example.react-pond-example',
  displayName: 'React Pond Example',
  version: '0.0.1'
}

/** @internal */
let singletonPond: PondType | undefined = undefined

/**
 * Top level component to initialize the pond
 *
 * ## Minimal example:
 * ```js
 * ReactDOM.render(
 *   <Pond onError={onError}>
 *     <App />
 *   </Pond>,
 *   document.getElementById('root')
 * )
 * ```
 * 
 * ## Complete example:
 * ```js
 * ReactDOM.render(
 *   <Pond onError={onError}
 *    manifest={{
 *     appId: 'io.actyx.react-pond-example',
 *     displayName: 'React Pond Example',
 *     version: '0.0.1',
 *     signature: 'v2tz...JBPT3/'
 *   }}
 *   connectionOpts={{
 *     actyxHost: 'actyx',
 *     actyxPort: 4232,
 *     onConnectionLost: onConnectionLostHandler
 *   }}
 *   opts={{
 *     fishErrorReporter: fishErrorReporter
 *   }}
 *   >
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
  manifest,
  connectionOpts,
  opts
}: PondProps) => {
  const [pond, setPond] = React.useState<PondType>()
  const [errorStateComponent, setErrorStateComponent] = React.useState<JSX.Element | undefined>(
    undefined
  )

  if (onError === undefined) {
    console.warn(
      'Not providing an onError handler is deprecated. Add a mechanism (e.g. reload) for handling connection problems with Actyx'
    )
  }

  React.useEffect(() => {
    if (singletonPond) {
      console.warn(
        'Warning: Reuse existing pond, Please initialize the Pond only once at top level'
      )
      setPond(singletonPond)
      return
    }

    PondType.of(manifest || defaultManifest, connectionOpts || {}, opts || {})
      .then(p => {
        singletonPond = p
        setPond(p)
      })
      .catch(e => {
        if (onError) {
          const errorComp = onError(e)
          if (errorComp) {
            setErrorStateComponent(errorComp)
          }
        } else {
          throw new Error(`Is ActyxOS running ${e}`)
        }
      })
  }, [])

  if (pond) {
    return <pondContext.Provider value={pond}>{children}</pondContext.Provider>
  } else if (errorStateComponent) {
    return errorStateComponent
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
