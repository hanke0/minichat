import React from "react"
import { useTheme } from 'next-themes'

const themes = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]


export function ThemeAction(
) {
  const { theme, setTheme } = useTheme()
  const changeTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.currentTarget.value)
  }
  return (
    <select className='cursor-pointer block bg-transparent text-inherit outline-none'
      onChange={changeTheme}>
      {
        themes.map(
          (option) => {
            return <option key={option.value} value={option.value}
              selected={option.value === theme}>{option.label} Theme</option>
          }
        )
      }
    </select>
  )
}
