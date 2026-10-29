import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@/index.scss'
import { router } from '@/router'

// iOS Safari 要有 touch 監聽，按鈕按下去的 :active 樣式才會出現
document.addEventListener('touchstart', () => {}, { passive: true })

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </React.StrictMode>,
)
