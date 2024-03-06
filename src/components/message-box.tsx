import { useScroll } from "@/hooks/useScroll"
import { TextMessage } from "@/lib/types"
import { Message } from "@/components/message"

export function MessageBox(
  { messages, user }: {
    messages: TextMessage[],
    user: string,
  }) {
  const { endRef, handleScroll } = useScroll()

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden"
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