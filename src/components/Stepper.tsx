export default function Stepper({
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  return (
    <span className="stepper">
      <button
        type="button"
        aria-label="減少"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span>{value}</span>
      <button
        type="button"
        aria-label="增加"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        ＋
      </button>
    </span>
  )
}
