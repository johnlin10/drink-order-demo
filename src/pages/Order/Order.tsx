import { useState } from 'react'
import './Order.scss'
import DrinkArt from '@/components/DrinkArt'
import Icon from '@/components/Icon'
import { MENU } from '@/data/menu'
import { useCart } from '@/data/store'
import { fades, useScrollEdges } from '@/hooks/useScrollEdges'
import type { Drink, Size } from '@/types'
import {
  addToCart,
  cartCount,
  cartTotal,
  money,
  unitPrice,
} from '@/utils/order'
import Customizer, { type Spec } from './ui/Customizer'
import Cart from './ui/Cart'

const CATEGORIES = ['全部', ...new Set(MENU.map((d) => d.category))]
const DEFAULT_DRINK = MENU.find((d) => d.id === 'boba-milk-tea') ?? MENU[0]
const no = (d: Drink) => String(MENU.indexOf(d) + 1).padStart(2, '0')

export default function Order() {
  const [category, setCategory] = useState('全部')
  const [drink, setDrink] = useState(DEFAULT_DRINK)
  const [spec, setSpec] = useState<Spec>({
    size: 'M',
    sugar: '半糖',
    ice: '少冰',
    toppings: [],
    qty: 1,
  })
  const [added, setAdded] = useState(false)
  const [cart, setCart] = useCart()
  // 菜單列左右、右側面板上下還有沒有內容，決定哪一邊要淡出
  const [strip, stripEdges] = useScrollEdges<HTMLDivElement>('x', category)
  const [side, sideEdges] = useScrollEdges<HTMLDivElement>('y')
  const count = cartCount(cart)

  const update = (patch: Partial<Spec>) => setSpec((s) => ({ ...s, ...patch }))

  // 換飲料時甜度、冰塊沿用（多數人習慣固定），容量與加料重設
  const pick = (d: Drink) => {
    setDrink(d)
    update({ size: 'M', toppings: [], qty: 1 })
  }

  const add = () => {
    const { qty, ...rest } = spec
    setCart(
      addToCart(cart, {
        drinkId: drink.id,
        name: drink.name,
        ...rest,
        qty,
        price: unitPrice(drink.id, spec.size, spec.toppings),
      }),
    )
    update({ qty: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="order-page">
      <div className="order-main">
        <section className="stage">
          <div className="stage-meta">
            <span className="eyebrow">
              No.{no(drink)} / {drink.category}
            </span>
            <span className="eyebrow live">● Live preview</span>
          </div>
          <DrinkArt
            drink={drink}
            {...spec}
            callouts
            interactive
            floor
            className="stage-art"
          />
          <div className="toolbar">
            {(['M', 'L'] as Size[]).map((s) => (
              <button
                key={s}
                className={spec.size === s ? 'on' : ''}
                onClick={() => update({ size: s })}
              >
                {s === 'M' ? '中杯' : '大杯'}
              </button>
            ))}
            <i />
            <button
              className={spec.ice !== '熱飲' ? 'on' : ''}
              onClick={() => update({ ice: '少冰' })}
            >
              冰飲
            </button>
            <button
              className={spec.ice === '熱飲' ? 'on' : ''}
              onClick={() => update({ ice: '熱飲' })}
            >
              熱飲
            </button>
          </div>
        </section>

        <section className="menu-strip">
          <div className="row">
            <h3>MENU 菜單</h3>
            <div className="chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`chip ${c === category ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className={`scroller-wrap ${fades(stripEdges)}`}>
            <div className="scroller" ref={strip}>
              {MENU.filter(
                (d) => category === '全部' || d.category === category,
              ).map((d) => (
                <button
                  key={d.id}
                  className={`drink ${d.id === drink.id ? 'selected' : ''}`}
                  onClick={() => pick(d)}
                >
                  <DrinkArt drink={d} className="thumb" />
                  <span>
                    <small className="mono">{no(d)}.</small>
                    <b>{d.name}</b>
                    <small className="mono">
                      {money(d.price.M)} / {money(d.price.L)}
                    </small>
                  </span>
                  <Icon name="chevron" size={18} />
                </button>
              ))}
            </div>
            {(['start', 'end'] as const).map((edge) => (
              <button
                key={edge}
                className={`icon-btn arrow ${edge}`}
                aria-label={edge === 'start' ? '往前看' : '看更多飲料'}
                hidden={!stripEdges[edge]}
                onClick={() =>
                  strip.current?.scrollBy({
                    left: edge === 'start' ? -480 : 480,
                    behavior: 'smooth',
                  })
                }
              >
                <Icon name="chevron" size={18} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className={`order-side ${fades(sideEdges)}`} ref={side}>
        <Customizer
          drink={drink}
          no={no(drink)}
          spec={spec}
          onChange={update}
          onAdd={add}
          added={added}
        />
        <Cart />
      </div>

      {/* 手機版購物車在下面，底部常駐一條提示 */}
      {count > 0 && (
        <button
          className="cart-bar"
          onClick={() =>
            document
              .getElementById('cart')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <Icon name="cart" size={18} /> {count} 杯・{money(cartTotal(cart))}
          <span>前往結帳 ↓</span>
        </button>
      )}
    </div>
  )
}
