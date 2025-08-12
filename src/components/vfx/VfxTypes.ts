// ✅ TypeScript interfaces to prevent prop mismatches
// This matches the VfxParameters.js structure for complete type safety

export interface VfxTransform {
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

export interface VfxParticles {
  particleCount: number;
  animationDuration: number;
  particleSize: number;
  spreadRadius: number;
  particleAge: number;
}

export interface VfxVisual {
  color: string;
  colorEnd: string;
  useGradient: boolean;
  opacity: number;
  blendMode: number;
}

export interface VfxPhysics {
  gravity: number;
  directionalForceX: number;
  directionalForceY: number;
  directionalForceZ: number;
  turbulence: number;
  streakLength: number;
}

export interface VfxShape {
  shape: VfxShapeType;
  shapeHeight: number;
  shapeAngle: number;
  heightMultiplier: number;
  sizeVariation: number;
  timeVariation: number;
}

export interface VfxAnimation {
  animationPreset: string;
  particleTexture: string;
  motionBlur: boolean;
}

// ✅ NEW: System/Control parameters interface
export interface VfxSystem {
  trigger: boolean;
  timelineActive: boolean;
  isTimelinePlaying: boolean;
  currentTime: number;
}

// ✅ NEW: Timeline-specific data structure
export interface VfxTimelineData {
  values: Record<string, any>;
  isPlaying: boolean;
  currentTime: number;
  duration?: number;
}

// ✅ NEW: Individual parameter definition for validation
export interface VfxParameterDefinition {
  value: any;
  min?: number;
  max?: number;
  step?: number;
  timelineName?: string;
  group: 'transform' | 'particles' | 'visual' | 'physics' | 'shape' | 'animation' | 'system';
  displayName: string;
  color?: string;
  strokeColor?: string;
  controlType?: 'range' | 'color' | 'boolean' | 'select';
  options?: string[] | Record<string, any>;
}

// ✅ NEW: Complete VFX state (all parameters combined)
export interface VfxState extends VfxTransform, VfxParticles, VfxVisual, VfxPhysics, VfxShape, VfxAnimation, VfxSystem {}

// ✅ NEW: Animatable parameters only (for timeline)
export interface VfxAnimatableState {
  // Transform (9 params)
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  
  // Core VFX (6 params)
  particleCount: number;
  particleSize: number;
  spreadRadius: number;
  opacity: number;
  gravity: number;
  animationDuration: number;
}

// ✅ Main VfxEngine props interface - EXPANDED
export interface VfxEngineProps {
  // Core props
  isActive?: boolean;
  position?: [number, number, number];
  scale?: number;
  onComplete?: () => void;
  trigger?: boolean;
  
  // ✅ NEW: Grouped VFX props (clean interface)
  vfxTransform?: VfxTransform;
  vfxParticles?: VfxParticles;
  vfxVisual?: VfxVisual;
  vfxPhysics?: VfxPhysics;
  vfxShape?: VfxShape;
  vfxAnimation?: VfxAnimation;
  vfxSystem?: VfxSystem;
  
  // Timeline props
  timelineActive?: boolean;
  timelineData?: VfxTimelineData;
  timelineInterpolation?: boolean;
  
  // ✅ Timeline control props (from R3F pattern)
  vfxValues?: VfxState;
  setVfxValues?: (values: VfxState) => void;
  isPlayingRef?: React.MutableRefObject<boolean>;
  timelineDrivenRef?: React.MutableRefObject<boolean>;
  prevUserValuesRef?: React.MutableRefObject<VfxState>;
  targetVfxRef?: React.MutableRefObject<any>;
  isPlaying?: boolean;
  
  // ✅ Control props
  showControls?: boolean;
  showTimeline?: boolean;
  
  // ✅ LEGACY: Individual props for backward compatibility during transition
  particleCount?: number;
  animationDuration?: number;
  particleSize?: number;
  spreadRadius?: number;
  particleAge?: number;
  color?: string;
  colorEnd?: string;
  useGradient?: boolean;
  opacity?: number;
  blendMode?: number;
  gravity?: number;
  directionalForceX?: number;
  directionalForceY?: number;
  directionalForceZ?: number;
  turbulence?: number;
  streakLength?: number;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  shape?: string;
  shapeHeight?: number;
  shapeAngle?: number;
  heightMultiplier?: number;
  sizeVariation?: number;
  timeVariation?: number;
  animationPreset?: string;
  particleTexture?: string;
  motionBlur?: boolean;
}

// ✅ TimelineLevaController props interface
export interface TimelineLevaControllerProps {
  visible?: boolean;
  onVfxUpdate: (values: Partial<VfxState>) => void;
  vfxActive?: boolean;
}

// ✅ AnimationTimeline props interface
export interface AnimationTimelineProps {
  visible?: boolean;
  duration?: number;
  onTimeChange?: (time: number) => void;
  onKeyframeChange?: (event: any) => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
  vfxValues?: VfxState;
  onLevaUpdate?: (values: any) => void;
  className?: string;
  initialModel?: any;
  normalizeFunctions?: any;
  parameterMapping?: any;
  triggerControls?: any;
  onVfxUpdate?: (values: any) => void;
}

// ✅ App.jsx state interface
export interface AppState {
  vfxActive: boolean;
  showTimelineControls: boolean;
  vfxParameters: VfxState;
  vfxValues: VfxState;
}

// ✅ Parameter validation result
export interface VfxValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ✅ VFX preset format
export interface VfxPreset {
  version: string;
  timestamp: number;
  metadata: {
    name?: string;
    description?: string;
    animatableParams: number;
    totalParams: number;
  };
  vfxState: VfxState;
  animationKeyframes?: Record<string, any>;
}

// ✅ Keyframe data structure
export interface VfxKeyframe {
  parameter: string;
  value: number;
  time: number;
  timestamp: number;
}

// ✅ Timeline model structure
export interface VfxTimelineModel {
  rows: VfxTimelineRow[];
}

export interface VfxTimelineRow {
  name: string;
  displayName: string;
  keyframes: VfxKeyframe[];
  style: {
    fillStyle: string;
    strokeColor: string;
    height: number;
  };
  _levaKey?: string;
  _min?: number;
  _max?: number;
  _group?: string;
}

// ✅ Normalization functions type
export interface VfxNormalizeFunctions {
  normalize: Record<string, (value: number) => number>;
  denormalize: Record<string, (normalizedValue: number) => number>;
}

// ✅ Parameter mapping type
export interface VfxParameterMapping {
  timelineToLeva: Record<string, string>;
  levaToTimeline: Record<string, string>;
}

// ✅ Parameter summary for debugging
export interface VfxParameterSummary {
  animatableCount: number;
  nonAnimatableCount: number;
  totalCount: number;
  groups: Record<string, number>;
  timelineTracks: number;
}

// ✅ Utility types for better type safety
export type VfxParameterGroup = 'transform' | 'particles' | 'visual' | 'physics' | 'shape' | 'animation' | 'system';

export type VfxBlendMode = 0 | 1 | 2 | 3; // Additive, Normal, Multiply, Subtractive

export type VfxShapeType = 'explosion' | 'sphere' | 'box' | 'cone' | 'circle' | 'square' | 'spiral' | 'wave';

export type VfxAnimationPreset = 'none' | 'orbital' | 'wave' | 'spiral' | 'bounce' | 'shockwave';

export type VfxParticleTexture = 'Circle' | 'Heart' | 'Point' | 'Point Cross' | 'Point Cross 2' | 'Ring' | 'Star' | 'Star 2';

// ✅ Helper function types
export type VfxParameterValidator = (values: Partial<VfxState>) => VfxValidationResult;

export type VfxPresetLoader = (presetData: any) => VfxPreset;

export type VfxPresetSaver = (vfxState: VfxState, timelineKeyframes?: any) => VfxPreset;

// ✅ Event handler types
export type VfxUpdateHandler = (values: Partial<VfxState>) => void;

export type VfxCompleteHandler = () => void;

export type VfxTimelineHandler = (timelineData: VfxTimelineData) => void;

// ✅ Default export for easy importing
export default VfxEngineProps;