import { pinchChange } from './gesture.js';
const $ = id => document.getElementById(id);
const canvas = $('poster'), photoArea = $('photo-area');
const W = 2000, H = 2990;
const frame = { x: 140, y: 154, w: 1722, h: 1952 };
const state = { ready: false, photo: null, title: '回南天见', director: '萨拉·戈赫尔', directorEn: 'SARAH GOHER', zoom: 1, dx: 0, dy: 0 };
let overlay, previewOverlay, original, originalTitle, directorPaper, previewPhoto, drag, loadId = 0, renderFrame = 0;
let savedPoster;
const saveDialog = $('save-dialog');
function downloadFile(url, filename) { const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); }
$('save-close').addEventListener('click', () => saveDialog.close());
saveDialog.addEventListener('close', () => { if (savedPoster) { const oldUrl = savedPoster.url; setTimeout(() => URL.revokeObjectURL(oldUrl), 60000); } savedPoster = null; $('save-image').removeAttribute('src'); });
$('save-file').addEventListener('click', () => { if (savedPoster) downloadFile(savedPoster.url, savedPoster.file.name); });
$('save-share').addEventListener('click', async () => {
  if (!savedPoster) return;
  const button = $('save-share'); button.disabled = true;
  try { await navigator.share({ files: [savedPoster.file] }); }
  catch (error) { if (error.name !== 'AbortError') $('save-help').textContent = '这次分享没有成功，可以长按图片保存，或选择下载图片。'; }
  finally { button.disabled = false; }
});
photoArea.style.left = `${frame.x / W * 100}%`;
photoArea.style.top = `${frame.y / H * 100}%`;
photoArea.style.width = `${frame.w / W * 100}%`;
photoArea.style.height = `${frame.h / H * 100}%`;
const photoPointers = new Map();
let pinch;
const stage = $('poster-stage');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function tilt(x, y) {
  if (reducedMotion.matches) return;
  stage.classList.add('moving'); stage.style.setProperty('--rx', `${-y * 11}deg`); stage.style.setProperty('--ry', `${x * 14}deg`);
  stage.style.setProperty('--px', `${x * 13}px`); stage.style.setProperty('--py', `${y * 8}px`);
}
function untilt() { stage.classList.remove('moving'); for (const key of ['--rx', '--ry', '--px', '--py']) stage.style.removeProperty(key); }
stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); tilt(Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)), Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1))); });
stage.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { stage.setPointerCapture(e.pointerId); const r = stage.getBoundingClientRect(); tilt(Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)), Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1))); } });
for (const event of ['pointerleave', 'pointercancel', 'lostpointercapture', 'blur']) stage.addEventListener(event, untilt);
stage.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') untilt(); });
stage.addEventListener('keydown', e => { const directions = {ArrowLeft:[-0.7,0],ArrowRight:[0.7,0],ArrowUp:[0,-0.7],ArrowDown:[0,0.7]}; if (directions[e.key]) { e.preventDefault(); tilt(...directions[e.key]); } else if (e.key === 'Escape') untilt(); });
function status(message, error = false) { $('status').textContent = message; $('status').classList.toggle('error', error); }
function loadImage(src) { return new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = () => reject(new Error('图片未能读取')); im.src = src; }); }
function scaledImage(image, maxSide, maxPixels = maxSide * maxSide) {
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height), Math.sqrt(maxPixels / (image.width * image.height)));
  const small = document.createElement('canvas'); small.width = Math.max(1, Math.round(image.width * ratio)); small.height = Math.max(1, Math.round(image.height * ratio));
  small.getContext('2d').drawImage(image, 0, 0, small.width, small.height); return small;
}
function setPhoto(image) { state.photo = image; previewPhoto = scaledImage(image, 1400, 1500000); }
function photoSize() { const scale = Math.max(frame.w / state.photo.width, frame.h / state.photo.height) * state.zoom; return { w: state.photo.width * scale, h: state.photo.height * scale }; }
function clamp() { const size = photoSize(); state.dx = Math.max(-(size.w - frame.w) / 2, Math.min((size.w - frame.w) / 2, state.dx)); state.dy = Math.max(-(size.h - frame.h) / 2, Math.min((size.h - frame.h) / 2, state.dy)); }
function draw(target) {
  const c = target.getContext('2d'); c.save(); c.setTransform(target.width / W, 0, 0, target.height / H, 0, 0); c.clearRect(0, 0, W, H);
  c.fillStyle = '#f0f0f0'; c.fillRect(0, 0, W, H);
  const size = photoSize();
  c.save(); c.beginPath(); c.roundRect(frame.x, frame.y, frame.w, frame.h, 15); c.clip();
  c.drawImage(target === canvas ? previewPhoto : state.photo, frame.x + (frame.w - size.w) / 2 + state.dx, frame.y + (frame.h - size.h) / 2 + state.dy, size.w, size.h); c.restore();
  c.drawImage(target === canvas ? previewOverlay : overlay, 0, 0, W, H);
  {
    c.drawImage(directorPaper, 135, 2110, 490, 130);
    c.save(); c.fillStyle = '#171717'; c.textBaseline = 'alphabetic';
    // Both lines use the supplied MiSans and share the same horizontal center.
    c.font = '500 52px MiSansDirector'; c.textAlign = 'center';
    const nameSize = Math.min(52, 52 * 300 / Math.max(c.measureText(state.director).width, 1));
    c.font = `500 ${nameSize}px MiSansDirector`; c.fillText(state.director, 290, 2176);
    c.font = '500 32px MiSansDirector';
    const enSize = Math.min(32, 32 * 300 / Math.max(c.measureText(state.directorEn).width, 1));
    c.font = `500 ${enSize}px MiSansDirector`; c.fillText(state.directorEn, 290, 2220);
    if (state.director || state.directorEn) { c.font = '500 32px MiSansDirector'; c.textAlign = 'left'; c.fillText('导演作品', 455, 2168); }
    c.restore();
  }
  if (state.title === '回南天见') c.drawImage(originalTitle, 110, 59, 729, 333);
  else if (state.title) {
    c.save(); c.transform(2.9007545564, -1.0841823495, 1.0841823495, 2.9007545564, 442.3831145177, 224.636243172);
    c.font = 'bold 80px XiHuan'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    const m = c.measureText(state.title); const factor = Math.min(1, 290 / Math.max(m.width, 1)); c.scale(factor, factor);
    c.fillStyle = '#000'; c.strokeStyle = '#000'; c.lineWidth = 0.5; c.lineJoin = 'round'; c.fillText(state.title, 0, 0); c.strokeText(state.title, 0, 0); c.restore();
  }
  c.restore();
}
function render() { if (!state.ready || renderFrame) return; renderFrame = requestAnimationFrame(() => { renderFrame = 0; draw(canvas); }); }
function clearPointers() { const ids = [...photoPointers.keys()]; photoPointers.clear(); drag = null; pinch = null; photoArea.classList.remove('dragging'); for (const id of ids) if (photoArea.hasPointerCapture(id)) photoArea.releasePointerCapture(id); }
function center() { clearPointers(); state.zoom = 1; state.dx = 0; state.dy = 0; $('zoom').value = '1'; $('zoom-value').value = '100%'; render(); }
async function replacePhoto(file) {
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { status('请选择 JPG、PNG 或 WebP 图片。', true); return; }
  if (file.size > 40 * 1024 * 1024) { status('图片超过 40 MB，请先缩小后再试。', true); return; }
  const id = ++loadId; const url = URL.createObjectURL(file); status('正在读取照片…');
  try {
    const im = await loadImage(url); if (id !== loadId) return;
    // Keep export detail, but bound image memory and use a smaller drag preview.
    setPhoto(scaledImage(im, 4096, 8000000));
    center(); $('upload-label').textContent = '点击更换照片'; status('拖动海报中的照片，调整取景。');
  } catch { if (id === loadId) status('这张图片无法读取，请换一张 JPG、PNG 或 WebP 图片。', true); }
  finally { URL.revokeObjectURL(url); $('photo').value = ''; }
}
$('title').addEventListener('input', e => { state.title = e.target.value.trim().replace(/[\r\n\t]/g, ''); render(); });
$('director').addEventListener('input', e => { state.director = e.target.value.trim().replace(/[\r\n\t]/g, ''); render(); });
$('director-en').addEventListener('input', e => { state.directorEn = e.target.value.trim().replace(/[\r\n\t]/g, ''); render(); });
$('photo').addEventListener('change', e => replacePhoto(e.target.files[0]));
$('zoom').addEventListener('input', e => { state.zoom = Number(e.target.value); $('zoom-value').value = `${Math.round(state.zoom * 100)}%`; if (state.ready) { clamp(); render(); } });
$('center').addEventListener('click', () => { center(); status(''); });
function point(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
photoArea.addEventListener('pointerdown', e => {
  if (!state.ready || e.button !== 0 || photoPointers.size >= 2) return;
  const p = point(e); if (p.x < frame.x || p.x > frame.x + frame.w || p.y < frame.y || p.y > frame.y + frame.h) return;
  photoPointers.set(e.pointerId, p); photoArea.setPointerCapture(e.pointerId); photoArea.classList.add('dragging');
  if (photoPointers.size === 1) drag = { ...p, dx: state.dx, dy: state.dy };
  else {
    const [first, second] = [...photoPointers.values()];
    pinch = { distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)), midpoint: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }, zoom: state.zoom, dx: state.dx, dy: state.dy };
    drag = null;
  }
});
photoArea.addEventListener('pointermove', e => {
  if (!photoPointers.has(e.pointerId)) return;
  const p = point(e); photoPointers.set(e.pointerId, p);
  if (pinch && photoPointers.size === 2) {
    const [first, second] = [...photoPointers.values()]; Object.assign(state, pinchChange(pinch, first, second, frame));
    $('zoom').value = String(state.zoom); $('zoom-value').value = `${Math.round(state.zoom * 100)}%`;
  } else if (drag) { state.dx = drag.dx + p.x - drag.x; state.dy = drag.dy + p.y - drag.y; }
  clamp(); render();
});
function releasePhotoPointer(e) {
  if (!photoPointers.has(e.pointerId)) return;
  photoPointers.delete(e.pointerId); pinch = null;
  const remaining = [...photoPointers.values()][0]; drag = remaining ? { ...remaining, dx: state.dx, dy: state.dy } : null;
  if (!remaining) photoArea.classList.remove('dragging');
}
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) photoArea.addEventListener(event, releasePhotoPointer);
window.addEventListener('blur', clearPointers);
photoArea.addEventListener('keydown', e => { if (!state.ready) return; const vectors = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }; if (!vectors[e.key]) return; e.preventDefault(); const [x, y] = vectors[e.key]; state.dx += x * (e.shiftKey ? 50 : 10); state.dy += y * (e.shiftKey ? 50 : 10); clamp(); render(); });
for (const el of [$('dropzone'), photoArea]) {
  el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('over'); });
  el.addEventListener('dragleave', e => { if (!el.contains(e.relatedTarget)) el.classList.remove('over'); });
  el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('over'); replacePhoto(e.dataTransfer.files[0]); });
}
window.addEventListener('dragover', e => e.preventDefault()); window.addEventListener('drop', e => e.preventDefault());
photoArea.addEventListener('paste', e => { const file = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith('image/')); if (file) { e.preventDefault(); replacePhoto(file); } });
$('reset').addEventListener('click', () => { ++loadId; setPhoto(original); state.title = '回南天见'; state.director = '萨拉·戈赫尔'; state.directorEn = 'SARAH GOHER'; $('title').value = state.title; $('director').value = state.director; $('director-en').value = state.directorEn; $('upload-label').textContent = '拖入照片，或点击选择'; center(); status(''); });
$('download').addEventListener('click', async () => {
  if (!state.ready) return; const button = $('download'); button.disabled = true; status('正在生成高清海报…');
  try {
    const output = document.createElement('canvas'); output.width = W; output.height = H; draw(output);
    const format = $('format').value; const blob = await new Promise(resolve => output.toBlob(resolve, `image/${format}`, 0.95)); if (!blob) throw new Error('导出失败');
    const url = URL.createObjectURL(blob), filename = `${(state.title || '生日快乐').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')}-生日海报.${format === 'jpeg' ? 'jpg' : 'png'}`;
    if (window.matchMedia('(pointer: coarse), (max-width: 800px)').matches) {
      const file = new File([blob], filename, { type: blob.type }); savedPoster = { url, file };
      $('save-image').src = url;
      let canShare = false;
      try { canShare = Boolean(navigator.share && navigator.canShare?.({ files: [file] })); } catch { canShare = false; }
      $('save-share').hidden = !canShare;
      $('save-help').textContent = canShare ? '长按高清图片保存，或点“分享 / 保存”打开手机菜单。' : '长按下面的高清图片，在菜单里选择保存图片。';
      saveDialog.showModal(); status('高清海报已生成，可长按图片保存。');
    } else { downloadFile(url, filename); setTimeout(() => URL.revokeObjectURL(url), 60000); status('高清海报已生成。'); }
  } catch { status('下载未成功，请重试，或在系统浏览器中打开页面。', true); }
  finally { button.disabled = false; }
});
try {
  [overlay, original, originalTitle, directorPaper] = await Promise.all(['fixed-overlay.png', 'default-photo.jpg', 'original-title.png', 'director-paper.png'].map(n => loadImage(`./assets/${n}`)));
  previewOverlay = scaledImage(overlay, 1495); if (!state.photo) setPhoto(original);
  await Promise.all([document.fonts.load('80px XiHuan'), document.fonts.load('500 52px MiSansDirector')]); state.ready = true; render(); $('loading').hidden = true; $('download').disabled = false; $('download').textContent = '打印惊喜'; status('');
} catch { $('loading').textContent = '海报未能载入，请刷新页面重试。'; status('原稿或字体加载失败，请检查网络后刷新页面。', true); }
