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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FishName, FishTypeImpl } from '@actyx/pond'
import * as React from 'react'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { usePond } from './Pond'
import { map, switchMap, share } from 'rxjs/operators'

/**
 * Feed fish function type
 *
 * @param command feed the fish with this command
 * @typeParam Command Available commands for the fish
 * @returns Promise when the feed is done
 */
export type FeedFish<Command> = (command: Command) => Promise<void>
/**
 * Set new fish name type. The fish name is used to hydrate the fish and return the state
 *
 * @param newName set a new name to the observing fish
 */
export type SetNewFishName = (newName: string) => void
/** Generic fish type for the registry fish */
export type FishTypeRegistry = FishTypeImpl<any, any, any, ReadonlyArray<FishName | string>>
/**
 * Generic fish type for the registry fish with generic public state
 * @typeParam PublicState Observable state of the registry fish
 */
export type FishTypeRegistryMap<PublicState> = FishTypeImpl<any, any, any, PublicState>
/**
 * Simplified type for the entity fish
 * @typeParam Command Available commands for the fish
 * @typeParam PublicState Observable state of the fish
 */
export type FishTypeEntity<Command, PublicState> = FishTypeImpl<any, Command, any, PublicState>

/**
 * ReactFish type.
 *
 * This fish will handle all interactions with the React component.
 *
 * state, feed, name, stream$
 *
 * @typeParam Command Available commands for the fish
 * @typeParam PublicState Observable state of the fish
 */
export type ReactFish<Command, PublicState> = {
  /** current public state of the observed fish */
  state: PublicState
  /** feed function for the observed fish */
  feed: FeedFish<Command>
  /** name of the observed fish */
  name: string
  /** stream$ of the public state @see useStream*/
  stream$: Observable<PublicState>
}

/**
 * Stateful integration of an actyx Pond Fish.
 *
 * ## Example:
 * ```js
 * export const App = () => {
 *   const [chatRoomFish] = useFish(ChatRoomFish, 'lobby')
 *
 *   return (
 *     <div>
 *       {chatRoomFish && (
 *         <>
 *           <div>current chat room: {chatRoomFish.name}</div>
 *           <div>
 *             {chatRoomFish.state.map((message, idx) => <div key={idx}>{message}</div>)}
 *           </div>
 *           <div>
 *             <button
 *               onClick={
 *                 () => chatRoomFish.feed({type: CommandType.postMessage, sender: 'me', 'hi'})
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
 * @param fishName (optional) if a name is set, this fish will be observed or hydrated. If no name is set, use the returned SetNewFishName to set the name
 * @typeParam Command Available commands for the fish
 * @typeParam PublicState Observable state of the fish
 * @returns [ReactFish?, SetNewFishName] If no name is set, the ReactFish is undefined
 */
export const useFish = <Command, PublicState>(
  fish: FishTypeEntity<Command, PublicState>,
  fishName?: string
): [ReactFish<Command, PublicState> | undefined, SetNewFishName] => {
  const [name, setName] = React.useState(fishName)
  const [reactFish, setReactFish] = React.useState<ReactFish<Command, PublicState>>()
  const { observe, feed } = usePond()

  React.useEffect(() => {
    if (name) {
      const stream$ = observe(fish, name).share()

      const sub = stream$
        .pipe(
          map<PublicState, ReactFish<Command, PublicState>>(state => ({
            state,
            feed: (command: Command) => feed(fish, name)(command).toPromise(),
            name,
            stream$
          }))
        )
        .subscribe(setReactFish)
      return () => sub && sub.unsubscribe()
    }
    setReactFish(undefined)
    return
  }, [name, fishName])

  return [
    reactFish,
    (newName: string) => {
      newName !== name && setName(newName)
    }
  ]
}

/**
 * Return of the useRegistryFish function
 *
 * @internal
 * @typeParam Command Available commands for the fish
 * @typeParam PublicState Observable state of the fish
 */
type UseRegistryFishReturn<Command, PublicState> = [
  ReadonlyArray<ReactFish<Command, PublicState>>,
  Observable<ReadonlyArray<PublicState>>
]

/**
 * Observe the registry fish to get the names of the entity fish. Observe all entity fish
 * and return a array of ReactFish representing the entities
 *
 * @see useRegistryFishMap If your registry fish has **not** an array of fish names as public state
 *
 * ## Example:
 * ```js
 * export const App = () => {
 *   const [chatRooms] = useRegistryFish(ChatRoomRegistryFish, ChatRoomFish)
 *
 *   return (
 *     <div>
 *       {chatRooms.map(chatRoomFish => (
 *         <>
 *           <div>Chat room: {chatRoomFish.name}</div>
 *           <div>
 *             Last fife messages:
 *             {chatRoomFish.state.slice(-5).map((message, idx) => <div key={idx}>{message}</div>)}
 *           </div>
 *           <div>
 *             <button
 *               onClick={
 *                 () => chatRoomFish.feed({type: CommandType.postMessage, sender: 'me', 'hi'})
 *               }
 *             >
 *               send "hi"
 *             </button>
 *           </div>
 *         </>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 * @param registryFish registry fish to map the state to the entity fish. (Public state needs to be a FishName[] or a string[])
 * @param entityFish fish, represent a single entity in the registry fish
 * @typeParam Command Available commands for the fish
 * @typeParam PublicState Observable state of the fish
 * @returns [ReactFish[], Observable<PublicState[]>] returns a ReactFish array and a Observable with all states as array @see useStream
 */
export const useRegistryFish = <Command, PublicState>(
  registryFish: FishTypeRegistry,
  entityFish: FishTypeEntity<Command, PublicState>
): UseRegistryFishReturn<Command, PublicState> => {
  const { observe, feed } = usePond()
  const [state, setState] = React.useState<UseRegistryFishReturn<Command, PublicState>>([
    [],
    Observable.never<ReadonlyArray<PublicState>>().startWith([])
  ])

  React.useEffect(() => {
    const allStates$ = observe(registryFish, 'reg').pipe(
      switchMap(reg =>
        reg.length === 0
          ? Observable.never<ReadonlyArray<ReactFish<Command, PublicState>>>().startWith([])
          : combineLatest(
              reg.map(name => {
                const stream$ = observe(entityFish, name).share()
                return stream$.map<PublicState, ReactFish<Command, PublicState>>(state => ({
                  state,
                  feed: (command: Command) => feed(entityFish, name)(command).toPromise(),
                  name,
                  stream$
                }))
              })
            )
      ),
      share()
    )

    const sub = allStates$.subscribe(s => setState([s, allStates$.map(s => s.map(st => st.state))]))
    return () => sub.unsubscribe()
  }, [])

  return state
}

/**
 * Observe the registry fish and map the state to an array of fish names, and finally observe all entity fish according to
 * the fish names and return a array of ReactFish representing the entities.
 *
 * Additionally you will get at Observable of the stream
 *
 * @see useRegistryFish If your registry fish has an array of FishNames or strings as public state
 *
 * @param registryFish registry fish to map the state to the entity fish.
 * @param mapFn mapper from RegistryPublicState to a array of the entity fish names
 * @param entityFish fish, represent a single entity in the registry fish
 * @typeParam RegistryPublicState observable state of the registry fish. Used in the mapper function
 * @typeParam Command Available commands for the fish
 * @typeParam PublicState Observable state of the fish
 * @returns [ReactFish[], Observable<PublicState[]>] returns a ReactFish array and a Observable with all states as array @see useStream
 */
export const useRegistryFishMap = <RegistryPublicState, Command, PublicState>(
  registryFish: FishTypeRegistryMap<RegistryPublicState>,
  mapFn: (regState: RegistryPublicState) => string[],
  entityFish: FishTypeEntity<Command, PublicState>
): UseRegistryFishReturn<Command, PublicState> => {
  const { observe, feed } = usePond()
  const [state, setState] = React.useState<UseRegistryFishReturn<Command, PublicState>>([
    [],
    Observable.never<ReadonlyArray<PublicState>>().startWith([])
  ])

  React.useEffect(() => {
    const allStates$ = observe(registryFish, 'reg').pipe(
      map((state: RegistryPublicState) => mapFn(state)),
      switchMap(reg =>
        reg.length === 0
          ? Observable.never<ReadonlyArray<ReactFish<Command, PublicState>>>().startWith([])
          : combineLatest(
              reg.map(name => {
                const stream$ = observe(entityFish, name).share()
                return stream$.map<PublicState, ReactFish<Command, PublicState>>(state => ({
                  state,
                  feed: (command: Command) => feed(entityFish, name)(command).toPromise(),
                  name,
                  stream$
                }))
              })
            )
      ),
      share()
    )

    const sub = allStates$.subscribe(s => setState([s, allStates$.map(s => s.map(st => st.state))]))
    return () => sub.unsubscribe()
  }, [])

  return state
}
