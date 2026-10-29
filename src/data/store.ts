import { useSyncExternalStore } from 'react'
import type { CartItem, Order } from '@/types'

// 原型沒有後端，購物車與訂單都存在瀏覽器的 localStorage
// 顧客端與店家端開在不同分頁時，透過 storage 事件即時同步
const cache = new Map<string, unknown>()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

function read<T>(key: string, fallback: T): T {
  if (!cache.has(key)) {
    try {
      cache.set(
        key,
        JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback,
      )
    } catch {
      cache.set(key, fallback)
    }
  }
  return cache.get(key) as T
}

function write<T>(key: string, value: T) {
  cache.set(key, value)
  localStorage.setItem(key, JSON.stringify(value))
  notify()
}

window.addEventListener('storage', (e) => {
  if (e.key) cache.delete(e.key)
  else cache.clear()
  notify()
})

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

function useStored<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(subscribe, () => read(key, fallback))
  return [value, (v: T) => write(key, v)] as const
}

const EMPTY_CART: CartItem[] = []
const EMPTY_ORDERS: Order[] = []
export const useCart = () => useStored('cart', EMPTY_CART)
export const useOrders = () => useStored('orders', EMPTY_ORDERS)

export function resetDemoData() {
  write('cart', EMPTY_CART)
  write('orders', EMPTY_ORDERS)
}
