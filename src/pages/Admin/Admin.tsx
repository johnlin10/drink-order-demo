import './Admin.scss'
import { STATUS } from '@/data/menu'
import { resetDemoData, useOrders } from '@/data/store'
import { describeItem, formatTime, money, salesStats } from '@/utils/order'

export default function Admin() {
  const [orders, setOrders] = useOrders()
  const stats = salesStats(orders)
  const maxCups = stats.ranking[0]?.[1] ?? 0

  const advance = (no: string) =>
    setOrders(
      orders.map((o) => (o.no === no ? { ...o, status: o.status + 1 } : o)),
    )

  return (
    <div className="admin">
      <div className="row">
        <div>
          <span className="eyebrow">Store dashboard</span>
          <h2>店家後台</h2>
        </div>
        <button
          className="ghost"
          onClick={() =>
            confirm('確定清除所有訂單與購物車？') && resetDemoData()
          }
        >
          清除示範資料
        </button>
      </div>

      <div className="stats">
        {[
          ['訂單數', 'Orders', `${stats.count} 筆`],
          ['營業額', 'Revenue', money(stats.revenue)],
          ['平均客單價', 'Avg. ticket', money(stats.average)],
          ['待製作', 'Pending', `${stats.pending} 筆`],
        ].map(([label, en, value]) => (
          <div key={label} className="panel framed">
            <span className="eyebrow">{en}</span>
            <small>{label}</small>
            <b>{value}</b>
          </div>
        ))}
      </div>

      <div className="panel framed ranking">
        <span className="eyebrow">Best sellers</span>
        <h3>熱銷排行</h3>
        {stats.ranking.length === 0 && <p className="empty">尚無銷售資料</p>}
        {stats.ranking.slice(0, 5).map(([name, cups]) => (
          <div key={name} className="bar">
            <span>{name}</span>
            <i style={{ width: `${(cups / maxCups) * 100}%` }} />
            <b>{cups} 杯</b>
          </div>
        ))}
      </div>

      <div className="panel framed table">
        <table>
          <thead>
            <tr>
              <th>單號</th>
              <th>下單</th>
              <th>顧客</th>
              <th>品項</th>
              <th>金額</th>
              <th>取餐</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  尚無訂單
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.no}>
                <td>
                  <b className="mono">#{o.no}</b>
                </td>
                <td>{formatTime(o.createdAt)}</td>
                <td>
                  {o.name}
                  <br />
                  <small>{o.phone}</small>
                </td>
                <td>
                  {o.items.map((it, i) => (
                    <div key={i}>
                      {it.name} × {it.qty}
                      <br />
                      <small>{describeItem(it)}</small>
                    </div>
                  ))}
                  {o.note && <em>備註：{o.note}</em>}
                </td>
                <td>
                  {money(o.total)}
                  <br />
                  <small>{o.pay}</small>
                </td>
                <td>{formatTime(o.pickupAt)}</td>
                <td>
                  <span className={`badge s${o.status}`}>
                    {STATUS[o.status]}
                  </span>
                </td>
                <td>
                  {o.status < STATUS.length - 1 && (
                    <button
                      className="primary sm"
                      onClick={() => advance(o.no)}
                    >
                      改為「{STATUS[o.status + 1]}」
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
