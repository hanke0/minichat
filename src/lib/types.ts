

export type Message =
  | {
    type: 'text'
    from: string
    payload: string
    id: string
  }
  | {
    type: 'self-join'
    name: string
    users: number
  }
  | {
    type: 'user-join' | 'user-left'
    name: string
  }

export type SecretUser = {
  user: string
  channel: string
  ip: string
}
