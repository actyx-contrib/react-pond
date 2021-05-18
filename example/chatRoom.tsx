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
import { useState } from 'react'
import * as ReactDOM from 'react-dom'
import { Pond, useFishFn, useFish, useRegistryFish } from '../src'
import { ChatRoom } from './fish/chatRoomFish'

export const Chat = () => {
  const [message, setMessage] = useState('')
  const [userName, setUserName] = useState('user')
  const [channel, setChannel] = useState('lobby')

  const chatRoomFish = useFishFn(ChatRoom.forChannel, channel)
  const chatRoomListFish = useFish(ChatRoom.channelList)
  const allChatRooms = useRegistryFish(ChatRoom.channelList, s => s, ChatRoom.forChannel)

  return (
    <div>
      <div>
        current chat room:{' '}
        <input onChange={({ target }) => setChannel(target.value)} value={channel} />
        {chatRoomListFish.state.map(name => (
          <button key={name} onClick={() => setChannel(name)}>
            {name}
          </button>
        ))}
        {allChatRooms.map(f => (
          <div key={f.props}>
            {f.props} : {f.state.join(', ')}
          </div>
        ))}
      </div>
      <div>
        username: <input onChange={({ target }) => setUserName(target.value)} value={userName} />
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
            <input onChange={({ target }) => setMessage(target.value)} value={message} />
            <button
              onClick={() =>
                chatRoomFish.run((_state, enqueue) =>
                  enqueue(ChatRoom.tags.channel.withId(channel), {
                    type: 'message',
                    message,
                    sender: userName,
                    channel
                  })
                )
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

ReactDOM.render(
  <Pond
    onError={e => {
      setTimeout(() => location.reload(), 5000)
      return (
        <div>Connection to Actyx rejected: {JSON.stringify(e)}. Next reconnect in 5 seconde</div>
      )
    }}
  >
    <Chat />
  </Pond>,
  document.getElementById('root')
)
