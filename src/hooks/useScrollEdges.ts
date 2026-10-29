import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 捲動區塊的前後是否還有內容，用來決定邊緣要不要淡出、箭頭要不要出現
 * 捲到最頂（最左）時前面不淡出，捲到底時後面不淡出
 * `watch` 變了（換分類、換頁）就重新量一次；內容長高、視窗縮放也會自動重量
 */
export function useScrollEdges<T extends HTMLElement>(
  axis: 'x' | 'y',
  watch?: unknown,
) {
  const ref = useRef<T>(null)
  const [edges, setEdges] = useState({ start: false, end: false })

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const pos = axis === 'x' ? el.scrollLeft : el.scrollTop
    const view = axis === 'x' ? el.clientWidth : el.clientHeight
    const total = axis === 'x' ? el.scrollWidth : el.scrollHeight
    const start = pos > 4
    const end = pos + view < total - 4
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }))
  }, [axis])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    for (const child of el.children) observer.observe(child)
    return () => {
      el.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [measure, watch])

  return [ref, edges] as const
}

/** 對應的 class：more-start／more-end，樣式裡用來開關淡出 */
export const fades = (e: { start: boolean; end: boolean }) =>
  `${e.start ? 'more-start' : ''} ${e.end ? 'more-end' : ''}`
