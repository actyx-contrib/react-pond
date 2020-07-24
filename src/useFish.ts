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
export type ReactFish<State, Event, T> = {
  /** current public state of the observed fish */
  state: State
  /** run function for the observed fish */
  run: (eff: StateEffect<State, Event>) => Promise<void>
  /** current props of the fish */
  props?: T
}
export type SetProps<P> = (props: P) => void

/** @internal */
const mkReactFish = <S, E, P>(
  pond: Pond,
  fish: Fish<S, E>,
  state: S,
  props?: P
): ReactFish<S, E, P> => ({
  state,
  run: x => pond.run(fish, x).toPromise(),
  props
})

/** @internal */
const useFishFn = <State, E, P>(
  mkFish: (props: P) => Fish<State, E>,
  props?: P
): [ReactFish<State, E, P> | undefined, SetProps<P>] => {
  const pond = usePond()
  const [fishProps, setFishProps] = React.useState<P | undefined>(props)
  const [reactFish, setReactFish] = React.useState<ReactFish<State, E, P>>()

  React.useEffect(() => {
    if (fishProps) {
      const fish = mkFish(fishProps)
      const sub = pond.observe(fish, newState => {
        const reactFish = mkReactFish<State, E, P>(pond, fish, newState, fishProps)
        setReactFish(reactFish)
      })
      return sub
    }
    return
  }, [fishProps, props])
  return [
    reactFish,
    (newProps: P) => {
      !Object.is(newProps, fishProps) && setFishProps(newProps)
    }
  ]
}

/** @internal */
const useFishInternal = <State, E, P>(
  fish: Fish<State, E>
): [ReactFish<State, E, P>, SetProps<P>] => {
  const pond = usePond()
  const [reactFish, setReactFish] = React.useState<ReactFish<State, E, P>>(
    mkReactFish(pond, fish, fish.initialState)
  )
  React.useEffect(
    () =>
      pond.observe(fish, newState => {
        const reactFish = mkReactFish<State, E, P>(pond, fish, newState, undefined)
        setReactFish(reactFish)
      }),
    []
  )

  return [
    reactFish,
    () => {
      return
    }
  ]
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
export const useFish = <State, E, P>(
  fish: Fish<State, E> | ((props: P) => Fish<State, E>),
  props?: P
): [ReactFish<State, E, P> | undefined, SetProps<P>] => {
  if (typeof fish === 'function') {
    return useFishFn(fish, props)
  } else {
    return useFishInternal(fish)
  }
}
