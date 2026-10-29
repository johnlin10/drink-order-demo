import Stepper from '@/components/Stepper'
import { ICE, SIZE_LABEL, SUGAR, TOPPINGS } from '@/data/menu'
import type { Drink, Size } from '@/types'
import { money, unitPrice } from '@/utils/order'

export interface Spec {
  size: Size
  sugar: string
  ice: string
  toppings: string[]
  qty: number
}

function Radios({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return options.map((o) => (
    <label key={o.value} className="opt">
      <input
        type="radio"
        checked={o.value === value}
        onChange={() => onChange(o.value)}
      />
      {o.label}
    </label>
  ))
}

const plain = (list: string[]) => list.map((s) => ({ value: s, label: s }))

export default function Customizer({
  drink,
  no,
  spec,
  onChange,
  onAdd,
  added,
}: {
  drink: Drink
  no: string
  spec: Spec
  onChange: (patch: Partial<Spec>) => void
  onAdd: () => void
  added: boolean
}) {
  const price = unitPrice(drink.id, spec.size, spec.toppings)

  // 依菜單順序排列，勾選順序不同也算同一種規格
  const toggleTopping = (name: string) =>
    onChange({
      toppings: TOPPINGS.map((t) => t.name).filter((t) =>
        t === name ? !spec.toppings.includes(t) : spec.toppings.includes(t),
      ),
    })

  const rows = [
    {
      label: '容量',
      en: 'Size',
      content: (
        <Radios
          options={(['M', 'L'] as const).map((s) => ({
            value: s,
            label: `${SIZE_LABEL[s]} ${money(drink.price[s])}`,
          }))}
          value={spec.size}
          onChange={(v) => onChange({ size: v as Size })}
        />
      ),
    },
    {
      label: '甜度',
      en: 'Sugar',
      content: (
        <Radios
          options={plain(SUGAR)}
          value={spec.sugar}
          onChange={(sugar) => onChange({ sugar })}
        />
      ),
    },
    {
      label: '冰塊',
      en: 'Ice',
      content: (
        <Radios
          options={plain(ICE)}
          value={spec.ice}
          onChange={(ice) => onChange({ ice })}
        />
      ),
    },
    {
      label: '加料',
      en: 'Topping',
      content: TOPPINGS.map((t) => (
        <label key={t.name} className="opt">
          <input
            type="checkbox"
            checked={spec.toppings.includes(t.name)}
            onChange={() => toggleTopping(t.name)}
          />
          {t.name} +{t.price}
        </label>
      )),
    },
  ]

  return (
    <section className="panel framed customizer">
      <span className="eyebrow">
        No.{no} · {drink.category}
      </span>
      <h2>{drink.name}</h2>
      <p className="desc">{drink.description}</p>

      {rows.map((r) => (
        <div
          key={r.label}
          className="spec-row"
          role="group"
          aria-label={r.label}
        >
          <div className="spec-label">
            <b>{r.label}</b>
            <span className="eyebrow">{r.en}</span>
          </div>
          <div>{r.content}</div>
        </div>
      ))}

      <div className="add-bar">
        <Stepper
          value={spec.qty}
          min={1}
          onChange={(qty) => onChange({ qty })}
        />
        <p className="total">
          小計 <b>{money(price * spec.qty)}</b>
        </p>
        <button className="primary" onClick={onAdd}>
          {added ? '✓ 已加入' : '加入購物車'}
        </button>
      </div>
    </section>
  )
}
