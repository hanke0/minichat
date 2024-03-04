
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { defaultCrypto } from "@/lib/secure";
import { channels, getClientIP } from "@/pages/api/_lib";
import { Message, SecretUser } from "@/lib/types";

export const config = {
  api: {
    bodyParser: {
      json: true,
      sizeLimit: '1mb',
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 5,
}

type Response = {
  ok: boolean
  numUsers: number
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  if (req.method !== 'POST') {
    res.status(405).end() // Method Not Allowed
    return
  }
  const data = req.body as { secret: string, message: Message }
  if (!data.secret || !data.message || !data.message.type) {
    res.status(400).end() // Bad Request
    return
  }
  const { type } = data.message
  if (type != 'text') {
    res.status(400).end() // Bad Request
    return
  }
  if (!data.message.payload) {
    res.status(400).end() // Bad Request
    return
  }
  const u = defaultCrypto.decrypt(data.secret)
  if (!u) {
    res.status(403).end() // Forbidden
    return
  }
  const secretUser: SecretUser = JSON.parse(u)
  if (secretUser.ip !== getClientIP(req)) {
    res.status(403).end() // Forbidden
    return
  }
  data.message.id = crypto.randomUUID()
  data.message.from = secretUser.user
  console.log(`Broadcasting message from ${secretUser.user} at ${secretUser.ip} to channel ${secretUser.channel}`)
  const n = channels.broadcast(secretUser.channel, secretUser.user, data.message)
  res.status(200).json({ ok: true, numUsers: n })
}
