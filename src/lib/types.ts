

export type Message = {
  type: 'text'
  payload: string
} | {
  type: 'join'
  encryptedUser: string
  encryptedRoom: string
}
