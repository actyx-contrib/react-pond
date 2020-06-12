import * as React from 'react'
import { Observable } from 'rxjs'

export const useStream = <T>(
  stream$: Observable<T> | undefined
): [T | undefined, (newStream$: Observable<T>) => void] => {
  const [stream, setStream] = React.useState(stream$)
  const [state, setState] = React.useState<T | undefined>(undefined)

  React.useEffect(() => {
    if (stream) {
      console.log('sub')
      const sub = stream.subscribe(s => setState(s))
      return () => sub && (sub.unsubscribe(), console.log('un sub'))
    }
    return () => undefined
  }, [stream])

  return [state, setStream]
}
