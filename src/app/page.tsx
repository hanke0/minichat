import { HomePage } from "@/components/home-page"
import { LoadingPage } from "@/components/loading-page"
import { Suspense } from "react"
import type { Viewport } from 'next'

// This component passed as a fallback to the Suspense boundary
// will be rendered in place of the search bar in the initial HTML.
// When the value is available during React hydration the fallback
// will be replaced with the `<SearchBar>` component.
function Fallback() {
  return <LoadingPage />
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function Home() {
  return (
    <Suspense fallback={<Fallback />}>
      <HomePage />
    </Suspense>
  )
}
