import { useId, type ReactNode } from 'react'
import washi from '@/assets/washi.svg'
import { SIZE_LABEL } from '@/data/menu'
import type { Drink, Size } from '@/types'

// 等角視角的飲料杯插圖：容量、冰塊、加料、熱飲都會反映在圖上
const CX = 260
const BOTTOM = 340
const K = 0.42 // 圓在等角視角下的上下壓扁比例
const R_TOP = 78
const R_BOTTOM = 58
const INK = 'var(--ink)'

// 料的位置用杯內的立體座標：x 往右、z 往前（朝向我們）、h 從杯底往上
const P = (x: number, z: number, h: number) =>
  [CX + x, BOTTOM - h + z * K] as const

// 固定種子的亂數：每次畫出來都一樣，但不會像排好的一樣整齊
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

// 珍珠沉在杯底堆成兩層，中間再隆起一點；少數幾顆被吸管攪起來
const PEARLS = (() => {
  const rand = rng(7)
  const out: { x: number; z: number; h: number; r: number }[] = []
  for (let layer = 0; layer < 3; layer++) {
    const reach = layer === 2 ? 28 : 46
    for (let row = -4; row <= 4; row++) {
      for (let col = -4; col <= 4; col++) {
        if (layer === 2 && rand() < 0.3) continue
        const x =
          col * 15 +
          (row % 2 ? 7.5 : 0) +
          (layer % 2) * 7.5 +
          (rand() - 0.5) * 6
        const z = row * 13 + (layer % 2) * 6.5 + (rand() - 0.5) * 6
        if (Math.hypot(x, z) > reach) continue
        out.push({ x, z, h: layer * 11 + rand() * 2, r: 6.8 + rand() * 1.2 })
      }
    }
  }
  out.push(
    { x: -20, z: 10, h: 62, r: 7 },
    { x: 28, z: -12, h: 98, r: 7.2 },
    { x: 6, z: 30, h: 42, r: 6.9 },
  )
  return out
})()

// 椰果：細長條，比水重一點，大多散在中下段
const COCONUTS = (() => {
  const rand = rng(31)
  return Array.from({ length: 12 }, (_, i) => {
    const a = rand() * Math.PI * 2
    const d = Math.sqrt(rand()) * 44
    return {
      x: Math.cos(a) * d,
      z: Math.sin(a) * d,
      dh: 4 + rand() ** 1.6 * 110,
      yaw: rand() * Math.PI,
      len: 11 + rand() * 6,
      seed: 100 + i,
    }
  })
})()

// 仙草：大塊、不規則，沉在底下（有珍珠就壓在珍珠上），有一兩塊斜靠在別塊上
const JELLIES = [
  { x: -24, z: 20, dh: 0, yaw: 0.4, w: 28, d: 20, t: 16 },
  { x: 22, z: 24, dh: 2, yaw: -0.6, w: 25, d: 18, t: 14 },
  { x: -4, z: -22, dh: 0, yaw: 1.1, w: 30, d: 22, t: 15 },
  { x: 30, z: -12, dh: 12, yaw: 0.2, w: 22, d: 16, t: 13 },
  { x: -36, z: -8, dh: 14, yaw: -0.9, w: 20, d: 18, t: 12 },
]

// 冰塊浮在液面，頂端露出一點；冰多時下面再擠一層。前面的先放，少冰時才看得到
const ICES = [
  { x: -24, z: 30, layer: 0, yaw: 0.35, s: 25 },
  { x: 22, z: 34, layer: 0, yaw: -0.45, s: 23 },
  { x: -4, z: 40, layer: 1, yaw: 0.8, s: 24 },
  { x: 40, z: 0, layer: 0, yaw: 0.15, s: 24 },
  { x: -46, z: -4, layer: 0, yaw: -0.7, s: 22 },
  { x: 26, z: 22, layer: 1, yaw: 0.6, s: 22 },
  { x: -36, z: 18, layer: 1, yaw: -0.2, s: 23 },
  { x: 0, z: -30, layer: 0, yaw: 0.5, s: 26 },
]
const ICE_COUNT: Record<string, number> = { 正常冰: 8, 少冰: 5, 微冰: 2 }

// 布丁比珍珠大，沉底時會靠到杯壁前側
const PUDDING = { x: -8, z: 16, r: 30, h: 30 }

// 冰飲杯壁上的水珠（相對杯底中心）
const DROPS_AT = [
  [-46, -150],
  [-30, -118],
  [40, -170],
  [52, -128],
  [26, -96],
  [-52, -64],
  [46, -48],
]

// 等角視角的圓（橢圓）在法線方向 (nx, ny) 上最外側的點
const support = (r: number, nx: number, ny: number) => {
  const a = r
  const b = r * K
  const l = Math.hypot(a * nx, b * ny)
  return [(a * a * nx) / l, (b * b * ny) / l]
}

/** 硬邊投影：杯底和杯口的影子，加上連起來的那塊，整組一起淡化才不會疊深 */
function CastShadow({ height }: { height: number }) {
  const [dx, dy] = [height * 0.2, -height * 0.02]
  const len = Math.hypot(dx, dy)
  const [nx, ny] = [-dy / len, dx / len]
  const [b1, b2] = [support(R_BOTTOM, nx, ny), support(R_BOTTOM, -nx, -ny)]
  const [f1, f2] = [support(R_TOP, nx, ny), support(R_TOP, -nx, -ny)]
  const fx = CX + dx
  const fy = BOTTOM + dy
  return (
    <g fill={INK} opacity={0.1}>
      <ellipse cx={CX} cy={BOTTOM} rx={R_BOTTOM} ry={R_BOTTOM * K} />
      <ellipse cx={fx} cy={fy} rx={R_TOP} ry={R_TOP * K} />
      <path
        d={`M${CX + b1[0]} ${BOTTOM + b1[1]}L${fx + f1[0]} ${fy + f1[1]}L${fx + f2[0]} ${fy + f2[1]}L${CX + b2[0]} ${BOTTOM + b2[1]}Z`}
      />
    </g>
  )
}

type Faces = [string, string, string]
const ICE: Faces = ['#ffffff', '#e6f5fa', '#c9e5ef']
const COCONUT: Faces = ['#fdf9e6', '#efe6bb', '#ddd096']
const JELLY: Faces = ['#5a4334', '#3b2a20', '#241811']

const pts = (ps: readonly (readonly [number, number])[]) =>
  ps.map((p) => p.join(' ')).join('L')

/**
 * 塊狀的料：底面四角依 yaw 轉向，每個角再隨機歪一點，
 * 冰塊、椰果就不會方方正正，仙草歪多一點就是不規則的大塊
 */
function Box({
  x,
  z,
  h,
  w,
  d,
  t,
  yaw,
  wobble,
  seed,
  faces,
  alpha = 1,
}: {
  x: number
  z: number
  h: number
  w: number
  d: number
  t: number
  yaw: number
  wobble: number
  seed: number
  faces: Faces
  alpha?: number
}) {
  const rand = rng(seed)
  const j = () => (rand() - 0.5) * 2 * wobble
  const c = Math.cos(yaw)
  const s = Math.sin(yaw)
  const base = [
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [w / 2, d / 2],
    [-w / 2, d / 2],
  ].map(([u, v]) => [x + u * c - v * s + j(), z + u * s + v * c + j()])
  const lo = base.map(([px, pz]) => P(px, pz, h + j() * 0.5))
  const hi = base.map(([px, pz]) => P(px + j(), pz + j(), h + t + j()))
  const edges = base.map((a, i) => {
    const b = base[(i + 1) % 4]
    let nx = b[1] - a[1]
    let nz = a[0] - b[0]
    if (nx * ((a[0] + b[0]) / 2 - x) + nz * ((a[1] + b[1]) / 2 - z) < 0) {
      nx = -nx
      nz = -nz
    }
    const l = Math.hypot(nx, nz)
    return { i, nx: nx / l, nz: nz / l }
  })
  // 頂面迎光那條邊（最朝左的）畫一道反光
  const lit = edges.reduce((m, e) => (e.nx < m.nx ? e : m)).i
  const [a, b] = [hi[lit], hi[(lit + 1) % 4]]
  const cx = hi.reduce((sum, p) => sum + p[0], 0) / 4
  const cy = hi.reduce((sum, p) => sum + p[1], 0) / 4
  const inset = (p: readonly [number, number], k: number) =>
    [p[0] + (cx - p[0]) * k, p[1] + (cy - p[1]) * k] as const
  const ha = inset(
    [a[0] + (b[0] - a[0]) * 0.2, a[1] + (b[1] - a[1]) * 0.2],
    0.2,
  )
  const hb = inset(
    [a[0] + (b[0] - a[0]) * 0.8, a[1] + (b[1] - a[1]) * 0.8],
    0.2,
  )
  return (
    <g
      stroke={INK}
      strokeOpacity={0.55}
      strokeWidth={1.2}
      strokeLinejoin="round"
      fillOpacity={alpha}
    >
      {edges
        .filter((e) => e.nz > 0)
        .map(({ i, nx }) => (
          <path
            key={i}
            d={`M${pts([lo[i], lo[(i + 1) % 4], hi[(i + 1) % 4], hi[i]])}Z`}
            fill={nx < 0.2 ? faces[1] : faces[2]}
          />
        ))}
      <path d={`M${pts(hi)}Z`} fill={faces[0]} />
      <path
        d={`M${pts([ha, hb])}`}
        stroke="#fff"
        strokeOpacity={0.85}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </g>
  )
}

function Pearl({ x, z, h, r }: { x: number; z: number; h: number; r: number }) {
  const [px, py] = P(x, z, h + r)
  return (
    <>
      <circle cx={px} cy={py} r={r} fill="#2b1c16" stroke="#120b08" />
      <circle cx={px + r * 0.3} cy={py + r * 0.3} r={r * 0.55} fill="#1a100c" />
      <circle
        cx={px - r * 0.35}
        cy={py - r * 0.35}
        r={r * 0.25}
        fill="#fff"
        opacity={0.5}
      />
    </>
  )
}

/** 一整顆雞蛋布丁倒扣在杯底：淺黃的側面、焦糖頂，焦糖往下流一點 */
function Pudding() {
  const { x, z, r, h } = PUDDING
  const rt = r - 5
  const [bx, by] = P(x, z, 0)
  const [tx, ty] = P(x, z, h)
  const front = (dx: number) => ty + rt * K * Math.sqrt(1 - (dx / rt) ** 2)
  const shade = (k: number) => Math.sqrt(1 - k * k)
  return (
    <g stroke={INK} strokeOpacity={0.55} strokeWidth={1.4}>
      <path
        d={`M${bx - r} ${by}A${r} ${r * K} 0 0 0 ${bx + r} ${by}L${tx + rt} ${ty}A${rt} ${rt * K} 0 0 1 ${tx - rt} ${ty}Z`}
        fill="#f4cf6e"
      />
      <path
        d={`M${bx + r * 0.35} ${by + r * K * shade(0.35)}A${r} ${r * K} 0 0 0 ${bx + r} ${by}L${tx + rt} ${ty}A${rt} ${rt * K} 0 0 1 ${tx + rt * 0.35} ${ty + rt * K * shade(0.35)}Z`}
        fill="#d9a843"
        stroke="none"
      />
      <ellipse cx={tx} cy={ty} rx={rt} ry={rt * K} fill="#9c5a1e" />
      {[
        [-14, 7],
        [-2, 11],
        [12, 5],
      ].map(([dx, len]) => (
        <path
          key={dx}
          d={`M${tx + dx - 3} ${front(dx) - 1}v${len}a3 3 0 0 0 6 0v${-len}Z`}
          fill="#9c5a1e"
          strokeOpacity={0}
        />
      ))}
      <ellipse
        cx={tx - 3}
        cy={ty - 1}
        rx={rt * 0.6}
        ry={rt * K * 0.55}
        fill="#bf7a36"
        stroke="none"
      />
      <ellipse
        cx={tx - 9}
        cy={ty - 2}
        rx={4}
        ry={1.6}
        fill="#fff"
        opacity={0.6}
        stroke="none"
      />
    </g>
  )
}

const textWidth = (s: string) =>
  [...s].reduce((w, c) => w + (c.charCodeAt(0) > 0xff ? 13 : 7.5), 0)

function Callout({
  ax,
  ay,
  ly,
  side,
  label,
  value,
}: {
  ax: number
  ay: number
  ly: number
  side: 'left' | 'right'
  label: string
  value: string
}) {
  const edge = side === 'left' ? 168 : 352
  // 放不下時（例如加了很多料）在「、」後面換行，標籤不會超出圖外
  const room = (side === 'left' ? edge - 4 : 516 - edge) - 34 - textWidth(label)
  const lines = value.split('、').reduce<string[]>((acc, part, i, all) => {
    const piece = part + (i < all.length - 1 ? '、' : '')
    const last = acc[acc.length - 1]
    if (last !== undefined && textWidth(last + piece) <= room)
      acc[acc.length - 1] = last + piece
    else acc.push(piece)
    return acc
  }, [])
  const w = 26 + textWidth(label) + 8 + Math.max(...lines.map(textWidth))
  const x = side === 'left' ? edge - w : edge
  const vx = x + 13 + textWidth(label) + 8
  return (
    <g className="callout">
      <path d={`M${ax} ${ay}L${edge} ${ly}`} stroke={INK} strokeWidth={1.2} />
      <rect
        x={x}
        y={ly - 15}
        width={w}
        height={30 + (lines.length - 1) * 18}
        rx={7}
        fill="#fffdf8"
        stroke={INK}
        strokeWidth={1.5}
      />
      <text x={x + 13} y={ly + 5} fontSize={13}>
        <tspan fill="var(--muted)">{label}</tspan>
        {lines.map((line, i) => (
          <tspan key={i} x={vx} dy={i ? 18 : 0} fill={INK} fontWeight={700}>
            {line}
          </tspan>
        ))}
      </text>
      <circle
        cx={ax}
        cy={ay}
        r={7}
        fill="#fffdf8"
        stroke="var(--accent)"
        strokeWidth={3}
      />
      <circle cx={ax} cy={ay} r={2.5} fill="var(--accent)" />
    </g>
  )
}

/**
 * 地板：和紙用跟杯子相同的等角視角鋪平（轉 45° 再壓扁一半，和杯墊同比例），
 * 往遠處淡出，看起來像杯子放在一張紙面上，而不是貼在頁面背景前
 */
const AREA = { x: -1000, y: -400, width: 2520, height: 1400 }
const LEAF =
  'M0 0C12-16 42-17 58 0C42 17 12 16 0 0ZM-10 3L0 0H54M14 0l7-7M27 0l7-8M40 0l6-6M14 0l7 7M27 0l7 8M40 0l6 6'

function Floor() {
  const id = useId()
  const cy = BOTTOM + 14 // 杯墊中心
  const iso = `translate(${CX} ${cy}) scale(1 0.5) rotate(45)`
  return (
    <g className="floor" aria-hidden>
      <defs>
        <pattern
          id={`${id}washi`}
          patternUnits="userSpaceOnUse"
          width={260}
          height={260}
          patternTransform={iso}
        >
          <image href={washi} width={260} height={260} />
          <image href={washi} width={260} height={260} />
        </pattern>
        {/* 茶葉直接畫在圖樣裡，比頁面背景深一點，壓扁後的形狀才看得出是一個平面 */}
        <pattern
          id={`${id}leaves`}
          patternUnits="userSpaceOnUse"
          width={220}
          height={220}
          patternTransform={iso}
        >
          <g
            fill="none"
            stroke={INK}
            strokeOpacity={0.16}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={LEAF} transform="translate(40 60) rotate(-28)" />
            <path
              d={LEAF}
              transform="translate(150 150) rotate(38) scale(0.8)"
            />
            <circle cx={170} cy={40} r={2.4} />
            <circle cx={60} cy={180} r={2} />
          </g>
        </pattern>
        <radialGradient
          id={`${id}fade`}
          gradientUnits="userSpaceOnUse"
          cx={CX}
          cy={cy}
          r={640}
          gradientTransform={`translate(${CX} ${cy}) scale(1 0.5) translate(${-CX} ${-cy})`}
        >
          <stop offset="0.2" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}mask`} maskUnits="userSpaceOnUse" {...AREA}>
          <rect {...AREA} fill={`url(#${id}fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}mask)`}>
        <rect {...AREA} fill="#faf5ea" />
        <rect {...AREA} fill={`url(#${id}washi)`} />
        <rect {...AREA} fill={`url(#${id}leaves)`} />
      </g>
      {/* 杯子周圍打一點光 */}
      <ellipse cx={CX} cy={cy} rx={220} ry={110} fill="#fffdf6" opacity={0.3} />
    </g>
  )
}

export default function DrinkArt({
  drink,
  size = 'L',
  sugar = '半糖',
  ice = '少冰',
  toppings = [],
  callouts = false,
  floor = false,
  className,
}: {
  drink: Drink
  size?: Size
  sugar?: string
  ice?: string
  toppings?: string[]
  callouts?: boolean
  floor?: boolean
  className?: string
}) {
  const clip = useId()
  const hot = ice === '熱飲'
  const height = size === 'L' ? 245 : 210
  const top = BOTTOM - height
  const liquidTop = top + (hot ? 30 : 20)
  const radius = (y: number) =>
    R_TOP + ((R_BOTTOM - R_TOP) * (y - top)) / height
  const rl = radius(liquidTop)
  const has = new Set([...(drink.inside ?? []), ...toppings])

  const body = `M${CX - R_TOP} ${top}L${CX - R_BOTTOM} ${BOTTOM}A${R_BOTTOM} ${R_BOTTOM * K} 0 0 0 ${CX + R_BOTTOM} ${BOTTOM}L${CX + R_TOP} ${top}A${R_TOP} ${R_TOP * K} 0 0 0 ${CX - R_TOP} ${top}Z`
  const liquid = `M${CX - rl} ${liquidTop}L${CX - R_BOTTOM} ${BOTTOM}A${R_BOTTOM} ${R_BOTTOM * K} 0 0 0 ${CX + R_BOTTOM} ${BOTTOM}L${CX + rl} ${liquidTop}A${rl} ${rl * K} 0 0 0 ${CX - rl} ${liquidTop}Z`

  // 吸管：杯內那段被杯身裁切、畫在杯壁後面；杯外那段畫在杯蓋上面
  const sa = { x: CX + 8, y: BOTTOM - 20 }
  const sb = { x: CX + 44, y: top - 92 }
  const t = (sa.y - top) / (sa.y - sb.y)
  const sp = { x: sa.x + (sb.x - sa.x) * t, y: top }

  // 杯身在高度 y 那一圈朝向我們的半圈
  const arc = (y: number) => {
    const r = radius(y)
    return `M${CX - r} ${y}A${r} ${r * K} 0 0 0 ${CX + r} ${y}`
  }

  // 紅茶、綠茶、果茶是透明的，看得到另一側的料；奶茶、咖啡不透明，只看得到貼著杯壁的
  const clear = drink.category === '原味茶' || drink.category === '果茶'
  const alpha = (z: number) => {
    const f = Math.min(1, Math.max(0, (z + 50) / 100))
    return clear ? 0.8 + 0.2 * f : 0.25 + 0.7 * f
  }

  // 沉下去的料落在哪個高度：有珍珠就疊在珍珠上，布丁上方就疊在布丁上
  const floorAt = (x: number, z: number) =>
    Math.max(
      has.has('珍珠') ? (Math.hypot(x, z) < 28 ? 34 : 24) : 0,
      has.has('布丁') && Math.hypot(x - PUDDING.x, z - PUDDING.z) < PUDDING.r
        ? PUDDING.h
        : 0,
    )

  // 所有料依前後排序再畫，後面的先畫；吸管在正中間，夾在前後兩群之間
  const items: { z: number; depth: number; el: ReactNode }[] = []
  const add = (z: number, h: number, el: ReactNode) =>
    items.push({ z, depth: z * 0.91 + h * 0.42, el })

  if (has.has('布丁')) add(PUDDING.z, PUDDING.h / 2, <Pudding />)
  if (has.has('珍珠'))
    PEARLS.filter(
      (p) =>
        !has.has('布丁') ||
        p.h > PUDDING.h ||
        Math.hypot(p.x - PUDDING.x, p.z - PUDDING.z) > PUDDING.r + p.r / 2,
    ).forEach((p) => add(p.z, p.h, <Pearl {...p} />))
  if (has.has('仙草'))
    JELLIES.forEach((j, i) =>
      add(
        j.z,
        floorAt(j.x, j.z) + j.dh,
        <Box
          {...j}
          h={floorAt(j.x, j.z) + j.dh}
          wobble={3.5}
          seed={50 + i}
          faces={JELLY}
          alpha={0.92}
        />,
      ),
    )
  if (has.has('椰果'))
    COCONUTS.forEach((c) =>
      add(
        c.z,
        floorAt(c.x, c.z) + c.dh,
        <Box
          {...c}
          h={floorAt(c.x, c.z) + c.dh}
          w={c.len}
          d={6.5}
          t={6.5}
          wobble={1}
          faces={COCONUT}
          alpha={0.85}
        />,
      ),
    )
  const surface = BOTTOM - liquidTop
  const ices = ICES.slice(0, ICE_COUNT[ice] ?? 0).map((c) => {
    const t = c.s * 0.88
    return { ...c, t, h: c.layer ? surface - 2 * t + 6 : surface + 3 - t }
  })
  ices.forEach((c, i) =>
    add(
      c.z,
      c.h,
      <Box
        {...c}
        w={c.s}
        d={c.s * 0.92}
        wobble={2}
        seed={200 + i}
        faces={ICE}
        alpha={0.7}
      />,
    ),
  )
  items.sort((a, b) => a.depth - b.depth)
  const layer = (keep: (z: number) => boolean) =>
    items
      .filter((it) => keep(it.z))
      .map((it, i) => (
        <g key={i} opacity={alpha(it.z)}>
          {it.el}
        </g>
      ))
  const iceMark =
    ices[0] &&
    P(ices[0].x, ices[0].z + ices[0].s / 2, ices[0].h + ices[0].t / 2)
  const mid = (liquidTop + BOTTOM) / 2

  return (
    <svg
      className={className}
      viewBox={callouts ? '0 -12 520 432' : '128 -6 264 380'}
      role="img"
      aria-label={`${drink.name}：${SIZE_LABEL[size]}、${sugar}、${ice}`}
    >
      <defs>
        <clipPath id={clip}>
          <path d={body} />
        </clipPath>
      </defs>

      {floor && <Floor />}

      <CastShadow height={height} />
      {/* 杯底貼地的那圈最深 */}
      <ellipse
        cx={CX + 2}
        cy={BOTTOM + 2}
        rx={R_BOTTOM + 3}
        ry={(R_BOTTOM + 3) * K}
        fill={INK}
        opacity={0.16}
      />

      {/* 杯內 */}
      <g clipPath={`url(#${clip})`}>
        <path d={liquid} fill={drink.color} fillOpacity={clear ? 0.82 : 1} />
        {/* 透明茶湯：兩側穿過的茶湯比較厚、顏色比較深，中間透光，還看得到杯底後半圈 */}
        {clear && (
          <>
            {[
              [-R_TOP, 0.42],
              [R_TOP * 0.45, 0.55],
            ].map(([x, w]) => (
              <rect
                key={x}
                x={CX + x}
                y={liquidTop}
                width={R_TOP * w}
                height={height}
                fill={drink.color}
                opacity={0.5}
              />
            ))}
            <path
              d={`M${CX - R_BOTTOM} ${BOTTOM}A${R_BOTTOM} ${R_BOTTOM * K} 0 0 1 ${CX + R_BOTTOM} ${BOTTOM}`}
              fill="none"
              stroke={INK}
              strokeOpacity={0.35}
              strokeWidth={1.5}
            />
            <path
              d={`M${CX - 30} ${liquidTop}L${CX - 22} ${BOTTOM}L${CX + 4} ${BOTTOM}L${CX - 2} ${liquidTop}Z`}
              fill="#fff"
              opacity={0.3}
            />
          </>
        )}
        {drink.swirl &&
          [-50, -16, 18, 50].map((dx) => (
            <path
              key={dx}
              d={`M${CX + dx} ${liquidTop + 6}c10 30 -14 60 4 100s-6 60 8 100`}
              fill="none"
              stroke={drink.swirl}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.55}
            />
          ))}
        {/* 液面：比杯身亮一階，邊緣一圈液面線 */}
        <ellipse
          cx={CX}
          cy={liquidTop}
          rx={rl}
          ry={rl * K}
          fill="#fff"
          fillOpacity={0.22}
          stroke={INK}
          strokeOpacity={0.3}
          strokeWidth={1.5}
        />
        {[-36, -22, 30].map((dx, i) => (
          <circle
            key={dx}
            cx={CX + dx}
            cy={liquidTop + [25, 29, 26][i]}
            r={i === 1 ? 2 : 3}
            fill="#fff"
            fillOpacity={0.35}
            stroke="#fff"
            strokeOpacity={0.8}
          />
        ))}
        {layer((z) => z < 0)}
        {!hot && (
          <g opacity={clear ? 0.95 : 0.8}>
            <path
              d={`M${sa.x} ${sa.y}L${sp.x} ${sp.y}`}
              stroke={INK}
              strokeWidth={17}
            />
            <path
              d={`M${sa.x} ${sa.y}L${sp.x} ${sp.y}`}
              stroke="var(--accent)"
              strokeWidth={13}
            />
            <path
              d={`M${sa.x + 4} ${sa.y}L${sp.x + 4} ${sp.y}`}
              stroke="#1f8a7e"
              strokeWidth={5}
            />
          </g>
        )}
        {layer((z) => z >= 0)}
        {/* 透明茶湯：泡在裡面的料都染上一層茶色 */}
        {clear && <path d={liquid} fill={drink.color} opacity={0.2} />}
        {/* 杯壁的明暗與反光 */}
        <rect
          x={CX - R_TOP}
          y={top - 40}
          width={R_TOP * 0.55}
          height={height + 80}
          fill="#fff"
          opacity={0.22}
        />
        <rect
          x={CX + R_TOP * 0.35}
          y={top - 40}
          width={R_TOP}
          height={height + 80}
          fill={INK}
          opacity={clear ? 0.04 : 0.1}
        />
        <rect
          x={CX + R_TOP * 0.72}
          y={top - 40}
          width={R_TOP}
          height={height + 80}
          fill={INK}
          opacity={clear ? 0.04 : 0.08}
        />
        <path
          d={`M${CX - R_TOP + 16} ${top + 16}L${CX - R_BOTTOM + 12} ${BOTTOM - 6}`}
          stroke="#fff"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.6}
        />
        <path
          d={`M${CX - R_TOP + 30} ${top + 50}L${CX - R_BOTTOM + 23} ${BOTTOM - 60}`}
          stroke="#fff"
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.5}
        />
        {/* 背光那側杯壁的反光 */}
        <path
          d={`M${CX + R_TOP - 7} ${top + 24}L${CX + R_BOTTOM - 5} ${BOTTOM - 10}`}
          stroke="#fff"
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.35}
        />
        {/* 杯蓋邊緣壓在杯身上的影子 */}
        <ellipse
          cx={CX}
          cy={top + 13}
          rx={R_TOP}
          ry={R_TOP * K}
          fill={INK}
          opacity={0.12}
        />
        {/* 加厚的杯底與兩圈壓紋 */}
        <path
          d={`${arc(BOTTOM - 12)}L${CX + R_TOP} ${BOTTOM + 60}L${CX - R_TOP} ${BOTTOM + 60}Z`}
          fill="#fff"
          opacity={0.2}
        />
        <path
          d={`${arc(BOTTOM - 12)}${arc(BOTTOM - 19)}`}
          fill="none"
          stroke={INK}
          strokeOpacity={0.3}
          strokeWidth={1.5}
        />
        {!hot &&
          DROPS_AT.filter(([, y]) => BOTTOM + y > liquidTop + 30).map(
            ([x, y]) => (
              <g key={`${x}${y}`}>
                <ellipse
                  cx={CX + x}
                  cy={BOTTOM + y}
                  rx={2.6}
                  ry={3.4}
                  fill="#fff"
                  fillOpacity={0.35}
                  stroke={INK}
                  strokeOpacity={0.3}
                />
                <circle
                  cx={CX + x - 0.8}
                  cy={BOTTOM + y - 1.2}
                  r={0.9}
                  fill="#fff"
                />
              </g>
            ),
          )}
      </g>
      <path
        d={body}
        fill="#fff"
        fillOpacity={0.12}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* 封膜杯蓋：杯緣有厚度，封膜微微凹下去，印著店名 */}
      <path
        d={`M${CX - R_TOP - 3} ${top}L${CX - R_TOP - 3} ${top + 6}A${R_TOP + 3} ${(R_TOP + 3) * K} 0 0 0 ${CX + R_TOP + 3} ${top + 6}L${CX + R_TOP + 3} ${top}Z`}
        fill="#e9dfcc"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d={`M${CX + R_TOP * 0.35} ${top + (R_TOP + 3) * K * 0.94}A${R_TOP + 3} ${(R_TOP + 3) * K} 0 0 0 ${CX + R_TOP + 1.8} ${top + 1}L${CX + R_TOP + 1.8} ${top + 6}A${R_TOP + 3} ${(R_TOP + 3) * K} 0 0 1 ${CX + R_TOP * 0.35} ${top + 6 + (R_TOP + 3) * K * 0.94}Z`}
        fill={INK}
        opacity={0.12}
      />
      <ellipse
        cx={CX}
        cy={top}
        rx={R_TOP + 3}
        ry={(R_TOP + 3) * K}
        fill="#fffaf0"
        stroke={INK}
        strokeWidth={2.5}
      />
      <ellipse
        cx={CX}
        cy={top + 1.5}
        rx={R_TOP - 4}
        ry={(R_TOP - 4) * K}
        fill="#f5ecda"
        stroke={INK}
        strokeOpacity={0.35}
        strokeWidth={1.5}
      />
      {/* 封膜靠杯緣那圈的凹痕影子 */}
      <path
        d={`M${CX - R_TOP + 4} ${top + 1.5}A${R_TOP - 4} ${(R_TOP - 4) * K} 0 0 1 ${CX + R_TOP - 4} ${top + 1.5}A${R_TOP - 4} ${(R_TOP - 4) * K - 4} 0 0 0 ${CX - R_TOP + 4} ${top + 1.5}Z`}
        fill={INK}
        opacity={0.08}
      />
      <ellipse
        cx={CX}
        cy={top + 1.5}
        rx={R_TOP - 13}
        ry={(R_TOP - 13) * K}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeDasharray="3 4"
      />
      <text
        x={CX - 22}
        y={top + 7}
        fontSize={14}
        fontWeight={700}
        fill="var(--accent)"
        letterSpacing={2}
      >
        茶語
      </text>

      {hot ? (
        [-30, -6, 18].map((dx) => (
          <path
            key={dx}
            d={`M${CX + dx} ${top - 24}c-8 -10 8 -20 0 -30s8 -20 0 -30`}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.6}
          />
        ))
      ) : (
        <g>
          {/* 吸管戳破封膜的皺褶 */}
          <ellipse
            cx={sp.x}
            cy={sp.y + 2}
            rx={13}
            ry={5.5}
            fill="#e6dac3"
            stroke={INK}
            strokeOpacity={0.45}
            strokeWidth={1.2}
          />
          <path
            d={`M${sp.x - 15} ${sp.y + 1}l-5 -1M${sp.x + 14} ${sp.y + 5}l5 2M${sp.x - 8} ${sp.y + 7}l-3 3M${sp.x + 4} ${sp.y - 3}l2 -3`}
            stroke={INK}
            strokeOpacity={0.4}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          {/* 吸管：亮面、本色、暗面三階 */}
          <path
            d={`M${sp.x} ${sp.y}L${sb.x} ${sb.y}`}
            stroke={INK}
            strokeWidth={17}
          />
          <path
            d={`M${sp.x} ${sp.y}L${sb.x} ${sb.y}`}
            stroke="var(--accent)"
            strokeWidth={13}
          />
          <path
            d={`M${sp.x + 4} ${sp.y + 1}L${sb.x + 4} ${sb.y + 1}`}
            stroke="#1f8a7e"
            strokeWidth={5}
          />
          <path
            d={`M${sp.x - 3} ${sp.y}L${sb.x - 3.5} ${sb.y + 2}`}
            stroke="#fff"
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.6}
          />
          <ellipse
            cx={sb.x}
            cy={sb.y}
            rx={8.5}
            ry={3.6}
            fill="#5cc9bb"
            stroke={INK}
            strokeWidth={1.5}
          />
          <ellipse
            cx={sb.x + 0.5}
            cy={sb.y + 0.3}
            rx={5}
            ry={1.8}
            fill="#0f4a44"
          />
        </g>
      )}

      {callouts && (
        <>
          <Callout
            ax={CX - R_TOP + 4}
            ay={top + 6}
            ly={top - 14}
            side="left"
            label="容量"
            value={SIZE_LABEL[size]}
          />
          <Callout
            ax={iceMark ? iceMark[0] : CX - rl + 18}
            ay={iceMark ? iceMark[1] : liquidTop + 6}
            ly={liquidTop + 52}
            side="left"
            label="冰塊"
            value={ice}
          />
          <Callout
            ax={CX + radius(mid) - 14}
            ay={mid}
            ly={mid - 24}
            side="right"
            label="甜度"
            value={sugar}
          />
          <Callout
            ax={CX + 18}
            ay={BOTTOM - (has.has('布丁') ? 30 : 8)}
            ly={BOTTOM + 30}
            side="right"
            label="加料"
            value={toppings.length ? toppings.join('、') : '不加'}
          />
        </>
      )}
    </svg>
  )
}
