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
import { Fish, StateEffect, Pond } from '@actyx/pond'
import * as React from 'react'
import { usePond } from './Pond'

/**
 * ReactFish type.
 *
 * This fish will handle all interactions with the React component.
 */
export type ReactFish<State, Event, Props = void> = {
  /** current public state of the observed fish */
  state: State
  /** run function for the observed fish */
  run: (eff: StateEffect<State, Event>) => Promise<void>
  /** props of the fish */
  props: Props
}

/** @internal */
const runStateEffect = <State, Events>(pond: Pond, fish: Fish<State, Events>) => (
  eff: StateEffect<State, Events>
) => pond.run(fish, eff).toPromise()

/** @internal */
export const mkReactFish = <State, Events, Props>(
  pond: Pond,
  fish: Fish<State, Events>,
  state: State,
  props: Props
): ReactFish<State, Events, Props> => ({
  state,
  run: runStateEffect(pond, fish),
  props
})

/**
 * Stateful integration of an actyx Pond Fish factory.
 *
 * ## Example:
 * ```js
 * export const App = () => {
 *   const [chatRoomFish, setProps] = useFish(ChatRoomFish.forChannel, 'lobby')
 *
 *   return (
 *     <div>
 *       {chatRoomFish && (
 *         <>
 *           <div>current chat room: {chatRoomFish.props}</div>
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
 * @param fish fish to get the public state for, or fish factory function
 * @param props if a factory function is passed to `fish`, provide the props here
 * @returns ReactFish
 */
export const useFishFn = <State, Events, Props>(
  mkFish: (props: Props) => Fish<State, Events>,
  props?: Props
): ReactFish<State, Events, Props> | undefined => {
  const pond = usePond()
  const [reactFish, setReactFish] = React.useState<ReactFish<State, Events, Props>>()

  React.useEffect(() => {
    if (props) {
      const fish = mkFish(props)
      const sub = pond.observe(fish, newState => {
        const reactFish = mkReactFish<State, Events, Props>(pond, fish, newState, props)
        setReactFish(reactFish)
      })
      return sub
    }
    return
  }, [props])
  return props && reactFish
}

/** @internal */
const useFishInternal = <State, Events>(
  fish: Fish<State, Events>
): ReactFish<State, Events> | undefined => {
  const pond = usePond()
  const [reactFish, setReactFish] = React.useState<ReactFish<State, Events, void>>(
    mkReactFish(pond, fish, fish.initialState, undefined)
  )
  React.useEffect(
    () =>
      pond.observe(fish, newState => {
        const reactFish = mkReactFish(pond, fish, newState, undefined)
        setReactFish(reactFish)
      }),
    []
  )

  return reactFish
}

/**
 * Stateful integration of an actyx Pond Fish.
 *
 * ## Example:
 * ```js
 * export const App = () => {
 *   const [chatRoomFish, setProps] = useFish(ChatRoomFish.forChannel, 'lobby')
 *
 *   return (
 *     <div>
 *       {chatRoomFish && (
 *         <>
 *           <div>current chat room: {chatRoomFish.props}</div>
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
 * @param fish fish to get the public state for, or fish factory function
 * @param props if a factory function is passed to `fish`, provide the props here
 * @returns ReactFish
 */
export const useFish = <State, Events>(
  fish: Fish<State, Events>
): ReactFish<State, Events, void> | undefined => useFishInternal(fish)
