import { Link } from 'react-router-dom'
import './MyOrders.scss'
import DrinkArt from '@/components/DrinkArt'
import { MENU, STATUS } from '@/data/menu'
import { useOrders } from '@/data/store'
import { describeItem, formatTime, money } from '@/utils/order'

export default function MyOrders() {
  const [orders] = useOrders()

  return (
    <div className="my-orders">
      <span className="eyebrow">My orders</span>
      <h2>我的訂單</h2>
      {orders.length === 0 && (
        <div className="panel empty">
          還沒有訂單，<Link to="/">先去點一杯吧！</Link>
        </div>
      )}
      {orders.map((o) => {
        const first = o.items[0]
        const drink = MENU.find((d) => d.id === first.drinkId)
        return (
          <article key={o.no} className="panel framed">
            {drink && (
              <DrinkArt
                drink={drink}
                size={first.size}
                ice={first.ice}
                toppings={first.toppings}
                className="thumb"
              />
            )}
            <div>
              <div className="row">
                <b className="order-no">#{o.no}</b>
                <span className={`badge s${o.status}`}>{STATUS[o.status]}</span>
              </div>
              <ol className="steps">
                {STATUS.map((s, i) => (
                  <li key={s} className={i <= o.status ? 'on' : ''}>
                    {s}
                  </li>
                ))}
              </ol>
              <ul>
                {o.items.map((it, i) => (
                  <li key={i}>
                    {it.name} × {it.qty} <small>{describeItem(it)}</small>
                  </li>
                ))}
              </ul>
              <p className="meta">
                下單 <b>{formatTime(o.createdAt)}</b>・預計取餐{' '}
                <b>{formatTime(o.pickupAt)}</b>・{o.pay}・合計{' '}
                <b>{money(o.total)}</b>
              </p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
