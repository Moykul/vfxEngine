// Minimal defaults isolated from VfxParameters to avoid encoding issues

export const getDefaultVfxValues = () => ({
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
});

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
};
