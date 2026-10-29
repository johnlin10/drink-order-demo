import { describe, expect, it } from 'vitest'
import type { CartItem } from '@/types'
import {
  addToCart,
  cartTotal,
  changeQty,
  createOrder,
  salesStats,
  unitPrice,
} from '../order'

const item = (over: Partial<CartItem> = {}): CartItem => ({
  drinkId: 'boba-milk-tea',
  name: '珍珠奶茶',
  size: 'M',
  sugar: '半糖',
  ice: '少冰',
  toppings: [],
  qty: 1,
  price: 50,
  ...over,
})

const customer = {
  name: ' 王小明 ',
  phone: '0912345678',
  pay: '到店付款',
  note: '',
  pickupIn: 20,
}

describe('價格計算', () => {
  it('容量價格加上加料', () => {
    expect(unitPrice('boba-milk-tea', 'M', [])).toBe(50)
    expect(unitPrice('boba-milk-tea', 'L', ['布丁'])).toBe(75)
    expect(unitPrice('black-tea', 'M', ['珍珠', '椰果'])).toBe(50)
  })

  it('購物車合計 = 單價 × 數量', () => {
    expect(cartTotal([item({ qty: 2 }), item({ price: 75 })])).toBe(175)
    expect(cartTotal([])).toBe(0)
  })
})

describe('購物車', () => {
  it('同規格合併數量，不同規格分開', () => {
    let cart = addToCart([], item())
    cart = addToCart(cart, item({ qty: 2 }))
    expect(cart).toHaveLength(1)
    expect(cart[0].qty).toBe(3)
    cart = addToCart(cart, item({ sugar: '無糖' }))
    cart = addToCart(cart, item({ toppings: ['布丁'] }))
    expect(cart).toHaveLength(3)
  })

  it('數量減到 0 就移除', () => {
    const cart = [item(), item({ size: 'L' })]
    expect(changeQty(cart, 0, 1)[0].qty).toBe(2)
    expect(changeQty(cart, 0, -1)).toEqual([item({ size: 'L' })])
  })
})

describe('建立訂單', () => {
  it('單號依序遞增、時間與金額正確、姓名去除空白', () => {
    const now = new Date('2026-10-29T10:00:00+08:00')
    const order = createOrder([], [item({ qty: 2 })], customer, now)
    expect(order.no).toBe('A001')
    expect(order.name).toBe('王小明')
    expect(order.total).toBe(100)
    expect(order.status).toBe(0)
    expect(new Date(order.pickupAt).getTime() - now.getTime()).toBe(20 * 60_000)
    expect(createOrder([order], [item()], customer).no).toBe('A002')
  })
})

describe('營運統計', () => {
  it('營業額、客單價、待製作、熱銷排行', () => {
    const a = createOrder([], [item({ qty: 3 })], customer)
    const b = {
      ...createOrder(
        [a],
        [item({ drinkId: 'latte', name: '拿鐵咖啡', price: 60 })],
        customer,
      ),
      status: 2,
    }
    const s = salesStats([a, b])
    expect(s.revenue).toBe(210)
    expect(s.average).toBe(105)
    expect(s.pending).toBe(1)
    expect(s.ranking[0]).toEqual(['珍珠奶茶', 3])
  })

  it('沒有訂單時不會除以 0', () => {
    expect(salesStats([]).average).toBe(0)
  })
})
