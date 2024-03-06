import { useRef } from 'react'
import { toast } from 'react-hot-toast'
import { TextMessage } from '@/lib/types'

export function MessageEditor(
  { secret, user, onSuccessfulSend }:
    {
      secret: string,
      user: string,
      onSuccessfulSend?: (msg: TextMessage) => void,
    },
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault()
        submitForm()
      }
    }
  }

  const submitForm = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (!secret) {
      toast.error('You are offline')
      return
    }
    const ele = textareaRef.current
    const text = ele?.value
    if (!ele || !text) {
      return
    }
    const message: TextMessage = {
      type: 'text', payload: text,
      id: crypto.randomUUID(), from: user,
    }
    const data = { secret, message: message }
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.status !== 200) {
      console.error('Failed to send message', res.status, res.statusText)
      toast.error('Failed to send message')
      return
    }
    if (onSuccessfulSend) {
      onSuccessfulSend(message)
    }
    ele.value = ''
  }

  return (
    <form onSubmit={submitForm}
      className="relative">
      <textarea name="message" onKeyDown={onKeyDown}
        required
        placeholder='Ctrl+Enter or Meta+Enter to send message'
        className="my-2 py-3 pl-4 pr-32 dark:bg-gray-900 focus:outline-none focus:border-blue-500 w-full h-24 border rounded-lg resize-none"
        ref={textareaRef} />
      <button type="submit"
        className="absolute bg-blue-500 hover:bg-blue-600 text-white right-8 bottom-8 py-2 px-4 rounded rounded-lg"
      >Send</button>
    </form>
  )
}