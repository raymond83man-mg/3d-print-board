export function parsePriorityFromTitle(title: string): 0 | 1 | 2 | 3 {
  const trimmed = title.trim();
  if (/^\*\*\*\s|\s\*\*\*$/.test(trimmed)) return 3;
  if (/^\*\*\s|\s\*\*$/.test(trimmed)) return 2;
  if (/^\*\s|\s\*$/.test(trimmed)) return 1;
  return 0;
}

export function nowIso() { return new Date().toISOString(); }

export function newId() { return Math.random().toString(36).slice(2, 10); }

export function formatTimestamp(dt: Date) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

