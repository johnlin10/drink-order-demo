// 按鍵「按下去」的狀態改用 pointer 事件控制，不靠 CSS 的 :active
// 觸控時 :active 的時機不穩：短按時可能在 click 之前就先放開，
// 開關類按鍵會先彈回來、等狀態更新後再卡下去，看起來像按了兩次
// 用 data-pressed 屬性而不是 class：React 重設 className 時不會被洗掉，
// 也不會讓「沒有 class 的內文連結」選擇器失效
const PRESSABLE = 'button, a, label'
/** 按下最少維持的時間，短按也看得到完整的按下、彈起 */
const MIN_PRESS = 120
/** 觸控先等一下再按下，手指其實是要捲動時就不會閃一下 */
const TOUCH_DELAY = 60

function hold(el: Element) {
  el.setAttribute('data-pressed', '')
  return performance.now()
}

function release(el: Element, pressedAt: number) {
  const left = MIN_PRESS - (performance.now() - pressedAt)
  setTimeout(() => el.removeAttribute('data-pressed'), Math.max(0, left))
}

export function initPress() {
  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return
    const el = (e.target as Element).closest(PRESSABLE)
    if (!el || el.matches(':disabled')) return

    let pressedAt = 0
    const timer = setTimeout(
      () => (pressedAt = hold(el)),
      e.pointerType === 'mouse' ? 0 : TOUCH_DELAY,
    )

    const end = (cancelled: boolean) => () => {
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      clearTimeout(timer)
      // 瀏覽器接手捲動（pointercancel）就不算按下
      if (cancelled) return el.removeAttribute('data-pressed')
      release(el, pressedAt || hold(el))
    }
    const up = end(false)
    const cancel = end(true)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
  })

  // 鍵盤按空白鍵、Enter 也要看得到按下去
  document.addEventListener('keydown', (e) => {
    if (e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return
    const el = document.activeElement?.closest(PRESSABLE)
    if (!el) return
    const pressedAt = hold(el)
    document.addEventListener('keyup', () => release(el, pressedAt), {
      once: true,
    })
  })
}
