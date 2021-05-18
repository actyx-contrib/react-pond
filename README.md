<img width="130px" src="https://raw.githubusercontent.com/actyx-contrib/react-pond/master/icon.png?token=AATHWQIC5RWS62GY3OINH3C645MHQ">

# React-Pond

Use the [Actyx Pond framework](https://developer.actyx.com/docs/pond/getting-started/) fully integrated into React. Expand your toolchain with `<Pond>`, `useFish`, and `usePond` to speed up your UI projects and write distributed apps in a couple of hours.

## 📦 Installation

React-Pond is available as a [npm package](https://www.npmjs.com/package/@actyx-contrib/react-pond).

```shell
npm install @actyx-contrib/react-pond
```

# 📖 Documentation and detailed examples

You can access the full API documentation and related examples by visiting: [https://actyx-contrib.github.io/react-pond](https://actyx-contrib.github.io/react-pond/)

You will find detailed examples [here](https://github.com/actyx-contrib/react-pond/tree/master/example). They can be executed running e.g. `npm run example:chatRoom'.

# 🤓 Quick start

## 🌊 `<Pond>...</Pond>`

Wrap your application with the `<Pond>` to use you fish everywhere in the code.

### Example

```js
ReactDOM.render(
  <Pond
    onError={() => {
      setTimeout(() => location.reload(), 5000)
      return <div>Connection to Actyx rejected: {JSON.stringify(e)}. Next reconnect in 5 seconde</div>
    }}
  >
    <AmazingDistributedApp />
  </Pond>,
  document.getElementById('root')!,
)
```

## 🐟 `useFish` and `useFishFn`

Write your distributed logic with the well-known fish and get the state as easy as possible.

- `useFish(fish)`: Hydrate one explicit fish without a factory
- `useFishFn(fishFactory, properties)`: Use a factory function to hydrate fish with properties

### 📖 Example

```js
const MaterialRequest = ({ id }: Props) => {
  const allOpenMatReq = useFish(MatRequest.allOpen)
  const matReq = useFishFn(MatRequest.of, id)

  return (
    <div>
      <div>Open Material Requests: {allOpenMatReq.ids.length}</div>
      <div>
        Material Request ({id}): {matReq.state.status}
      </div>
      <button
        onClick={() =>
          matReq.run((_state, enqueue) => enqueue(Tag('material').withId(id), EventType.Done))
        }
      >
        Done
      </button>
    </div>
  )
}
```

## 🎏 `useRegistryFish`

Map your registry fish to the entities and create tables, lists, complex autocomplete fields, ...

### 📖 Example

```js
const MaterialRequests = () => {
  const allOpenMatReq = useRegistryFish(MatRequest.allOpen, reg => reg.ids, MatRequestFish.of)

  const done = (matReq: ReactFish<State, Events, string>) => {
    matReq.run((_state, enqueue) => enqueue(Tag('material').withId(matReq.props), EventType.Done))
  }

  return (
    <div>
      <div>Open Material Requests: {allOpenMatReq.length}</div>
      {allOpenMatReq.map(matReq => (
        <div key={matReq.props}>
          <div>
            {matReq.props}: {matReq.state.status}
          </div>
          <button onClick={() => done(matReq)}>Done</button>
        </div>
      ))}
    </div>
  )
}
```

## 🌊 `usePond`

The pond is not hidden from you. Use it as usual with `const pond = usePond()`.

### 📖 Example

```js
const Example = () => {
  const pond = usePond()
  const [nodeConnectivity, setNodeConnectivity] = React.useState<ConnectivityStatus>()
  React.useEffect(() => {
    pond.getNodeConnectivity({ callback: setNodeConnectivity })
  }, [])

  return <div>
    <div>{JSON.stringify(nodeConnectivity)}</div>
  </div>
}
```
