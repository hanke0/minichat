import { headers } from "next/headers"


export default function TextHead({ children, background, color, height, width, className }: {
  children: string
  background: string
  color: string
  height?: number
  width?: number
  className?: string
}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
      height={height} width={width} className={className} fill={background}>
      <circle cx="50%" cy="50%" r="50%" />
      <text fontSize={16} x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
        fill={color} className="select-none">{children}</text>
    </svg>
  )
}
