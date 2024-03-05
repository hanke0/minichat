

interface BaseMessage {
  type: string
  id?: string
  payload: string
}

export interface TextMessage extends BaseMessage {
  type: 'text'
  from: string
}

export interface SelfJoinMessage extends BaseMessage {
  type: 'self-join'
  conflict: boolean
  users: number
}

export interface UserJoinMessage extends BaseMessage {
  type: 'user-join'
}

export interface UserLeftMessage extends BaseMessage {
  type: 'user-left'
}

export interface ErrorMessage extends BaseMessage {
  type: 'error'
}

export type Message =
  | TextMessage | SelfJoinMessage | UserJoinMessage | UserLeftMessage
  | ErrorMessage

export type SecretUser = {
  user: string
  channel: string
  ip: string
}
