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

/*
 * Generated fish pattern with visual studio code extension Actyx-Pond
 * VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=Actyx.actyx-pond
 */

/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Envelope,
  FishType,
  InitialState,
  OnCommand,
  OnEvent,
  OnStateChange,
  Semantics,
  Subscription
} from '@actyx/pond'

/*
 * Fish State
 */
export type State = ReadonlyArray<string>
export type PublicState = State
const initialState: InitialState<State> = (name, _sourceId) => ({
  state: [],
  subscriptions: [Subscription.of(ChatRoomFish, name)]
})

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

export const onEvent: OnEvent<State, Event> = (state: State, event: Envelope<Event>) => {
  const { payload } = event
  switch (payload.type) {
    case EventType.message: {
      const newMessage = `${payload.sender}: ${payload.message}`
      return [newMessage, ...state]
    }
  }
  return state
}

/**
 * Fish Commands
 */
export enum CommandType {
  postMessage = 'postMessage'
}
export type PostMessageCommand = {
  type: CommandType.postMessage
  sender: string
  message: string
}
export type Command = PostMessageCommand

export const onCommand: OnCommand<State, Command, Event> = (_state: State, command: Command) => {
  switch (command.type) {
    case CommandType.postMessage: {
      return [
        {
          type: EventType.message,
          message: command.message,
          sender: command.sender
        }
      ]
    }
  }
  return []
}

/*
 * Fish Definition
 */
export const ChatRoomFish = FishType.of<State, Command, Event, PublicState>({
  semantics: Semantics.of('com.example.chatRoom'),
  initialState,
  onEvent,
  onCommand,
  onStateChange: OnStateChange.publishPrivateState()
})
