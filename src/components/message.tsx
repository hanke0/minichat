'use client'

type MessageProps = {
  children: React.ReactNode | string
  user: string
  isMe?: boolean
}

export default function Message({ children, user, isMe }: MessageProps) {
  const order = isMe ? 'flex-row-reverse' : 'flex-row'
  const bg = isMe ? 'bg-blue-100 dark:bg-slate-900' : 'bg-gray-100 dark:bg-gray-800'
  const headAlign = isMe ? 'text-right' : 'text-left'
  const slice = new Blob([user.charAt(0)]).size > 1 ? 1 : 2
  const head = user.slice(0, slice)
  const headPadding = (() => {
    if (head.length !== slice) {
      return 'px-[0.8rem] py-[0.5rem]'
    }
    if (head.length !== 1) {
      return 'px-[0.5rem] py-[0.5rem]'
    }
    return 'px-[0.6rem] py-[0.5rem]'
  })()

  return (
    <div className={`flex py-2 ${order}`}>
      <div className={`pt-6`}>
        <span className={`${headPadding} font-mono rounded-[50%] w-[2rem] h-[2rem] leading-[2rem] text-[1rem] text-white bg-red-200 border text-center`}>{head}</span>
      </div>
      <div className="flex flex-col max-w-[90%] md:max-w-[60%] px-1">
        <div className={`${headAlign} text-base text-cyan-600 px-1`}>
          {user} {isMe ? <span className="text-sm">(You)</span> : ''}
        </div>
        <div className={`text-pretty p-2 border border-lg rounded-lg ${bg}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
