import { Main } from "@/components/main"
import { RandomSvg } from "./random-svg"
import { useRef } from "react"
import { lowerDigits, randomAlnum, randomName } from "@/lib/random"

export function LoginPage() {
  const channelRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const inputClass = 'appearance-none border rounded px-2 py-1'

  return (
    <Main>
      <div className="h-full flex flex-col items-center content-center justify-items-center justify-center">
        <form className="flex flex-col basic-1 border rounded-lg shadow-lg px-8 py-4">
          <div className="basis-1 py-2">
            <label className="block">Channel <RandomSvg className="inline block m-auto" width="1rem" height="1.2rem"
              onClick={() => {
                channelRef.current!.value = randomAlnum(6, lowerDigits)
              }} />
            </label>
            <input className={inputClass} type="text" name="channel" placeholder="channel" ref={channelRef} required />
          </div>
          <div className="basis-1 py-2">
            <label className="block">Name<RandomSvg className="inline block m-auto" width="1rem" height="1.2rem"
              onClick={() => {
                nameRef.current!.value = randomName()
              }} />
            </label>
            <input className={inputClass} type="text" name="user" placeholder="name" ref={nameRef} required />
          </div>
          <div className="basis-1 py-2">
            <button className="w-full border rounded-lg px-2 py-1" type="submit">Join</button>
          </div>
        </form>
      </div>
    </Main>
  )
}