/** Keep the point beneath the two-finger midpoint stable as the photo scales. */
export function pinchChange(start, first, second, frame) {
  const distance = Math.hypot(second.x - first.x, second.y - first.y);
  const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
  const zoom = Math.max(1, Math.min(3, start.zoom * distance / Math.max(start.distance, 1)));
  const ratio = zoom / start.zoom;
  const cx = frame.x + frame.w / 2, cy = frame.y + frame.h / 2;
  return {
    zoom,
    dx: (start.dx - (start.midpoint.x - cx)) * ratio + midpoint.x - cx,
    dy: (start.dy - (start.midpoint.y - cy)) * ratio + midpoint.y - cy,
  };
}
