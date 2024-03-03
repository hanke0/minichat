// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { defaultCrypto } from "@/lib/secure";
import { rooms, secret, keepAliveInterval } from "@/pages/api/_room";

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
  const room = req.query.room
  if (typeof room !== 'string' || !room) {
    res.status(400).end() // Bad Request
    return
  }

  const encUser = defaultCrypto.encrypt(user)
  if (!encUser) {
    res.status(500).end() // Internal Server Error
    return
  }
  const encRoom = defaultCrypto.encrypt(room)
  if (!encRoom) {
    res.status(500).end() // Internal Server Error
    return
  }
  const u = rooms.addUserToRoom(room, user, res)
  if (!u) {
    res.status(409) // Conflict
    return
  }
  console.log(`User ${user} joined room ${room}`)
  let closed = false
  res.once('close', () => {
    rooms.removeUserFromRoom(room, user)
    console.log(`User ${user} left room ${room}`)
    closed = true
  })
  res.status(200)
  res.flushHeaders()
  const interval = setInterval(() => {
    if (closed || !u.keepAlive()) {
      clearInterval(interval)
      res.end()
      return
    }
  }, keepAliveInterval)
}
