import { useEffect, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  ScrollRestoration,
  useLocation,
} from 'react-router-dom'
import './App.scss'
import Icon, { type IconName } from '@/components/Icon'
import { SHOP_NAME, STATUS } from '@/data/menu'
import { useCart, useOrders } from '@/data/store'
import { cartCount } from '@/utils/order'

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: '點餐', icon: 'cup' },
  { to: '/orders', label: '我的訂單', icon: 'receipt' },
  { to: '/admin', label: '店家後台', icon: 'store' },
  { to: '/report', label: '作業說明', icon: 'book' },
]

const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const pad = (n: number) => String(n).padStart(2, '0')

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="clock">
      <span>
        {now.getFullYear()}.{pad(now.getMonth() + 1)}.{pad(now.getDate())}{' '}
        {WEEKDAY[now.getDay()]}
      </span>
      <span>
        {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
      </span>
    </div>
  )
}

/** 最新一筆訂單的進度，像課程進度條 */
function LatestOrder() {
  const [orders] = useOrders()
  const latest = orders[0]
  return (
    <Link to="/orders" className="latest">
      <Icon name="receipt" size={30} />
      <div>
        <b>{latest ? `訂單 #${latest.no}` : '尚無訂單'}</b>
        <span className="track">
          <i
            style={{
              width: `${latest ? ((latest.status + 1) / STATUS.length) * 100 : 0}%`,
            }}
          />
        </span>
      </div>
      <span className="step">
        {latest ? `${latest.status + 1}/${STATUS.length}` : '0/4'}
      </span>
    </Link>
  )
}

/** 大標題捲出畫面後，頂部改顯示的精簡列（只有手機與矮螢幕會捲動） */
function MiniBar({ show }: { show: boolean }) {
  const [orders] = useOrders()
  const latest = orders[0]
  return (
    <div className={`minibar ${show ? 'show' : ''}`}>
      <Link to="/" className="mini-logo">
        <span className="mark">
          <Icon name="cup" size={18} />
        </span>
        <b>{SHOP_NAME}</b>
      </Link>
      {latest && (
        <Link to="/orders" className="mini-order">
          <span className="mono">#{latest.no}</span>
          <span className={`badge s${latest.status}`}>
            {STATUS[latest.status]}
          </span>
        </Link>
      )}
    </div>
  )
}

export default function App() {
  const [cart] = useCart()
  const count = cartCount(cart)
  const masthead = useRef<HTMLElement>(null)
  const main = useRef<HTMLElement>(null)
  const [compact, setCompact] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setCompact(!entry.isIntersecting),
    )
    if (masthead.current) observer.observe(masthead.current)
    return () => observer.disconnect()
  }, [])

  // 電腦版捲動的是 main 不是整頁，ScrollRestoration 管不到，換頁時自己回到頂端
  useEffect(() => {
    main.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="shell">
      <aside className="sidebar">
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end title={n.label}>
              <Icon name={n.icon} size={24} />
              <span>{n.label}</span>
              {n.to === '/' && count > 0 && <i className="count">{count}</i>}
            </NavLink>
          ))}
        </nav>
        <p className="credit">
          <small>管理資訊系統</small>
          課堂原型
        </p>
      </aside>

      <MiniBar show={compact} />

      <div className="content">
        <header className="masthead" ref={masthead}>
          <Link to="/" className="logo">
            <span className="mark">
              <Icon name="cup" size={30} />
            </span>
            <span>
              <b>{SHOP_NAME}</b>
              <small>SELECT · CUSTOMIZE · PICK UP</small>
            </span>
          </Link>
          <div className="widgets">
            <LatestOrder />
            <Clock />
          </div>
        </header>
        <main ref={main}>
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
