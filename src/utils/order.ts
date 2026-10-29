import { MENU, SIZE_LABEL, TOPPINGS } from '@/data/menu'
import type { CartItem, Customer, Order, Size } from '@/types'

export const money = (n: number) => `$${n}`

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

/** 單杯價格 = 容量價格 + 加料 */
export function unitPrice(drinkId: string, size: Size, toppings: string[]) {
  const drink = MENU.find((d) => d.id === drinkId)
  if (!drink) throw new Error(`找不到飲料：${drinkId}`)
  return toppings.reduce(
    (sum, t) => sum + (TOPPINGS.find((x) => x.name === t)?.price ?? 0),
    drink.price[size],
  )
}

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, it) => sum + it.price * it.qty, 0)

export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, it) => sum + it.qty, 0)

export const describeItem = (it: CartItem) =>
  [
    SIZE_LABEL[it.size],
    it.sugar,
    it.ice,
    ...it.toppings.map((t) => `+${t}`),
  ].join('・')

const sameSpec = (a: CartItem, b: CartItem) =>
  a.drinkId === b.drinkId &&
  a.size === b.size &&
  a.sugar === b.sugar &&
  a.ice === b.ice &&
  a.toppings.join() === b.toppings.join()

/** 規格完全相同的飲料合併成同一行，只加數量 */
export function addToCart(cart: CartItem[], item: CartItem) {
  const i = cart.findIndex((x) => sameSpec(x, item))
  if (i < 0) return [...cart, item]
  return cart.map((x, j) => (j === i ? { ...x, qty: x.qty + item.qty } : x))
}

/** 數量減到 0 就移除 */
export const changeQty = (cart: CartItem[], index: number, delta: number) =>
  cart
    .map((x, i) => (i === index ? { ...x, qty: x.qty + delta } : x))
    .filter((x) => x.qty > 0)

/** 訂單只會新增、不會刪除（清除示範資料除外），用筆數產生單號不會重複 */
export function createOrder(
  orders: Order[],
  cart: CartItem[],
  { pickupIn, ...customer }: Customer,
  now = new Date(),
): Order {
  return {
    ...customer,
    name: customer.name.trim(),
    note: customer.note.trim(),
    no: `A${String(orders.length + 1).padStart(3, '0')}`,
    items: cart,
    total: cartTotal(cart),
    createdAt: now.toISOString(),
    pickupAt: new Date(now.getTime() + pickupIn * 60_000).toISOString(),
    status: 0,
  }
}

/** 店家後台的營運統計 */
export function salesStats(orders: Order[]) {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0)
  const cups = new Map<string, number>()
  for (const o of orders)
    for (const it of o.items)
      cups.set(it.name, (cups.get(it.name) ?? 0) + it.qty)
  const ranking = [...cups].sort((a, b) => b[1] - a[1])
  return {
    count: orders.length,
    revenue,
    average: orders.length ? Math.round(revenue / orders.length) : 0,
    pending: orders.filter((o) => o.status < 2).length,
    ranking,
  }
}
