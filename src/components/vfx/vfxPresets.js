// vfxPresets.js
// Collection of ready-to-use VFX presets for the engine.
// Each preset is a plain object that matches the shape produced by `getVfxValues()` in `VfxParameters.js`.

export const VFX_PRESETS = {
  "Pow Explosion": {
    // Comic-style POW explosion using the POW spritesheet
    pCount: 600,
    duration: 1.2,
    pSize: 0.8,
    spread: 3.5,
    pAge: 1.0,
    sizeVariation: 0.6,
    timeVariation: 0.3,
    color: '#ffffff',
    colorEnd: '#ff7a00',
    useGradient: true,
    opacity: 1.0,
    blendMode: 0,
    gravity: -0.5,
    turbulence: 0.25,
    directionalForceX: 0,
    directionalForceY: 1.2,
    directionalForceZ: 0,
    streakLength: 0.2,
    shape: 'explosion',
    shapeHeight: 1.5,
    animationPreset: 'burst',
    particleTexture: 'Circle',

    // spritesheet settings
    useSpritesheet: true,
    spritesheetName: 'pow_explosion_5x5',
    spritesheetFrameRate: 24,
    spritesheetAnimationMode: 'once',
    spritesheetRandomStart: false,

    // helpers
    trigger: false
  },

  "BAM Impact": {
    // Short punch impact using BAM spritesheet
    pCount: 400,
    duration: 0.9,
    pSize: 0.9,
    spread: 2.2,
    sizeVariation: 0.4,
    timeVariation: 0.2,
    color: '#fff8e1',
    colorEnd: '#ffd166',
    useGradient: true,
    opacity: 1.0,
    blendMode: 0,
    gravity: -0.2,
    turbulence: 0.15,
    directionalForceY: 0.8,
    streakLength: 0.1,
    shape: 'explosion',
    animationPreset: 'burst',
    particleTexture: 'Ring',

    useSpritesheet: true,
    spritesheetName: 'bam_explosion_5x5',
    spritesheetFrameRate: 24,
    spritesheetAnimationMode: 'once',
    spritesheetRandomStart: false,

    trigger: false
  },

  "Boom Mega": {
    // Large cinematic blast (no spritesheet) - higher particle count and wide spread
    pCount: 1200,
    duration: 1.8,
    pSize: 1.2,
    spread: 5.0,
    sizeVariation: 0.8,
    timeVariation: 0.5,
    color: '#ffd9c1',
    colorEnd: '#ff6b6b',
    useGradient: true,
    opacity: 0.95,
    blendMode: 0,
    gravity: -0.6,
    turbulence: 0.8,
    directionalForceY: 1.8,
    streakLength: 0.35,
    shape: 'explosion',
    shapeHeight: 2.5,
    animationPreset: 'burst',
    particleTexture: 'Star',

    useSpritesheet: false,

    trigger: false
  },

  "Magic Sparkle": {
    // Gentle magic burst using small particles
    pCount: 250,
    duration: 2.5,
    pSize: 0.25,
    spread: 1.6,
    sizeVariation: 0.6,
    timeVariation: 0.6,
    color: '#ffd6ff',
    colorEnd: '#80b3ff',
    useGradient: true,
    opacity: 0.9,
    blendMode: 0,
    gravity: 0,
    turbulence: 0.12,
    directionalForceY: 0.6,
    streakLength: 0.0,
    shape: 'sphere',
    animationPreset: 'fadeOut',
    particleTexture: 'Star 2',

    useSpritesheet: false,

    trigger: false
  },

  "Smoke Puff": {
    // Soft smoke dissipation - good as a demo when spritesheet not used
    pCount: 320,
    duration: 1.2,
    pSize: 0.5,
    spread: 1.8,
    sizeVariation: 0.7,
    timeVariation: 0.5,
    color: '#bfbfbf',
    colorEnd: '#666666',
    useGradient: true,
    opacity: 0.8,
    blendMode: 0,
    gravity: 0.2,
    turbulence: 0.4,
    directionalForceY: 0.6,
    streakLength: 0.0,
    shape: 'circle',
    animationPreset: 'fadeOut',
    particleTexture: 'Circle',

    useSpritesheet: false,

    trigger: false
  },

  "Water Splash": {
    // Splash effect useful for impacts into water
    pCount: 420,
    duration: 1.4,
    pSize: 0.6,
    spread: 2.4,
    sizeVariation: 0.5,
    timeVariation: 0.3,
    color: '#dff7ff',
    colorEnd: '#77d6ff',
    useGradient: true,
    opacity: 1.0,
    blendMode: 0,
    gravity: 1.2,
    turbulence: 0.4,
    directionalForceY: 1.6,
    streakLength: 0.05,
    shape: 'explosion',
    animationPreset: 'burst',
    particleTexture: 'Ring',

    useSpritesheet: false,

    trigger: false
  },

  "Tornado Mini": {
    // Small tornado-style effect using tornado mode
    pCount: 900,
    duration: 4.0,
    pSize: 0.35,
    spread: 0.6,
    sizeVariation: 0.6,
    timeVariation: 0.4,
    color: '#ffffff',
    colorEnd: '#999999',
    useGradient: false,
    opacity: 0.9,
    blendMode: 0,
    gravity: 0.0,
    turbulence: 0.6,
    directionalForceY: 0.7,
    streakLength: 0.15,
    shape: 'tornado',
    shapeHeight: 6.0,
    animationPreset: 'spiral',
    particleTexture: 'Point',

    useSpritesheet: false,
    tornadoEnabled: true,
    tornadoHeight: 6.0,
    verticalSpeed: 0.8,
    rotationSpeed: 1.6,
    vortexStrength: 1.2,
    spiralSpin: 2.5,

    trigger: false
  }
};

// Helper: get preset by name
export function getPreset(name) {
  return VFX_PRESETS[name] || null;
}

// Helper: list available preset names
export function listPresets() {
  return Object.keys(VFX_PRESETS);
}

export default VFX_PRESETS;
