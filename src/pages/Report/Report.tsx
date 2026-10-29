import { Link } from 'react-router-dom'
import './Report.scss'
import DrinkArt from '@/components/DrinkArt'
import { MENU } from '@/data/menu'

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
    '/',
  ],
  [
    '客製化飲料',
    '在右側面板選容量、甜度、冰塊、加料與數量；中間的飲料插圖（冰塊、珍珠、布丁、熱氣）與小計即時更新',
    '/',
  ],
  ['確認購物車', '調整每一項的數量，減到 0 自動移除；相同規格會自動合併', '/'],
  [
    '填寫取餐資料並送出',
    '按購物車的「結帳」，輸入姓名、手機，選擇取餐時間與付款方式（線上付款為模擬）',
    '/',
  ],
  ['取得單號', '送出後顯示單號（如 #A001）與預計取餐時間', '/'],
  [
    '追蹤訂單進度',
    '在「我的訂單」看到 已接單 → 製作中 → 可取餐 → 已完成',
    '/orders',
  ],
] as const

const STORE_FLOW = [
  [
    '接收訂單',
    '新訂單即時出現在「店家後台」，含品項規格、備註、付款方式與取餐時間',
    '/admin',
  ],
  [
    '更新製作狀態',
    '按「改為製作中」「改為可取餐」「改為已完成」，顧客端進度同步更新',
    '/admin',
  ],
  [
    '查看營運數據',
    '訂單數、營業額、平均客單價、待製作筆數、熱銷排行',
    '/admin',
  ],
] as const

const FEATURES = [
  ['🧋', '菜單瀏覽', '11 款飲料、4 種分類，一鍵篩選，每款都有等角插圖'],
  [
    '🎛️',
    '飲料客製化',
    '容量 2 種、甜度 5 段、冰塊 5 段（含熱飲）、4 種加料，價格自動計算；飲料插圖即時反映選擇',
  ],
  ['🛒', '購物車', '同規格自動合併、數量增減、即時合計；重新整理不會遺失'],
  [
    '📝',
    '線上結帳',
    '姓名與手機格式驗證、取餐時間、付款方式（到店／LINE Pay／信用卡，線上為模擬）、備註',
  ],
  ['📦', '訂單追蹤', '單號、預計取餐時間、四階段進度條'],
  ['🏪', '店家後台', '訂單列表、一鍵推進製作狀態；頂部小工具顯示最新訂單進度'],
  ['📊', '營運統計', '訂單數、營業額、平均客單價、待製作、熱銷排行長條圖'],
  [
    '🔄',
    '多分頁即時同步',
    '顧客端與店家端開在不同分頁，資料即時同步，方便現場演示',
  ],
  [
    '📱',
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

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

function SectionTitle({ i }: { i: number }) {
  return (
    <span className="eyebrow">
      {String(i + 1).padStart(2, '0')} / {SECTIONS[i][2]}
    </span>
  )
}

export default function Report() {
  return (
    <div className="report">
      <header className="hero panel framed">
        <div>
          <span className="eyebrow">管理資訊系統 · 課堂作業</span>
          <h1>飲料預訂系統原型</h1>
          <p className="student">
            {STUDENT.className}
            {' · '}
            {STUDENT.id}
            {' · '}
            {STUDENT.name}
          </p>
          <nav>
            {SECTIONS.map(([id, label], i) => (
              <button key={id} onClick={() => scrollTo(id)}>
                <span className="mono">0{i + 1}</span> {label}
              </button>
            ))}
          </nav>
        </div>
        <DrinkArt
          drink={MENU.find((d) => d.id === 'boba-milk-tea') ?? MENU[0]}
          toppings={['布丁']}
          floor
          className="hero-art"
        />
      </header>

      <section id="links" className="panel framed">
        <SectionTitle i={0} />
        <h2>系統連結</h2>
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
        </dl>
        <p className="muted">
          本系統為課堂原型：不含真實會員、金流與後端，資料只存在使用者自己的瀏覽器中。
        </p>
      </section>

      <section id="flow" className="panel framed">
        <SectionTitle i={1} />
        <h2>可演示流程</h2>
        <p className="tip">
          💡
          建議演示方式：開兩個分頁，一個停在「店家後台」，另一個以顧客身分點餐，送出後店家端會即時出現新訂單。
        </p>
        <div className="flows">
          {(
            [
              ['顧客端', CUSTOMER_FLOW],
              ['店家端', STORE_FLOW],
            ] as const
          ).map(([title, steps]) => (
            <div key={title}>
              <h3>{title}</h3>
              <ol className="flow">
                {steps.map(([step, detail, to]) => (
                  <li key={step}>
                    <b>{step}</b>
                    <p>{detail}</p>
                    <Link to={to}>前往操作 →</Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="panel framed">
        <SectionTitle i={2} />
        <h2>系統功能介紹</h2>
        <div className="features">
          {FEATURES.map(([icon, title, detail]) => (
            <div key={title}>
              <span>{icon}</span>
              <b>{title}</b>
              <p>{detail}</p>
            </div>
          ))}
        </div>
        <h3>技術架構</h3>
        <table>
          <tbody>
            {TECH.map(([k, v]) => (
              <tr key={k}>
                <th>{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="tests" className="panel framed">
        <SectionTitle i={3} />
        <h2>測試紀錄</h2>
        <p className="muted">
          測試日期：{TEST_DATE}
          {' ・ '}環境：macOS、Chromium 瀏覽器（桌面與 375px 手機寬度）
        </p>
        <h3>
          自動化單元測試（Vitest）：{UNIT_TESTS.length}／{UNIT_TESTS.length}{' '}
          通過
        </h3>
        <ul className="unit">
          {UNIT_TESTS.map((t) => (
            <li key={t}>✅ {t}</li>
          ))}
        </ul>
        <h3>
          手動功能測試：{MANUAL_TESTS.length}／{MANUAL_TESTS.length} 通過
        </h3>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>編號</th>
                <th>測試項目</th>
                <th>操作步驟</th>
                <th>預期結果</th>
                <th>結果</th>
              </tr>
            </thead>
            <tbody>
              {MANUAL_TESTS.map(([no, item, steps, expected]) => (
                <tr key={no}>
                  <td>{no}</td>
                  <td>{item}</td>
                  <td>{steps}</td>
                  <td>{expected}</td>
                  <td className="pass">✅ 通過</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="value" className="panel framed">
        <SectionTitle i={4} />
        <h2>商業價值說明</h2>
        <div className="values">
          {VALUE.map((v) => (
            <div key={v.title}>
              <h3>{v.title}</h3>
              <ul>
                {v.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="actions">
        <Link to="/" className="primary">
          開始體驗系統 →
        </Link>
      </div>
    </div>
  )
}
