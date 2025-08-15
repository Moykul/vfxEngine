# VFX Engine — Dataflow

This document maps the runtime and file I/O data flow for the VFX controls and engine. All notes below are derived from the repository code (no speculation).

## Quick summary

- Leva controls live in `src/components/vfx/VfxLevaControls.jsx` and produce `allVfxControls` (live UI state).
- `VfxLevaControls` syncs control values into the shared `VfxSettingsContext` via `updateVfxSettings(...)`.
- The VFX renderer (`VfxEngine.jsx`) consumes the final values passed from `VfxLevaControls` and triggers animations.
- Save/load uses `src/components/timeline/fileManager.jsx`. Imported files are filtered before being applied to Leva controls to avoid schema mismatches.

---

## Mermaid diagram (visual)

```mermaid
flowchart TD
	A[VfxLevaControls.jsx\n(Leva UI)] -->|allVfxControls (live)| B[VfxSettingsContext.jsx\n(updateVfxSettings)]
	A -->|finalVfxValues| C[VfxEngine.jsx\n(renderer)]
	A -->|Save payload {vfxSettings: allVfxControls}| D[fileManager.saveJSON]
	D -->|writes JSON| FS[(disk / download)]
	A -->|Load → file input| E[fileManager.loadJSON]
	E -->|parsed data| A
	E -->|if data.vfxSettings| A -->|filter transforms → setAllVfxControls(vfxOnly)| A
	E -->|if invalid| A -->|alert| ALERT[Invalid file]
```

## Simple visual diagram

```
┌──────────────────────┐                               ┌──────────────────────┐
│                      │    allVfxControls (live)      │                      │
│  VfxLevaControls.jsx │ ─────────────────────────────>│ VfxSettingsContext   │
│     (Leva UI)        │                               │ (updateVfxSettings)  │
│                      │                               └──────────────────────┘
└──────────┬───────────┘
           │
           │ finalVfxValues
           │
           ▼
┌──────────────────────┐
│                      │
│    VfxEngine.jsx     │
│     (renderer)       │
│                      │
└──────────────────────┘
           ▲
           │
           │
           │
┌──────────┴───────────┐                               ┌──────────────────────┐
│                      │     {vfxSettings: ...}        │                      │
│  VfxLevaControls.jsx │ ─────────────────────────────>│  fileManager.saveJSON│
│  (Save button)       │                               │  (write to disk)     │
│                      │                               └──────────────────────┘
└──────────────────────┘

┌──────────────────────┐                               ┌──────────────────────┐
│                      │     file input                │                      │
│  VfxLevaControls.jsx │ ─────────────────────────────>│  fileManager.loadJSON│
│  (Load button)       │                               │  (parse JSON)        │
│                      │                               └──────────┬───────────┘
└──────────────────────┘                                          │
           ▲                                                      │
           │                                                      │
           │ parsed data                                          │
           └──────────────────────────────────────────────────────┘
                         |
                         | (in handleImport)
                         ▼
┌─────────────────────────────────────────────────────┐
│ ✅ if data.vfxSettings:                            │
│ - Filter transforms                                 │
│ - setAllVfxControls(filtered)                       │
│                                                     │
│ ❌ if invalid:                                      │
│ - alert("Invalid animation JSON file")              │
└─────────────────────────────────────────────────────┘
```

> If your environment doesn't render Mermaid, see the ASCII fallback below.

---

## ASCII fallback (straightforward)

VfxLevaControls.jsx (Leva controls, Save/Load)
	├─ produces `allVfxControls` (live)
	├─ calls `updateVfxSettings(allVfxControls)` → `VfxSettingsContext.jsx` (single source)
	├─ passes `finalVfxValues` → `VfxEngine.jsx` (consumer/renderer)
	├─ Save → `fileManager.saveJSON({ vfxSettings: allVfxControls })`
	└─ Load → `fileManager.loadJSON(file)` → parsed data
			 ├─ if `data.vfxSettings` → `updateVfxSettings(data.vfxSettings)` + filter out transforms → `setAllVfxControls(vfx-only)`
			 ├─ else if legacy (root keys like `pCount` / `color`) → `updateVfxSettings(data)` + `setAllVfxControls(filteredLegacy)`
			 └─ else → alert("Invalid animation JSON file")

---

## Data shapes (examples observed in code)

- `allVfxControls` (object) — keys correspond to Leva controls:
	```json
	{ "pCount": 800, "duration": 3, "pSize": 0.1, "spread": 2, "pAge": 1, "color": "#ffffff" }
	```

- `vfxSettings` (context object) — usually identical but sometimes contains transforms:
	```json
	{ "positionX":0, "positionY":0, "rotationX":0, "scale":1, "pCount":800 }
	```

- saved payload written by the app:
	```json
	{ "vfxSettings": { /* ...control keys... */ }, "metadata": { /* optional */ } }
	```

---

## Where filtering happens and why

- The import handler in `VfxLevaControls.handleImport` destructures loaded objects and removes transform fields before calling `setAllVfxControls`:

	```js
	const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scale, ...vfxOnlySettings } = data.vfxSettings;
	setAllVfxControls(vfxOnlySettings);
	```

- Reason (from code behaviour): Leva's programmatic setter expects keys that match the currently defined controls. Passing unexpected transform keys can cause errors or fail to apply values. Filtering ensures only keys that belong to the Leva panel are applied.

---

## Edge-cases & observed behaviours

- JSON parse errors: `fileManager.loadJSON` alerts "Invalid animation JSON file." on parse failure.
- Schema mismatch: older or externally produced files may include extra keys or miss new ones. The current code filters out transforms but otherwise replaces Leva values (no merge strategy is implemented).
- Type mismatches: saved values with different types (string vs number) can fail to apply to Leva controls.

---

## Where to look in the repo

- UI & Leva controls: `src/components/vfx/VfxLevaControls.jsx`
- Runtime consumer: `src/components/vfx/VfxEngine.jsx`
- Defaults / params: `src/components/vfx/VfxParameters.js`
- Context: `src/contexts/VfxSettingsContext.jsx`
- File I/O: `src/components/timeline/fileManager.jsx`
- Reference pattern: `src/components/timeline/timelineLevaControl.jsx`

---

## Quick manual test (in-app)

1. Open the app (dev server).
2. Adjust some controls in the "VFX Controls" panel.
3. Click "Save Settings" — confirm a `vfx-settings.json` file is downloaded.
4. Click "Load Settings" and select the saved file.
5. Check browser console for logs from `VfxLevaControls.handleImport` showing filtered keys.

---

## Non-speculative note

All statements above map to existing code in the repository; I avoided inventing behaviour. If you want changes (merge-on-load, schema versioning, richer metadata), tell me which and I will implement it explicitly.
