// ✅ SIMPLIFIED: Only 8 Core Animatable Parameters (no complex mapping)

export const ANIMATABLE_VFX_PARAMS = {
  // Transform (7 params)
  positionX: { 
    value: 0, min: -10, max: 10, step: 0.1,
    timelineName: 'positionX',
    displayName: '📍 Position X'
  },
  positionY: { 
    value: 0, min: -10, max: 10, step: 0.1,
    timelineName: 'positionY',
    displayName: '📍 Position Y'
  },
  positionZ: { 
    value: 0, min: -10, max: 10, step: 0.1,
    timelineName: 'positionZ',
    displayName: '📍 Position Z'
  },
  rotationX: {
    value: 0, min: 0, max: 360, step: 1,
    timelineName: 'rotationX',
    displayName: '🔄 Rotation X'
  },
  rotationY: {
    value: 0, min: 0, max: 360, step: 1,
    timelineName: 'rotationY',
    displayName: '🔄 Rotation Y'
  },
  rotationZ: {
    value: 0, min: 0, max: 360, step: 1,
    timelineName: 'rotationZ',
    displayName: '🔄 Rotation Z'
  },
  scale: {
    value: 1, min: 0.1, max: 5, step: 0.1,
    timelineName: 'scale',
    displayName: '📏 Scale'
  },

  // Visual (1 param)
  opacity: {
    value: 1.0, min: 0.0, max: 1.0, step: 0.1,
    timelineName: 'opacity',
    displayName: '👻 Opacity'
  }
};

// Fixed effect settings (not animatable)
export const FIXED_VFX_SETTINGS = {
  pCount: 800,
  duration: 3.0,
  pSize: 0.1,
  spread: 2,
  color: '#30ffcf',
  colorEnd: '#f520bc',
  shape: 'explosion',
  gravity: 0,
  turbulence: 0,
  particleTexture: 'Circle',
  blendMode: 0
};

// ✅ SIMPLIFIED: Helper functions (removed complex logic)
export const getAnimatableParams = () => Object.keys(ANIMATABLE_VFX_PARAMS);

export const getTimelineModel = () => {
  const rows = Object.entries(ANIMATABLE_VFX_PARAMS).map(([key, def]) => ({
    name: def.timelineName,
    displayName: def.displayName,
    keyframes: [],
    style: { 
      fillStyle: '#4f46e5', 
      strokeColor: '#3730a3', 
      height: 21 
    }
  }));

  return { rows };
};

// ✅ SIMPLIFIED: Direct value functions (no complex normalize/denormalize)
export const createNormalizeFunctions = () => {
  const normalize = {};
  const denormalize = {};
  
  Object.entries(ANIMATABLE_VFX_PARAMS).forEach(([levaKey, def]) => {
    const timelineName = def.timelineName;
    const range = def.max - def.min;
    
    // Simple normalize: convert value to 0-1 range
    normalize[timelineName] = (value) => (value - def.min) / range;
    
    // Simple denormalize: convert 0-1 back to value range
    denormalize[timelineName] = (normalizedValue) => def.min + (normalizedValue * range);
  });
  
  return { normalize, denormalize };
};

export const createParameterMapping = () => {
  const timelineToLeva = {};
  const levaToTimeline = {};
  
  Object.entries(ANIMATABLE_VFX_PARAMS).forEach(([levaKey, def]) => {
    timelineToLeva[def.timelineName] = levaKey;
    levaToTimeline[levaKey] = def.timelineName;
  });
  
  return { timelineToLeva, levaToTimeline };
};

// ✅ SIMPLIFIED: All default values in one place
export const getDefaultVfxValues = () => {
  return {
    // Transform parameters (animatable)
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    opacity: 1.0,
    
    // Color parameters
    color: '#9eff30',
    colorEnd: '#00eeff',
    useGradient: false,
    blendMode: 0,
    
    // Basic properties
    pCount: 800,
    duration: 3.0,
    pSize: 0.1,
    spread: 2,
    pAge: 1.0,
    
    // Physics parameters
    gravity: 0,
    directionalForceX: 0,
    directionalForceY: 0,
    directionalForceZ: 0,
    turbulence: 0,
    streakLength: 0,
    
    // Shape parameters
    shape: 'cone',
    shapeHeight: 2.0,
    shapeAngle: 0,
    heightMultiplier: 1.0,
    sizeVariation: 0.5,
    timeVariation: 0.4,
    
    // Animation parameters
    animationPreset: 'none',
    particleTexture: 'Circle',
    motionBlur: false
  };
};