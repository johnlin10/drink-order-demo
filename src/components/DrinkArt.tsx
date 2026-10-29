import { useId } from 'react'
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

const ICE_COUNT: Record<string, number> = { 正常冰: 4, 少冰: 3, 微冰: 2 }
// 杯蓋封膜會蓋住液面上緣，冰塊放低一點才看得到
const ICE_AT = [
  [-30, 44],
  [16, 38],
  [-8, 70],
  [34, 66],
]
const PEARLS_AT = [
  [-24, 12],
  [-8, 12],
  [8, 12],
  [24, 12],
  [-40, 0],
  [-24, 0],
  [-8, 0],
  [8, 0],
  [24, 0],
  [40, 0],
  [-32, -14],
  [-16, -14],
  [0, -14],
  [16, -14],
  [32, -14],
  [-20, -28],
  [-4, -28],
  [12, -28],
  [28, -28],
]
const COCONUT_AT = [
  [-30, -80],
  [-8, -96],
  [16, -76],
  [34, -102],
  [-22, -124],
  [6, -134],
]
const JELLY_AT = [
  [-26, -58],
  [22, -56],
  [-4, -110],
  [30, -132],
  [-36, -140],
]

type Faces = [string, string, string]
const ICE: Faces = ['#f6fcff', '#d9eef6', '#bcdce9']
const COCONUT: Faces = ['#fbf7df', '#efe6bb', '#ddd096']
const JELLY: Faces = ['#5a4334', '#3b2a20', '#281b14']

function Cube({
  x,
  y,
  s,
  faces,
}: {
  x: number
  y: number
  s: number
  faces: Faces
}) {
  const w = s * 0.87
  const h = s / 2
  return (
    <g stroke={INK} strokeOpacity={0.45} strokeLinejoin="round">
      <path
        d={`M${x} ${y - h}L${x + w} ${y}L${x} ${y + h}L${x - w} ${y}Z`}
        fill={faces[0]}
      />
      <path
        d={`M${x - w} ${y}L${x} ${y + h}L${x} ${y + h + s}L${x - w} ${y + s}Z`}
        fill={faces[1]}
      />
      <path
        d={`M${x} ${y + h}L${x + w} ${y}L${x + w} ${y + s}L${x} ${y + h + s}Z`}
        fill={faces[2]}
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
  const w = 26 + textWidth(label) + 8 + textWidth(value)
  const edge = side === 'left' ? 168 : 352
  const x = side === 'left' ? edge - w : edge
  return (
    <g className="callout">
      <path d={`M${ax} ${ay}L${edge} ${ly}`} stroke={INK} strokeWidth={1.2} />
      <rect
        x={x}
        y={ly - 15}
        width={w}
        height={30}
        rx={7}
        fill="#fffdf8"
        stroke={INK}
        strokeWidth={1.5}
      />
      <text x={x + 13} y={ly + 5} fontSize={13}>
        <tspan fill="var(--muted)">{label}</tspan>
        <tspan dx={8} fill={INK} fontWeight={700}>
          {value}
        </tspan>
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
    <g aria-hidden>
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

  const ices = ICE_AT.slice(0, ICE_COUNT[ice] ?? 0)
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

      {/* 接觸陰影 */}
      <ellipse
        cx={CX + 18}
        cy={BOTTOM + 12}
        rx={72}
        ry={27}
        fill={INK}
        opacity={0.13}
      />

      {/* 杯內 */}
      <g clipPath={`url(#${clip})`}>
        <path d={liquid} fill={drink.color} />
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
        {has.has('布丁') && (
          <>
            <rect
              x={CX - R_TOP}
              y={BOTTOM - 44}
              width={R_TOP * 2}
              height={80}
              fill="#f2c45a"
            />
            <ellipse
              cx={CX}
              cy={BOTTOM - 44}
              rx={radius(BOTTOM - 44)}
              ry={radius(BOTTOM - 44) * K}
              fill="#f7d986"
              stroke="#c98a2b"
              strokeWidth={2}
            />
          </>
        )}
        {has.has('仙草') &&
          JELLY_AT.map(([x, y]) => (
            <Cube
              key={`${x}${y}`}
              x={CX + x}
              y={BOTTOM + y}
              s={10}
              faces={JELLY}
            />
          ))}
        {has.has('椰果') &&
          COCONUT_AT.map(([x, y]) => (
            <Cube
              key={`${x}${y}`}
              x={CX + x}
              y={BOTTOM + y}
              s={8}
              faces={COCONUT}
            />
          ))}
        {has.has('珍珠') &&
          PEARLS_AT.map(([x, y]) => (
            <g key={`${x}${y}`}>
              <circle
                cx={CX + x}
                cy={BOTTOM + y - (has.has('布丁') ? 44 : 0)}
                r={7.5}
                fill="#2b1c16"
              />
              <circle
                cx={CX + x - 2.5}
                cy={BOTTOM + y - 2.5 - (has.has('布丁') ? 44 : 0)}
                r={2}
                fill="#fff"
                opacity={0.45}
              />
            </g>
          ))}
        <ellipse
          cx={CX}
          cy={liquidTop}
          rx={rl}
          ry={rl * K}
          fill="#fff"
          opacity={0.22}
        />
        {ices.map(([x, y]) => (
          <Cube
            key={`${x}${y}`}
            x={CX + x}
            y={liquidTop + y}
            s={17}
            faces={ICE}
          />
        ))}
        {!hot && (
          <path
            d={`M${sa.x} ${sa.y}L${sp.x} ${sp.y}`}
            stroke={INK}
            strokeWidth={17}
            opacity={0.75}
          />
        )}
        {!hot && (
          <path
            d={`M${sa.x} ${sa.y}L${sp.x} ${sp.y}`}
            stroke="var(--accent)"
            strokeWidth={13}
            opacity={0.75}
          />
        )}
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
          opacity={0.1}
        />
        <path
          d={`M${CX - R_TOP + 16} ${top + 16}L${CX - R_BOTTOM + 12} ${BOTTOM - 6}`}
          stroke="#fff"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.6}
        />
      </g>
      <path
        d={body}
        fill="#fff"
        fillOpacity={0.12}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* 封膜杯蓋 */}
      <ellipse
        cx={CX}
        cy={top + 6}
        rx={R_TOP + 3}
        ry={(R_TOP + 3) * K}
        fill="#e9dfcc"
        stroke={INK}
        strokeWidth={2.5}
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
        cy={top}
        rx={R_TOP - 8}
        ry={(R_TOP - 8) * K}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeDasharray="3 4"
      />
      <text
        x={CX - 22}
        y={top + 6}
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
            d={`M${sp.x - 2} ${sp.y}L${sb.x - 4} ${sb.y}`}
            stroke="#fff"
            strokeWidth={3}
            opacity={0.5}
          />
          <ellipse
            cx={sb.x}
            cy={sb.y}
            rx={8.5}
            ry={3.6}
            fill="#1f8a7e"
            stroke={INK}
            strokeWidth={1.5}
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
            ax={ices.length ? CX + ICE_AT[0][0] : CX - rl + 18}
            ay={ices.length ? liquidTop + ICE_AT[0][1] + 8 : liquidTop + 6}
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
