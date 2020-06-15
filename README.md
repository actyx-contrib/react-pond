<img width="130px" src="https://raw.githubusercontent.com/actyx-contrib/react-pond/master/icon.png?token=AATHWQIC5RWS62GY3OINH3C645MHQ">

# React-Pond

Use the [Actyx-Pond framework](https://developer.actyx.com/docs/pond/getting-started/) fully integrated in React. Expend you tool chain with `<Pond>`, `useFish`, `useRegistryFish`, `useRegistryFishMap`, `usePond`, and `useStream` to speed up your UI projects and write distributed apps in a couple of hours.  

## 📦 Installation

React-Pond is available as a [npm package](https://www.npmjs.com/package/@actyx-contrib/react-pond).

```shell
npm install @actyx-contrib/react-pond
```

# 📖  Documentation and detailed examples

You can access the full api documentation and related examples by visiting: [https://actyx-contrib.github.io/react-pond](https://actyx-contrib.github.io/react-pond/)

You will find detailed examples [here](https://github.com/actyx-contrib/react-pond/tree/master/example)

# 🤓 Quick start

## 🌊 `<Pond>...</Pond>`

Wrap your application with the `<Pond>` to use you fish everywhere in the code.

### Example

```js
export const wireUI = () =>
  ReactDOM.render(
    <Pond>
      <AmazingDistributedApp />
    </Pond>,
    document.getElementById('root')!,
  )
```

## 🐟 `useFish`

Write your distributed logic with the well known fish and get the public state as easy as possible

### Example

```js
const MaterialRequest = ({id}: Props) => {
  const [mrState] = useFish(MaterialRequestFish, id)

  return (
    <div>
      <div>
        Material Request ({mrState.name}): mrState.state.status
      </div>
      <button onClick={() => mrState.feed({type: CommandType.Done})}>
        Done
      </button>
    </div>
  )
}
```

## 🎏 `useRegistryFish`

Run with the concept of registry fish and write scalable and maintainable data architecture. The `useRegistryFish` function will return you an array of all relevant fish to create tables, autocomplete inputs, and select fields as easy as possible.

If you registry fish is not as strateforward, use the mapper function in `useRegistryFishMap`

---
**NOTE**
Learn more about registry fish here: [https://developer.actyx.com/blog/2020/06/15/registry-fishes](https://developer.actyx.com/blog/2020/06/15/registry-fishes) 

Checkout the @actyx-contrib/registry project on [GitHub](https://github.com/actyx-contrib/registry) or install it with `npm install @actyx-contrib/registry`

---

### Example

```js
const MaterialRequest = ({id}: Props) => {
  const [materialRequests] = useRegistryFish(MaterialRequestRegistryFish, MaterialRequestFish)

  return (
    <div>
      <div>
        Maintain all material requests
      </div>
      <div>
        {materialRequests.map(mrFish => {
          return (
            <div>
              <div>
                Material Request ({mrFish.name}): mrFish.state.status
              </div>
              <button onClick={() => mrFish.feed({type: CommandType.Done})}>
                Done
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

## `useStream`

If you already have some complex `Observables` in your code. Use the `useStream` function to turn it into a state and render your UI.

### Example

```js
const Example = () => {
  const [ticks] = useStream(interval(1000))

  const [mrState] = useFish(MaterialRequestFish, id)
  const cool$ = mrState.stream$.pipe(/*...*/)
  const [advancedState] = useStream(cool$)

  return <div>
    <div>timer: {ticks}</div>
    <div>state: {advancedState}</div>
  </div>
}
```

## 🌊 `usePond`

the pond in not hidden from you. use it as usual with `const pond = usePond()`

### Example

```js
const Example = () => {
  const pond = usePond()
  const [nodeConnectivity] = useStream(pond.getNodeConnectivity())

  return <div>
    <div>{JSON.stringify(nodeConnectivity)}</div>
  </div>
}
```
