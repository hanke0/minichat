import { TextMessage } from "@/lib/types"
import { Message } from "@/components/message"
import { useRef, useState, useEffect } from "react"

export function MessageBox(
  { messages, user, className }: {
    messages: TextMessage[],
    user: string,
    className?: string
  }) {
  const endRef = useRef<HTMLDivElement>(null)
  const [bottom, setBottom] = useState(true)

  useEffect(() => {
    if (messages.length === 0) {
      return
    }
    if (!bottom) {
      return
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [bottom, messages.length])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget
    const bottomLength = Math.abs(scrollHeight - (scrollTop + clientHeight))
    setBottom(bottomLength < 1)
  }

  return (
    <div className={`${className} w-full overflow-y-auto overflow-x-hidden`}
      onScroll={handleScroll}
    >
      {
        messages.map((msg) => {
          return (
            <Message key={msg.id} user={msg.from} isMe={msg.from === user}>
              {msg.payload}
            </Message>
          )
        })
      }
      <div ref={endRef} />
    </div>
  )
}