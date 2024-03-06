'use client'
import { Message, TextMessage } from "@/lib/types"
import { useCallback, useEffect, useState, Dispatch, SetStateAction } from "react"
import { toast } from "react-hot-toast"

type eventSourceParam = {
  channel: string
  user: string
  setMessages: Dispatch<SetStateAction<TextMessage[]>>
  setError: Dispatch<SetStateAction<Error | null>>
  setLoading: Dispatch<SetStateAction<boolean>>
  setSecret: Dispatch<SetStateAction<string>>
  setClosed: Dispatch<SetStateAction<boolean>>
  setNumUsers: Dispatch<SetStateAction<number>>
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
  setError(null)
  setLoading(true)
  setSecret("")
  setClosed(false)

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
    setSecret("")
  })

  eventSource.addEventListener('message', (event) => {
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
      if (msg.type === 'error') {
        setError(new Error(msg.payload || 'Unknown error'))
        eventSource.close()
        return
      }
    } catch (error) {
      console.error('Error parsing message', error, event.data)
    }
  })

  return eventSource
}

export function useJoin({ user, channel }: { user?: string, channel?: string }) {
  const [messages, setMessages] = useState<TextMessage[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [secret, setSecret] = useState("")
  const [closed, setClosed] = useState(false) // EventSource is closed manually
  const [numUsers, setNumUsers] = useState<number>(0)
  const [, setES] = useState<EventSource | null>(null)


  const forceReconnect = useCallback(() => {
    if (!user || !channel) {
      return
    }

    setES((pre) => {
      if (pre) {
        pre.close()
      }
      const es = makeEventSource(
        {
          user, channel,
          setMessages, setError,
          setLoading, setSecret, setClosed,
          setNumUsers,
        }
      )
      return es
    })
    setLoading(false) // forceReconnect no need to show loading
  }, [user, channel])

  useEffect(() => {
    let newEs: EventSource | null = null
    if (!user || !channel) {
      return
    }
    setES((pre) => {
      if (pre) {
        if (!closed) {
          return pre
        }
        pre.close()
      }
      const es = makeEventSource(
        {
          user, channel,
          setMessages, setError,
          setLoading, setSecret, setClosed,
          setNumUsers,
        }
      )
      newEs = es
      return es
    })
    return () => {
      if (newEs) {
        newEs.close()
      }
    }
  }, [user, channel, closed])

  const updateNumUsers = async () => {
    const query = new URLSearchParams()
    query.set('secret', secret)
    const res = await fetch(`/api/count?${query.toString()}`)
    if (res.status !== 200) {
      console.error('Failed to refresh', res.status, res.statusText)
      toast.error('Failed to refresh')
      return
    }
    const data = await res.json()
    if (typeof data.count === 'number' || data.count > 0) {
      setNumUsers(data.count)
    }
  }

  const appendMessage = (message: TextMessage) => {
    setMessages((prev) => [...prev, message])
  }

  return {
    messages, error, loading, opened: closed, secret, numUsers,
    updateNumUsers, appendMessage, forceReconnect
  }
}
