// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { defaultCrypto } from "@/lib/server/secure";
import { channels, keepAliveInterval, getClientIP, sendSSEMessage } from "@/pages/api/_lib";
import { SecretUser } from "@/lib/types";
import { clearInterval } from "timers";
import type { NextApiRequest, NextApiResponse } from "next";

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
  res.status(200)
  res.flushHeaders()

  const user = req.query['user']
  if (typeof user !== 'string' || !user) {
    sendSSEMessage(res, { type: 'error', payload: "User not provided" })
    res.end()
    return
  }
  const channel = req.query['channel']
  if (typeof channel !== 'string' || !channel) {
    sendSSEMessage(res, { type: 'error', payload: "Channel not provided" })
    res.end()
    return
  }
  const ip = getClientIP(req)
  if (!ip) {
    sendSSEMessage(res, { type: 'error', payload: "User ip is unknown" })
    res.end()
    return
  }
  const secretUser: SecretUser = {
    user: user,
    channel: channel,
    ip: ip,
  }
  const encUser = defaultCrypto.encrypt(JSON.stringify(secretUser))
  if (!encUser) {
    sendSSEMessage(res, { type: 'error', payload: "Encrypt user data fails" })
    res.end()
    return
  }
  const u = channels.addUserToChannel(channel, user, res)
  if (!u) {
    sendSSEMessage(res, { type: 'self-join', payload: "", conflict: true, id: "", users: 0 })
    res.end()
    return
  }

  console.log(`User ${user} at ${ip} joined channel ${channel}`)
  let closed = false
  res.once('close', () => {
    channels.removeUserFromChannel(channel, user)
    console.log(`User ${user} at ${ip} left channel ${channel}`)
    closed = true
    channels.broadcast(channel, user, { type: 'user-left', payload: user, id: crypto.randomUUID() })
  })
  res.once('error', (err) => {
    console.error(`User ${user} at ${ip} error`, err)
    closed = true
  })
  res.write('retry: 1500\n\n') // 1.5 seconds
  u.sendMessage({ type: 'self-join', payload: encUser, users: channels.usersInChannel(channel), id: crypto.randomUUID(), conflict: false })
  channels.broadcast(channel, user, { type: 'user-join', payload: user, id: crypto.randomUUID() })
  const interval = setInterval(() => {
    if (closed) {
      clearInterval(interval)
      res.end()
      return
    }
    if (!u.keepAlive()) {
      console.log(`User ${user} at ${ip} left channel ${channel} due to inactivity`)
      clearInterval(interval)
      res.end()
      return
    }
  }, keepAliveInterval)
}
