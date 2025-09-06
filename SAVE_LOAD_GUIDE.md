# VFX Engine Save/Load System Guide

## Overview
The VFX Engine now has a comprehensive save/load system that allows you to save your current VFX setups, load them back, and share configurations. The system supports multiple file formats and provides clear feedback.

## Save Options

### 🚀 VFX Actions Panel

#### Quick Save Current
- **Location**: VFX Actions → "Quick Save Current"
- **What it saves**: Current VFX settings only
- **Filename**: `quick-save-YYYY-MM-DD-HH-MM-SS.json`
- **Use case**: Fast saving during experimentation

### 💾 Save/Load Panel

#### Save Complete Setup
- **Location**: Save/Load → "Save Complete Setup"  
- **What it saves**: VFX settings + timeline animation data
- **Filename**: `vfx-complete-YYYY-MM-DD-HH-MM-SS.json`
- **Use case**: Full project backup with animations

#### Save VFX Only
- **Location**: Save/Load → "Save VFX Only"
- **What it saves**: VFX parameters only (no timeline)
- **Filename**: `vfx-settings-YYYY-MM-DD-HH-MM-SS.json`
- **Use case**: Creating reusable VFX configurations

#### Save Current as Preset
- **Location**: Save/Load → "Save Current as Preset"
- **What it saves**: VFX settings as a named preset
- **Filename**: `preset-[name].json`
- **Use case**: Creating custom presets for later use

### 📅 Timeline Panel

#### Export Animation
- **Location**: Timeline → "Export Animation"
- **What it saves**: Combined VFX + timeline data
- **Filename**: `vfx-animation-complete.json`
- **Use case**: Exporting complete animated sequences

## Load Options

### Load Complete Setup
- **Location**: Save/Load → "Load Complete Setup"
- **What it loads**: Full setups (VFX + timeline), VFX-only files, presets, or legacy files
- **Auto-detects**: File format and loads appropriately
- **Features**: Shows preview animation after loading

### Load VFX Only
- **Location**: Save/Load → "Load VFX Only"
- **What it loads**: VFX settings only (ignores timeline data)
- **Use case**: Loading VFX configurations without affecting timeline

### Import Animation
- **Location**: Timeline → "Import Animation"
- **What it loads**: Complete animation files or legacy timeline data
- **Use case**: Loading saved animation sequences

## File Formats Supported

### Complete Setup Files
```json
{
  "vfxSettings": { /* All VFX parameters */ },
  "timeline": { /* Timeline animation data */ },
  "metadata": {
    "version": "1.0",
    "created": "2024-...",
    "description": "Complete VFX Setup",
    "hasTimeline": true,
    "parameterCount": 45
  }
}
```

### VFX-Only Files
```json
{
  "vfxSettings": { /* All VFX parameters */ },
  "metadata": {
    "version": "1.0",
    "created": "2024-...",
    "description": "VFX Settings Only",
    "parameterCount": 45
  }
}
```

### Preset Files
```json
{
  "name": "My Custom Preset",
  "settings": { /* VFX parameters */ },
  "metadata": {
    "created": "2024-...",
    "description": "Custom preset: My Custom Preset"
  }
}
```

### Legacy Timeline Files
```json
{
  "rows": [ /* Timeline rows */ ]
}
```

## Features

### Smart File Detection
- The system automatically detects file format
- Shows appropriate success messages with file info
- Handles legacy formats gracefully

### User Feedback
- Success messages show file size and parameter count
- Error messages provide specific failure reasons
- Console logging for debugging

### File Validation
- Validates JSON structure before saving/loading
- Checks for required VFX parameters
- Provides helpful error messages for invalid files

### Auto-Preview
- Briefly triggers VFX animation after loading to show the effect
- Duration matches the loaded settings

## Best Practices

### File Organization
- Use descriptive names when saving presets
- Quick saves include timestamps for easy identification
- Complete setups preserve both VFX and animation data

### Workflow Tips
1. **Experimentation**: Use "Quick Save Current" frequently
2. **Project Backup**: Use "Save Complete Setup" for full backups  
3. **Preset Creation**: Use "Save Current as Preset" for reusable effects
4. **Sharing**: VFX-only files are smaller and easier to share

### File Management
- All saves include metadata for easy identification
- File sizes are shown in success messages
- Timestamps prevent filename conflicts

## Troubleshooting

### Common Issues
- **"Invalid JSON file"**: File is corrupted or not proper JSON
- **"Missing required fields"**: VFX file missing core parameters
- **"Timeline not ready"**: Timeline component not initialized

### Debug Information
- Use "Debug Values" button to see current settings in console
- Check browser console for detailed loading information
- Validate file structure if having issues

## Technical Notes

### Supported Parameters
The system saves all VFX parameters including:
- Particles (count, size, duration, spread, age)
- Colors & Effects (colors, gradients, opacity, blend modes)
- Physics (gravity, turbulence, forces, streak length)
- Shape & Texture (shape, texture, animation presets)
- Trails (trail settings)
- Animated Textures (spritesheet settings)
- Tornado (tornado-specific parameters)

### File Compatibility
- Forward compatible with future versions
- Backwards compatible with legacy timeline files
- Cross-platform JSON format
