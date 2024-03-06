'use client'
import { Status } from './status'
import { useJoin } from '../hooks/useJoin'
import { TextMessage } from '@/lib/types'
import { FreshSvg } from '@/components/fresh-svg'
import { Main } from '@/components/main'
import { LoginPage } from '@/components/login-page'
import { MessageAction } from '@/components/message-action'
import { ThemeAction } from '@/components/theme-action'
import { LoadingPage } from '@/components/loading-page'
import { ErrorPage } from '@/components/error-page'
import { MessageEditor } from '@/components/message-editor'
import { MessageBox } from '@/components/message-box'
import { useScroll } from '@/hooks/useScroll'
import { useSearchParams } from 'next/navigation'
import React from 'react'

export function HomePage() {
  const query = useSearchParams()
  const channel = query?.get("channel") || undefined
  const user = query?.get("user") || undefined
  const { messages, error, loading, secret, numUsers,
    updateNumUsers, appendMessage, forceReconnect } = useJoin({ user, channel })
  const { scrollBottom } = useScroll()
  if (!user || !channel) {
    return <LoginPage />
  }
  if (error) {
    return <ErrorPage error={error} />
  }
  if (loading) {
    return <LoadingPage />
  }

  const onSuccessfulSend = (message: TextMessage) => {
    appendMessage(message)
    scrollBottom()
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
            <FreshSvg height="0.75rem" width="0.75rem" className="inline mx-1" onClick={updateNumUsers} />
          </p>
        </header>
        <div className="flex-1 py-2 px-8 overflow-y-auto overflow-x-hidden">
          <MessageBox messages={messages} user={user} />
        </div>
        <footer className="py-2 px-8">
          <div className="flex flex-row rounded-lg">
            <MessageAction>You are {user}</MessageAction>
            <MessageAction><ThemeAction /></MessageAction>
          </div>
          <MessageEditor
            secret={secret}
            user={user}
            onSuccessfulSend={onSuccessfulSend}
          />
        </footer>
      </div>
    </Main>
  )
}
