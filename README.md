# VFX Engine

A powerful, real-time VFX particle system built with React Three Fiber and WebGL shaders. Create stunning visual effects with customizable parameters, animation timelines, and spritesheet support.

🌐 **Live Demo**: [https://moykul.github.io/vfxEngine/](https://moykul.github.io/vfxEngine/)

## Features

- 🎨 **40+ Customizable Parameters**: Full control over particle behavior, colors, physics, and animations
- 🎬 **Animation Timeline**: Create complex VFX sequences with keyframe animations
- 🖼️ **Spritesheet Support**: Animated sprite textures with multiple playback modes
- 🌀 **Advanced Effects**: Shockwaves, explosions, tornado effects, trails, and more
- 💾 **Save/Load System**: Save and load VFX configurations as JSON presets
- 🎮 **Real-time Editor**: Interactive controls powered by Leva
- 🚀 **High Performance**: GPU-accelerated WebGL shaders for smooth rendering

## Installation

### Prerequisites

- Node.js 16+ and npm

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/moykul/vfxEngine.git
   cd vfxEngine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Using VFX Settings JSON Files

### Loading Preset Configurations

The engine comes with pre-made VFX configurations stored as JSON files in `src/components/vfx/vfxSettings/`:

#### Available Presets

- `CharacterShockwave_02.json` - Blue shockwave effect
- `fireExplosion.json` - Fire explosion with embers
- `green_SW.json` - Green energy shockwave
- `vfx-sheild_settings.json` - Shield force field effect

#### Method 1: Load via UI

1. Click **"Load Complete Setup"** in the Save/Load panel
2. Browse and select a JSON file from the vfxSettings folder
3. The VFX will automatically update with the preset parameters

#### Method 2: Programmatic Import

```javascript
import characterShockwave from './src/components/vfx/vfxSettings/CharacterShockwave_02.json';
import { useVfxSettings } from './src/contexts/VfxSettingsContext.jsx';

// Inside your component
const { updateVfxSettings } = useVfxSettings();
updateVfxSettings(characterShockwave);
```

### Creating Custom JSON Presets

#### JSON Structure

```json
{
  "positionX": 0,
  "positionY": 0,
  "positionZ": 0,
  "rotationX": 0,
  "rotationY": 0,
  "rotationZ": 0,
  "scaleX": 1,
  "scaleY": 1,
  "scaleZ": 1,
  "particleCount": 500,
  "animationDuration": 2,
  "particleSize": 0.8,
  "spreadRadius": 2,
  "color": "#30b0ff",
  "colorEnd": "#0080ff",
  "opacity": 0.8,
  "blendMode": "Additive",
  "shape": "explosion",
  "particleTexture": "Particle 1",
  "useGradient": false,
  "streakLength": 0.0,
  "turbulence": 0.0,
  "directionalForceX": 0.0,
  "directionalForceY": 0.0,
  "directionalForceZ": 0.0
}
```

#### Creating Your Own Presets

1. **Using the UI**:
   - Adjust VFX parameters using the Leva controls
   - Click **"Save VFX Only"** or **"Save Current as Preset"**
   - The JSON file will be downloaded to your computer
   - Move it to `src/components/vfx/vfxSettings/` for easy access

2. **Manual Creation**:
   - Create a new `.json` file in `src/components/vfx/vfxSettings/`
   - Copy the structure above and adjust values
   - All parameters are optional (defaults will be used)

### Complete Setup Files (VFX + Animation)

For full animated sequences with timeline data:

```json
{
  "vfxSettings": {
    "positionX": 0,
    "particleCount": 800,
    "color": "#ff6030"
  },
  "timeline": {
    "duration": 5000,
    "keyframes": [ /* animation data */ ]
  },
  "metadata": {
    "version": "1.0",
    "created": "2024-03-15",
    "description": "Explosion with camera shake"
  }
}
```

Use **"Save Complete Setup"** to export full animated sequences.

## Key Parameters Reference

### Transform
- `positionX/Y/Z`: Position in 3D space (-10 to 10)
- `rotationX/Y/Z`: Rotation in radians (0 to 6.28)
- `scaleX/Y/Z`: Scale multiplier (0.1 to 5)

### Particles
- `particleCount`: Number of particles (10 to 5000)
- `particleSize`: Size of each particle (0.01 to 5)
- `spreadRadius`: Initial spread radius (0.1 to 10)
- `animationDuration`: Effect duration in seconds (0.5 to 10)

### Visual
- `color`: Starting color (hex)
- `colorEnd`: Ending color for gradients (hex)
- `opacity`: Transparency (0 to 1)
- `blendMode`: "Normal", "Additive", "Multiply"
- `useGradient`: Use color gradient animation

### Physics
- `gravity`: Gravity force (-5 to 5)
- `directionalForceX/Y/Z`: Directional movement force
- `turbulence`: Random noise (0 to 2)
- `streakLength`: Motion blur trail length

### Shape
- `shape`: "explosion", "sphere", "ring", "cone", "line", "tornado"
- `shapeHeight`: Height for shaped effects
- `shapeAngle`: Emission angle in radians

### Spritesheet Animation
- `useSpritesheet`: Enable spritesheet animation
- `spritesheetName`: Name of spritesheet to use
- `frameRate`: Animation speed (1 to 60 fps)
- `animationMode`: "once", "loop", "ping-pong"

## Project Structure

```
vfxEngine/
├── src/
│   ├── components/
│   │   ├── vfx/
│   │   │   ├── VfxEngine.jsx          # Main VFX engine component
│   │   │   ├── VfxLevaControls.jsx    # UI controls
│   │   │   ├── VfxParameters.js       # Parameter definitions
│   │   │   ├── vfxPresets.js          # Built-in presets
│   │   │   └── vfxSettings/           # ⭐ JSON preset files
│   │   └── timeline/
│   │       └── AnimationTimeline.jsx  # Timeline editor
│   ├── contexts/
│   │   └── VfxSettingsContext.jsx     # State management
│   ├── hooks/
│   │   └── useVfxSpritesheets.js      # Spritesheet loader
│   ├── shaders/
│   │   └── vfxShaders/                # GLSL shaders
│   └── utils/
│       └── shapeGenerators.js         # Particle shape generation
├── public/
│   └── sprites/                       # Spritesheet JSON + images
└── vite.config.js                     # Vite configuration
```

## Deployment to GitHub Pages

The project is configured for GitHub Pages deployment.

### Automated Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Commit and push**:
   ```bash
   git add dist/
   git commit -m "Build for deployment"
   git push
   ```

3. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Set source to deploy from the `dist` folder or use GitHub Actions

The `base` path is already configured in `vite.config.js` for the `/vfxEngine/` subdirectory.

## Technical Stack

- **React 18** - UI framework
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - 3D graphics library
- **@react-three/drei** - Helpers and abstractions
- **Leva** - GUI controls
- **GSAP** - Animation library
- **Vite** - Build tool and dev server
- **GLSL** - Custom shaders for particle effects

## Documentation

- [Save/Load System Guide](SAVE_LOAD_GUIDE.md) - Detailed save/load instructions
- [VFX Components Analysis](VFX_COMPONENTS_ANALYSIS.md) - Component architecture
- [Dataflow Documentation](VFX_ENGINE_DATAFLOW.md) - System dataflow diagrams

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For questions or issues, please open a GitHub issue.

---

<div align="center">
  <img src="https://raw.githubusercontent.com/moykul/vfxEngine/main/public/assets/ROFL_logo.png" alt="ROFL Production Logo" width="200"/>
  <p><strong>A ROFL Production</strong></p>
</div>
