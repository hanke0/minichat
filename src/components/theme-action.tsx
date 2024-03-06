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
    <select className="cursor-pointer block bg-transparent text-inherit outline-none focus:bg-gray-100 dark:focus:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
      onChange={changeTheme} value={theme}
    >
      {
        themes.map(
          (option) => {
            return <option key={option.value} value={option.value}>{option.label} Theme</option>
          }
        )
      }
    </select>
  )
}
