
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { channels, safeGetRequestUser } from "@/pages/api/_lib";
import { Message } from "@/lib/types";
import type { NextApiRequest, NextApiResponse } from "next";

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

export default function handle(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  if (req.method !== 'POST') {
    res.status(405).end() // Method Not Allowed
    return
  }
  const { user, channel, ip } = safeGetRequestUser(req, res)
  if (!user || !channel || !ip) {
    return
  }
  const { message } = req.body as { message: Message }
  if (!message || message.type != 'text') {
    res.status(400).end() // Bad Request
    return
  }
  if (!message.payload) {
    res.status(400).end() // Bad Request
    return
  }
  message.from = user
  console.log(`Broadcasting message from ${user} at ${ip} to channel ${channel}`)
  const n = channels.broadcast(channel, user, message)
  res.status(200).json({ ok: true, numUsers: n })
}
