# 3D Print Board

Fast, responsive whiteboard-style tracker for 3D printing projects. Three tabs (Personal, Work, Others) each with workflow columns. Drag-and-drop, keyboard controls, snapshots, safe wipes, and local persistence.

## Tech
- React + TypeScript (Vite)
- Zustand for state
- dnd-kit for drag-and-drop
- html2canvas for snapshots

## Run
```
npm install
npm run dev
```

## Shortcuts
- `n` Add new item to current column
- `[` / `]` Move selected card left/right
- `Ctrl/Cmd+Enter` Toggle notes editor (when card selected)
- `/` Focus search

## Snapshots
- Snapshot board, current tab, or board without details (temporarily hides optional fields)
- PNG includes timestamp (YYYY-MM-DD HH:mm) bottom-right

## Wipe confirmations
Exact phrases required:
- Wipe Done: `CONFIRM WIPE DONE`
- Wipe Personal: `CONFIRM WIPE PERSONAL`
- Wipe Work: `CONFIRM WIPE WORK`
- Wipe Others: `CONFIRM WIPE OTHERS`
- Wipe All: `CONFIRM WIPE ALL`

## Import/Export
- Export downloads a JSON of full state
- Import validates basic shape and shows summary before replacing state

## Optional: Cloud Sync (GitHub Gist)
- Open Actions menu → Settings & Sync
- Create a GitHub Personal Access Token (classic) with only the "gist" scope
  - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Paste the token in Settings, optionally set an existing Gist ID (or leave empty to auto-create)
- Enable Auto-sync to upload on every change, or use Sync Now / Load from Cloud manually
Note: Token is stored locally on the device (localStorage). Repeat on each device.

## Notes
- Manual card order only; no auto-sort
- Priority parsed from `*`, `**`, `***` in title (asterisks preserved)
- Per-card details toggle overrides global setting
- State persists to localStorage with debounce
