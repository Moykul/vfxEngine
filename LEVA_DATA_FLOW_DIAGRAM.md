# Leva Data Flow Analysis - VFX System

## Overview
This diagram traces how Leva control values flow through the VFX system, from initial configuration to final rendering.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              INITIALIZATION PHASE                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  VfxParameters.js   │    │ VfxSettingsContext  │    │  VfxLevaControls    │
│                     │    │                     │    │                     │
│ • getVfxValues()    │───▶│ • Initial state     │───▶│ • Component mount   │
│ • Default settings  │    │ • Shared provider   │    │ • useState init     │
│ • Parameter defs    │    │ • Context creation  │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                        │                          │
                                        ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LEVA CONTROLS SETUP                                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      useControls('VFX Controls', () => ({                       │
│                                                                                 │
│  pCount: { value: vfxValues.pCount, min: 50, max: 2000, step: 10 }            │
│  duration: { value: vfxValues.duration, min: 0.5, max: 10.0, step: 0.1 }      │
│  pSize: { value: vfxValues.pSize, min: 0.01, max: 1.0, step: 0.01 }           │
│  color: { value: vfxValues.color }                                             │
│  gravity: { value: vfxValues.gravity, min: -15.0, max: 15.0, step: 0.1 }      │
│  shape: { value: vfxValues.shape, options: [...] }                             │
│  // ... all other VFX parameters                                               │
│                                                                                 │
│                      }))                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REAL-TIME DATA FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   User Interaction  │    │   Leva Controls     │    │  allVfxControls     │
│                     │    │                     │    │                     │
│ • Slider movement   │───▶│ • useControls hook  │───▶│ • Live state        │
│ • Dropdown change   │    │ • Real-time update  │    │ • Current values    │
│ • Button click      │    │ • Immediate capture │    │ • Destructured obj  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                        │                          │
                                        ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VALUE TRANSFORMATION LAYER                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   allVfxValues      │    │  finalVfxValues     │    │ VfxSettingsContext  │
│   (useMemo)         │    │   (useMemo)         │    │                     │
│                     │    │                     │    │                     │
│ • Transform values  │───▶│ • Complete dataset  │───▶│ • updateVfxSettings │
│ • ...allVfxControls │    │ • Trigger handling  │    │ • Shared state      │
│ • Default positions │    │ • Ready for engine  │    │ • Context update    │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                        │                          │
                                        ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RENDERING PIPELINE                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    VfxEngine        │    │   Shader System     │    │   Canvas Render     │
│                     │    │                     │    │                     │
│ • Receives values   │───▶│ • Uniform updates   │───▶│ • Visual output     │
│ • Particle system   │    │ • GPU computation   │    │ • Real-time VFX     │
│ • Animation logic   │    │ • Vertex/Fragment   │    │ • User feedback     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TRIGGER MECHANISM                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ "Fire Current       │    │   setVfxValues      │    │   Trigger Reset     │
│  Settings!" Button  │    │                     │    │                     │
│                     │───▶│ • {...allVfxValues, │───▶│ • setTimeout 100ms  │
│ • User action       │    │   trigger: true}    │    │ • trigger: false    │
│ • Manual trigger    │    │ • Animation start   │    │ • Ready for next    │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          FILE OPERATIONS FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Save Settings     │    │   Live Capture      │    │   JSON Export       │
│                     │    │                     │    │                     │
│ • Button press      │───▶│ • allVfxControls    │───▶│ • fileManager.save  │
│ • Current state     │    │ • Real-time values  │    │ • Structured format │
│ • Export action     │    │ • No transforms     │    │ • Metadata included │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                        │
                                        ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Load Settings     │    │   File Import       │    │   State Update      │
│                     │    │                     │    │                     │
│ • File selection    │───▶│ • JSON parsing      │───▶│ • setVfxValues      │
│ • handleImport      │    │ • Format detection  │    │ • Trigger animation │
│ • Legacy support    │    │ • Validation        │    │ • UI sync           │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## Key Data Flow Points

### 1. Initial Value Population
```javascript
const [vfxValues, setVfxValues] = useState(() => getVfxValues());
```
- `getVfxValues()` provides default values from `VfxParameters.js`
- Initial state includes all VFX parameters with defaults

### 2. Leva Controls Creation
```javascript
const [allVfxControls, setAllVfxControls] = useControls('VFX Controls', () => ({
  pCount: { value: vfxValues.pCount, min: 50, max: 2000, step: 10 },
  // ... all other controls
}));
```
- **Single `useControls` call** - Critical for performance
- Controls are bound to initial `vfxValues`
- Returns live state object that updates on user interaction

### 3. Value Merging & Transformation
```javascript
const allVfxValues = useMemo(() => ({
  // Default transform values (for VFX-only mode)
  positionX: vfxValues.positionX,
  positionY: vfxValues.positionY,
  positionZ: vfxValues.positionZ,
  // ...
  // VFX effect parameters from live controls
  ...allVfxControls
}), [allVfxControls, vfxValues]);
```
- Combines static transform values with live control values
- `useMemo` prevents unnecessary recalculations

### 4. Final Value Preparation
```javascript
const finalVfxValues = useMemo(() => {
  const baseValues = { ...allVfxValues };
  if (Object.keys(vfxValues).length > 0 && vfxValues.trigger) {
    baseValues.trigger = true;
  }
  return baseValues;
}, [allVfxValues, vfxValues]);
```
- Adds trigger state for animation playback
- Final dataset sent to `VfxEngine`

### 5. Context Sharing
```javascript
useEffect(() => {
  updateVfxSettings(allVfxControls);
}, [allVfxControls, updateVfxSettings]);
```
- Live control values are shared via context
- Other components can access current settings
- Shallow comparison prevents unnecessary updates

## Critical Flow Characteristics

### ✅ Real-Time Updates
- **Live Controls**: `allVfxControls` updates immediately on user interaction
- **No Delays**: Values flow directly from Leva to rendering
- **Immediate Feedback**: Changes visible in real-time

### ✅ Performance Optimizations
- **Single useControls**: Avoids multiple hook calls
- **useMemo Dependencies**: Prevents unnecessary recalculations
- **Shallow Comparison**: Context updates only when needed

### ✅ State Management
- **Local State**: Component-level `vfxValues` for trigger management
- **Shared Context**: `VfxSettingsContext` for cross-component access
- **Default Fallbacks**: Transform values included for VFX-only mode

### ✅ File Operations
- **Live Capture**: Save button captures current `allVfxControls`
- **Format Support**: Handles both structured and legacy JSON formats
- **State Sync**: Load operations update both local and context state

## Data Types & Structure

### allVfxControls Object
```javascript
{
  pCount: 800,
  duration: 3.0,
  pSize: 0.1,
  color: "#9eff30",
  gravity: 0,
  shape: "cone",
  // ... 20+ more parameters
}
```

### finalVfxValues Object
```javascript
{
  // Transform (static)
  positionX: 0, positionY: 0, positionZ: 0,
  rotationX: 0, rotationY: 0, rotationZ: 0,
  scale: 1,
  
  // VFX Parameters (live from Leva)
  pCount: 800, duration: 3.0, pSize: 0.1,
  color: "#9eff30", gravity: 0, shape: "cone",
  // ... all other live values
  
  // Control
  trigger: false
}
```

This flow ensures that every user interaction with Leva controls immediately flows through the system to provide real-time visual feedback in the VFX engine.
