import type { Drink } from '@/types'

export const SHOP_NAME = '茶語時光'

export const MENU: Drink[] = [
  {
    id: 'black-tea',
    name: '錫蘭紅茶',
    category: '原味茶',
    description: '斯里蘭卡茶葉，香氣濃郁',
    price: { M: 30, L: 35 },
    color: '#b8662a',
  },
  {
    id: 'green-tea',
    name: '茉莉綠茶',
    category: '原味茶',
    description: '清新茉莉花香',
    price: { M: 30, L: 35 },
    color: '#d3c672',
  },
  {
    id: 'oolong',
    name: '凍頂烏龍',
    category: '原味茶',
    description: '南投凍頂，焙火回甘',
    price: { M: 35, L: 40 },
    color: '#c48b3f',
  },
  {
    id: 'milk-tea',
    name: '經典奶茶',
    category: '奶茶',
    description: '紅茶加奶，古早味',
    price: { M: 45, L: 55 },
    color: '#d6a878',
  },
  {
    id: 'boba-milk-tea',
    name: '珍珠奶茶',
    category: '奶茶',
    description: '招牌！手作黑糖珍珠',
    price: { M: 50, L: 60 },
    color: '#cfa173',
    inside: ['珍珠'],
  },
  {
    id: 'brown-sugar-milk',
    name: '黑糖珍珠鮮奶',
    category: '奶茶',
    description: '鮮奶＋黑糖珍珠，無茶',
    price: { M: 65, L: 75 },
    color: '#f1e5d1',
    swirl: '#8a4a1f',
    inside: ['珍珠'],
  },
  {
    id: 'lemon-green',
    name: '檸檬綠茶',
    category: '果茶',
    description: '現榨檸檬，酸甜解膩',
    price: { M: 50, L: 60 },
    color: '#e2d65e',
  },
  {
    id: 'passion-fruit',
    name: '百香雙響炮',
    category: '果茶',
    description: '百香果＋珍珠＋椰果',
    price: { M: 55, L: 65 },
    color: '#f2b23a',
    inside: ['珍珠', '椰果'],
  },
  {
    id: 'grapefruit',
    name: '葡萄柚綠',
    category: '果茶',
    description: '整顆果肉，季節限定',
    price: { M: 60, L: 70 },
    color: '#ee8c6c',
  },
  {
    id: 'latte',
    name: '拿鐵咖啡',
    category: '咖啡',
    description: '義式濃縮＋鮮奶',
    price: { M: 60, L: 70 },
    color: '#ecdcc4',
    swirl: '#9a6a40',
  },
  {
    id: 'americano',
    name: '美式咖啡',
    category: '咖啡',
    description: '中焙豆，順口不酸',
    price: { M: 45, L: 55 },
    color: '#4b2d1c',
  },
]

export const SIZE_LABEL = { M: '中杯', L: '大杯' } as const
export const SUGAR = ['正常糖', '少糖', '半糖', '微糖', '無糖']
export const ICE = ['正常冰', '少冰', '微冰', '去冰', '熱飲']
export const TOPPINGS = [
  { name: '珍珠', price: 10 },
  { name: '椰果', price: 10 },
  { name: '仙草', price: 10 },
  { name: '布丁', price: 15 },
]
export const PAY_METHODS = ['到店付款', 'LINE Pay（模擬）', '信用卡（模擬）']
export const PICKUP_OPTIONS = [
  { minutes: 10, label: '盡快（約 10 分鐘）' },
  { minutes: 20, label: '20 分鐘後' },
  { minutes: 30, label: '30 分鐘後' },
  { minutes: 60, label: '1 小時後' },
]
export const STATUS = ['已接單', '製作中', '可取餐', '已完成']
