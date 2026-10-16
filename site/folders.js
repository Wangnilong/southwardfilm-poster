'use strict';

const folders = document.querySelector('.film-list');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let drag = null;
let momentumFrame = 0;
let suppressClick = false;

folders.querySelectorAll('img').forEach(image => { image.draggable = false; });
folders.addEventListener('dragstart', event => event.preventDefault());
folders.addEventListener('pointerdown', event => {
  cancelAnimationFrame(momentumFrame);
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  drag = { id: event.pointerId, origin: event.clientX, x: event.clientX, time: event.timeStamp, velocity: 0, active: false };
});
folders.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  if (!drag.active && Math.abs(event.clientX - drag.origin) > 6) {
    drag.active = true;
    folders.setPointerCapture(event.pointerId);
    folders.classList.add('dragging');
  }
  if (!drag.active) return;
  const dx = drag.x - event.clientX;
  const dt = Math.max(8, event.timeStamp - drag.time);
  folders.scrollLeft += dx;
  drag.velocity = drag.velocity * .35 + dx / dt * .65;
  drag.x = event.clientX;
  drag.time = event.timeStamp;
});
function finishDrag(event) {
  if (!drag || event.pointerId !== drag.id) return;
  const finished = drag;
  drag = null;
  folders.classList.remove('dragging');
  if (!finished.active) return;
  suppressClick = true;
  setTimeout(() => { suppressClick = false; }, 0);
  if (reducedMotion.matches || event.type !== 'pointerup' || event.timeStamp - finished.time > 120) return;
  let velocity = finished.velocity;
  let last = performance.now();
  function coast(time) {
    const dt = Math.min(32, time - last);
    last = time;
    const before = folders.scrollLeft;
    folders.scrollLeft += velocity * dt;
    velocity *= Math.exp(-dt / 180);
    if (Math.abs(velocity) > .015 && Math.abs(folders.scrollLeft - before) > .1) momentumFrame = requestAnimationFrame(coast);
  }
  momentumFrame = requestAnimationFrame(coast);
}
folders.addEventListener('pointerup', finishDrag);
folders.addEventListener('pointercancel', finishDrag);
folders.addEventListener('lostpointercapture', finishDrag);
folders.addEventListener('pointerleave', () => { if (drag && !drag.active) drag = null; });
folders.addEventListener('click', event => {
  if (suppressClick) { event.preventDefault(); event.stopPropagation(); }
}, true);
folders.addEventListener('wheel', () => cancelAnimationFrame(momentumFrame), { passive: true });
folders.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  cancelAnimationFrame(momentumFrame);
  folders.scrollBy({ left: event.key === 'ArrowRight' ? 240 : -240, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
});
