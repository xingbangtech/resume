// 将 public/avatar-square.png 转成 Base64 data URI，写入 src/data.js 的 avatar 字段
// 用法：npm run avatar:b64
// 恢复文件地址格式：手动把 avatar 值改回 '/avatar.png'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const imgPath = resolve(root, 'public/avatar-square.png')
const dataPath = resolve(root, 'src/data.js')

const buf = readFileSync(imgPath)
const uri = `data:image/png;base64,${buf.toString('base64')}`

let src = readFileSync(dataPath, 'utf8')
// 匹配 avatar: '...' 或 "..."（兼容现有路径值与旧 data URI）
const re = /^(\s*avatar:\s*)(['"])(?:(?!\2).)*\2\s*,?\s*$/m
if (!re.test(src)) {
  console.error('错误：src/data.js 中未找到 avatar 字段')
  process.exit(1)
}
src = src.replace(re, `$1'${uri}',`)
writeFileSync(dataPath, src)

const kb = (n) => (n / 1024).toFixed(0) + 'KB'
console.log(`完成：public/avatar-square.png (${kb(buf.length)}) → src/data.js avatar 字段（b64 ${kb(uri.length)}）`)
