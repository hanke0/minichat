import { useEffect, useState, useRef } from 'react'
import React from 'react'

export function useScroll() {
  const endRef = useRef<HTMLDivElement>(null)
  const [scroll, setScroll] = useState(Symbol())
  const [bottom, setBottom] = useState(true)
  useEffect(() => {
    if (!bottom) {
      return
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scroll, bottom])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget
    const bottomLength = Math.abs(scrollHeight - (scrollTop + clientHeight))
    setBottom(bottomLength < 1)
  }

  return {
    scrollBottom: () => setScroll(Symbol()),
    handleScroll, endRef
  }
}