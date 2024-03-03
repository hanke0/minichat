import type { NextApiResponse } from "next";
import { Message } from "@/lib/types";

const secret = process.env.SECRET || "secret";

const keepAliveInterval = 1000;

class User {
  name: string
  res: NextApiResponse
  lastActive: Date

  constructor(name: string, res: NextApiResponse) {
    this.name = name
    this.res = res
    this.lastActive = new Date()
  }

  send(msg: Message) {
    this.res.write(`data: ${JSON.stringify(msg)}\n\n`)
    this.res.fl
    this.lastActive = new Date()
  }

  keepAlive() {
    if (!this.res.writable) {
      return false
    }
    if (new Date().getTime() - this.lastActive.getTime() < keepAliveInterval) {
      this.res.write(':keep-alive\n\n')
      this.lastActive = new Date()
    }
    return true
  }
}

class Room {
  users: Map<string, User>

  constructor() {
    this.users = new Map()
  }

  addUser(user: string, res: NextApiResponse) {
    if (this.users.get(user)) {
      return
    }
    const u = new User(user, res)
    this.users.set(user, u)
    return u
  }

  removeUser(user: string) {
    this.users.delete(user)
  }

  broadcast(msg: Message) {
    this.users.forEach((u) => {
      u.send(msg)
    })
  }

  get length() {
    return this.users.size
  }
}

class Controller {
  rooms: Map<string, Room>

  constructor() {
    this.rooms = new Map()
  }

  addUserToRoom(room: string, user: string, res: NextApiResponse) {
    let r = this.rooms.get(room)
    if (!r) {
      r = new Room()
      this.rooms.set(room, r)
    }
    return r.addUser(user, res)
  }

  removeUserFromRoom(room: string, user: string) {
    const r = this.rooms.get(room)
    if (r) {
      r.removeUser(user)
      if (r.length === 0) {
        this.rooms.delete(room)
      }
    }
  }

  broadcast(room: string, msg: Message) {
    this.rooms.get(room)?.broadcast(msg)
  }
}

const rooms = new Controller()

export { rooms, secret, keepAliveInterval }
