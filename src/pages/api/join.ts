// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { defaultCrypto } from "@/lib/secure";
import { channels, keepAliveInterval, getClientIP } from "@/pages/api/_lib";
import { SecretUser } from "@/lib/types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).end() // Method Not Allowed
    return
  }
  if (req.headers.accept !== 'text/event-stream') {
    res.status(406).end() // Not Acceptable
    return
  }
  res.setHeader('Content-Encoding', 'none');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const user = req.query.user
  if (typeof user !== 'string' || !user) {
    res.status(400).end() // Bad Request
    return
  }
  const channel = req.query.channel
  if (typeof channel !== 'string' || !channel) {
    res.status(400).end() // Bad Request
    return
  }
  const ip = getClientIP(req)
  if (!ip) {
    res.status(403).end() // Forbidden
    return
  }
  const secretUser: SecretUser = {
    user: user,
    channel: channel,
    ip: ip,
  }

  const encUser = defaultCrypto.encrypt(JSON.stringify(secretUser))
  if (!encUser) {
    res.status(500).end() // Internal Server Error
    return
  }
  const u = channels.addUserToChannel(channel, user, res)
  if (!u) {
    res.status(409) // Conflict
    return
  }
  console.log(`User ${user} at ${ip} joined channel ${channel}`)
  let closed = false
  res.once('close', () => {
    channels.removeUserFromChannel(channel, user)
    console.log(`User ${user} at ${ip} left channel ${channel}`)
    closed = true
    channels.broadcast(channel, user, { type: 'user-left', name: user })
  })
  res.status(200)
  res.flushHeaders()
  u.sendMessage({ type: 'self-join', name: encUser, users: channels.usersInChannel(channel) })
  channels.broadcast(channel, user, { type: 'user-join', name: user })
  const interval = setInterval(() => {
    if (closed || !u.keepAlive()) {
      clearInterval(interval)
      res.end()
      return
    }
  }, keepAliveInterval)
}
