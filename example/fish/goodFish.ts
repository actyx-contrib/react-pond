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
import { createRegistryFish } from '@actyx-contrib/registry'
import {
  Envelope,
  FishType,
  InitialState,
  OnCommand,
  OnEvent,
  OnStateChange,
  Semantics,
  SnapshotFormat,
  Subscription
} from '@actyx/pond'

/*
 * Fish State
 */
export type UnknownState = {
  type: 'unknown'
}
export type SetState = {
  type: 'set'
  pos: string
}
export type deletedState = {
  type: 'deleted'
  lastPos: string
}
export type State = UnknownState | SetState | deletedState
export type PublicState = State
const initialState: InitialState<State> = (name, _sourceId) => ({
  state: {
    type: 'unknown'
  },
  subscriptions: [Subscription.of(GoodFish, name)]
})

/**
 * Fish Events
 */

export enum EventType {
  deleted = 'deleted',
  movedTo = 'movedTo'
}
export type DeletedEvent = {
  type: EventType.deleted
}
export type MovedToEvent = {
  type: EventType.movedTo
  pos: string
}
export type Event = DeletedEvent | MovedToEvent

export const onEvent: OnEvent<State, Event> = (state: State, event: Envelope<Event>) => {
  const { payload } = event
  switch (payload.type) {
    case EventType.deleted: {
      if (state.type === 'set') {
        return {
          type: 'deleted',
          lastPos: state.pos
        }
      }
      return state
    }
    case EventType.movedTo: {
      // I think this is something you are looking for
      if (state.type === 'deleted') {
        return {
          type: 'deleted',
          lastPos: payload.pos
        }
      } else {
        return {
          type: 'set',
          pos: payload.pos
        }
      }
    }
  }
  return state
}
/**
 * Fish Commands
 */
export enum CommandType {
  moveTo = 'moveTo',
  delete = 'delete'
}
export type MoveToCommand = {
  type: CommandType.moveTo
  pos: string
}
export type DeleteCommand = {
  type: CommandType.delete
}
export type Command = MoveToCommand | DeleteCommand

export const onCommand: OnCommand<State, Command, Event> = (state: State, command: Command) => {
  switch (command.type) {
    case CommandType.moveTo: {
      return [
        {
          type: EventType.movedTo,
          pos: command.pos
        }
      ]
    }
    case CommandType.delete: {
      if (state.type === 'set') {
        return [
          {
            type: EventType.deleted
          }
        ]
      }
    }
  }
  return []
}

/*
 * Local Snapshot
 */
const localSnapshot: SnapshotFormat<State, unknown> = {
  version: 1,
  serialize: state => state,
  deserialize: state => state as State
}

/*
 * Fish Definition
 */
export const GoodFish = FishType.of<State, Command, Event, PublicState>({
  semantics: Semantics.of('ax.goodFish'),
  initialState,
  onEvent,
  onCommand,
  onStateChange: OnStateChange.publishPrivateState(),
  localSnapshot
})

export const GoodRegistryFish = createRegistryFish(GoodFish, EventType.movedTo)
