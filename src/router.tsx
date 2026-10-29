import { createHashRouter } from 'react-router-dom'

import App from './App'

// pages
import Order from './pages/Order/Order'
import MyOrders from './pages/MyOrders/MyOrders'
import Admin from './pages/Admin/Admin'
import Report from './pages/Report/Report'

// GitHub Pages 沒有伺服器端路由，重新整理 /admin 會 404，所以用 hash 路由（#/admin）
export const router = createHashRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <Order /> },
      { path: '/orders', element: <MyOrders /> },
      { path: '/admin', element: <Admin /> },
      { path: '/report', element: <Report /> },
    ],
  },
])
