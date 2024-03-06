export function Status({
  status, className, height, width, onOffClick
}: {
  status: boolean, className?: string,
  height?: number | string, width?: number | string
  onOffClick?: () => void
}) {
  const color = status ? 'bg-green-500' : 'bg-red-500'
  const pingCss = status ? 'bg-green-400' : 'animate-ping bg-red-400'
  console.log('status', status, "onOffClick", onOffClick)
  return (
    <span className={`inline-flex relative h-3 w-3 ${onOffClick && !status ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (!status && onOffClick) {
          onOffClick()
        }
      }}>
      <span className={`${pingCss} absolute inline-flex h-full w-full rounded-full opacity-75`}></span>
      <span className={`${color} relative inline-flex rounded-full h-3 w-3`}></span>
    </span>
  )
}
