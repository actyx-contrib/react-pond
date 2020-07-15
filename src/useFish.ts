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
import { Fish, StateEffect } from '@actyx/pond'
import * as React from 'react'
import { usePond } from './Pond'

/**
 * ReactFish type.
 *
 * This fish will handle all interactions with the React component.
 *
 * state, run
 * TODO DOCS
 */
export type ReactFish<State, Event> = {
  /** current public state of the observed fish */
  state: State
  /** feed function for the observed fish */
  run: (eff: StateEffect<State, Event>) => Promise<void>
}

/**
 * Stateful integration of an actyx Pond Fish.
 *
 * ## Example:
 * ```js
 * export const App = () => {
 *   const chatRoomFish = useFish(ChatRoomFish.forChannel('lobby'))
 *
 *   return (
 *     <div>
 *       {chatRoomFish && (
 *         <>
 *           <div>current chat room: lobby</div>
 *           <div>
 *             {chatRoomFish.state.map((message, idx) => (
 *               <div key={idx}>{message}</div>
 *             ))}
 *           </div>
 *           <div>
 *             <button
 *               onClick={() =>
 *                 chatRoomFish.run(() => [
 *                   {
 *                     tags: ['channel:lobby'],
 *                     payload: { type: EventType.message, sender: 'me', message: 'hi' }
 *                   }
 *                 ])
 *               }
 *             >
 *               send
 *             </button>
 *           </div>
 *         </>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 *
 * @param fish fish to get the public state for
 * @returns ReactFish
 */
export const useFish = <State, E>(fish: Fish<State, E>): ReactFish<State, E> => {
  const pond = usePond()
  const mkReactFish = (state: State): ReactFish<State, E> => ({
    state,
    run: x => pond.run(fish, x).toPromise()
  })
  const [reactFish, setReactFish] = React.useState<ReactFish<State, E>>(
    mkReactFish(fish.initialState)
  )

  React.useEffect(
    () =>
      pond.observe(fish, newState => {
        const reactFish = mkReactFish(newState)
        setReactFish(reactFish)
      }),
    []
  )

  return reactFish
}
