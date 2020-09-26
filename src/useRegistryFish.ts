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
import { Fish, CancelSubscription } from '@actyx/pond'
import * as React from 'react'
import { usePond } from './Pond'
import { ReactFish, mkReactFish } from './useFish'
import equal from 'deep-equal'

/**
 * Stateful integration of an actyx Pond Fish factory.
 *
 * Learn more about the fish: https://developer.actyx.com/docs/pond/getting-started
 *
 * ## Example:
 * ```js
 * export const App = () => {
 *   const allChatRooms = useRegistryFish(ChatRoom.channelList, (s) => s, ChatRoom.forChannel)
 *
 *   return (
 *     <div>
 *      {allChatRooms.map(f => (
 *        <div key={f.props}>{f.props}: {f.state.join(', ')}</div>
 *      ))}
 *     </div>
 *   )
 * }
 * ```
 *
 * @param regFish fish to get the public state for, or fish factory function
 * @param map map the registry state to an array of properties used by the mkFish
 * @param mkFish fish factory function to get the public state for
 * @returns ReactFish[] entities of the registry
 */
export const useRegistryFish = <RegState, State, Events, Props>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  regFish: Fish<RegState, any>,
  map: (regState: RegState) => Props[],
  mkFish: (props: Props) => Fish<State, Events>
): ReactFish<State, Events, Props>[] => {
  const pond = usePond()
  const [regProps, setRegProps] = React.useState<Props[]>()
  const [entityStates, setEntityStates] = React.useState<ReactFish<State, Events, Props>[]>([])

  React.useEffect(
    () =>
      pond.observe(regFish, s => {
        const newRegProps = map(s)
        if (!equal(newRegProps, regProps)) {
          setRegProps(newRegProps)
        }
      }),
    [regProps]
  )
  React.useEffect(() => {
    let entityFishCancel: CancelSubscription[] = []
    if (regProps) {
      // just internal this should not trigger react for re-render or updateing the useEffect
      let liveMode = false
      let states: ReactFish<State, Events, Props>[] = []
      Promise.all(
        regProps.map(
          (properties, idx) =>
            new Promise<[CancelSubscription, ReactFish<State, Events, Props>]>(resolve => {
              let resolveExternal: ReactFish<State, Events, Props> | undefined = undefined
              const c = pond.observe(mkFish(properties), newState => {
                const reactFish = mkReactFish(pond, mkFish(properties), newState, properties)
                if (liveMode) {
                  states[idx] = reactFish
                  setEntityStates([...states])
                } else {
                  if (!c) {
                    resolveExternal = reactFish
                  } else {
                    resolve([c, reactFish])
                  }
                }
              })
              if (resolveExternal) {
                resolve([c, resolveExternal])
              }
            })
        )
      ).then(out => {
        liveMode = true
        states = out.map(e => e[1])
        entityFishCancel = out.map(e => e[0])
        setEntityStates(states)
      })
    }

    return () => entityFishCancel.forEach(c => c())
  }, [regProps])

  return entityStates
}
