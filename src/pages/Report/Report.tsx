import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import './Report.scss'
import DrinkArt from '@/components/DrinkArt'
import { MENU, SHOP_NAME } from '@/data/menu'

// 交作業前改這裡
const STUDENT = { className: '（班級）', id: '（學號）', name: '（姓名）' }
const REPO_URL = 'https://github.com/johnlin10/drink-order-demo'
const DEMO_URL = 'https://johnlin10.github.io/drink-order-demo/'
const TEST_DATE = '2026-10-29'

const SECTIONS = [
  ['links', '系統連結', 'Links'],
  ['flow', '可演示流程', 'Demo flow'],
  ['features', '系統功能介紹', 'Features'],
  ['tests', '測試紀錄', 'Test log'],
  ['value', '商業價值說明', 'Business value'],
] as const

const CUSTOMER_FLOW = [
  [
    '瀏覽菜單',
    '在下方菜單列依分類（原味茶、奶茶、果茶、咖啡）篩選，卡片附飲料插圖與中杯／大杯價格',
  ],
  [
    '客製化飲料',
    '在右側面板選容量、甜度、冰塊、加料與數量；中間的飲料插圖（冰塊、珍珠、布丁、熱氣）與小計即時更新',
  ],
  ['確認購物車', '調整每一項的數量，減到 0 自動移除；相同規格會自動合併'],
  [
    '填寫取餐資料並送出',
    '按購物車的「結帳」，輸入姓名、手機，選擇取餐時間與付款方式（線上付款為模擬）',
  ],
  ['取得單號', '送出後顯示單號（如 #A001）與預計取餐時間'],
  ['追蹤訂單進度', '在「我的訂單」看到 已接單 → 製作中 → 可取餐 → 已完成'],
] as const

const STORE_FLOW = [
  [
    '接收訂單',
    '新訂單即時出現在「店家後台」，含品項規格、備註、付款方式與取餐時間',
  ],
  [
    '更新製作狀態',
    '按「改為製作中」「改為可取餐」「改為已完成」，顧客端進度同步更新',
  ],
  ['查看營運數據', '訂單數、營業額、平均客單價、待製作筆數、熱銷排行'],
] as const

const FEATURES = [
  ['菜單瀏覽', '11 款飲料、4 種分類，一鍵篩選，每款都有等角插圖'],
  [
    '飲料客製化',
    '容量 2 種、甜度 5 段、冰塊 5 段（含熱飲）、4 種加料，價格自動計算；飲料插圖即時反映選擇',
  ],
  ['購物車', '同規格自動合併、數量增減、即時合計；重新整理不會遺失'],
  [
    '線上結帳',
    '姓名與手機格式驗證、取餐時間、付款方式（到店／LINE Pay／信用卡，線上為模擬）、備註',
  ],
  ['訂單追蹤', '單號、預計取餐時間、四階段進度條'],
  ['店家後台', '訂單列表、一鍵推進製作狀態；頂部小工具顯示最新訂單進度'],
  ['營運統計', '訂單數、營業額、平均客單價、待製作、熱銷排行長條圖'],
  ['多分頁即時同步', '顧客端與店家端開在不同分頁，資料即時同步，方便現場演示'],
  [
    '響應式介面',
    '手機、平板、電腦都能操作，手機版改為底部導覽列，並有購物車快捷列',
  ],
] as const

const TECH = [
  ['前端框架', 'React 18 + TypeScript'],
  ['建置工具', 'Vite'],
  ['樣式', 'SCSS；等角插圖以 SVG 手寫，不用圖片檔'],
  ['路由', 'React Router（Hash 路由，適用 GitHub Pages）'],
  ['資料儲存', '瀏覽器 localStorage（原型不需後端）'],
  ['自動化測試', 'Vitest'],
  ['部署', 'GitHub Actions 自動建置並發布到 GitHub Pages'],
  ['AI 協作', '使用 Claude Code 生成程式碼，再由本人檢視、測試與調整'],
] as const

const UNIT_TESTS = [
  '價格計算：容量價格加上加料',
  '價格計算：購物車合計 = 單價 × 數量',
  '購物車：同規格合併數量，不同規格分開',
  '購物車：數量減到 0 就移除',
  '建立訂單：單號依序遞增、時間與金額正確、姓名去除空白',
  '營運統計：營業額、客單價、待製作、熱銷排行',
  '營運統計：沒有訂單時不會除以 0',
]

// [編號, 測試項目, 操作步驟, 預期結果]
const MANUAL_TESTS = [
  [
    'T01',
    '分類篩選',
    '點「果茶」',
    '只顯示檸檬綠茶、百香雙響炮、葡萄柚綠 3 項',
  ],
  [
    'T02',
    '客製化價格',
    '選珍珠奶茶 → 大杯、加布丁、數量 2',
    '小計顯示 $150（(60+15)×2）',
  ],
  ['T03', '同規格合併', '同規格的飲料再加入一次', '購物車維持一行，數量相加'],
  ['T04', '數量增減', '購物車按 − 直到 0', '該品項從購物車移除，合計同步更新'],
  [
    'T05',
    '空購物車結帳',
    '購物車為空時按「結帳」',
    '提示「購物車是空的」，不建立訂單',
  ],
  ['T06', '必填欄位', '姓名只輸入空白後送出', '瀏覽器阻擋送出並提示'],
  [
    'T07',
    '手機格式',
    '手機輸入 12345 後送出',
    '瀏覽器阻擋送出，提示 09 開頭 10 碼',
  ],
  [
    'T08',
    '成功下單',
    '填妥資料送出',
    '顯示單號 #A001 與預計取餐時間，購物車清空',
  ],
  [
    'T09',
    '訂單追蹤',
    '前往「我的訂單」',
    '看到訂單、飲料縮圖與品項規格，進度停在「已接單」',
  ],
  [
    'T10',
    '店家推進狀態',
    '店家後台依序按 3 次狀態按鈕',
    '已接單 → 製作中 → 可取餐 → 已完成，完成後按鈕消失',
  ],
  [
    'T11',
    '營運統計',
    '建立 2 筆訂單後看後台',
    '訂單數、營業額、客單價、熱銷排行數字正確',
  ],
  ['T12', '資料保存', '重新整理頁面', '購物車與訂單仍在'],
  [
    'T13',
    '跨分頁同步',
    '分頁 A 開店家後台、分頁 B 下單',
    '分頁 A 不需重新整理就出現新訂單',
  ],
  [
    'T14',
    '防止 XSS',
    '備註輸入 <img src=x onerror=alert(1)>',
    '後台以純文字顯示，不執行程式',
  ],
  [
    'T15',
    '手機版面',
    '以 375px 寬度瀏覽',
    '版面不破、無水平捲動，導覽列移到底部，並出現購物車快捷列',
  ],
] as const

// [編號, 問題, 原因, 解決方式, 來源, 修正版本]
const ISSUES = [
  [
    'I01',
    '作業說明頁在手機上右側被裁掉',
    '版面格線的欄位被寬表格撐開，超出畫面',
    '格線欄位改成可以縮小（minmax(0, 1fr)），表格自己橫向捲動',
    '測試發現',
    'v0.1.0',
  ],
  [
    'I02',
    '點餐頁右側面板蓋住飲料預覽',
    '左半邊的格線被橫向捲動的菜單撐到所有卡片的寬度',
    '限制左半邊的欄寬，菜單只在自己的區塊內捲動',
    '測試發現',
    'v0.1.0',
  ],
  [
    'I03',
    '標題隨內容捲走，電腦版點餐頁整頁都會捲動',
    '標題與內容放在同一個捲動區',
    '電腦版標題固定、點餐頁左半邊固定、右半邊自己捲；手機版捲動後頂部出現精簡標題列',
    '使用者回饋',
    'v0.2.0',
  ],
  [
    'I04',
    '菜單橫向捲動時，卡片在左右邊緣被硬切一半',
    '捲動區邊緣沒有過渡',
    '還有內容的那一側用漸層淡出，並加上左右箭頭',
    '使用者回饋',
    'v0.2.0',
  ],
  [
    'I05',
    '方格背景與「茶語時光」的氛圍不搭',
    '視覺選擇',
    '改成和紙紋理加上淡淡的茶葉線稿；飲料預覽區改成同視角鋪開的紙面地板，拿掉杯墊',
    '使用者回饋',
    'v0.2.0',
  ],
  [
    'I06',
    '按鈕、選項、連結的互動缺乏質感，也不一致',
    '各元件各自設定樣式',
    '統一成「實體按鍵」的互動語言：平常是平的、hover 浮起、按下時鍵帽下沉、選取只換顏色',
    '使用者回饋',
    'v0.3.0–v0.4.0',
  ],
  [
    'I07',
    '「開始體驗系統」按鈕的文字看不清楚',
    '作業說明頁的連結顏色規則蓋過按鈕的淺色文字',
    '連結顏色只套用在沒有樣式的內文連結',
    '使用者回饋',
    'v0.3.1',
  ],
  [
    'I08',
    '右側面板捲到最頂時，上緣仍然淡出',
    '淡出效果固定存在，不管捲動位置',
    '偵測捲動位置，只有還有內容的那一側才淡出',
    '使用者回饋',
    'v0.3.1',
  ],
  [
    'I09',
    '手機版菜單滑動停下時，停住的卡片被淡出蓋到',
    '卡片停靠的位置在淡出區裡面',
    '停靠位置往右移到淡出區之外',
    '使用者回饋',
    'v0.3.1',
  ],
  [
    'I10',
    '手機上快速點按鈕，看起來像按了兩次',
    '觸控時瀏覽器內建的按下狀態，在選取狀態更新前就消失',
    '按下狀態改由程式控制：至少維持 0.12 秒、選取在按住時就生效、滑動時不按下',
    '使用者回饋',
    'v0.3.2',
  ],
  [
    'I11',
    '按下時整顆按鈕往下移，不符合真實按鍵',
    '按下效果用整體位移表現',
    '外框留在原位，只有裡面的文字、圖示下沉 1px 並產生內側陰影',
    '使用者回饋',
    'v0.4.0',
  ],
  [
    'I12',
    '購物車的清空按鈕和結帳按鈕高度不一致',
    '圖示按鈕固定 40px，文字按鈕的高度由內距與行高決定',
    '所有按鈕統一 44px 高',
    '使用者回饋',
    'v0.4.0',
  ],
  [
    'I13',
    '滑鼠停在選項上按下去，看不出按下的效果',
    '選項的 hover 樣式權重高於按下的樣式',
    '按下時取消 hover 浮起',
    '測試發現',
    'v0.4.0',
  ],
  [
    'I14',
    '同一行的選項按下去時，整顆被往上推，抵銷下沉',
    '行內元素以文字基線對齊，內容下沉時基線跟著移動',
    '按鍵改以上緣對齊',
    '測試發現',
    'v0.4.0',
  ],
] as const

const VALUE = [
  {
    title: '顧客：省下排隊時間',
    points: [
      '先點先做，到店直接取餐，尖峰時段不用排隊等點餐、等製作',
      '甜度、冰塊、加料自己選，減少口頭點餐的溝通錯誤',
      '隨時查看製作進度，知道什麼時候該出門取餐',
    ],
  },
  {
    title: '店家：提升效率、降低錯誤',
    points: [
      '訂單以文字呈現完整規格，取代手寫單與口頭傳達，減少做錯飲料的成本',
      '預約取餐時間讓尖峰訂單分散，備料與人力排班更好安排',
      '櫃檯不必一直接單，人力可以轉去製作，提高每小時出杯數',
    ],
  },
  {
    title: '管理：資料驅動決策（MIS 的核心）',
    points: [
      '每筆交易自動記錄，營業額、客單價、熱銷品項即時可見，不用月底人工對帳',
      '熱銷排行可作為進貨、備料、菜單調整與促銷的依據',
      '累積的訂單資料可進一步分析時段尖峰、顧客偏好，支援營運決策',
    ],
  },
  {
    title: '成本與擴充性',
    points: [
      '原型為純前端靜態網站，部署在 GitHub Pages，主機成本為 0',
      '正式上線可再串接：會員與點數、真實金流（LINE Pay／信用卡）、LINE 取餐通知、POS 與庫存系統',
      '資料結構（菜單、訂單、狀態）已明確定義，未來換成雲端資料庫時前端可沿用',
    ],
  },
]

// ---- 版面：內容拆成一塊一塊，依高度排進 A4 紙，放不下就換下一張 ----

type SectionId = (typeof SECTIONS)[number][0]

type Block = { section: SectionId } & (
  | { kind: 'node'; node: ReactNode; keep?: boolean; start?: boolean }
  | {
      kind: 'table'
      /** 欄寬固定：整張表量出來的列高，拆到不同頁時才會一樣 */
      cols: string[]
      head: string[]
      rows: ReactNode[][]
      className?: string
    }
)

/** 一張紙上的一塊；表格跨頁時只放其中幾列，表頭每頁重複 */
type Part = { block: number; rows?: [number, number] }

type Size = { h: number } | { head: number; rows: number[]; extra: number }

const Pass = () => <span className="pass">通過</span>

const BLOCKS: Block[] = []
{
  let section: SectionId = 'links'
  // keep：標題這類不能落單在頁底，要跟下一塊一起換頁
  const add = (node: ReactNode, keep = false, start = false) =>
    BLOCKS.push({ kind: 'node', section, node, keep, start })
  const table = (
    t: Omit<Extract<Block, { kind: 'table' }>, 'kind' | 'section'>,
  ) => BLOCKS.push({ kind: 'table', section, ...t })
  const start = (i: number) => {
    section = SECTIONS[i][0]
    add(
      <>
        <span className="eyebrow">
          {String(i + 1).padStart(2, '0')} / {SECTIONS[i][2]}
        </span>
        <h2>{SECTIONS[i][1]}</h2>
      </>,
      true,
      true,
    )
  }

  start(0)
  add(
    <dl className="links">
      <dt>線上 Demo</dt>
      <dd>
        <a href={DEMO_URL} target="_blank" rel="noreferrer">
          {DEMO_URL}
        </a>
      </dd>
      <dt>原始碼</dt>
      <dd>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          {REPO_URL}
        </a>
      </dd>
    </dl>,
  )
  add(
    <p className="muted">
      本系統為課堂原型：不含真實會員、金流與後端，資料只存在使用者自己的瀏覽器中。
    </p>,
  )

  start(1)
  add(
    <p className="tip">
      建議演示方式：開兩個分頁，一個停在「店家後台」，另一個以顧客身分點餐，送出後店家端會即時出現新訂單。
    </p>,
  )
  for (const [title, steps] of [
    ['顧客端', CUSTOMER_FLOW],
    ['店家端', STORE_FLOW],
  ] as const) {
    add(<h3>{title}</h3>, true)
    add(
      <ol className="flow">
        {steps.map(([step, detail]) => (
          <li key={step}>
            <b>{step}</b>
            <p>{detail}</p>
          </li>
        ))}
      </ol>,
    )
  }

  start(2)
  add(
    <div className="features">
      {FEATURES.map(([title, detail], i) => (
        <div key={title}>
          <span className="mono">{String(i + 1).padStart(2, '0')}</span>
          <b>{title}</b>
          <p>{detail}</p>
        </div>
      ))}
    </div>,
  )
  add(<h3>技術架構</h3>, true)
  table({
    cols: ['120px', 'auto'],
    head: ['項目', '使用'],
    rows: TECH.map(([k, v]) => [k, v]),
  })

  start(3)
  add(
    <p className="muted">
      測試日期：{TEST_DATE}
      {' ・ '}環境：macOS、Chromium 瀏覽器（桌面與 375px 手機寬度）
    </p>,
  )
  add(
    <h3>
      自動化單元測試（Vitest）：{UNIT_TESTS.length}／{UNIT_TESTS.length} 通過
    </h3>,
    true,
  )
  add(
    <ul className="unit">
      {UNIT_TESTS.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>,
  )
  add(
    <h3>
      手動功能測試：{MANUAL_TESTS.length}／{MANUAL_TESTS.length} 通過
    </h3>,
    true,
  )
  table({
    cols: ['52px', '96px', 'auto', 'auto', '64px'],
    head: ['編號', '測試項目', '操作步驟', '預期結果', '結果'],
    rows: MANUAL_TESTS.map(([no, item, steps, expected]) => [
      no,
      item,
      steps,
      expected,
      <Pass />,
    ]),
  })
  add(<h3>問題與解決方式：{ISSUES.length} 項，皆已修正</h3>, true)
  add(
    <p className="muted">
      開發與試用過程中發現的問題，包含使用者回饋與測試時自行發現的項目。
    </p>,
    true,
  )
  table({
    cols: ['44px', '128px', '120px', 'auto', '80px', '64px'],
    head: ['編號', '問題', '原因', '解決方式', '來源', '版本'],
    rows: ISSUES.map(([no, ...rest]) => [no, ...rest]),
    className: 'issues',
  })

  start(4)
  for (const v of VALUE) {
    add(<h3>{v.title}</h3>, true)
    add(
      <ul className="value">
        {v.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>,
    )
  }
}

function BlockView({
  block,
  rows,
  id,
}: {
  block: Block
  rows?: [number, number]
  id?: string
}) {
  if (block.kind === 'node')
    return (
      <div className={`block ${block.start ? 'start' : ''}`} id={id}>
        {block.node}
      </div>
    )
  return (
    <div className="block" id={id}>
      <table className={block.className}>
        <colgroup>
          {block.cols.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {block.head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows ? block.rows.slice(...rows) : block.rows).map((cells, r) => (
            <tr key={r}>
              {cells.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** 由上往下排：放不下就換頁；表格一列一列排，換頁時重複表頭 */
function paginate(sizes: Size[], avail: number) {
  const pages: Part[][] = [[]]
  let used = 0
  const newPage = () => {
    pages.push([])
    used = 0
  }
  // 這一塊至少要放得下的高度（表格是表頭加第一列）
  const first = (s: Size | undefined) =>
    !s ? 0 : 'h' in s ? s.h : s.extra + s.head + (s.rows[0] ?? 0)

  sizes.forEach((s, i) => {
    const block = BLOCKS[i]
    if ('h' in s) {
      const need =
        s.h + (block.kind === 'node' && block.keep ? first(sizes[i + 1]) : 0)
      if (used > 0 && used + need > avail) newPage()
      pages[pages.length - 1].push({ block: i })
      used += s.h
      return
    }
    let r = 0
    while (r < s.rows.length) {
      if (used > 0 && used + s.extra + s.head + s.rows[r] > avail) newPage()
      const from = r
      used += s.extra + s.head + s.rows[r++]
      while (r < s.rows.length && used + s.rows[r] <= avail) used += s.rows[r++]
      pages[pages.length - 1].push({ block: i, rows: [from, r] })
    }
  })
  return pages
}

function Sheet({
  no,
  total,
  section,
  children,
}: {
  no: number
  total: number
  section?: string
  children: ReactNode
}) {
  return (
    <article className="sheet">
      {section && (
        <header>
          <span>飲料預訂系統原型</span>
          <span>{section}</span>
        </header>
      )}
      <div className="body">{children}</div>
      <footer>
        <span>{SHOP_NAME} · 管理資訊系統課堂作業</span>
        <span className="mono">
          {String(no).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </footer>
    </article>
  )
}

const NAV = [['cover', '封面', ''], ...SECTIONS] as const

export default function Report() {
  const measurer = useRef<HTMLDivElement>(null)
  const sheets = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<Part[][]>([])
  const [zoom, setZoom] = useState(1)
  const [active, setActive] = useState('cover')

  // 在看不見的紙上量每一塊的高度，再分頁；字型載入後重量一次
  useLayoutEffect(() => {
    const body = measurer.current
    if (!body) return
    const run = () => {
      const height = (e: Element | null) =>
        e?.getBoundingClientRect().height ?? 0
      const sizes = [...body.children].map((el, i): Size => {
        if (BLOCKS[i].kind === 'node') return { h: height(el) }
        const head = height(el.querySelector('thead'))
        const rows = [...el.querySelectorAll('tbody tr')].map(height)
        return {
          head,
          rows,
          extra: height(el) - head - rows.reduce((a, b) => a + b, 0),
        }
      })
      const next = paginate(sizes, body.clientHeight)
      setPages((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
      )
    }
    run()
    document.fonts.ready.then(run)
    document.fonts.addEventListener('loadingdone', run)
    return () => document.fonts.removeEventListener('loadingdone', run)
  }, [])

  // 紙張固定 A4 大小排版，畫面不夠寬時整張等比例縮小
  useLayoutEffect(() => {
    const el = sheets.current
    const paper = measurer.current?.parentElement
    if (!el || !paper) return
    const observer = new ResizeObserver(() =>
      setZoom(Math.min(1, el.clientWidth / paper.offsetWidth)),
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 導覽標出目前看到的段落：最後一個捲過畫面上方的段落起點
  useEffect(() => {
    const onScroll = () => {
      let current = 'cover'
      for (const [id] of NAV) {
        const top = document.getElementById(id)?.getBoundingClientRect().top
        if (top !== undefined && top < window.innerHeight * 0.35) current = id
      }
      setActive(current)
    }
    onScroll()
    document.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    })
    return () =>
      document.removeEventListener('scroll', onScroll, { capture: true })
  }, [pages])

  const total = pages.length + 1
  const pageOf = (id: string) =>
    id === 'cover'
      ? 1
      : pages.findIndex((p) => p.some((part) => isStart(part, id))) + 2
  const isStart = (part: Part, id: string) =>
    !part.rows &&
    BLOCKS[part.block].section === id &&
    BLOCKS.findIndex((b) => b.section === id) === part.block

  return (
    <div className="report">
      <nav className="report-nav">
        <span className="eyebrow">目錄</span>
        {NAV.map(([id, label], i) => (
          <button
            key={id}
            className={active === id ? 'on' : ''}
            onClick={() =>
              document
                .getElementById(id)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            <span className="mono">{i ? `0${i}` : '00'}</span>
            <span>{label}</span>
            <span className="mono page">{pages.length ? pageOf(id) : ''}</span>
          </button>
        ))}
        <button className="ghost print" onClick={() => window.print()}>
          列印／存成 PDF
        </button>
      </nav>

      <div
        className="sheets"
        ref={sheets}
        style={{ '--zoom': zoom } as CSSProperties}
      >
        <Sheet no={1} total={total}>
          <div className="cover" id="cover">
            <span className="eyebrow">管理資訊系統 · 課堂作業</span>
            <h1>飲料預訂系統原型</h1>
            <p className="subtitle">{SHOP_NAME}｜線上點餐與取餐</p>
            <DrinkArt
              drink={MENU.find((d) => d.id === 'boba-milk-tea') ?? MENU[0]}
              toppings={['布丁']}
              floor
              className="cover-art"
            />
            <dl className="info">
              <dt>班級</dt>
              <dd>{STUDENT.className}</dd>
              <dt>學號</dt>
              <dd>{STUDENT.id}</dd>
              <dt>姓名</dt>
              <dd>{STUDENT.name}</dd>
              <dt>日期</dt>
              <dd className="mono">{TEST_DATE}</dd>
            </dl>
            <ol className="toc">
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <span>{label}</span>
                  <i />
                  <span className="mono">{pages.length ? pageOf(id) : ''}</span>
                </li>
              ))}
            </ol>
          </div>
        </Sheet>
        {pages.map((parts, p) => (
          <Sheet
            key={p}
            no={p + 2}
            total={total}
            section={
              SECTIONS.find(
                ([id]) => id === BLOCKS[parts[0].block].section,
              )?.[1]
            }
          >
            {parts.map((part) => (
              <BlockView
                key={`${part.block}-${part.rows?.[0] ?? 0}`}
                block={BLOCKS[part.block]}
                rows={part.rows}
                id={NAV.find(([id]) => isStart(part, id))?.[0]}
              />
            ))}
          </Sheet>
        ))}
      </div>

      <div className="actions">
        <Link to="/" className="primary">
          開始體驗系統 →
        </Link>
      </div>

      {/* 量高度用的紙，跟真的紙同樣大小、不縮放 */}
      <div className="measure" aria-hidden>
        <article className="sheet">
          <div className="body" ref={measurer}>
            {BLOCKS.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
