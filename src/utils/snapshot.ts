import html2canvas from 'html2canvas';
import { formatTimestamp } from './format';

type Mode = 'board' | 'tab';

export async function snapshotBoard(opts: { mode: Mode; hideDetails?: boolean; element?: HTMLElement | null }) {
  const container = opts.element || (opts.mode === 'tab'
    ? (document.querySelector('.board .tab-panel') as HTMLElement | null)
    : document.getElementById('board-capture'));
  if (!container) return;
  const cls = 'snapshot-hide-details';
  if (opts.hideDetails) container.classList.add(cls);
  const canvas = await html2canvas(container, { backgroundColor: '#fff', scale: 2, useCORS: true });
  if (opts.hideDetails) container.classList.remove(cls);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const ts = formatTimestamp(new Date());
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#777';
    const padding = 8; const textWidth = ctx.measureText(ts).width;
    ctx.fillText(ts, canvas.width - textWidth - padding, canvas.height - padding);
  }
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `3d-print-board-${opts.mode}-${Date.now()}.png`;
  a.click();
}
