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

import { Fish, FishId, Reduce, Tag } from '@actyx/pond'

/*
 * Fish State
 */
export type State = string[]

/**
 * Fish Events
 */
export enum EventType {
  message = 'message'
}
export type MessageEvent = {
  type: EventType.message
  sender: string
  message: string
}
export type Event = MessageEvent

export const onEvent: Reduce<State, Event> = (state: State, event: Event) => {
  switch (event.type) {
    case EventType.message: {
      const newMessage = `${event.sender}: ${event.message}`
      state.push(newMessage)
    }
  }
  return state
}

const tags = {
  channel: Tag<Event>('channel')
}
const fishForChannel = (channel: string): Fish<State, Event> => ({
  fishId: FishId.of('com.example.chatRoom', channel, 0),
  initialState: [],
  onEvent,
  where: tags.channel.withId(channel)
})

export const ChatRoom = { fishForChannel, tags }
