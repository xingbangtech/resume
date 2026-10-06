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
  return `<div class="tl-desc">${desc}</div>`
}

function renderTimeline(items) {
  return items
    .map(
      (t) => `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-content">
          <div class="tl-date">${t.date}</div>
          <div class="tl-head">
            <span class="tl-sub">${t.sub}</span>
            <span class="tl-title">${t.title}</span>
          </div>
          ${renderDesc(t.desc)}
        </div>
      </div>`
    )
    .join('')
}

function renderProjectList(items) {
  return items
    .map(
      (p) => `
      <div class="proj">
        <div class="proj-head">
          <span class="proj-name">${p.name}</span>
          <span class="proj-tag">${p.tag}</span>
        </div>
        <div class="proj-desc">${p.desc}</div>
        <div class="proj-stack">${p.stack
          .split(',')
          .map((s) => `<span class="chip">${s.trim()}</span>`)
          .join('')}</div>
      </div>`
    )
    .join('')
}

const d = resumeData
const isAvatarB64 = String(d.avatar || '').startsWith('data:')
const avatarOffsetToolbar = isAvatarB64
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
const projectsBlock =
  d.projects && d.projects.length
    ? `
      <section class="block">
        <h2 class="block-title block-title--accent">项目经历</h2>
        <div class="projects">${renderProjectList(d.projects)}</div>
      </section>`
    : ''

document.querySelector('#app').innerHTML = `
  <div class="page">
    <div class="toolbar no-print">
      ${avatarOffsetToolbar}
      <div class="toolbar-right">
        <button type="button" id="themeToggle" class="theme-btn">浅色</button>
        <button id="printBtn">打印 / 导出 PDF</button>
      </div>
    </div>

    <div class="sheet">
      <div class="sheet-inner">
        <aside class="col col-left">
          <div class="avatar" id="avatar">
            <img src="${d.avatar}" alt="${d.name}" class="avatar-img" id="avatarImg" draggable="false" onerror="this.style.display='none';document.getElementById('avatarFallback').style.display='flex'" />
            <div class="avatar-fallback" id="avatarFallback" style="display:none">${d.name.charAt(
              0
            )}</div>
          </div>

          <div class="id-block">
            <h1 class="name">${d.name}</h1>
            <p class="position">${d.position}</p>
          </div>

          <section class="block">
            <h2 class="block-title">基本信息</h2>
            <div class="contact">${renderContact(d.contact)}</div>
          </section>

          <section class="block">
            <h2 class="block-title">专业技能</h2>
            <div class="skills">${renderSkillList(d.skills)}</div>
          </section>

          <section class="block">
            <h2 class="block-title">兴趣爱好</h2>
            <div class="tags">${d.interests
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

document.getElementById('printBtn').addEventListener('click', () => window.print())

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

let currentTheme = 'dark'
try {
  currentTheme = localStorage.getItem(THEME_KEY) || 'dark'
} catch (e) {}
applyTheme(currentTheme)

document.addEventListener('click', (e) => {
  if (e.target.id !== 'themeToggle') return
  currentTheme = currentTheme === 'light' ? 'dark' : 'light'
  applyTheme(currentTheme)
  try {
    localStorage.setItem(THEME_KEY, currentTheme)
  } catch (e) {}
})

// ===== Avatar offset (X/Y + zoom inputs outside the resume) =====
// Event delegation on document so it survives HMR / innerHTML replacement
const STORE_KEY = 'avatarOffset'

function clampOffset(val) {
  const avatar = document.getElementById('avatar')
  if (!avatar) return val
  // Overhang scales with zoom: at zoom=100% overhang=10%, at 200% overhang=50%
  const img = document.getElementById('avatarImg')
  const zoom = Number(document.getElementById('offsetZoom')?.value) || 100
  const overhang = (zoom - 100) / 100 + 0.1 // +10% base
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
    // Keep centered as zoom changes
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

// Defaults depend on avatar format: b64 is pre-cropped (no offset needed); file path needs tuning
function avatarDefaults() {
  return isAvatarB64 ? { x: 0, y: 0, zoom: 100 } : { x: 0, y: 40, zoom: 178 }
}

// Restore saved offset on load
;(() => {
  let offset = avatarDefaults()
  if (!isAvatarB64) {
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
})()

// Delegate input + click on document ( survives DOM replacement )
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

// Export the visible avatar area (what you see in the round frame) as a square PNG
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
  // Display geometry: zoom box centered in the frame, image contained inside, then offset
  const box = cw * (zoom / 100)
  const scaleDisp = Math.min(box / natW, box / natH)
  // Export at the resolution the visible square maps to in the source image
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
  if (e.target.id === 'saveAvatar') {
    saveAvatarSquare()
    return
  }
  if (e.target.id !== 'offsetReset') return
  const def = avatarDefaults()
  applyAvatarOffset(def.x, def.y, def.zoom)
  setInputs(def.x, def.y, def.zoom)
  try {
    localStorage.removeItem(STORE_KEY)
  } catch (e) {}
})
