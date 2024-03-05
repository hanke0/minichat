import React from 'react'

export function Main({ children }: { children: React.ReactNode }) {
  return (
    <main
      className={`px-1 md:px-24 py-1 md:py-8 min-h-screen h-screen`}
    >
      {children}
    </main>
  )
}