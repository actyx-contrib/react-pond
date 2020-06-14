import { Pond, useFish, useRegistryFish } from '@actyx-contrib/react-pond'
import { CommandType, GoodFish, GoodRegistryFish } from './fish/goodFish'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

export const App = () => {
  const [goodFish, setGoodFishName] = useFish(GoodFish)
  const [goodsReg] = useFish(GoodRegistryFish, 'reg')
  const [goods] = useRegistryFish(GoodRegistryFish, GoodFish)

  return (
    <div>
      <div>
        goodsReg {goodsReg && goodsReg.state.join(', ')}
        <br />
        {goods.map((s, idx) => (
          <div key={idx}>
            {s.name} {JSON.stringify(s.state)}{' '}
          </div>
        ))}
      </div>
      <hr />
      <div>
        {goodFish && (
          <div>
            GoodFishName:{' '}
            <input onChange={({ target }) => setGoodFishName(target.value)} value={goodFish.name} />
            <br />
            {JSON.stringify(goodFish.state)}
            <br />
            <button
              onClick={() =>
                goodFish.feed({
                  type: CommandType.moveTo,
                  pos: `pos ${Math.floor(Math.random() * 10000)}`
                })
              }
            >
              set
            </button>
            <button onClick={() => goodFish.feed({ type: CommandType.delete })}>delete</button>
          </div>
        )}
      </div>
    </div>
  )
}

export const wireUI = () => {
  ReactDOM.render(
    <Pond>
      <App />
    </Pond>,
    document.getElementById('root')!
  )
}
