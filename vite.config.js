import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

export default defineConfig({
  base: '/resume/',
  server: {
    port: 5173,
    open: '/resume/'
  },
  plugins: [
    {
      name: 'save-resume-data',
      configureServer(server) {
        const root = server.config.root

        // 弹出系统文件管理器，让用户主动选择保存目录
        server.middlewares.use('/__pick_folder', (req, res) => {
          if (req.method !== 'GET' && req.method !== 'POST') {
            res.statusCode = 405
            res.end()
            return
          }
          try {
            const defaultDir = path.resolve(root, 'src')
            const scriptPath = path.resolve(root, 'scripts', 'pick-folder.ps1')
            const selected = execFileSync(
              'powershell.exe',
              ['-NoProfile', '-STA', '-File', scriptPath, '-DefaultPath', defaultDir],
              { encoding: 'utf8', timeout: 120000 }
            ).trim()
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            if (!selected) {
              res.end(JSON.stringify({ ok: false, cancelled: true }))
            } else {
              res.end(JSON.stringify({ ok: true, path: selected }))
            }
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(e) }))
          }
        })

        // 将 JSON 写入指定目录（默认 src），目录由用户确认
        server.middlewares.use('/__save_resume', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end()
            return
          }
          const body = await readBody(req)
          try {
            JSON.parse(body)
          } catch (e) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(e) }))
            return
          }
          try {
            const url = new URL(req.url, 'http://localhost')
            const dirParam = url.searchParams.get('dir')
            const targetDir = dirParam
              ? path.resolve(dirParam)
              : path.resolve(root, 'src')
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true })
            }
            const target = path.join(targetDir, 'data.json')
            fs.writeFileSync(target, body, 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, path: target }))
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(e) }))
          }
        })
      }
    }
  ]
})
