// VFX Parameters - Enhanced with Spritesheet Support
// Default values for VFX system including new spritesheet properties

import * as THREE from 'three';

// ✅ ENHANCED: Updated default VFX values with spritesheet support
export const getVfxValues = () => ({
  // Transform properties
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  scale: 1,
  
  // Core particle properties
  pCount: 800,
  duration: 3.0,
  pSize: 0.4,
  spread: 2,
  pAge: 1.0,
  sizeVariation: 0.5,
  timeVariation: 0.4,
  
  // Visual properties
  color: '#ff6030',
  colorEnd: '#ff0030',
  useGradient: false,
  opacity: 1.0,
  blendMode: 0, // 0=Additive, 1=Normal, 2=Multiply, 3=Subtractive
  
  // Physics properties
  gravity: 0,
  turbulence: 0,
  directionalForceX: 0,
  directionalForceY: 0,
  directionalForceZ: 0,
  streakLength: 0,
  
  // Shape and pattern
  shape: 'explosion',
  shapeHeight: 2.0,
  shapeAngle: 0,
  heightMultiplier: 1.0,
  
  // Animation and effects
  animationPreset: 'none',
  particleTexture: 'Circle',
  motionBlur: false,
  
  // ✅ NEW: Spritesheet properties
  useSpritesheet: false,
  spritesheetName: 'pow_explosion_5x5',
  spritesheetFrameRate: 24,
  spritesheetAnimationMode: 'once', // 'once', 'loop', 'ping-pong'
  spritesheetRandomStart: false,
  
  // Tornado properties
  tornadoEnabled: false,
  tornadoHeight: 8.0,
  verticalSpeed: 1.0,
  rotationSpeed: 1.0,
  vortexStrength: 1.0,
  spiralSpin: 2.0,
  baseDiameter: 0.5,
  topDiameter: 3.0,
  heightColorGradient: false,
  
  // Control flags
  trigger: false,
  showHelpers: false,
  helperOpacity: 0.3,
  fileName: 'my-vfx-settings'
});

// ✅ NEW: Spritesheet-specific utility functions
export const getSpritesheetDefaults = () => ({
  useSpritesheet: false,
  spritesheetName: 'pow_explosion_5x5',
  spritesheetFrameRate: 24,
  spritesheetAnimationMode: 'once',
  spritesheetRandomStart: false
});

// ✅ NEW: Animation mode mappings for shaders
export const getAnimationModeValue = (mode) => {
  const modeMap = {
    'once': 0,
    'loop': 1,
    'ping-pong': 2
  };
  return modeMap[mode] || 0;
};

// ✅ NEW: Recommended spritesheet configurations for different effects
export const getSpritesheetPresets = () => ({
  explosion: {
    spritesheetName: 'pow_explosion_5x5',
    spritesheetFrameRate: 24,
    spritesheetAnimationMode: 'once',
    spritesheetRandomStart: false
  },
  fire: {
    spritesheetName: 'flame_flicker_2x4',
    spritesheetFrameRate: 8,
    spritesheetAnimationMode: 'loop',
    spritesheetRandomStart: true
  },
  smoke: {
    spritesheetName: 'smoke_puff_4x2',
    spritesheetFrameRate: 12,
    spritesheetAnimationMode: 'once',
    spritesheetRandomStart: true
  },
  magic: {
    spritesheetName: 'magic_sparkle_8x1',
    spritesheetFrameRate: 16,
    spritesheetAnimationMode: 'loop',
    spritesheetRandomStart: false
  },
  electric: {
    spritesheetName: 'electric_spark_4x4',
    spritesheetFrameRate: 30,
    spritesheetAnimationMode: 'once',
    spritesheetRandomStart: true
  },
  water: {
    spritesheetName: 'water_splash_6x2',
    spritesheetFrameRate: 18,
    spritesheetAnimationMode: 'once',
    spritesheetRandomStart: false
  }
});

// ✅ ENHANCED: Blend mode utilities
export const getBlendModeValue = (blendMode) => {
  switch (blendMode) {
    case 1: return THREE.NormalBlending;
    case 2: return THREE.MultiplyBlending;
    case 3: return THREE.SubtractiveBlending;
    default: return THREE.AdditiveBlending;
  }
};

export const getBlendModeOptions = () => ({
  'Additive': 0,
  'Normal': 1,
  'Multiply': 2,
  'Subtractive': 3
});

// ✅ NEW: Validation functions for spritesheet parameters
export const validateSpritesheetSettings = (settings) => {
  const errors = [];
  
  if (settings.useSpritesheet) {
    if (!settings.spritesheetName || settings.spritesheetName.trim() === '') {
      errors.push('Spritesheet name is required when using spritesheets');
    }
    
    if (settings.spritesheetFrameRate < 1 || settings.spritesheetFrameRate > 60) {
      errors.push('Frame rate must be between 1 and 60 fps');
    }
    
    const validModes = ['once', 'loop', 'ping-pong'];
    if (!validModes.includes(settings.spritesheetAnimationMode)) {
      errors.push('Animation mode must be one of: once, loop, ping-pong');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ✅ NEW: Performance recommendations based on spritesheet settings
export const getPerformanceRecommendations = (settings) => {
  const recommendations = [];
  
  if (settings.useSpritesheet) {
    if (settings.spritesheetFrameRate > 30) {
      recommendations.push('Consider reducing frame rate for better performance');
    }
    
    if (settings.pCount > 1000 && settings.spritesheetFrameRate > 20) {
      recommendations.push('High particle count + high frame rate may impact performance');
    }
    
    if (settings.spritesheetRandomStart && settings.pCount > 500) {
      recommendations.push('Random start frames with many particles may cause frame drops');
    }
  }
  
  return recommendations;
};

// ✅ NEW: Utility to merge spritesheet settings into VFX values
export const mergeSpritesheetSettings = (baseSettings, spritesheetSettings) => {
  return {
    ...baseSettings,
    useSpritesheet: true,
    ...spritesheetSettings
  };
};

// Export all utilities as a single object for convenience
export const SpritesheetUtils = {
  getDefaults: getSpritesheetDefaults,
  getAnimationModeValue,
  getPresets: getSpritesheetPresets,
  validate: validateSpritesheetSettings,
  getPerformanceRecommendations,
  merge: mergeSpritesheetSettings
};