export const ANIMATABLE_VFX_PARAMS = {
  // Transform (7 params)
  positionX: {
    value: 0, min: -10, max: 10, step: 0.1,
    timelineName: 'positionX',
    displayName: 'Position X'
  },
  positionY: {
    value: 0, min: -10, max: 10, step: 0.1,
    timelineName: 'positionY',
    displayName: 'Position Y'
  },
  positionZ: {
    value: 0, min: -10, max: 10, step: 0.1,
    timelineName: 'positionZ',
    displayName: 'Position Z'
  },
  rotationX: {
    value: 0, min: 0, max: 360, step: 1,
    timelineName: 'rotationX',
    displayName: 'Rotation X'
  },
  rotationY: {
    value: 0, min: 0, max: 360, step: 1,
    timelineName: 'rotationY',
    displayName: 'Rotation Y'
  },
  rotationZ: {
    value: 0, min: 0, max: 360, step: 1,
    timelineName: 'rotationZ',
    displayName: 'Rotation Z'
  },
  scale: {
    value: 1, min: 0.1, max: 5, step: 0.1,
    timelineName: 'scale',
    displayName: 'Scale'
  },

  // Visual (1 param)
  opacity: {
    value: 1.0, min: 0.0, max: 1.0, step: 0.1,
    timelineName: 'opacity',
    displayName: 'Opacity'
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
  blendMode: 0,
  
  // === TORNADO SETTINGS ===
  tornadoEnabled: false,
  tornadoHeight: 8.0,
  verticalSpeed: 1.0,
  rotationSpeed: 1.0,
  vortexStrength: 1.0,
  spiralSpin: 2.0,
  baseDiameter: 0.5,
  topDiameter: 3.0,
  heightColorGradient: false
};

// Helper functions (removed complex logic)
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

export const createNormalizeFunctions = () => {
  const normalize = {};
  const denormalize = {};

  Object.entries(ANIMATABLE_VFX_PARAMS).forEach(([levaKey, def]) => {
    // Validate parameter definition
    if (!def || typeof def.min !== 'number' || typeof def.max !== 'number' || !def.timelineName) {
      console.warn('Invalid parameter definition for ' + levaKey + ':', def);
      return;
    }

    const timelineName = def.timelineName;
    const min = def.min;
    const max = def.max;
    const range = (max - min) === 0 ? 1 : (max - min); // avoid zero division

    // Clamp-then-normalize (assumes min < max in our parameter set)
    normalize[timelineName] = (value) => {
      const v = Math.max(min, Math.min(max, value));
      return (v - min) / range;
    };

    // Clamp normalized to [0,1] then denormalize
    denormalize[timelineName] = (t) => {
      const u = Math.max(0, Math.min(1, t));
      return min + u * range;
    };
  });

  return { normalize, denormalize };
};

export const validateVfxParameters = () => {
  const errors = [];
  const warnings = [];

  Object.entries(ANIMATABLE_VFX_PARAMS).forEach(([key, def]) => {
    if (!def) {
      errors.push('Parameter ' + key + ' is undefined');
      return;
    }

    if (typeof def.min !== 'number') {
      errors.push('Parameter ' + key + ' has invalid min value: ' + def.min);
    }

    if (typeof def.max !== 'number') {
      errors.push('Parameter ' + key + ' has invalid max value: ' + def.max);
    }

    if (!def.timelineName || typeof def.timelineName !== 'string') {
      errors.push('Parameter ' + key + ' has invalid timelineName: ' + def.timelineName);
    }

    if (def.min === def.max) {
      warnings.push('Parameter ' + key + ' has min === max (' + def.min + ')');
    }

    if (def.min > def.max) {
      warnings.push('Parameter ' + key + ' has min > max (' + def.min + ' > ' + def.max + ')');
    }
  });

  if (errors.length > 0) {
    console.error('VFX Parameter validation errors:', errors);
  }

  if (warnings.length > 0) {
    console.warn('VFX Parameter validation warnings:', warnings);
  }

  return { errors, warnings, isValid: errors.length === 0 };
};

// Enhanced parameter mapping with validation
export const createParameterMapping = () => {
  const timelineToLeva = {};
  const levaToTimeline = {};

  Object.entries(ANIMATABLE_VFX_PARAMS).forEach(([levaKey, def]) => {
    if (!def || !def.timelineName) {
      console.warn('Skipping invalid parameter mapping for ' + levaKey);
      return;
    }

    timelineToLeva[def.timelineName] = levaKey;
    levaToTimeline[levaKey] = def.timelineName;
  });

  return { timelineToLeva, levaToTimeline };
};

// All default values in one place
export const getVfxValues = () => {
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
    motionBlur: false,

    // === TORNADO PARAMETERS ===
    tornadoEnabled: false,
    tornadoHeight: 8.0,
    verticalSpeed: 1.0,
    rotationSpeed: 1.0,
    vortexStrength: 1.0,
    spiralSpin: 2.0,
    baseDiameter: 0.5,
    topDiameter: 3.0,
    heightColorGradient: false
  };
};