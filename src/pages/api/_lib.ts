import { Message, SecretUser } from "@/lib/types";
import { defaultCrypto } from "@/lib/server/secure";
import { getIP } from "@/lib/ip";
import type { NextApiRequest, NextApiResponse } from "next";

export const secret = process.env.SECRET || "secret";

// 15 seconds
export const keepAliveInterval = 15000;

export function sendSSEMessage(res: NextApiResponse, msg: Message) {
  res.write(`data: ${JSON.stringify(msg)}\n\n`)
}

class User {
  name: string
  res: NextApiResponse
  lastActive: Date

  constructor(name: string, res: NextApiResponse) {
    this.name = name
    this.res = res
    this.lastActive = new Date()
  }

  send(msg: string) {
    this.res.write(`data: ${msg}\n\n`)
    this.lastActive = new Date()
  }

  sendMessage(msg: Message) {
    this.send(JSON.stringify(msg))
  }

  keepAlive() {
    if (!this.res.writable) {
      return false
    }
    if (new Date().getTime() - this.lastActive.getTime() > keepAliveInterval) {
      this.res.write(':keep-alive\n\n')
      this.lastActive = new Date()
    }
    return true
  }
}

class Channel {
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

  broadcast(user: string, msg: string) {
    let n = 0
    this.users.forEach((u) => {
      if (u.name === user) {
        return
      }
      u.send(msg)
      n++
    })
    return n
  }

  get length() {
    return this.users.size
  }
}

class Controller {
  channels: Map<string, Channel>
  id: string

  constructor() {
    this.channels = new Map()
    this.id = crypto.randomUUID()
  }

  usersInChannel(channel: string) {
    return this.channels.get(channel)?.length || 0
  }

  addUserToChannel(channel: string, user: string, res: NextApiResponse) {
    let r = this.channels.get(channel)
    if (!r) {
      r = new Channel()
      this.channels.set(channel, r)
    }
    return r.addUser(user, res)
  }

  removeUserFromChannel(channel: string, user: string) {
    const r = this.channels.get(channel)
    if (r) {
      r.removeUser(user)
      if (r.length === 0) {
        this.channels.delete(channel)
      }
    }
  }

  broadcast(channel: string, user: string, msg: Message) {
    return this.channels.get(channel)?.broadcast(user, JSON.stringify(msg)) || 0
  }
}

export function getClientIP(req: NextApiRequest) {
  const ip = getIP((key) => {
    const v = req.headers[key]
    if (!v) {
      return null
    }
    if (typeof v === 'string') {
      return v
    }
    if (v.length > 0) {
      return v[0]
    }
    return null
  })
  if (ip) {
    return ip
  }
  return req.socket.remoteAddress
}

function getSecret(req: NextApiRequest) {
  if (req.method === 'GET') {
    return req.query.secret
  }
  return req.body.secret
}

export function safeGetRequestUser(
  req: NextApiRequest, res: NextApiResponse): SecretUser {
  const secret = getSecret(req)
  if (!secret) {
    res.status(400).end() // Bad Request
    return { user: '', channel: '', ip: '' }
  }
  const u = defaultCrypto.decrypt(secret)
  if (!u) {
    res.status(403).end() // Forbidden
    return { user: '', channel: '', ip: '' }
  }
  const secretUser: SecretUser = JSON.parse(u)
  if (secretUser.ip !== getClientIP(req)) {
    res.status(403).end() // Forbidden
    return { user: '', channel: '', ip: '' }
  }
  return secretUser
}

export const channels = new Controller()
