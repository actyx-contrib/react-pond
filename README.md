<img width="130px" src="https://raw.githubusercontent.com/actyx-contrib/react-pond/master/icon.png?token=AATHWQIC5RWS62GY3OINH3C645MHQ">

# React-Pond

Use the [Actyx Pond framework](https://developer.actyx.com/docs/pond/getting-started/) fully integrated into React. Expand your toolchain with `<Pond>`, `useFish`, and `usePond` to speed up your UI projects and write distributed apps in a couple of hours.  

## 📦 Installation

React-Pond is available as a [npm package](https://www.npmjs.com/package/@actyx-contrib/react-pond).

```shell
npm install @actyx-contrib/react-pond
```

# 📖  Documentation and detailed examples

You can access the full API documentation and related examples by visiting: [https://actyx-contrib.github.io/react-pond](https://actyx-contrib.github.io/react-pond/)

You will find detailed examples [here](https://github.com/actyx-contrib/react-pond/tree/master/example). They can be executed running e.g. `npm run example:chatRoom'.

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

Write your distributed logic with the well-known fish and get the public state as easy as possible.

### Example

```js
const MaterialRequest = ({ id }: Props) => {
  const [mrState, setId] = useFish(MaterialRequestFish, id)

  return (
    <div>
      <div>
        Material Request ({ id }): mrState.state.status
      </div>
      <button onClick={() => mrState.run(() => [{tags: [`material:${id}`], payload: EventType.Done })}>
        Done
      </button>
    </div>
  )
}
```

## 🌊 `usePond`

the pond is not hidden from you. Use it as usual with `const pond = usePond()`.

### Example

```js
const Example = () => {
  const pond = usePond()
  const [nodeConnectivity, setNodeConnectivity] = React.useState<ConnectivityStatus>()
  React.useEffect(() => {
    getNodeConnectivity({ callback: setNodeConnectivity })
  })

  return <div>
    <div>{JSON.stringify(nodeConnectivity)}</div>
  </div>
}
```
