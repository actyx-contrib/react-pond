import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { useStream } from '@actyx-contrib/react-pond'
import { interval } from 'rxjs/observable/interval'

export const start = () => {
  ReactDOM.render(<Example />, document.getElementById('root')!)
}

const Example = () => {
  // create a ticker with rxjs
  const [ticks, setStream] = useStream(interval(1000))

  // exchange stream after 10 seconds
  React.useEffect(() => {
    const timeout = setTimeout(() => setStream(interval(100)), 10_000)
    return () => clearTimeout(timeout)
  }, [])

  return <div>ticks: {ticks}</div>
}
