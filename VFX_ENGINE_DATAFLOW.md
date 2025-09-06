# VFX Engine Data Flow Architecture

## System Overview

The VFX Engine is a React-based particle system with timeline controls, built on Three.js/R3F. It supports static particles, animated spritesheets, tornado effects, and timeline-based animations.

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    VFX ENGINE SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                      APP.JSX                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                         VfxSettingsProvider (Context)                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     Shared VFX Settings State                          │  │  │
│  │  │  • pCount, duration, pSize, spread, colors, physics                   │  │  │
│  │  │  • shape, texture, spritesheet, tornado settings                      │  │  │
│  │  │  • Provides: vfxSettings, updateVfxSettings()                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│                                          ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          TimelineController (DEFAULT)                          │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        LEVA CONTROLS LAYER                             │  │  │
│  │  │                                                                         │  │  │
│  │  │  ┌─────────────────────┐    ┌─────────────────────────────────────┐    │  │  │
│  │  │  │   Transform Controls │    │        VFX Controls                 │    │  │  │
│  │  │  │  • positionX/Y/Z    │    │  ┌─────────────────────────────────┐ │    │  │  │
│  │  │  │  • rotationX/Y/Z    │    │  │         Particles               │ │    │  │  │
│  │  │  │  • scale            │    │  │  • pCount, duration, pSize      │ │    │  │  │
│  │  │  │  • opacity          │    │  │  • spread, pAge, variations     │ │    │  │  │
│  │  │  └─────────────────────┘    │  └─────────────────────────────────┘ │    │  │  │
│  │  │           │                 │  ┌─────────────────────────────────┐ │    │  │  │
│  │  │           │                 │  │      Colors & Effects           │ │    │  │  │
│  │  │           │                 │  │  • color, colorEnd, gradient    │ │    │  │  │
│  │  │           │                 │  │  • blendMode, opacity           │ │    │  │  │
│  │  │           │                 │  └─────────────────────────────────┘ │    │  │  │
│  │  │           │                 │  ┌─────────────────────────────────┐ │    │  │  │
│  │  │           │                 │  │           Physics               │ │    │  │  │
│  │  │           │                 │  │  • gravity, turbulence          │ │    │  │  │
│  │  │           │                 │  │  • directionalForce X/Y/Z       │ │    │  │  │
│  │  │           │                 │  │  • streakLength                 │ │    │  │  │
│  │  │           │                 │  └─────────────────────────────────┘ │    │  │  │
│  │  │           │                 │  ┌─────────────────────────────────┐ │    │  │  │
│  │  │           │                 │  │       Shape & Texture           │ │    │  │  │
│  │  │           │                 │  │  • shape, shapeHeight/Angle     │ │    │  │  │
│  │  │           │                 │  │  • particleTexture, motionBlur  │ │    │  │  │
│  │  │           │                 │  └─────────────────────────────────┘ │    │  │  │
│  │  │           │                 │  ┌─────────────────────────────────┐ │    │  │  │
│  │  │           │                 │  │      Animated Textures          │ │    │  │  │
│  │  │           │                 │  │  • useSpritesheet, name         │ │    │  │  │
│  │  │           │                 │  │  • frameRate, animationMode     │ │    │  │  │
│  │  │           │                 │  └─────────────────────────────────┘ │    │  │  │
│  │  │           │                 │  ┌─────────────────────────────────┐ │    │  │  │
│  │  │           │                 │  │          Tornado                │ │    │  │  │
│  │  │           │                 │  │  • enabled, height, diameter    │ │    │  │  │
│  │  │           │                 │  │  • speeds, vortex, spiral       │ │    │  │  │
│  │  │           │                 │  └─────────────────────────────────┘ │    │  │  │
│  │  │           │                 │  ┌─────────────────────────────────┐ │    │  │  │
│  │  │           │                 │  │           Trails                │ │    │  │  │
│  │  │           │                 │  │  • enabled, length, damping     │ │    │  │  │
│  │  │           │                 │  │  • size                         │ │    │  │  │
│  │  │           │                 │  └─────────────────────────────────┘ │    │  │  │
│  │  │           │                 └─────────────────────────────────────┘    │  │  │
│  │  │           │                                   │                         │  │  │
│  │  │           └─────────────────┬─────────────────┘                         │  │  │
│  │  │                             │                                           │  │  │
│  │  │                             ▼                                           │  │  │
│  │  │           ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │           │                COMBINED VALUES                          │   │  │  │
│  │  │           │  allVfxValues = { ...vfxValues, ...allVfxControls }     │   │  │  │
│  │  │           └─────────────────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                          │                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      TIMELINE LAYER                                    │  │  │
│  │  │                                                                         │  │  │
│  │  │  ┌─────────────────────┐    ┌─────────────────────────────────────┐    │  │  │
│  │  │  │   Timeline Model    │    │         Timeline Controls          │    │  │  │
│  │  │  │  • parameterDefs    │    │  • currentTime, isPlaying          │    │  │  │
│  │  │  │  • tracks/keyframes │    │  • export/import functions         │    │  │  │
│  │  │  │  • normalization    │    │  • file operations                  │    │  │  │
│  │  │  └─────────────────────┘    └─────────────────────────────────────┘    │  │  │
│  │  │           │                                   │                         │  │  │
│  │  │           └─────────────────┬─────────────────┘                         │  │  │
│  │  │                             │                                           │  │  │
│  │  │                             ▼                                           │  │  │
│  │  │           ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │           │            INTERPOLATED VALUES                          │   │  │  │
│  │  │           │  handleLevaUpdate() → setVfxValues()                    │   │  │  │
│  │  │           └─────────────────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                          │                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                       HOOKS LAYER                                      │  │  │
│  │  │                                                                         │  │  │
│  │  │  ┌─────────────────────┐    ┌─────────────────────────────────────┐    │  │  │
│  │  │  │   useVfxSprites     │    │       useVfxSpritesheets            │    │  │  │
│  │  │  │  • sprites[]        │    │  • spritesheets[]                   │    │  │  │
│  │  │  │  • spriteCategories │    │  • spritesheetOptions               │    │  │  │
│  │  │  │  • texture loading  │    │  • animationModeOptions             │    │  │  │
│  │  │  └─────────────────────┘    │  • getSpritesheetByName()           │    │  │  │
│  │  │                             │  • getSpritesheetMetadata()         │    │  │  │
│  │  │                             └─────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                          │                                     │  │
│  │                                          ▼                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                         DATA FLOW                                      │  │  │
│  │  │                                                                         │  │  │
│  │  │     allVfxValues + sprites → VfxEngine                                 │  │  │
│  │  │                                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   VFX ENGINE                                           │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                             PROPS PROCESSING                                   │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────┐    ┌─────────────────────────────────────────────┐   │  │
│  │  │   allVfxValues      │    │              sprites[]                      │   │  │
│  │  │  (from Timeline)    │    │         (from useVfxSprites)                │   │  │
│  │  │                     │    │                                             │   │  │
│  │  │  • transform props  │    │  • Static texture files                    │   │  │
│  │  │  • VFX parameters   │    │  • Organized by category                   │   │  │
│  │  │  • spritesheet data │    │  • Extended texture library                │   │  │
│  │  │  • tornado settings │    │                                             │   │  │
│  │  └─────────────────────┘    └─────────────────────────────────────────────┘   │  │
│  │           │                                   │                                │  │
│  │           └─────────────────┬─────────────────┘                                │  │
│  │                             │                                                  │  │
│  │                             ▼                                                  │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    EFFECTIVE VALUES                                    │  │  │
│  │  │                                                                         │  │  │
│  │  │  const effectiveValues = allVfxValues || {individual props}            │  │  │
│  │  │                                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                           GEOMETRY GENERATION                                  │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    useEffect → Async Generation                        │  │  │
│  │  │                                                                         │  │  │
│  │  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │  │
│  │  │  │   Shape Type    │    │   Tornado Mode  │    │  Shape Params   │    │  │  │
│  │  │  │                 │    │                 │    │                 │    │  │  │
│  │  │  │ • explosion     │    │ • tornadoEnabled│    │ • pCount        │    │  │  │
│  │  │  │ • sphere        │    │ • height        │    │ • spread        │    │  │  │
│  │  │  │ • box           │    │ • diameters     │    │ • variations    │    │  │  │
│  │  │  │ • cone          │    │ • spiral        │    │ • height factor │    │  │  │
│  │  │  │ • circle        │    │                 │    │                 │    │  │  │
│  │  │  │ • square        │    │                 │    │                 │    │  │  │
│  │  │  │ • spiral        │    │                 │    │                 │    │  │  │
│  │  │  │ • wave          │    │                 │    │                 │    │  │  │
│  │  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │  │  │
│  │  │           │                       │                       │            │  │  │
│  │  │           └───────────────────────┼───────────────────────┘            │  │  │
│  │  │                                   │                                    │  │  │
│  │  │                                   ▼                                    │  │  │
│  │  │    ┌─────────────────────────────────────────────────────────────┐     │  │  │
│  │  │    │                 shapeGenerators.js                         │     │  │  │
│  │  │    │                                                             │     │  │  │
│  │  │    │  • generateExplosion() → positions[], sizes[], etc.       │     │  │  │
│  │  │    │  • generateTornado() → spiral particle distribution       │     │  │  │
│  │  │    │  • generateSphere(), generateBox(), etc.                  │     │  │  │
│  │  │    │                                                             │     │  │  │
│  │  │    │  Returns: BufferGeometry with attributes:                  │     │  │  │
│  │  │    │    • position (vec3)                                       │     │  │  │
│  │  │    │    • aSize (float)                                         │     │  │  │
│  │  │    │    • aTimeMultiplier (float)                               │     │  │  │
│  │  │    │    • aHeightFactor (float)                                 │     │  │  │
│  │  │    └─────────────────────────────────────────────────────────────┘     │  │  │
│  │  │                                   │                                    │  │  │
│  │  │                                   ▼                                    │  │  │
│  │  │    ┌─────────────────────────────────────────────────────────────┐     │  │  │
│  │  │    │                    setGeometry()                           │     │  │  │
│  │  │    └─────────────────────────────────────────────────────────────┘     │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                            MATERIAL UNIFORMS                                   │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      useEffect → Material Updates                      │  │  │
│  │  │                                                                         │  │  │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐     │  │  │
│  │  │  │  Basic Uniforms │  │ Physics Uniforms│  │ Spritesheet Uniforms│     │  │  │
│  │  │  │                 │  │                 │  │                     │     │  │  │
│  │  │  │ • uSize         │  │ • uGravity      │  │ • uUseSpritesheet   │     │  │  │
│  │  │  │ • uColor        │  │ • uTurbulence   │  │ • uFramesX/Y        │     │  │  │
│  │  │  │ • uColorEnd     │  │ • uDirectional  │  │ • uTotalFrames      │     │  │  │
│  │  │  │ • uUseGradient  │  │   Force         │  │ • uFrameRate        │     │  │  │
│  │  │  │ • uOpacity      │  │ • uStreakLength │  │ • uAnimationMode    │     │  │  │
│  │  │  │ • uResolution   │  │                 │  │ • uRandomStartFrame │     │  │  │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘     │  │  │
│  │  │                                                                         │  │  │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐     │  │  │
│  │  │  │ Tornado Uniforms│  │ Trail Uniforms  │  │  Texture Selection  │     │  │  │
│  │  │  │                 │  │                 │  │                     │     │  │  │
│  │  │  │ • uTornadoEnabled│ │ • uTrailEnabled │  │ • uTexture          │     │  │  │
│  │  │  │ • uTornadoHeight│  │ • uTrailLength  │  │                     │     │  │  │
│  │  │  │ • uVerticalSpeed│  │ • uTrailDamping │  │ Priority Order:     │     │  │  │
│  │  │  │ • uRotationSpeed│  │ • uTrailSize    │  │ 1. Spritesheet      │     │  │  │
│  │  │  │ • uVortexStrength│ │                 │  │ 2. Extended sprites │     │  │  │
│  │  │  │ • uSpiralSpin   │  │                 │  │ 3. Basic particles  │     │  │  │
│  │  │  │ • uBaseDiameter │  │                 │  │                     │     │  │  │
│  │  │  │ • uTopDiameter  │  │                 │  │                     │     │  │  │
│  │  │  │ • uHeightColor  │  │                 │  │                     │     │  │  │
│  │  │  │   Gradient      │  │                 │  │                     │     │  │  │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘     │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              SHADER PIPELINE                                   │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                           VFXMaterial                                  │  │  │
│  │  │                                                                         │  │  │
│  │  │  ┌─────────────────────┐              ┌─────────────────────────────┐  │  │  │
│  │  │  │   Vertex Shader     │              │       Fragment Shader      │  │  │  │
│  │  │  │                     │              │                             │  │  │  │
│  │  │  │ • Transform vertex  │              │ • Sample texture            │  │  │  │
│  │  │  │ • Apply physics     │              │ • Apply spritesheet UV      │  │  │  │
│  │  │  │ • Calculate size    │              │ • Color gradients           │  │  │  │
│  │  │  │ • Tornado spiral    │              │ • Blend modes               │  │  │  │
│  │  │  │ • Trail effects     │              │ • Alpha/opacity             │  │  │  │
│  │  │  │                     │              │ • Motion blur               │  │  │  │
│  │  │  └─────────────────────┘              └─────────────────────────────┘  │  │  │
│  │  │           │                                       │                    │  │  │
│  │  │           └─────────────────┬─────────────────────┘                    │  │  │
│  │  │                             │                                          │  │  │
│  │  │                             ▼                                          │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                    GPU Rendering                               │  │  │  │
│  │  │  │                                                                 │  │  │  │
│  │  │  │  • Points primitive                                             │  │  │  │
│  │  │  │  • Custom particle shapes via geometry                         │  │  │  │
│  │  │  │  • Real-time animation via uniforms                            │  │  │  │
│  │  │  │  • Blend modes: Additive, Normal, Multiply, Subtractive        │  │  │  │
│  │  │  └─────────────────────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                            ANIMATION LOOP                                      │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        useFrame Hook                                   │  │  │
│  │  │                                                                         │  │  │
│  │  │  ┌─────────────────────┐              ┌─────────────────────────────┐  │  │  │
│  │  │  │   Playing Mode      │              │       Design Mode           │  │  │  │
│  │  │  │                     │              │                             │  │  │  │
│  │  │  │ • Track elapsed time│              │ • Static progress value     │  │  │  │
│  │  │  │ • Calculate progress│              │ • Show particle preview     │  │  │  │
│  │  │  │ • Update uProgress  │              │ • Different modes:          │  │  │  │
│  │  │  │ • Update uTime      │              │   - Standard: 0.3           │  │  │  │
│  │  │  │ • Handle completion │              │   - Spritesheet: 0.5        │  │  │  │
│  │  │  │                     │              │   - Tornado: 0.5            │  │  │  │
│  │  │  └─────────────────────┘              └─────────────────────────────┘  │  │  │
│  │  │           │                                       │                    │  │  │
│  │  │           └─────────────────┬─────────────────────┘                    │  │  │
│  │  │                             │                                          │  │  │
│  │  │                             ▼                                          │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                 Trigger System                                  │  │  │  │
│  │  │  │                                                                 │  │  │  │
│  │  │  │  • effectiveValues.trigger → setIsPlaying(true)                │  │  │  │
│  │  │  │  • Reset startTimeRef.current                                  │  │  │  │
│  │  │  │  • Animation duration from effectiveValues.duration            │  │  │  │
│  │  │  │  • onComplete callback when progress >= 1                      │  │  │  │
│  │  │  └─────────────────────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL RESOURCES                                        │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               TEXTURE SYSTEM                                   │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────┐    ┌─────────────────────────────────────────────┐   │  │
│  │  │  useVfxTextures     │    │             useVfxSprites                   │   │  │
│  │  │                     │    │                                             │   │  │
│  │  │ • Basic particles   │    │ • Extended sprite library                  │   │  │
│  │  │   - Circle          │    │ • Organized by categories:                 │   │  │
│  │  │   - Heart           │    │   - Fire, Smoke, Magic, etc.               │   │  │
│  │  │   - Point           │    │ • Loaded from /assets/sprites/             │   │  │
│  │  │   - Ring            │    │ • Dynamic texture loading                  │   │  │
│  │  │   - Star            │    │                                             │   │  │
│  │  │                     │    │                                             │   │  │
│  │  └─────────────────────┘    └─────────────────────────────────────────────┘   │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      useVfxSpritesheets                                │  │  │
│  │  │                                                                         │  │  │
│  │  │  • Animated texture sequences                                          │  │  │
│  │  │  • Loaded from /public/sprites/ with .json metadata                   │  │  │
│  │  │  • Support for different grid layouts (4x4, 5x5, etc.)               │  │  │
│  │  │  • Animation modes: once, loop, ping-pong                             │  │  │
│  │  │  • Frame rate control                                                 │  │  │
│  │  │  • Random start frame timing                                          │  │  │
│  │  │                                                                         │  │  │
│  │  │  Available spritesheets:                                               │  │  │
│  │  │  • BAM-0, BOOM, CircleWave, POW, shield                               │  │  │
│  │  │  • shockwave4, SpeedLines                                             │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               PRESET SYSTEM                                    │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        VfxParameters.js                                │  │  │
│  │  │                                                                         │  │  │
│  │  │  • getVfxValues() - Default parameter values                           │  │  │
│  │  │  • listPresets() - Available preset names                             │  │  │
│  │  │  • applyPreset(name) - Load preset configuration                      │  │  │
│  │  │                                                                         │  │  │
│  │  │  Preset categories:                                                    │  │  │
│  │  │  • Explosions, Fire effects, Magic spells                             │  │  │
│  │  │  • Environmental effects (smoke, sparks)                              │  │  │
│  │  │  • Geometric patterns                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Key Data Flow Paths

### 1. User Interaction → Parameter Update
```
User adjusts Leva control → allVfxControls update → effectiveValues change → 
VfxEngine receives new props → Material uniforms update → Shader re-renders
```

### 2. Timeline Animation
```
Timeline playback → handleLevaUpdate() → setVfxValues() → allVfxValues update → 
VfxEngine effectiveValues → Real-time parameter interpolation
```

### 3. Texture/Spritesheet Selection
```
User selects texture → useVfxSprites/useVfxSpritesheets load resources → 
Material uniforms update → Shader receives new texture + metadata → 
Fragment shader applies correct UV mapping
```

### 4. VFX Trigger
```
"Fire Current Settings!" button → setVfxValues({...values, trigger: true}) → 
useEffect detects trigger → setIsPlaying(true) → useFrame animation loop → 
Progress calculation → Shader uniforms (uProgress, uTime) → Animation
```

### 5. Context Sharing
```
VfxSettingsContext provides shared state → TimelineController reads/writes → 
Context updates propagate → Other components stay synchronized
```

## Component Responsibilities

| Component | Purpose | Key Responsibilities |
|-----------|---------|---------------------|
| **App.jsx** | Entry Point | • VfxSettingsProvider wrapper<br>• Component routing<br>• Canvas styling |
| **TimelineController** | Main Interface | • Leva controls management<br>• Timeline integration<br>• Data combination<br>• Hook orchestration |
| **VfxEngine** | Rendering Core | • Geometry generation<br>• Material/shader management<br>• Animation loop<br>• WebGL rendering |
| **VfxSettingsContext** | State Management | • Shared parameter storage<br>• Cross-component sync<br>• Persistence support |
| **useVfxSprites** | Extended Textures | • Static sprite loading<br>• Category organization<br>• Dynamic imports |
| **useVfxSpritesheets** | Animated Textures | • Spritesheet metadata<br>• Animation parameters<br>• Frame calculations |
| **shapeGenerators.js** | Geometry Creation | • Particle distribution<br>• Shape algorithms<br>• Buffer attribute generation |
| **VFXMaterial** | Shader Interface | • Uniform management<br>• Vertex/fragment shaders<br>• GPU pipeline |

## State Flow Summary

1. **User Input** → Leva controls update local state
2. **Local State** → Combined into `allVfxValues` object  
3. **Timeline** → Interpolates values over time (optional)
4. **Context** → Shares VFX parameters across components
5. **Hooks** → Load external resources (textures, spritesheets)
6. **VfxEngine** → Processes all inputs into `effectiveValues`
7. **Geometry** → Generated based on shape/particle parameters
8. **Material** → Uniforms updated from effective values
9. **Shaders** → GPU rendering with real-time animation
10. **Animation** → Progress/time uniforms drive visual effects

This architecture provides a clean separation of concerns while maintaining real-time performance and extensive customization options.
