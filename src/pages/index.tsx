import { SelectHTMLAttributes } from 'react'
import Message from '../components/message'
import { useTheme } from 'next-themes'
import { useJoin } from '../hooks/useJoin'
import { channel } from 'diagnostics_channel'

export default function Home() {
  const { setTheme } = useTheme()
  const user = { user: 'user1', channel: 'channel1' }
  const { messages, error, loading, secret, numUsers, reconnect } = useJoin(user)

  const changeTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.currentTarget.value)
  }

  return (
    <main
      className={`px-1 md:px-24 py-1 md:py-8 min-h-screen h-screen`}
    >
      <div className="flex flex-col divide-y border rounded-lg shadow h-full w-full py-2 px-0">
        <header className="w-full px-8 py-2">
          <h1 className="font-bold text-2xl">Channel {user.channel}</h1>
          <p>{numUsers} users in the channel</p>
        </header>
        <main className="flex-1 py-2 px-8 overflow-y-auto overflow-x-hidden">
          {
            messages.map((msg, i) => {
              return (
                <Message key={msg.id} user={msg.from} isMe={msg.from === user.user}>
                  {msg.payload}
                </Message>
              )
            })
          }
          <Message user='user1'>
            this is a every long message that is going to be sent by the user
            word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word
          </Message>
          <Message user='me' isMe>
            this is a every long message that is going to be sent by the user
            word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word word
          </Message>
        </main>
        <footer className="py-2 px-8">
          <div className="flex flex-row rounded-lg">
            <div className='rounded-lg border bg-gray-100 dark:bg-gray-800 py-1 px-4'>
              You are aaa
            </div>
            <select className='block rounded-lg border bg-gray-100 dark:bg-gray-800 py-1 px-4 ml-2'
              onChange={changeTheme}>
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
              <option value="system">System Theme</option>
            </select>
          </div>
          <form className="relative">
            <textarea className="my-2 py-3 pl-4 pr-32 dark:bg-gray-900 focus:outline-none focus:border-blue-500 w-full h-24 border rounded-lg resize-none" />
            <button type='submit' className="absolute bg-blue-500 hover:bg-blue-600 text-white right-8 bottom-8 py-2 px-4 rounded rounded-lg">Send</button>
          </form>
        </footer>
      </div>
    </main>
  )
}
