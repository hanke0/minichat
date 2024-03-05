import { Main } from "@/components/main"
import { RandomSvg } from "./random-svg"

export function LoginPage() {
  const inputClass = 'appearance-none border rounded px-2 py-1'
  return (
    <Main>
      <div className="h-full flex flex-col items-center content-center justify-items-center justify-center">
        <form className="flex flex-col basic-1 border rounded-lg shadow-lg px-8 py-4">
          <div className="basis-1 py-2">
            <label className="block">Channel <RandomSvg className="inline block m-auto" width="1rem" height="1.2rem" /></label>
            <input className={inputClass} type="text" name="channel" placeholder="channel" required />
          </div>
          <div className="basis-1 py-2">
            <label className="block">Name</label>
            <input className={inputClass} type="text" name="name" placeholder="name" required />
          </div>
          <div className="basis-1 py-2">
            <button className="w-full border rounded-lg px-2 py-1" type="submit">Join</button>
          </div>
        </form>
      </div>
    </Main>
  )
}