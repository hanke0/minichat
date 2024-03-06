export function RandomSvg({
  height, width, className,
  onClick
}: {
  height: string | number,
  width: string | number,
  className?: string
  onClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={width}
      className={`${className} fill-none stroke-current`}
      onClick={onClick}
      preserveAspectRatio="xMidYMin"
      viewBox="0 0 72 72">
      <g id="color" />
      <g id="hair" />
      <g id="skin" />
      <g id="skin-shadow" />
      <g id="line">
        <path strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" d="M40.3774,40.4583l6.9093,6.9332c1.6139,1.6195,4.0955,2.5668,6.7244,2.5668h12.7749" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" d="M5,21.9583h12.7749c2.6288,0,5.1104,0.9473,6.7244,2.5668l7.0229,7.0473" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" d="M5,49.9583h12.7749c2.6288,0,5.1104-0.9473,6.7244-2.5668l22.7874-22.8664c1.6139-1.6195,4.0955-2.5668,6.7244-2.5668h12.7749" />
        <line x1="66.7859" x2="58.6005" y1="21.9583" y2="13.7444" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" />
        <line x1="58.6005" x2="66.7859" y1="30.1722" y2="21.9583" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" />
        <line x1="66.7859" x2="58.6005" y1="49.9583" y2="41.7444" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" />
        <line x1="58.6005" x2="66.7859" y1="58.1722" y2="49.9583" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" />
      </g>
    </svg>
  )
}