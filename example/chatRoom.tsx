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
import { Pond, useFish } from '../src'
import { ChatRoomFish, EventType } from './fish/chatRoomFish'

export const start = () => {
  ReactDOM.render(
    <Pond>
      <Chat />
    </Pond>,
    document.getElementById('root')
  )
}

export const Chat = () => {
  const [message, setMessage] = useState('')
  const [userName, setUserName] = useState('user')
  const [chatRoomName, setChatRoomName] = useState('lobby')
  const chatRoomFish = useFish(ChatRoomFish.forChannel(chatRoomName))

  return (
    <div>
      <div>
        current chat room:{' '}
        <input
          onChange={({ target }) => target.value !== chatRoomName && setChatRoomName(target.value)}
          value={chatRoomName}
        />
      </div>
      <div>
        username:{' '}
        <input
          onChange={({ target }) => target.value !== userName && setUserName(target.value)}
          value={userName}
        />
      </div>
      <hr />
      {
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
                chatRoomFish.run(() => [
                  {
                    tags: ChatRoomFish.tags.channel.withId(chatRoomName),
                    payload: { type: EventType.message, message, sender: userName }
                  }
                ])
              }
            >
              send
            </button>
          </div>
        </>
      }
    </div>
  )
}
