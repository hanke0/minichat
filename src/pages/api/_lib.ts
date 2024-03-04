import type { NextApiRequest, NextApiResponse } from "next";
import { Message, SecretUser } from "@/lib/types";
import { defaultCrypto } from "@/lib/server/secure";

const secret = process.env.SECRET || "secret";

// 15 seconds
const keepAliveInterval = 15000;

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
    const c = this.channels.get(channel)
    return this.channels.get(channel)?.broadcast(user, JSON.stringify(msg)) || 0
  }
}

const ipRE = {
  ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
  ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
}

function isIP(ip: string) {
  return ipRE.ipv4.test(ip) || ipRE.ipv6.test(ip)
}

function getClientIpFromXForwardedFor(value: string) {
  if (!value) {
    return null;
  }
  const forwardedIps = value.split(',').map(function (e) {
    var ip = e.trim();
    if (ip.includes(':')) {
      var splitted = ip.split(':');

      if (splitted.length === 2) {
        return splitted[0];
      }
    }
    return ip;
  });

  for (let ip of forwardedIps) {
    if (isIP(ip)) {
      return ip;
    }
  }
  return null;
}

function getClientIP(req: NextApiRequest) {
  const real = req.headers['x-real-ip']
  if (typeof real === 'string' && isIP(real)) {
    return real
  }

  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    const ip = getClientIpFromXForwardedFor(forwarded);
    if (ip) {
      return ip;
    }
  }
  return req.socket.remoteAddress
}


function safeGetRequestUser<T>(req: NextApiRequest, res: NextApiResponse): SecretUser {
  const data = req.body as { secret: string }
  if (!data.secret) {
    res.status(400).end() // Bad Request
    return { user: '', channel: '', ip: '' }
  }
  const u = defaultCrypto.decrypt(data.secret)
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

const channels = new Controller()

export { channels, secret, keepAliveInterval, getClientIP, safeGetRequestUser }
