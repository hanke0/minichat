'use client'
import Message from './message'
import { useJoin } from '../hooks/useJoin'
import { useSearchParams } from 'next/navigation'
import { TextMessage } from '@/lib/types'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FreshSvg } from '@/components/fresh-svg'
import { Main } from '@/components/main'
import { LoginPage } from '@/components/login-page'
import { MessageAction } from '@/components/message-action'
import { ThemeAction } from '@/components/theme-action'
import { LoadingPage } from '@/components/loading-page'
import { ErrorPage } from '@/components/error-page'
import { Status } from './status'

export function HomePage() {
  const query = useSearchParams()
  const [scroll, setScroll] = useState(Symbol())
  const [bottom, setBottom] = useState(true)
  useEffect(() => {
    if (!bottom) {
      return
    }
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scroll, bottom])
  const channel = query?.get("channel") || undefined
  const user = query?.get("user") || undefined
  const { messages, error, loading, secret, numUsers,
    updateNumUsers, appendMessage, forceReconnect } = useJoin({ user, channel })
  const msgEditorRef = useRef<HTMLTextAreaElement>(null)
  const msgEndRef = useRef<HTMLDivElement>(null)
  if (!user || !channel) {
    return <LoginPage />
  }
  if (error) {
    return <ErrorPage error={error} />
  }
  if (loading) {
    return <LoadingPage />
  }

  const handleMessageScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget
    const bottomLength = Math.abs(scrollHeight - (scrollTop + clientHeight))
    setBottom(bottomLength < 1)
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!secret) {
      toast.error('You are offline')
      return
    }
    const ele = msgEditorRef.current
    const text = ele?.value
    if (!ele || !text) {
      return
    }
    const message: TextMessage = { type: 'text', payload: text, id: crypto.randomUUID(), from: user }
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
    appendMessage(message)
    setScroll(Symbol())
    ele.value = ''
  }

  return (
    <Main>
      <div className="flex flex-col divide-y border rounded-lg shadow h-full w-full py-2 px-0">
        <header className="w-full px-8 py-2">
          <div className="font-bold text-2xl">
            <span className="pr-4">Channel {channel}</span>
            <Status status={secret !== ""} onOffClick={forceReconnect} />
          </div>
          <p>
            {numUsers} users in the channel
            <FreshSvg height="0.75rem" width="0.75rem" className='inline mx-1' onClick={updateNumUsers} />
          </p>
        </header>
        <div className="flex-1 py-2 px-8 overflow-y-auto overflow-x-hidden"
          onScroll={handleMessageScroll}>
          {
            messages.map((msg) => {
              return (
                <Message key={msg.id} user={msg.from} isMe={msg.from === user}>
                  {msg.payload}
                </Message>
              )
            })
          }
          <div ref={msgEndRef}></div>
        </div>
        <footer className="py-2 px-8">
          <div className="flex flex-row rounded-lg">
            <MessageAction>You are {user}</MessageAction>
            <MessageAction><ThemeAction /></MessageAction>
          </div>
          <form onSubmit={submitForm} className="relative">
            <textarea name="message" required className="my-2 py-3 pl-4 pr-32 dark:bg-gray-900 focus:outline-none focus:border-blue-500 w-full h-24 border rounded-lg resize-none" ref={msgEditorRef} />
            <button type='submit' className="absolute bg-blue-500 hover:bg-blue-600 text-white right-8 bottom-8 py-2 px-4 rounded rounded-lg">Send</button>
          </form>
        </footer>
      </div>
    </Main>
  )
}
