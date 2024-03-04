'use client'
import { Message, TextMessage } from "@/lib/types"
import { on } from "events"
import { useEffect, useState } from "react"

function makeEventSource(
  channel: string, user: string,
  setMessages: (set: (pre: TextMessage[]) => TextMessage[]) => void,
  setError: (error: Error) => void,
  setLoading: (loading: boolean) => void,
  setSecret: (sendSecret: string) => void,
  setOpened: (opened: boolean) => void,
  setUsers: (users: number) => void,
) {
  const query = new URLSearchParams({ user, channel }).toString()
  const eventSource = new EventSource(`/api/join?${query}`)

  eventSource.addEventListener('open', () => {
    setOpened(true)
  })

  eventSource.addEventListener('error', (event) => {
    console.error('EventSource failed:', event)
    setOpened(false)
    if (event.type === 'error') {
      const e = event as ErrorEvent
      if (e.message) {
        setError(new Error(`Failed to connect to the server: ${e.message}`))
        return
      }
    }
    setError(new Error('Failed to connect to the server'))
  })

  eventSource.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data) as Message
      if (msg.type === 'text' && msg.payload && msg.id) {
        setMessages((prev) => [...prev, msg])
        return
      }
      if (msg.type == 'self-join') {
        if (!msg.payload) {
          setError(new Error('Failed to join the channel'))
          eventSource.close()
          return
        }
        setSecret(msg.payload)
        setUsers(msg.users || 0)
        setLoading(false)
        return
      }
    } catch (error) {
      console.error('Error parsing message', error, event.data)
      eventSource.close()
    }
  })

  return eventSource
}

export function useJoin({ user, channel }: { user: string, channel: string }) {
  const [reconnect, forceReconnect] = useState(Symbol())
  const [messages, setMessages] = useState<TextMessage[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [secret, setSecret] = useState<string>("")
  const [opened, setOpened] = useState(false)
  const [numUsers, setNumUsers] = useState<number>(0)
  const [es, setES] = useState<EventSource | null>(null)
  const [once, setOnce] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setOpened(false)
    setES((pre) => {
      if (pre) {
        pre.close()
      }
      return makeEventSource(
        user, channel, setMessages, setError, setLoading, setSecret, setOpened, setNumUsers)
    })
  }, [once, user, channel, reconnect])

  const updateUsers = () => {
    setNumUsers((prev) => prev + 1)
  }

  return {
    messages, error, loading, opened, secret, numUsers,
    reconnect: () => forceReconnect(Symbol())
  }
}
