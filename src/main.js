import './resume.css'
import { resumeData, ICONS } from './data.js'

function renderContact(items) {
  return items
    .map(
      (i) => `
      <div class="contact-row">
        <span class="contact-icon">${ICONS[i.icon] || ''}</span>

        <span class="contact-values">
          ${i.values.map((v) => `<span class="contact-val">${v}</span>`).join('')}
        </span>
      </div>`
    )
    .join('')
}

function renderSkillList(items) {
  return items
    .map(
      (s) => `
      <div class="skill-row">
        <span class="skill-name">${s.name}</span>
        <span class="skill-desc">${s.desc}</span>
      </div>`
    )
    .join('')
}

function renderDesc(desc) {
  if (Array.isArray(desc)) {
    return `<ul class="tl-desc-list">${desc
      .map((d) => `<li>${d}</li>`)
      .join('')}</ul>`
  }
  return `<div class="tl-desc">${desc || ''}</div>`
}

function renderTimeline(items) {
  return (items || [])
    .map(
      (t) => `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-content">
          <div class="tl-date">${t.date || ''}</div>
          <div class="tl-head">
            <span class="tl-sub">${t.sub || ''}</span>
            <span class="tl-title">${t.title || ''}</span>
          </div>
          ${renderDesc(t.desc)}
        </div>
      </div>`
    )
    .join('')
}

function renderProjectList(items) {
  return (items || [])
    .map(
      (p) => `
      <div class="proj">
        <div class="proj-head">
          <span class="proj-name">${p.name || ''}</span>
          <span class="proj-tag">${p.tag || ''}</span>
        </div>
        <div class="proj-desc">${p.desc || ''}</div>
        <div class="proj-stack">${(p.stack || '')
          .split(',')
          .filter(Boolean)
          .map((s) => `<span class="chip">${s.trim()}</span>`)
          .join('')}</div>
      </div>`
    )
    .join('')}

const isDev = import.meta.env.DEV

let d = resumeData
let currentTheme = 'dark'
const editHistory = []
let resumeRoot = null

function isAvatarB64() {
  return String(d.avatar || '').startsWith('data:')
}

function renderApp() {
  if (!resumeRoot) return
  const avatarOffsetToolbar = isAvatarB64()
    ? ''
    : `
      <div class="avatar-offset">
        <span class="ao-label">头像调节</span>
        <label class="ao-field">X<input type="number" id="offsetX" value="0" step="1" /></label>
        <label class="ao-field">Y<input type="number" id="offsetY" value="40" step="1" /></label>
        <label class="ao-field">Z<input type="number" id="offsetZoom" value="178" step="1" min="50" max="200" /></label>
        <button type="button" id="offsetReset" class="ao-reset">默认</button>
        <button type="button" id="saveAvatar" class="ao-reset">另存头像</button>
      </div>`
  const name = d.name || ''
  const projectsBlock =
    d.projects && d.projects.length
      ? `
      <section class="block">
        <h2 class="block-title block-title--accent">项目经历</h2>
        <div class="projects">${renderProjectList(d.projects)}</div>
      </section>`
      : ''

  resumeRoot.innerHTML = `
  <div class="page">
    <div class="toolbar no-print">
      ${avatarOffsetToolbar}
      <div class="toolbar-right">
        ${isDev ? '<button type="button" id="editBtn" class="theme-btn">编辑</button>' : ''}
        <button type="button" id="themeToggle" class="theme-btn">浅色</button>
        <button id="printBtn">打印 / 导出</button>
      </div>
    </div>

    <div class="sheet">
      <div class="sheet-inner">
        <aside class="col col-left">
          <div class="avatar" id="avatar">
            <img src="${d.avatar || ''}" alt="${name}" class="avatar-img" id="avatarImg" draggable="false" onerror="this.style.display='none';document.getElementById('avatarFallback').style.display='flex'" />
            <div class="avatar-fallback" id="avatarFallback" style="display:none">${name.charAt(
              0
            )}</div>
          </div>

          <div class="id-block">
            <h1 class="name">${name}</h1>
            <p class="position">${d.position || ''}</p>
          </div>

          <section class="block">
            <h2 class="block-title">基本信息</h2>
            <div class="contact">${renderContact(d.contact || [])}</div>
          </section>

          <section class="block">
            <h2 class="block-title">专业技能</h2>
            <div class="skills">${renderSkillList(d.skills || [])}</div>
          </section>

          <section class="block">
            <h2 class="block-title">兴趣爱好</h2>
            <div class="tags">${(d.interests || [])
              .map((i) => `<span class="chip">${i}</span>`)
              .join('')}</div>
          </section>
        </aside>

        <main class="col col-right">
          <section class="block">
            <h2 class="block-title block-title--accent">教育背景</h2>
            <div class="timeline">${renderTimeline(d.education)}</div>
          </section>

          <section class="block">
            <h2 class="block-title block-title--accent">工作经历</h2>
            <div class="timeline">${renderTimeline(d.experience)}</div>
          </section>

            ${projectsBlock}
        </main>
      </div>
    </div>
  </div>
  `
  applyTheme(currentTheme)
  initAvatarOffset()
}

// ===== Left-column theme toggle (dark / light) =====
const THEME_KEY = 'leftTheme'

function applyTheme(theme) {
  const sheet = document.querySelector('.sheet')
  const themeBtn = document.getElementById('themeToggle')
  if (!sheet || !themeBtn) return
  if (theme === 'light') {
    sheet.classList.add('theme-light')
    themeBtn.textContent = '深色'
  } else {
    sheet.classList.remove('theme-light')
    themeBtn.textContent = '浅色'
  }
}

try {
  currentTheme = localStorage.getItem(THEME_KEY) || 'dark'
} catch (e) {}

document.addEventListener('click', (e) => {
  if (e.target.id !== 'themeToggle') return
  currentTheme = currentTheme === 'light' ? 'dark' : 'light'
  applyTheme(currentTheme)
  try {
    localStorage.setItem(THEME_KEY, currentTheme)
  } catch (e) {}
})

// ===== Avatar offset (X/Y + zoom inputs outside the resume) =====
const STORE_KEY = 'avatarOffset'

function clampOffset(val) {
  const avatar = document.getElementById('avatar')
  if (!avatar) return val
  const img = document.getElementById('avatarImg')
  const zoom = Number(document.getElementById('offsetZoom')?.value) || 100
  const overhang = (zoom - 100) / 100 + 0.1
  const max = (avatar.clientWidth * overhang) - 2
  return Math.max(-max, Math.min(max, val))
}

function clampZoom(val) {
  return Math.max(50, Math.min(200, val))
}

function applyAvatarOffset(x, y, zoom) {
  const avatar = document.getElementById('avatar')
  const img = document.getElementById('avatarImg')
  if (!avatar) return
  avatar.style.setProperty('--ox', x + 'px')
  avatar.style.setProperty('--oy', y + 'px')
  avatar.style.setProperty('--zoom', zoom + '%')
  if (img) {
    img.style.width = zoom + '%'
    img.style.height = zoom + '%'
    img.style.left = (100 - zoom) / 2 + '%'
    img.style.top = (100 - zoom) / 2 + '%'
  }
}

function getInputs() {
  return {
    x: Number(document.getElementById('offsetX')?.value) || 0,
    y: Number(document.getElementById('offsetY')?.value) || 0,
    zoom: clampZoom(Number(document.getElementById('offsetZoom')?.value) || 100)
  }
}

function setInputs(x, y, zoom) {
  const ix = document.getElementById('offsetX')
  const iy = document.getElementById('offsetY')
  const iz = document.getElementById('offsetZoom')
  if (ix) ix.value = Math.round(x)
  if (iy) iy.value = Math.round(y)
  if (iz) iz.value = Math.round(zoom)
}

function avatarDefaults() {
  return isAvatarB64() ? { x: 0, y: 0, zoom: 100 } : { x: 0, y: 40, zoom: 178 }
}

function initAvatarOffset() {
  let offset = avatarDefaults()
  if (!isAvatarB64()) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null')
      if (saved && typeof saved.x === 'number') offset = { ...offset, ...saved }
    } catch (e) {}
  }
  offset.zoom = clampZoom(offset.zoom)
  const cx = clampOffset(offset.x)
  const cy = clampOffset(offset.y)
  applyAvatarOffset(cx, cy, offset.zoom)
  setInputs(cx, cy, offset.zoom)
}

document.addEventListener('input', (e) => {
  if (
    e.target.id !== 'offsetX' &&
    e.target.id !== 'offsetY' &&
    e.target.id !== 'offsetZoom'
  )
    return
  const { x, y, zoom } = getInputs()
  const cx = clampOffset(x)
  const cy = clampOffset(y)
  applyAvatarOffset(cx, cy, zoom)
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ x: cx, y: cy, zoom }))
  } catch (e) {}
})

function saveAvatarSquare() {
  const avatar = document.getElementById('avatar')
  const img = document.getElementById('avatarImg')
  if (!avatar || !img || !img.naturalWidth) return
  const natW = img.naturalWidth
  const natH = img.naturalHeight
  const cw = avatar.clientWidth || 300
  const { x, y, zoom } = getInputs()
  const cx = clampOffset(x)
  const cy = clampOffset(y)
  const box = cw * (zoom / 100)
  const scaleDisp = Math.min(box / natW, box / natH)
  let L = Math.round(cw / scaleDisp)
  L = Math.max(200, Math.min(4096, L))
  const k = L / cw
  const boxK = box * k
  const s = Math.min(boxK / natW, boxK / natH)
  const dw = natW * s
  const dh = natH * s
  const dx = (L - boxK) / 2 + cx * k + (boxK - dw) / 2
  const dy = (L - boxK) / 2 + cy * k + (boxK - dh) / 2
  const canvas = document.createElement('canvas')
  canvas.width = L
  canvas.height = L
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, dx, dy, dw, dh)
  canvas.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'avatar-square.png'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }, 'image/png')
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'printBtn') {
    window.print()
    return
  }
  if (e.target.id === 'editBtn') {
    openEditorDrawer()
    return
  }
  if (e.target.id === 'saveAvatar') {
    saveAvatarSquare()
    return
  }
  if (e.target.id === 'offsetReset') {
    const def = avatarDefaults()
    applyAvatarOffset(def.x, def.y, def.zoom)
    setInputs(def.x, def.y, def.zoom)
    try {
      localStorage.removeItem(STORE_KEY)
    } catch (e) {}
    return
  }
})

document.addEventListener('click', async (e) => {
  const id = e.target.id
  const editor = document.getElementById('dataEditor')
  const msg = document.getElementById('dataMsg')
  if (!editor) return

  if (id === 'dataDrawerClose' || id === 'dataDrawerMask') {
    closeEditorDrawer()
    return
  }
  if (id === 'dataRestore' || id === 'dataDefault') {
    editor.value = JSON.stringify(resumeData, null, 2)
    if (msg) msg.textContent = '已还原为初始数据，点「应用」生效'
    updateEditorChrome()
    return
  }
  if (id === 'dataSave') {
    const text = editor.value || JSON.stringify(d, null, 2)
    try {
      JSON.parse(text)
    } catch (err) {
      if (msg) msg.textContent = 'JSON 解析失败：' + err.message
      return
    }
    if (!isDev) {
      downloadResumeData(text)
      if (msg) msg.textContent = '已下载 data.json'
      return
    }
    if (msg) msg.textContent = '请选择保存目录...'
    const folder = await pickSaveFolder()
    if (folder && folder.cancelled) {
      if (msg) msg.textContent = '已取消保存'
      return
    }
    if (!folder) {
      downloadResumeData(text)
      if (msg) msg.textContent = '无法选择目录，已下载 data.json'
      return
    }
    if (msg) msg.textContent = '保存中...'
    saveResumeData(text, folder)
      .then((res) => {
        if (res && res.ok) {
          if (msg) msg.textContent = `已保存到 ${res.path || folder + '/data.json'}`
        } else {
          downloadResumeData(text)
          if (msg) msg.textContent = '保存失败，已下载 data.json'
        }
      })
      .catch(() => {
        downloadResumeData(text)
        if (msg) msg.textContent = '保存失败，已下载 data.json'
      })
    return
  }
  if (id === 'dataApply') {
    let parsed
    try {
      parsed = JSON.parse(editor.value)
    } catch (err) {
      if (msg) msg.textContent = 'JSON 解析失败：' + err.message
      return
    }
    const prev = d
    d = parsed
    try {
      renderApp()
      editHistory.push(prev)
      if (msg) msg.textContent = '已应用'
      const ed = document.getElementById('dataEditor')
      if (ed) ed.value = JSON.stringify(d, null, 2)
      updateEditorChrome()
    } catch (err) {
      d = prev
      if (msg) msg.textContent = '渲染失败：' + err.message
    }
    return
  }
  if (id === 'dataUndo') {
    if (editHistory.length) {
      d = editHistory.pop()
      renderApp()
      const ed = document.getElementById('dataEditor')
      if (ed) ed.value = JSON.stringify(d, null, 2)
      updateEditorChrome()
      if (msg) msg.textContent = '已撤销'
    }
    return
  }
})

// ===== Data editor drawer (dev only) =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlightJSON(text) {
  const escaped = escapeHtml(text)
  return escaped.replace(
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g,
    (match, key, str, num, lit) => {
      if (key) return `<span class="tok-key">${key}</span>`
      if (str) return `<span class="tok-str">${str}</span>`
      if (num) return `<span class="tok-num">${num}</span>`
      if (lit) return `<span class="tok-lit">${lit}</span>`
      return match
    }
  )
}

function updateEditorChrome() {
  const ta = document.getElementById('dataEditor')
  if (!ta) return
  const lines = ta.value.split('\n').length
  const gutter = document.getElementById('editorGutter')
  if (gutter) {
    gutter.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('\n')
  }
  const code = document.getElementById('editorHighlightCode')
  if (code) code.innerHTML = highlightJSON(ta.value)
  syncEditorScroll()
}

function syncEditorScroll() {
  const ta = document.getElementById('dataEditor')
  const hl = document.getElementById('editorHighlight')
  const gutter = document.getElementById('editorGutter')
  if (!ta) return
  if (hl) hl.style.transform = `translate(-${ta.scrollLeft}px, -${ta.scrollTop}px)`
  if (gutter) gutter.style.transform = `translateY(-${ta.scrollTop}px)`
}

function openEditorDrawer() {
  const drawer = document.getElementById('dataDrawer')
  if (!drawer) return
  drawer.classList.add('open')
  const editor = document.getElementById('dataEditor')
  if (editor) {
    editor.value = JSON.stringify(d, null, 2)
  }
  updateEditorChrome()
}

function closeEditorDrawer() {
  const drawer = document.getElementById('dataDrawer')
  if (drawer) drawer.classList.remove('open')
}

// 保存编辑中的 JSON：开发模式下直接写回 src/data.json，否则降级为下载文件
// 先弹出系统文件管理器让用户选择目录，再保存
async function pickSaveFolder() {
  if (!isDev) return null
  try {
    const res = await fetch('/__pick_folder', { method: 'POST' })
    const data = await res.json().catch(() => null)
    if (res.ok && data && data.ok) return data.path
    if (data && data.cancelled) return { cancelled: true }
  } catch (e) {}
  return null
}

async function saveResumeData(text, dir) {
  if (isDev) {
    try {
      const url = dir ? `/__save_resume?dir=${encodeURIComponent(dir)}` : '/__save_resume'
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data) return data
    } catch (e) {}
  }
  return { ok: false, direct: false }
}

function downloadResumeData(text) {
  const blob = new Blob([text], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'data.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function setupEditorEvents() {
  const ta = document.getElementById('dataEditor')
  if (!ta) return
  ta.addEventListener('input', updateEditorChrome)
  ta.addEventListener('scroll', syncEditorScroll)
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = ta.selectionStart
      const end = ta.selectionEnd
      ta.value = ta.value.slice(0, start) + '  ' + ta.value.slice(end)
      ta.selectionStart = ta.selectionEnd = start + 2
      updateEditorChrome()
    }
  })
}

// ===== Layout bootstrap =====
const app = document.querySelector('#app')
app.innerHTML = `<div id="resumeRoot"></div>` +
  (isDev
    ? `
  <div id="dataDrawer" class="data-drawer no-print" aria-hidden="true">
    <div class="data-drawer-mask" id="dataDrawerMask"></div>
    <aside class="data-drawer-panel">
      <div class="data-head">
        <span>简历数据（JSON，可编辑）</span>
        <button type="button" class="data-x" id="dataDrawerClose">×</button>
      </div>
      <div class="editor-wrap">
        <div class="editor-gutter" id="editorGutter"></div>
        <div class="editor-main">
          <pre class="editor-highlight" id="editorHighlight" aria-hidden="true"><code id="editorHighlightCode"></code></pre>
          <textarea id="dataEditor" spellcheck="false"></textarea>
        </div>
      </div>
      <div class="data-foot">
        <span id="dataMsg" class="data-msg"></span>
        <div class="data-actions">
          <button type="button" id="dataRestore" class="data-btn">还原</button>
          <button type="button" id="dataSave" class="data-btn">保存</button>
          <button type="button" id="dataApply" class="data-btn data-btn--primary">应用</button>
          <button type="button" id="dataUndo" class="data-btn">撤销</button>
        </div>
      </div>
    </aside>
  </div>`
    : '')
resumeRoot = document.getElementById('resumeRoot')
if (isDev) {
  setupEditorEvents()
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEditorDrawer()
  })
}

renderApp()
