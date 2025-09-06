# VFX Engine Animation Trigger Data Flow

## Overview

This document details the specific data flow for the two main animation triggers in the VFX Engine:
1. **"Fire Current Settings!" Button** - Immediate VFX animation trigger
2. **Timeline Play Button** - Timeline-driven parameter animation

## Complete Animation Trigger Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ANIMATION TRIGGER SYSTEM                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               USER INTERACTIONS                                        │
│                                                                                         │
│  ┌─────────────────────────────────┐    ┌─────────────────────────────────────────┐  │
│  │     "Fire Current Settings!"    │    │        Timeline Play Button            │  │
│  │           Button                │    │      (AnimationTimeline.jsx)           │  │
│  │                                 │    │                                         │  │
│  │  📍 Location:                   │    │  📍 Location:                           │  │
│  │  TimelineController.jsx         │    │  AnimationTimeline.jsx                  │  │
│  │  useControls("🚀 VFX Actions")  │    │  <button onClick={play}>▶</button>      │  │
│  │                                 │    │                                         │  │
│  │  🎯 Purpose:                    │    │  🎯 Purpose:                            │  │
│  │  Trigger immediate VFX          │    │  Start timeline parameter animation     │  │
│  │  animation with current params  │    │  over time duration                     │  │
│  └─────────────────────────────────┘    └─────────────────────────────────────────┘  │
│              │                                             │                          │
│              ▼                                             ▼                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TRIGGER PROCESSING                                        │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                    FIRE CURRENT SETTINGS FLOW                                  │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     Button Click Handler                                │  │  │
│  │  │                                                                         │  │  │
│  │  │  'Fire Current Settings!': button(() => {                              │  │  │
│  │  │    const mode = allVfxControls.useSpritesheet ? 'Spritesheet' :        │  │  │
│  │  │                 allVfxControls.tornadoEnabled ? 'Tornado' : 'Standard'; │  │  │
│  │  │    console.log(`🚀 Firing VFX animation (${mode} mode)`);              │  │  │
│  │  │                                                                         │  │  │
│  │  │    // 🔥 KEY TRIGGER: Add trigger flag to combined values              │  │  │
│  │  │    const combinedValues = {                                            │  │  │
│  │  │      ...vfxValues,        // Transform parameters                      │  │  │
│  │  │      ...allVfxControls,   // All VFX effect parameters                │  │  │
│  │  │      trigger: true        // ⭐ ANIMATION TRIGGER FLAG                │  │  │
│  │  │    };                                                                  │  │  │
│  │  │                                                                         │  │  │
│  │  │    // Auto-reset trigger after brief moment                           │  │  │
│  │  │    setTimeout(() => {                                                  │  │  │
│  │  │      const resetValues = { ...combinedValues, trigger: false };       │  │  │
│  │  │    }, 100);                                                            │  │  │
│  │  │  })                                                                    │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                        │                                       │  │
│  │                                        ▼                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Data Combination                                     │  │  │
│  │  │                                                                         │  │  │
│  │  │  allVfxValues = useMemo(() => ({                                       │  │  │
│  │  │    // Transform properties from timeline                               │  │  │
│  │  │    ...vfxValues,                                                       │  │  │
│  │  │    // All VFX effect parameters                                        │  │  │
│  │  │    ...allVfxControls,                                                  │  │  │
│  │  │    // Including the trigger flag                                       │  │  │
│  │  │    trigger: combinedValues.trigger                                     │  │  │
│  │  │  }), [vfxValues, allVfxControls, combinedValues.trigger]);             │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                      TIMELINE PLAY FLOW                                        │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Play Button Handler                                  │  │  │
│  │  │                                                                         │  │  │
│  │  │  const play = useCallback(() => {                                      │  │  │
│  │  │    if (!timeline || !isInitialized || isPlaying) return;              │  │  │
│  │  │                                                                         │  │  │
│  │  │    // Setup animation loop                                             │  │  │
│  │  │    let startTime = currentTime;                                        │  │  │
│  │  │    if (currentTime >= duration - 100) startTime = 0;                  │  │  │
│  │  │                                                                         │  │  │
│  │  │    setIsPlaying(true);                                                 │  │  │
│  │  │    isPlayingRef.current = true;                                        │  │  │
│  │  │    onPlaybackChange(true); // 🔄 NOTIFY PARENT                        │  │  │
│  │  │                                                                         │  │  │
│  │  │    // Start animation frame loop                                       │  │  │
│  │  │    const animate = (timestamp) => {                                    │  │  │
│  │  │      // Calculate elapsed time and progress                           │  │  │
│  │  │      const elapsed = timestamp - performanceStartTime;                │  │  │
│  │  │      const newTime = startTime + elapsed;                             │  │  │
│  │  │      const progress = Math.min(newTime / duration, 1);                │  │  │
│  │  │                                                                         │  │  │
│  │  │      // 🎯 KEY UPDATE: Set timeline time                              │  │  │
│  │  │      if (timeline && timeline.setTime) {                              │  │  │
│  │  │        timeline.setTime(newTime);                                     │  │  │
│  │  │      }                                                                 │  │  │
│  │  │      setCurrentTime(newTime);                                         │  │  │
│  │  │                                                                         │  │  │
│  │  │      // Continue animation or complete                                │  │  │
│  │  │      if (progress < 1 && isPlayingRef.current) {                      │  │  │
│  │  │        playbackRef.current = requestAnimationFrame(animate);          │  │  │
│  │  │      } else { /* Handle completion */ }                               │  │  │
│  │  │    };                                                                  │  │  │
│  │  │  }, [timeline, isInitialized, currentTime, duration]);                │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                        │                                       │  │
│  │                                        ▼                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                   Timeline Callbacks                                   │  │  │
│  │  │                                                                         │  │  │
│  │  │  timelineInstance.onTimeChanged((event) => {                          │  │  │
│  │  │    const time = event.time || 0;                                      │  │  │
│  │  │    setCurrentTime(time);                                              │  │  │
│  │  │    onTimeChange(time); // 🔄 NOTIFY PARENT                           │  │  │
│  │  │                                                                         │  │  │
│  │  │    // 🎯 KEY INTERPOLATION: Calculate values at current time          │  │  │
│  │  │    const interpolated = interpolateValuesAtTime(time, model);          │  │  │
│  │  │    onLevaUpdate(interpolated); // 🚀 SEND TO TIMELINE CONTROLLER     │  │  │
│  │  │  });                                                                   │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│                                        ▼                                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            TIMELINECONTROLLER PROCESSING                               │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          Data Reception & Handling                             │  │
│  │                                                                                 │  │
│  │  ┌─────────────────────────────────┐    ┌─────────────────────────────────┐  │  │
│  │  │     From Fire Button           │    │      From Timeline Play         │  │  │
│  │  │                                 │    │                                 │  │  │
│  │  │  allVfxValues = {              │    │  handleLevaUpdate = useCallback │  │  │
│  │  │    ...vfxValues,               │    │  ((interpolated) => {           │  │  │
│  │  │    ...allVfxControls,          │    │    if (!interpolated) return;   │  │  │
│  │  │    trigger: true  // 🔥        │    │                                 │  │  │
│  │  │  }                             │    │    // 🎯 APPLY INTERPOLATED    │  │  │
│  │  │                                 │    │    // VALUES TO LEVA CONTROLS  │  │  │
│  │  │  ▼ Passed to VfxEngine         │    │    const levaUpdates = {};     │  │  │
│  │  │                                 │    │                                 │  │  │
│  │  │                                 │    │    Object.entries(interpolated)│  │  │
│  │  │                                 │    │    .forEach(([key, value]) => {│  │  │
│  │  │                                 │    │      if (parameterMapping[key])│  │  │
│  │  │                                 │    │        levaUpdates[key] = value;│  │  │
│  │  │                                 │    │    });                         │  │  │
│  │  │                                 │    │                                 │  │  │
│  │  │                                 │    │    setVfxValues(levaUpdates);  │  │  │
│  │  │                                 │    │  }, [setVfxValues, parameterM]);│  │  │
│  │  └─────────────────────────────────┘    └─────────────────────────────────┘  │  │
│  │                 │                                         │                    │  │
│  │                 └──────────────────┬──────────────────────┘                    │  │
│  │                                    │                                           │  │
│  │                                    ▼                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      Combined Values Creation                          │  │  │
│  │  │                                                                         │  │  │
│  │  │  // ✅ ENHANCED: Final combined values for VfxEngine                  │  │  │
│  │  │  const allVfxValues = useMemo(() => ({                                 │  │  │
│  │  │    // Transform values (from timeline or manual controls)             │  │  │
│  │  │    ...vfxValues,                                                       │  │  │
│  │  │    // All VFX effect parameters                                        │  │  │
│  │  │    ...allVfxControls,                                                  │  │  │
│  │  │    // Trigger flag (if from Fire button)                              │  │  │
│  │  │    trigger: triggerState                                               │  │  │
│  │  │  }), [vfxValues, allVfxControls, triggerState]);                       │  │  │
│  │  │                                                                         │  │  │
│  │  │  // 🚀 CRITICAL: Pass to VfxEngine                                    │  │  │
│  │  │  <VfxEngine                                                            │  │  │
│  │  │    allVfxValues={allVfxValues}                                         │  │  │
│  │  │    sprites={sprites}                                                   │  │  │
│  │  │    onComplete={() => console.log('VFX animation completed')}          │  │  │
│  │  │  />                                                                    │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│                                        ▼                                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               VFX ENGINE PROCESSING                                    │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                           Props Reception                                       │  │
│  │                                                                                 │  │
│  │  const VfxEngine = ({                                                          │  │
│  │    // Individual props (fallback)                                              │  │
│  │    positionX = 0, positionY = 0, positionZ = 0,                               │  │
│  │    rotationX = 0, rotationY = 0, rotationZ = 0,                               │  │
│  │    scale = 1, opacity = 1.0,                                                  │  │
│  │    // ... all other VFX parameters                                            │  │
│  │                                                                                 │  │
│  │    // 🎯 PRIMARY DATA SOURCE                                                  │  │
│  │    allVfxValues = null  // ⭐ Combined values from TimelineController         │  │
│  │  }) => {                                                                       │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                        Effective Values Calculation                            │  │
│  │                                                                                 │  │
│  │  // ✅ ENHANCED: Include spritesheet values in effectiveValues                │  │
│  │  const effectiveValues = useMemo(() => {                                      │  │
│  │    // 🎯 PRIORITY: Use allVfxValues if provided (from TimelineController)     │  │
│  │    if (allVfxValues) {                                                         │  │
│  │      return allVfxValues; // 🚀 CONTAINS TRIGGER FLAG + ALL PARAMETERS       │  │
│  │    }                                                                           │  │
│  │                                                                                 │  │
│  │    // Fallback: Use individual props                                          │  │
│  │    return {                                                                    │  │
│  │      positionX, positionY, positionZ, rotationX, rotationY, rotationZ,       │  │
│  │      scale, opacity, color, colorEnd, useGradient, blendMode,                │  │
│  │      pCount, duration, pSize, spread, pAge, gravity,                         │  │
│  │      // ... all other parameters including spritesheet + tornado             │  │
│  │    };                                                                          │  │
│  │  }, [allVfxValues, /* ...all individual prop dependencies */]);               │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          Animation Trigger Detection                           │  │
│  │                                                                                 │  │
│  │  // 🔥 CRITICAL: Handle animation triggers                                    │  │
│  │  useEffect(() => {                                                             │  │
│  │    if (effectiveValues.trigger) {                                             │  │
│  │      console.log('🚀 VfxEngine: Animation trigger fired',                     │  │
│  │        effectiveValues.useSpritesheet ? '(Spritesheet mode)' :                │  │
│  │        effectiveValues.tornadoEnabled ? '(Tornado mode)' : ''                 │  │
│  │      );                                                                        │  │
│  │                                                                                 │  │
│  │      // 🎯 START ANIMATION                                                    │  │
│  │      setIsPlaying(true);                                                      │  │
│  │      startTimeRef.current = performance.now() / 1000;                        │  │
│  │    }                                                                           │  │
│  │  }, [effectiveValues.trigger, effectiveValues.useSpritesheet,                │  │
│  │      effectiveValues.tornadoEnabled]);                                        │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                            Material Uniforms Update                            │  │
│  │                                                                                 │  │
│  │  // ✅ ENHANCED: Material uniforms with spritesheet support                  │  │
│  │  useEffect(() => {                                                             │  │
│  │    if (!materialRef.current) return;                                          │  │
│  │                                                                                 │  │
│  │    const material = materialRef.current;                                      │  │
│  │                                                                                 │  │
│  │    // 🎨 BASIC UNIFORMS                                                      │  │
│  │    material.uniforms.uSize.value = effectiveValues.pSize || 0.4;             │  │
│  │    material.uniforms.uColor.value = new THREE.Color(                         │  │
│  │      effectiveValues.color || '#ff6030'                                       │  │
│  │    );                                                                          │  │
│  │    material.uniforms.uColorEnd.value = new THREE.Color(                      │  │
│  │      effectiveValues.colorEnd || '#ff0030'                                    │  │
│  │    );                                                                          │  │
│  │                                                                                 │  │
│  │    // ⚡ PHYSICS UNIFORMS                                                    │  │
│  │    material.uniforms.uGravity.value = effectiveValues.gravity || 0;          │  │
│  │    material.uniforms.uTurbulence.value = effectiveValues.turbulence || 0;    │  │
│  │    material.uniforms.uDirectionalForce.value.set(                            │  │
│  │      effectiveValues.directionalForceX || 0,                                 │  │
│  │      effectiveValues.directionalForceY || 0,                                 │  │
│  │      effectiveValues.directionalForceZ || 0                                  │  │
│  │    );                                                                          │  │
│  │                                                                                 │  │
│  │    // 🎬 SPRITESHEET UNIFORMS                                               │  │
│  │    material.uniforms.uUseSpritesheet.value =                                 │  │
│  │      effectiveValues.useSpritesheet ? 1.0 : 0.0;                            │  │
│  │    material.uniforms.uFrameRate.value =                                      │  │
│  │      effectiveValues.spritesheetFrameRate || 24;                             │  │
│  │                                                                                 │  │
│  │    // 🌪️ TORNADO UNIFORMS                                                  │  │
│  │    material.uniforms.uTornadoEnabled.value =                                 │  │
│  │      effectiveValues.tornadoEnabled ? 1.0 : 0.0;                            │  │
│  │    material.uniforms.uTornadoHeight.value =                                  │  │
│  │      effectiveValues.tornadoHeight || 8.0;                                   │  │
│  │    // ... more tornado parameters                                            │  │
│  │                                                                                 │  │
│  │    // 🖼️ TEXTURE SELECTION (Enhanced priority system)                      │  │
│  │    if (effectiveValues.useSpritesheet && spritesheets.length > 0) {          │  │
│  │      // Use animated spritesheet                                             │  │
│  │      const spritesheet = getSpritesheetByName(                               │  │
│  │        effectiveValues.spritesheetName                                        │  │
│  │      );                                                                       │  │
│  │      if (spritesheet) {                                                       │  │
│  │        material.uniforms.uTexture.value = spritesheet.texture;              │  │
│  │        material.uniforms.uFramesX.value = spritesheet.framesX;              │  │
│  │        material.uniforms.uFramesY.value = spritesheet.framesY;              │  │
│  │        material.uniforms.uTotalFrames.value = spritesheet.totalFrames;      │  │
│  │      }                                                                        │  │
│  │    } else {                                                                   │  │
│  │      // Use static texture (sprites or basic particles)                     │  │
│  │      // Priority: Extended sprites → Basic particles                        │  │
│  │    }                                                                          │  │
│  │                                                                                 │  │
│  │    material.needsUpdate = true;                                               │  │
│  │  }, [effectiveValues, canvasSize, textures, sprites, spritesheets]);         │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              Animation Loop                                    │  │
│  │                                                                                 │  │
│  │  // 🔄 MAIN ANIMATION LOOP                                                    │  │
│  │  useFrame((state) => {                                                        │  │
│  │    if (!materialRef.current) return;                                          │  │
│  │                                                                                 │  │
│  │    const elapsedTime = state.clock.elapsedTime;                               │  │
│  │                                                                                 │  │
│  │    if (isPlaying) {                                                            │  │
│  │      // 🎯 PLAYING MODE: Calculate animation progress                         │  │
│  │      const animationTime = elapsedTime -                                      │  │
│  │        (startTimeRef.current - performance.now() / 1000 +                    │  │
│  │         state.clock.elapsedTime);                                             │  │
│  │      const progress = Math.min(                                               │  │
│  │        animationTime / (effectiveValues.duration || 3.0), 1                  │  │
│  │      );                                                                        │  │
│  │                                                                                 │  │
│  │      // 🚀 UPDATE SHADER UNIFORMS                                            │  │
│  │      materialRef.current.uniforms.uProgress.value = progress;                │  │
│  │      materialRef.current.uniforms.uTime.value = elapsedTime;                 │  │
│  │                                                                                 │  │
│  │      // ✅ COMPLETE ANIMATION                                                 │  │
│  │      if (progress >= 1) {                                                     │  │
│  │        setIsPlaying(false);                                                   │  │
│  │        if (onComplete) onComplete();                                          │  │
│  │        console.log('🏁 VFX animation completed');                             │  │
│  │      }                                                                         │  │
│  │    } else {                                                                    │  │
│  │      // 🎨 DESIGN MODE: Show static preview                                  │  │
│  │      const designProgress = effectiveValues.useSpritesheet ? 0.5 :           │  │
│  │                            effectiveValues.tornadoEnabled ? 0.5 : 0.3;       │  │
│  │      materialRef.current.uniforms.uProgress.value = designProgress;          │  │
│  │      materialRef.current.uniforms.uTime.value = elapsedTime;                 │  │
│  │    }                                                                           │  │
│  │  });                                                                           │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│                                        ▼                                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                GPU SHADER RENDERING                                    │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              Vertex Shader                                     │  │
│  │                                                                                 │  │
│  │  // Receives uniforms updated from VfxEngine                                  │  │
│  │  uniform float uProgress;     // Animation progress (0.0 - 1.0)               │  │
│  │  uniform float uTime;         // Global elapsed time                          │  │
│  │  uniform float uSize;         // Particle size                                │  │
│  │  uniform float uGravity;      // Physics: gravity                             │  │
│  │  uniform float uTurbulence;   // Physics: turbulence                          │  │
│  │  uniform vec3 uDirectionalForce; // Physics: directional forces              │  │
│  │                                                                                 │  │
│  │  // Spritesheet uniforms                                                      │  │
│  │  uniform float uUseSpritesheet;    // Enable/disable spritesheet             │  │
│  │  uniform float uFrameRate;         // Animation frame rate                   │  │
│  │  uniform float uAnimationMode;     // once/loop/ping-pong                    │  │
│  │                                                                                 │  │
│  │  // Tornado uniforms                                                          │  │
│  │  uniform float uTornadoEnabled;    // Enable/disable tornado                 │  │
│  │  uniform float uTornadoHeight;     // Tornado height                         │  │
│  │  uniform float uVerticalSpeed;     // Vertical movement speed                │  │
│  │  uniform float uRotationSpeed;     // Rotation speed                         │  │
│  │  uniform float uVortexStrength;    // Vortex pull strength                   │  │
│  │                                                                                 │  │
│  │  void main() {                                                                │  │
│  │    // 🎯 VERTEX POSITION CALCULATION                                         │  │
│  │    vec3 pos = position;                                                       │  │
│  │                                                                                 │  │
│  │    // Apply physics forces                                                    │  │
│  │    pos.y += uGravity * uProgress * uProgress;                                │  │
│  │    pos += uDirectionalForce * uProgress;                                     │  │
│  │                                                                                 │  │
│  │    // Apply tornado effects if enabled                                       │  │
│  │    if (uTornadoEnabled > 0.5) {                                              │  │
│  │      float spiralAngle = uTime * uRotationSpeed + aHeightFactor * 10.0;     │  │
│  │      float radius = mix(uBaseDiameter, uTopDiameter, aHeightFactor);        │  │
│  │      pos.x += cos(spiralAngle) * radius * uVortexStrength;                  │  │
│  │      pos.z += sin(spiralAngle) * radius * uVortexStrength;                  │  │
│  │      pos.y += aHeightFactor * uTornadoHeight * uProgress;                   │  │
│  │    }                                                                          │  │
│  │                                                                                 │  │
│  │    // Apply turbulence                                                       │  │
│  │    pos += noise(pos + uTime) * uTurbulence;                                  │  │
│  │                                                                                 │  │
│  │    // Calculate final size                                                   │  │
│  │    float finalSize = uSize * aSize * (1.0 - uProgress * 0.5);               │  │
│  │    gl_PointSize = finalSize;                                                 │  │
│  │                                                                                 │  │
│  │    // Transform position                                                     │  │
│  │    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);       │  │
│  │  }                                                                            │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                             Fragment Shader                                    │  │
│  │                                                                                 │  │
│  │  uniform sampler2D uTexture;       // Particle texture                       │  │
│  │  uniform vec3 uColor;              // Start color                            │  │
│  │  uniform vec3 uColorEnd;           // End color                              │  │
│  │  uniform float uUseGradient;       // Color gradient flag                    │  │
│  │  uniform float uOpacity;           // Overall opacity                        │  │
│  │                                                                                 │  │
│  │  // Spritesheet uniforms                                                     │  │
│  │  uniform float uFramesX;           // Horizontal frame count                 │  │
│  │  uniform float uFramesY;           // Vertical frame count                   │  │
│  │  uniform float uTotalFrames;       // Total frame count                      │  │
│  │                                                                                 │  │
│  │  void main() {                                                               │  │
│  │    vec2 uv = gl_PointCoord;                                                  │  │
│  │                                                                                 │  │
│  │    // 🎬 SPRITESHEET UV CALCULATION                                         │  │
│  │    if (uUseSpritesheet > 0.5) {                                             │  │
│  │      // Calculate current frame based on progress and frame rate            │  │
│  │      float frameIndex = floor(uProgress * uTotalFrames * uFrameRate / 30.0);│  │
│  │                                                                                 │  │
│  │      // Handle animation modes                                              │  │
│  │      if (uAnimationMode < 0.5) {        // once                            │  │
│  │        frameIndex = clamp(frameIndex, 0.0, uTotalFrames - 1.0);            │  │
│  │      } else if (uAnimationMode < 1.5) { // loop                            │  │
│  │        frameIndex = mod(frameIndex, uTotalFrames);                         │  │
│  │      } else {                            // ping-pong                       │  │
│  │        float cycle = frameIndex / (uTotalFrames * 2.0 - 2.0);              │  │
│  │        float t = fract(cycle) * (uTotalFrames * 2.0 - 2.0);                │  │
│  │        frameIndex = t < uTotalFrames ? t : (uTotalFrames * 2.0 - 2.0 - t); │  │
│  │      }                                                                      │  │
│  │                                                                                 │  │
│  │      // Calculate UV coordinates for current frame                          │  │
│  │      float frameX = mod(frameIndex, uFramesX);                              │  │
│  │      float frameY = floor(frameIndex / uFramesX);                           │  │
│  │                                                                                 │  │
│  │      uv.x = (uv.x + frameX) / uFramesX;                                     │  │
│  │      uv.y = (uv.y + frameY) / uFramesY;                                     │  │
│  │    }                                                                         │  │
│  │                                                                                 │  │
│  │    // 🎨 SAMPLE TEXTURE                                                     │  │
│  │    vec4 textureColor = texture2D(uTexture, uv);                             │  │
│  │                                                                                 │  │
│  │    // 🌈 APPLY COLOR GRADIENT                                               │  │
│  │    vec3 finalColor;                                                          │  │
│  │    if (uUseGradient > 0.5) {                                                │  │
│  │      finalColor = mix(uColor, uColorEnd, uProgress);                        │  │
│  │    } else {                                                                  │  │
│  │      finalColor = uColor;                                                   │  │
│  │    }                                                                         │  │
│  │                                                                                 │  │
│  │    // 👻 APPLY OPACITY                                                      │  │
│  │    float alpha = textureColor.a * uOpacity * (1.0 - uProgress);             │  │
│  │                                                                                 │  │
│  │    gl_FragColor = vec4(finalColor * textureColor.rgb, alpha);               │  │
│  │  }                                                                           │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                               │
│                                        ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              Final Rendering                                   │  │
│  │                                                                                 │  │
│  │  🖥️ GPU renders particles with:                                               │  │
│  │  • Animated positions (physics, tornado, turbulence)                          │  │
│  │  • Dynamic sizes and colors                                                   │  │
│  │  • Spritesheet animation (if enabled)                                         │  │
│  │  • Blend modes (additive, normal, multiply, subtractive)                      │  │
│  │  • Real-time progress-based effects                                           │  │
│  │                                                                                 │  │
│  │  📺 Visual Result:                                                            │  │
│  │  • Explosion/tornado/particle effects                                         │  │
│  │  • Smooth animations over time                                                │  │
│  │  • Interactive parameter changes                                              │  │
│  │  • Timeline-driven or immediate triggers                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Animation Trigger Comparison

| Aspect | Fire Current Settings! | Timeline Play |
|--------|----------------------|---------------|
| **Trigger Source** | Button click in TimelineController | Play button in AnimationTimeline |
| **Data Source** | Current Leva control values | Timeline keyframes + interpolation |
| **Duration** | Fixed duration from `effectiveValues.duration` | Timeline total duration |
| **Parameter Change** | Static values throughout animation | Dynamic interpolated values |
| **Animation Type** | Single VFX burst/effect | Transform + VFX parameter animation |
| **Trigger Mechanism** | `trigger: true` flag | Timeline time progression |
| **State Management** | Temporary trigger flag | Timeline playback state |

## Key Technical Details

### Fire Current Settings Flow:
1. **Button Click** → Combines `vfxValues` + `allVfxControls` + `trigger: true`
2. **Data Pass** → `allVfxValues` sent to VfxEngine
3. **Trigger Detection** → `useEffect` detects `effectiveValues.trigger`
4. **Animation Start** → `setIsPlaying(true)` + `startTimeRef` reset
5. **Progress Calculation** → `uProgress` uniform drives animation
6. **Auto-Complete** → Animation stops when `progress >= 1`

### Timeline Play Flow:
1. **Play Button** → Starts timeline animation loop
2. **Time Progression** → `timeline.setTime()` advances time
3. **Interpolation** → `interpolateValuesAtTime()` calculates current values
4. **Leva Update** → `handleLevaUpdate()` applies values to controls
5. **Combined Values** → Updated controls flow to VfxEngine
6. **Real-time Animation** → Parameters change continuously during playback

### Critical Data Paths:
- **Immediate Trigger**: `Button` → `trigger: true` → `VfxEngine` → `GPU`
- **Timeline Trigger**: `Play` → `Interpolation` → `Leva Controls` → `VfxEngine` → `GPU`
- **Shader Updates**: `Uniforms` → `Vertex Shader` → `Fragment Shader` → `Rendering`

This system enables both immediate VFX bursts and complex timeline-based animations with the same underlying rendering engine!
