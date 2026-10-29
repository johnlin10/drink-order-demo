import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Dialog from '@/components/Dialog'
import Icon from '@/components/Icon'
import Stepper from '@/components/Stepper'
import { PAY_METHODS, PICKUP_OPTIONS } from '@/data/menu'
import { useCart, useOrders } from '@/data/store'
import type { Order } from '@/types'
import {
  cartCount,
  cartTotal,
  changeQty,
  createOrder,
  describeItem,
  formatTime,
  money,
} from '@/utils/order'

export default function Cart() {
  const [cart, setCart] = useCart()
  const [orders, setOrders] = useOrders()
  const [checkout, setCheckout] = useState(false)
  const [done, setDone] = useState<Order | null>(null)
  const navigate = useNavigate()
  const total = cartTotal(cart)

  const openCheckout = () => {
    if (!cart.length) return alert('購物車是空的，請先選擇飲料')
    setCheckout(true)
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const order = createOrder(orders, cart, {
      name: String(f.get('name')),
      phone: String(f.get('phone')),
      pay: String(f.get('pay')),
      note: String(f.get('note')),
      pickupIn: Number(f.get('pickupIn')),
    })
    setOrders([order, ...orders])
    setCart([])
    form.reset()
    setCheckout(false)
    setDone(order)
  }

  return (
    <section id="cart" className="panel framed cart">
      <div className="row">
        <h3>購物車</h3>
        <div className="row-actions">
          <button
            className="icon-btn"
            aria-label="清空購物車"
            title="清空購物車"
            disabled={!cart.length}
            onClick={() => setCart([])}
          >
            <Icon name="trash" size={18} />
          </button>
          <button className="primary" onClick={openCheckout}>
            <Icon name="play" size={14} /> 結帳
          </button>
        </div>
      </div>

      {/* 像程式編輯器一樣，每一行有行號 */}
      <ol className="lines">
        {cart.length ? (
          cart.map((it, i) => (
            <li key={i}>
              <span className="ln">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <b>{it.name}</b>
                <small>{describeItem(it)}</small>
              </div>
              <Stepper
                value={it.qty}
                onChange={(v) => setCart(changeQty(cart, i, v - it.qty))}
              />
              <span className="amount mono">{money(it.price * it.qty)}</span>
            </li>
          ))
        ) : (
          <li className="empty">
            <span className="ln">01</span>
            <span>// 購物車是空的，從菜單選一杯吧</span>
          </li>
        )}
      </ol>
      <p className="total">
        合計 <b>{money(total)}</b>
      </p>

      <Dialog open={checkout} onClose={() => setCheckout(false)}>
        <form onSubmit={submit} className="checkout">
          <span className="eyebrow">Checkout</span>
          <h3>填寫取餐資料</h3>
          <p className="total">
            {cartCount(cart)} 杯 <b>{money(total)}</b>
          </p>
          <label>
            姓名
            <input
              name="name"
              required
              maxLength={20}
              pattern=".*\S.*"
              title="請輸入姓名"
              placeholder="王小明"
            />
          </label>
          <label>
            手機
            <input
              name="phone"
              required
              pattern="09[0-9]{8}"
              maxLength={10}
              inputMode="numeric"
              title="請輸入 09 開頭的 10 碼手機號碼"
              placeholder="0912345678"
            />
          </label>
          <label>
            取餐時間
            <select name="pickupIn">
              {PICKUP_OPTIONS.map((o) => (
                <option key={o.minutes} value={o.minutes}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>付款方式</legend>
            {PAY_METHODS.map((p, i) => (
              <label key={p} className="opt">
                <input
                  type="radio"
                  name="pay"
                  value={p}
                  defaultChecked={i === 0}
                />
                {p}
              </label>
            ))}
          </fieldset>
          <label>
            備註
            <textarea
              name="note"
              rows={2}
              maxLength={100}
              placeholder="例如：吸管不用、分開裝"
            />
          </label>
          <div className="actions">
            <button
              type="button"
              className="ghost"
              onClick={() => setCheckout(false)}
            >
              取消
            </button>
            <button className="primary">送出訂單</button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!done} onClose={() => setDone(null)}>
        {done && (
          <div className="done">
            <span className="eyebrow">Order confirmed</span>
            <p className="order-no">#{done.no}</p>
            <p>
              {done.name} 您好，預計 <b>{formatTime(done.pickupAt)}</b> 可取餐
              <br />
              金額 <b className="mono">{money(done.total)}</b>・
              {done.pay === PAY_METHODS[0]
                ? '請於取餐時付款'
                : `${done.pay}付款成功`}
            </p>
            <div className="actions">
              <button className="ghost" onClick={() => setDone(null)}>
                繼續點餐
              </button>
              <button className="primary" onClick={() => navigate('/orders')}>
                查看訂單進度
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  )
}
