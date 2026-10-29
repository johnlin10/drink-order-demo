export type Size = 'M' | 'L'

export interface Drink {
  id: string
  name: string
  category: string
  description: string
  price: Record<Size, number>
  /** 插圖用：茶湯顏色、漸層紋路（黑糖虎紋、拿鐵）、本身就有的料 */
  color: string
  swirl?: string
  inside?: string[]
}

export interface CartItem {
  drinkId: string
  name: string
  size: Size
  sugar: string
  ice: string
  toppings: string[]
  qty: number
  /** 單杯價格（加入購物車時就算好，菜單改價不影響舊訂單） */
  price: number
}

export interface Customer {
  name: string
  phone: string
  pay: string
  note: string
  /** 幾分鐘後取餐 */
  pickupIn: number
}

export interface Order extends Omit<Customer, 'pickupIn'> {
  no: string
  items: CartItem[]
  total: number
  createdAt: string
  pickupAt: string
  /** STATUS 的索引 */
  status: number
}
