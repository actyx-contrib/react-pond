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

import { Fish, FishId, Tag } from '@actyx/pond'

// Fish Events
export type MessageEvent = {
  type: 'message'
  sender: string
  message: string
  channel: string
}

// Fish tags
const tags = {
  channel: Tag<MessageEvent>('channel')
}

export const ChatRoom = {
  /** chat room tags */
  tags,
  /** fish factory for a specific channel */
  forChannel: (channel: string): Fish<string[], MessageEvent> => ({
    fishId: FishId.of('com.example.chatRoom', channel, 0),
    initialState: [],
    onEvent: (state, event) => {
      if (event.type === 'message') {
        const newMessage = `${event.sender}: ${event.message}`
        state.push(newMessage)
      }
      return state
    },
    where: tags.channel.withId(channel)
  }),
  /** fish that lists all open channels */
  channelList: {
    fishId: FishId.of('com.example.chatRoomRegistry', 'registry', 0),
    initialState: [],
    onEvent: (state, event) => {
      if (event.type === 'message' && event.channel && !state.includes(event.channel)) {
        state.push(event.channel)
      }
      return state
    },
    where: tags.channel
  } as Fish<string[], MessageEvent>
}
