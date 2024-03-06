'use client'

import TextHead from "@/components/text-head"

type MessageProps = {
  children: React.ReactNode | string
  user: string
  isMe?: boolean
}

const wordSepRE = / \-_/

export default function Message({ children, user, isMe }: MessageProps) {
  const order = isMe ? 'flex-row-reverse' : 'flex-row'
  const bg = isMe ? 'bg-[#8FCB9B]' : 'bg-[#EAE6E5] dark:bg-[#12130F]'
  const head = user.split(wordSepRE).map((w) => w ? w.charAt(0).toUpperCase() : '').join('').slice(0, 2)
  const textAlign = isMe ? 'text-right' : 'text-left'

  return (
    <div className={`flex py-2 ${order}`}>
      <div className={`pt-6`}>
        <TextHead className="font-mono" height={32} width={32} background="#0096FF" color="white">{head}</TextHead>
      </div>
      <div className="flex flex-col max-w-[90%] md:max-w-[60%] px-1">
        <div className={`${textAlign} text-base text-cyan-600 px-1`}>
          {user} {isMe ? <span className="text-sm">(You)</span> : ''}
        </div>
        <div className={`text-pretty p-2 border border-lg rounded-lg ${bg}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
