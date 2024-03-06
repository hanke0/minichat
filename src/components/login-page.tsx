import { Main } from "@/components/main"
import { RandomSvg } from "./random-svg"
import { useRef } from "react"
import Image from "next/image"
import { lowerDigits, randomAlnum, randomName } from "@/lib/random"

export function LoginPage({ channel }: { channel?: string }) {
  const channelRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const inputClass = 'appearance-none outline-none border rounded px-2 py-1 focus:border-blue-400'

  return (
    <Main>
      <div className="h-full flex flex-col items-center justify-start">
        <div className="basis-1 text-center pt-16">
          <Image alt="logo" width={80} height={40}
            src="/minichat.svg"></Image>
        </div>
        <h1 className="basis-1 py-2 text-center text-3xl pb-8">Join to Channel</h1>
        <form className="basic-1 w-90 flex flex-col basic-1 border rounded-lg bg-slate-100 dark:bg-slate-600 px-8 py-4"
          method="get">
          <div className="basis-1 py-2">
            <label className="block">Channel<RandomSvg className="inline block m-1" width="1rem" height="1.2rem"
              onClick={() => {
                channelRef.current!.value = randomAlnum(6, lowerDigits)
              }} />
            </label>
            <input className={inputClass} value={channel} type="text" name="channel" placeholder="channel" ref={channelRef} required />
          </div>
          <div className="basis-1 py-2">
            <label className="block">Name<RandomSvg className="inline block m-1" width="1rem" height="1.2rem"
              onClick={() => {
                nameRef.current!.value = randomName()
              }} />
            </label>
            <input className={inputClass} type="text" name="user" placeholder="name" ref={nameRef} required />
          </div>
          <div className="basis-1 py-2">
            <button className="w-full bg-green-700 text-white border rounded-lg px-2 py-1" type="submit">Join</button>
          </div>
        </form>
        <div className="basis-1 text-gray-700 text-sm py-6 mt-6">
          Power by <a href="https://github.com/hanke0/minichat">Mini Chat</a>
        </div>
      </div>
    </Main >
  )
}