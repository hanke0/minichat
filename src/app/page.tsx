import { Suspense } from "react"
import { MyHome } from "@/app/home"

// This component passed as a fallback to the Suspense boundary
// will be rendered in place of the search bar in the initial HTML.
// When the value is available during React hydration the fallback
// will be replaced with the `<SearchBar>` component.
function Fallback() {
  return <>placeholder</>
}

export default function Home() {
  return (
    <Suspense fallback={<Fallback />}>
      <MyHome />
    </Suspense>
  )
}
