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
  const [liveMode, setLiveMode] = React.useState(false)
  const [regProps, setRegProps] = React.useState<Props[]>()
  const [entityFishCancel, setEntityFishCancel] = React.useState<CancelSubscription[]>([])
  const [entityStates, setEntityStates] = React.useState<ReactFish<State, Events, Props>[]>([])

  React.useEffect(() => pond.observe(regFish, s => setRegProps(map(s))), [])
  React.useEffect(() => {
    if (regProps) {
      Promise.all(
        regProps.map(
          (properties, idx) =>
            new Promise<[CancelSubscription, ReactFish<State, Events, Props>]>(resolve => {
              let resolveExternal: ReactFish<State, Events, Props> | undefined = undefined
              const c = pond.observe(mkFish(properties), newState => {
                const reactFish = mkReactFish(pond, mkFish(properties), newState, properties)
                if (liveMode) {
                  const newState = [...entityStates]
                  newState[idx] = reactFish
                  setEntityStates(newState)
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
        setLiveMode(true)
        setEntityFishCancel(out.map(e => e[0]))
        setEntityStates(out.map(e => e[1]))
      })
    }

    return () => {
      entityFishCancel.forEach(c => c())
      setLiveMode(false)
    }
  }, [regProps])

  return entityStates
}
