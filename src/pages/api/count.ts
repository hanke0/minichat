import { channels, safeGetRequestUser } from "@/pages/api/_lib"
import type { NextApiRequest, NextApiResponse } from "next"

export default function handle(
  req: NextApiRequest,
  res: NextApiResponse<{ count: number }>,
) {
  if (req.method !== 'GET') {
    res.status(405).end() // Method Not Allowed
    return
  }
  const { channel } = safeGetRequestUser(req, res)
  if (!channel) {
    return
  }
  const count = channels.usersInChannel(channel)
  return res.status(200).json({ count })
}
