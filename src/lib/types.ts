

interface BaseMessage {
  type: string
  id: string
  payload: string
}

export interface TextMessage extends BaseMessage {
  type: 'text'
}

export interface SelfJoinMessage extends BaseMessage {
  type: 'self-join'
  users: number
}

export interface UserJoinMessage extends BaseMessage {
  type: 'user-join'
}

export interface UserLeftMessage extends BaseMessage {
  type: 'user-left'
}

export type Message =
  | TextMessage | SelfJoinMessage | UserJoinMessage | UserLeftMessage

export type SecretUser = {
  user: string
  channel: string
  ip: string
}
