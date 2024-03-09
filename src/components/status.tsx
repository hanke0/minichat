export function Status({
  status, onOffClick
}: {
  status: boolean,
  onOffClick?: () => void
}) {
  const color = status ? 'bg-green-500' : 'bg-red-500'
  const pingCss = status ? 'bg-green-400' : 'animate-ping bg-red-400'
  return (
    <span className={`inline-flex relative h-3 w-3 ${onOffClick && !status ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (!status && onOffClick) {
          onOffClick()
        }
      }}
    >
      <span className={`${pingCss} absolute inline-flex h-full w-full rounded-full opacity-75`} />
      <span className={`${color} relative inline-flex rounded-full h-3 w-3`} />
    </span>
  )
}
