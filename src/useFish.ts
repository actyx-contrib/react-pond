/* eslint-disable @typescript-eslint/no-explicit-any */
import { FishName, FishTypeImpl } from '@actyx/pond'
import * as React from 'react'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { usePond } from './usePond'

export type FeedFish<Command> = (command: Command) => Promise<void>
export type SetNewFishName = (newName: string) => void
export type FishTypeRegistry = FishTypeImpl<any, any, any, ReadonlyArray<FishName>>
export type FishTypeEntity<Command, PublicState> = FishTypeImpl<any, Command, any, PublicState>

export type ReactFish<Command, PublicState> = {
  state: PublicState
  feed: FeedFish<Command>
  name: string
  stream$: Observable<PublicState>
}

export const useFish = <Command, PublicState>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fish: FishTypeEntity<Command, PublicState>,
  fishName?: string
): [ReactFish<Command, PublicState> | undefined, SetNewFishName] => {
  const [name, setName] = React.useState(fishName)
  const [reactFish, setReactFish] = React.useState<ReactFish<Command, PublicState>>()
  const { observe, feed } = usePond()

  React.useEffect(() => {
    if (name) {
      const stream$ = observe(fish, FishName.of(name)).share()

      const sub = stream$
        .map<PublicState, ReactFish<Command, PublicState>>(state => ({
          state,
          feed: (command: Command) => feed(fish, FishName.of(name))(command).toPromise(),
          name,
          stream$
        }))
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

type UseRegistryFishReturn<Command, PublicState> = [
  ReadonlyArray<ReactFish<Command, PublicState>>,
  Observable<ReadonlyArray<PublicState>>
]

export const useRegistryFish = <Command, PublicState>(
  registryFish: FishTypeRegistry,
  entityFish: FishTypeEntity<Command, PublicState>
): UseRegistryFishReturn<Command, PublicState> => {
  const { observe, feed } = usePond()
  const [state, setState] = React.useState<
    [ReadonlyArray<ReactFish<Command, PublicState>>, Observable<ReadonlyArray<PublicState>>]
  >([[], Observable.never<ReadonlyArray<PublicState>>().startWith([])])

  React.useEffect(() => {
    const allStates$ = observe(registryFish, FishName.of('reg'))
      .switchMap(reg =>
        reg.length === 0
          ? Observable.never<ReadonlyArray<ReactFish<Command, PublicState>>>().startWith([])
          : combineLatest(
              reg.map(name => {
                const stream$ = observe(entityFish, name).share()
                return stream$.map<PublicState, ReactFish<Command, PublicState>>(state => ({
                  state,
                  feed: (command: Command) =>
                    feed(entityFish, FishName.of(name))(command).toPromise(),
                  name,
                  stream$
                }))
              })
            )
      )
      .share()

    const sub = allStates$.subscribe(s => setState([s, allStates$.map(s => s.map(st => st.state))]))
    return () => sub.unsubscribe()
  }, [])

  return state
}
