import { useEffect, useRef } from 'react'

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))

type Spring = { x: number; v: number }
type Item = {
  x: Spring
  y: Spring
  cx: number
  cy: number
  k: number
  float: number
}

/**
 * 飲料的物理效果，只在真的碰到杯子時才有反應：
 * - 從杯子外面滑進杯子、或在杯子上短暫點一下：杯子晃一下（--lean，度），
 *   茶湯慣性留在原地、液面來回晃（--tilt，弧度），料也跟著漂
 * - 在杯子裡滑動：游標附近的料被撥開，在茶湯裡慢慢漂回原位
 *
 * 杯身的範圍由 svg 裡的 [data-hit] 決定；每顆料是一個 [data-k] 元素，
 * data-x / data-y 是它原本的位置，data-k 是多容易被推動，data-float 是浮在液面上的料的 x
 * 每一幀直接改元素的 transform 與 svg 上的 CSS 變數，不經過 React 重新渲染；靜止下來就停止動畫
 */
export function useSlosh(enabled: boolean) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg || !enabled) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lean: Spring = { x: 0, v: 0 }
    const tilt: Spring = { x: 0, v: 0 }
    const drift: Spring = { x: 0, v: 0 }
    const items = new WeakMap<Element, Item>()
    let frame = 0
    let last = 0
    let prev: DOMPoint | null = null
    let inside = false
    let down: { t: number; p: DOMPoint } | null = null

    // 位置、k、float 每次都從元素重新讀：換飲料或加料時，React 會沿用同一個元素
    // 放另一顆料（例如原本的珍珠變成冰塊），記住舊值就會在錯的位置撥動
    const list = () =>
      [...svg.querySelectorAll<SVGGElement>('[data-k]')].map((el) => {
        let it = items.get(el)
        if (!it) {
          it = {
            x: { x: 0, v: 0 },
            y: { x: 0, v: 0 },
            cx: 0,
            cy: 0,
            k: 0,
            float: 0,
          }
          items.set(el, it)
        }
        it.cx = Number(el.dataset.x)
        it.cy = Number(el.dataset.y)
        it.k = Number(el.dataset.k)
        it.float = Number(el.dataset.float ?? 0)
        return [el, it] as const
      })

    const spring = (s: Spring, k: number, c: number, dt: number, to = 0) => {
      s.v += (k * (to - s.x) - c * s.v) * dt
      s.x += s.v * dt
      return Math.abs(s.x - to) + Math.abs(s.v) > 0.02
    }

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      let moving = spring(lean, 180, 12, dt)
      lean.x = clamp(lean.x, -4, 4)
      moving = spring(tilt, 55, 2.2, dt) || moving
      tilt.x = clamp(tilt.x, -0.18, 0.18)
      // 液面往右低時（tilt > 0），料被茶湯帶著往左漂
      moving = spring(drift, 25, 5, dt, -tilt.x * 90) || moving
      svg.style.setProperty('--lean', lean.x.toFixed(3))
      // 支點：往右倒用右邊的杯底轉角，往左倒用左邊的（角度為 0 時換邊，不會跳動）
      svg.style.setProperty('--pivot', lean.x < 0 ? '-1' : '1')
      svg.style.setProperty('--tilt', tilt.x.toFixed(4))
      for (const [el, it] of list()) {
        // 在茶湯裡：回彈慢、阻力大
        moving = spring(it.x, 30, 7, dt) || moving
        moving = spring(it.y, 30, 7, dt) || moving
        it.x.x = clamp(it.x.x, -26, 26)
        it.y.x = clamp(it.y.x, -22, it.float ? 4 : 3)
        const x = drift.x * it.k + it.x.x
        el.style.transform = `translate(${x.toFixed(2)}px, ${(tilt.x * it.float + it.y.x).toFixed(2)}px)`
        el.style.setProperty('--j', x.toFixed(2))
      }
      frame = moving ? requestAnimationFrame(step) : 0
    }
    const run = () => {
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(step)
    }

    // 杯子被推了一下：dx 往右為正（svg 座標）
    const shake = (dx: number) => {
      lean.v += dx * 3
      tilt.v += dx * 0.06
      run()
    }
    // 撥動 p 附近的料：順著游標移動的方向推，再往外推開一點
    const stir = (p: DOMPoint, dx: number, dy: number, poke = 0) => {
      const R = 38
      for (const [, it] of list()) {
        const ox = it.cx + it.x.x - p.x
        const oy = it.cy + it.y.x - p.y
        const d = Math.hypot(ox, oy)
        if (d > R) continue
        const w = (1 - d / R) ** 2 * it.k
        const push = poke + 2
        it.x.v += (dx * 10 + (ox / (d || 1)) * push * 10) * w
        it.y.v += (dy * 10 + (oy / (d || 1)) * push * 10) * w
      }
      tilt.v += dx * 0.0015
      run()
    }

    const hit = () => svg.querySelector<SVGGeometryElement>('[data-hit]')
    const toSvg = (e: PointerEvent) => {
      const h = hit()
      const m = h?.getScreenCTM()
      if (!h || !m) return null
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
      return { p, on: h.isPointInFill(p) }
    }

    const onMove = (e: PointerEvent) => {
      const at = toSvg(e)
      if (!at) return
      const { p, on } = at
      if (prev && on) {
        const dx = clamp(p.x - prev.x, -30, 30)
        const dy = clamp(p.y - prev.y, -30, 30)
        // 從外面滑進杯子：撞到杯子
        if (!inside) shake(clamp(dx, -20, 20))
        stir(p, dx, dy)
      }
      inside = on
      prev = p
    }
    const onDown = (e: PointerEvent) => {
      const at = toSvg(e)
      down = at?.on ? { t: performance.now(), p: at.p } : null
      // 手指直接按在杯子上不算「滑進來」
      if (at && e.pointerType !== 'mouse') {
        prev = at.p
        inside = at.on
      }
    }
    // 短暫點一下：從點的那一側往另一側推，點的地方的料被戳開
    const onUp = (e: PointerEvent) => {
      const at = toSvg(e)
      if (!down || !at) return
      const quick = performance.now() - down.t < 300
      if (quick && Math.hypot(at.p.x - down.p.x, at.p.y - down.p.y) < 8) {
        const cx = svg.viewBox.baseVal.x + svg.viewBox.baseVal.width / 2
        shake(Math.sign(cx - at.p.x) * 12)
        stir(at.p, 0, 0, 3)
      }
      down = null
      // 手指離開後，下一次按下的位置跟這次無關
      if (e.pointerType !== 'mouse') onLeave()
    }
    const onLeave = () => {
      prev = null
      inside = false
    }

    // 掛在 window 上：手指從杯子外面按下再滑進來時，事件不一定會送到 svg
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onLeave)
    }
  }, [enabled])

  return ref
}
