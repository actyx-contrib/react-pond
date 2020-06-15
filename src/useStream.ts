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
import * as React from 'react'
import { Observable } from 'rxjs'

/**
 * Observe an rxjs Observable and get the last emitted value. the observable can be exchanged with setStream
 *
 * ## Example:
 * ```js
 * const Example = () => {
 *   // create a ticker with rxjs
 *   const [ticks, setStream] = useStream(interval(1000))
 *
 *   // exchange stream after 10 seconds
 *   React.useEffect(() => {
 *     const timeout = setTimeout(() => setStream(interval(100)), 10_000)
 *     return () => clearTimeout(timeout)
 *   }, [])
 *
 *   return <div>ticks: {ticks}</div>
 * }
 * ```
 *
 * ## Observe fish
 *
 * To observe the public state of a fish, please use one of the following functions:
 *
 * |   |   |
 * |---|---|
 * | @see useFish | Get the public state or feed a fish |
 * | @see useRegistryFish | Use a registry fish to get the public states of a set of fish |
 * | @see useRegistryFishMap | Use a registry fish with a mapper to get the public states of a set of fish |
 *
 * @param stream$ Observable to get the last emitted value
 * @returns last emitted item of the stream and a setter to exchange the stream
 */
export const useStream = <T>(
  stream$: Observable<T> | undefined
): [T | undefined, (newStream$: Observable<T>) => void] => {
  const [stream, setStream] = React.useState(stream$)
  const [value, setValue] = React.useState<T | undefined>()

  React.useEffect(() => {
    if (stream) {
      const sub = stream.subscribe(s => setValue(s))
      return () => sub && sub.unsubscribe()
    }
    return () => undefined
  }, [stream])

  return [value, setStream]
}
