'use client'
import { Message, TextMessage } from "@/lib/types"
import { useEffect, useState } from "react"

type eventSourceParam = {
  channel: string
  user: string
  setMessages: (set: (pre: TextMessage[]) => TextMessage[]) => void
  setError: (error: Error | null) => void
  setLoading: (loading: boolean) => void
  setSecret: (sendSecret: string) => void
  setClosed: (opened: boolean) => void
  setNumUsers: (users: number) => void
}

function makeEventSource(
  {
    channel,
    user,
    setMessages,
    setError,
    setLoading,
    setSecret,
    setClosed,
    setNumUsers
  }: eventSourceParam
) {
  const query = new URLSearchParams({ user, channel }).toString()
  const eventSource = new EventSource(`/api/join?${query}`)

  eventSource.addEventListener('close', () => {
    console.log('EventSource closed')
    setClosed(true)
  })

  eventSource.addEventListener('open', () => {
    console.log('EventSource opened')
    setClosed(false)
  })

  eventSource.addEventListener('error', (event) => {
    console.log('EventSource failed:', eventSource.readyState, event)
    if (event.type === 'error') {
      const e = event as ErrorEvent
      if (e.message) {
        setError(new Error(`Failed to connect to the server: ${e.message}`))
        return
      }
    }
    setError(new Error('Failed to connect to the server'))
    eventSource.close()
  })

  eventSource.addEventListener('message', (event) => {
    setError(null)
    console.log('EventSource message:', event.data)
    try {
      const msg = JSON.parse(event.data) as Message
      if (msg.type === 'text' && msg.payload && msg.id) {
        setMessages((prev) => [...prev, msg])
        return
      }
      if (msg.type == 'self-join') {
        if (msg.conflict) {
          setError(new Error('User already in the channel'))
          eventSource.close()
          return
        }
        if (!msg.payload) {
          setError(new Error('Failed to join the channel'))
          eventSource.close()
          return
        }
        setSecret(msg.payload)
        setNumUsers(msg.users || 0)
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
  const [secret, setSecret] = useState("")
  const [closed, setClosed] = useState(true)
  const [numUsers, setNumUsers] = useState<number>(0)
  const [, setES] = useState<EventSource | null>(null)

  useEffect(() => {
    setError(null)
    setLoading(true)
    setSecret("")
    setClosed(true)

    setES((pre) => {
      if (pre) {
        if (pre.readyState !== EventSource.CLOSED) {
          return pre
        }
      }
      return makeEventSource(
        {
          user, channel, setMessages, setError,
          setLoading, setSecret, setClosed: setClosed,
          setNumUsers,
        }
      )
    })
  }, [user, channel, reconnect])

  const updateNumUsers = () => {
    setNumUsers((prev) => prev + 1)
  }

  const appendMessage = (message: TextMessage) => {
    setMessages((prev) => [...prev, message])
  }

  return {
    messages, error, loading, opened: closed, secret, numUsers,
    updateNumUsers, appendMessage,
    reconnect: () => forceReconnect(Symbol())
  }
}
