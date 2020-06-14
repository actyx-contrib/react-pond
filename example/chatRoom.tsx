import * as React from 'react'
import { useState } from 'react'
import * as ReactDOM from 'react-dom'
import { Pond, useFish } from '@actyx-contrib/react-pond'
import { createRegistryFish } from '@actyx-contrib/registry'
import { ChatRoomFish, EventType, CommandType } from './fish/chatRoomFish'

const ChatRoomRegistryFish = createRegistryFish(ChatRoomFish, EventType.message)

export const start = () => {
  ReactDOM.render(
    <Pond>
      <Chat />
    </Pond>,
    document.getElementById('root')!
  )
}

export const Chat = () => {
  const [message, setMessage] = useState('')
  const [userName, setUserName] = useState('user')
  const [chatRoomFish, setChatRoomFishName] = useFish(ChatRoomFish, 'lobby')
  const [chatRoomRegistryFish] = useFish(ChatRoomRegistryFish, 'reg')

  return (
    <div>
      <div>
        current chat room:{' '}
        <input
          onChange={({ target }) => setChatRoomFishName(target.value)}
          value={chatRoomFish ? chatRoomFish.name : ''}
        />
        <div>{chatRoomRegistryFish && chatRoomRegistryFish.state.join(', ')}</div>
      </div>
      <div>
        username:{' '}
        <input
          onChange={({ target }) => target.value !== userName && setUserName(target.value)}
          value={userName}
        />
      </div>
      <hr />
      {chatRoomFish && (
        <>
          <div>
            {chatRoomFish.state.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </div>
          <div>
            Your message:{' '}
            <input
              onChange={({ target }) => target.value !== message && setMessage(target.value)}
              value={message}
            />
            <button
              onClick={() =>
                chatRoomFish.feed({ type: CommandType.postMessage, sender: userName, message })
              }
            >
              send
            </button>
          </div>
        </>
      )}
    </div>
  )
}
