# 🧋 茶語時光｜飲料預訂系統原型

管理資訊系統課程作業：可操作的飲料預訂系統原型（不含真實會員、金流與後端）。

- **線上 Demo**：https://johnlin10.github.io/drink-order-demo/
- **作業說明**（演示流程、功能介紹、測試紀錄、商業價值）：https://johnlin10.github.io/drink-order-demo/#/report

## 功能

| 顧客端                                     | 店家端                     |
| ------------------------------------------ | -------------------------- |
| 菜單分類瀏覽                               | 即時訂單列表               |
| 容量、甜度、冰塊、加料客製化               | 一鍵推進製作狀態           |
| 購物車（同規格自動合併）                   | 營業額、客單價、待製作統計 |
| 結帳（姓名／手機驗證、取餐時間、模擬付款） | 熱銷排行                   |
| 訂單進度追蹤                               |                            |

資料存在瀏覽器的 localStorage；顧客端與店家端開在不同分頁會即時同步。

## 技術

React 18、TypeScript、Vite、SCSS、React Router、Vitest；GitHub Actions 自動部署到 GitHub Pages。

## 開發

```bash
pnpm install
pnpm dev        # 本機開發
pnpm test       # 單元測試
pnpm build      # 建置到 build/
```

## 部署

push 到 `main` 後由 `.github/workflows/deploy.yml` 自動測試、建置並發布。
第一次需要到 GitHub repo 的 **Settings → Pages → Source** 選 **GitHub Actions**。

## 授權

MIT
