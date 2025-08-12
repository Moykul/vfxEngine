import React, { useState, useCallback, useRef, useMemo, createContext, useContext, useEffect } from 'react';
import { useControls, button } from 'leva';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import AnimationTimeline from './AnimationTimeline';
import VfxEngine from '../vfx/VfxEngine.jsx';
import fileManager from './fileManager';
import { 
  ANIMATABLE_VFX_PARAMS,
  getTimelineModel,
  createNormalizeFunctions,
  createParameterMapping,
  getDefaultVfxValues
} from '../vfx/VfxParameters.js';

// Debug flag
const DEBUG = false;

const TimelineController = () => {
  const defaultValues = useMemo(() => getDefaultVfxValues(), []);
  const [timelineValues, setTimelineValues] = useState({});
  const [isTimelineActive, setIsTimelineActive] = useState(false);

  // ✅ ORGANIZED: Categorized Leva controls for better UX
  const transformControls = useControls("📍 Transform", {
    positionX: { value: defaultValues.positionX, min: -10, max: 10, step: 0.1 },
    positionY: { value: defaultValues.positionY, min: -10, max: 10, step: 0.1 },
    positionZ: { value: defaultValues.positionZ, min: -10, max: 10, step: 0.1 },
    rotationX: { value: defaultValues.rotationX, min: 0, max: 360, step: 1 },
    rotationY: { value: defaultValues.rotationY, min: 0, max: 360, step: 1 },
    rotationZ: { value: defaultValues.rotationZ, min: 0, max: 360, step: 1 },
    scale: { value: defaultValues.scale, min: 0.1, max: 5, step: 0.1 },
    opacity: { value: defaultValues.opacity, min: 0.0, max: 1.0, step: 0.1 }
  });

  const particleControls = useControls("✨ Particles", {
    pCount: { value: defaultValues.pCount, min: 50, max: 2000, step: 10 },
    duration: { value: defaultValues.duration, min: 0.5, max: 10.0, step: 0.1 },
    pSize: { value: defaultValues.pSize, min: 0.01, max: 1.0, step: 0.01 },
    spread: { value: defaultValues.spread, min: 0.5, max: 10, step: 0.1 }
  });

  const colorControls = useControls("🎨 Colors & Effects", {
    color: { value: defaultValues.color },
    colorEnd: { value: defaultValues.colorEnd },
    useGradient: { value: defaultValues.useGradient },
    blendMode: { 
      value: defaultValues.blendMode,
      options: { 'Additive': 0, 'Normal': 1, 'Multiply': 2, 'Subtractive': 3 }
    }
  });

  const physicsControls = useControls("⚡ Physics", {
    gravity: { value: defaultValues.gravity, min: -15.0, max: 15.0, step: 0.1 },
    turbulence: { value: defaultValues.turbulence, min: 0.0, max: 5.0, step: 0.1 }
  });

  const shapeControls = useControls("🔺 Shape & Texture", {
    shape: {
      value: defaultValues.shape,
      options: ['explosion', 'sphere', 'box', 'cone', 'circle', 'square', 'spiral', 'wave']
    },
    particleTexture: {
      value: defaultValues.particleTexture,
      options: { 'Circle': 'Circle', 'Heart': 'Heart', 'Point': 'Point', 'Star': 'Star' }
    }
  });

  // Combine all controls into single object
  const allVfxValues = useMemo(() => ({
    ...transformControls,
    ...particleControls,
    ...colorControls,
    ...physicsControls,
    ...shapeControls
  }), [transformControls, particleControls, colorControls, physicsControls, shapeControls]);

  // ✅ SEPARATE: Direct VFX trigger (no timeline dependency)
  const actionControls = useControls("🚀 Actions", {
    'Fire Current Settings!': button(() => {
      console.log('🚀 Firing VFX with values:', allVfxValues);
      // Direct trigger without timeline involvement
      setTimelineValues({ ...allVfxValues, trigger: true });
      // Auto-reset after brief moment
      setTimeout(() => {
        setTimelineValues(prev => ({ ...prev, trigger: false }));
      }, 100);
    })
  });

  // ✅ SEPARATE: Transform-only controls for quick adjustments
  const quickTransformControls = useControls("⚡ Quick Transform", {
    'Reset Position': button(() => {
      // Reset only transform values, keeping other settings
      setTimelineValues({ 
        ...allVfxValues, 
        positionX: 0, 
        positionY: 0, 
        positionZ: 0,
        trigger: true 
      });
      setTimeout(() => {
        setTimelineValues(prev => ({ ...prev, trigger: false }));
      }, 100);
    }),
    'Reset Rotation': button(() => {
      setTimelineValues({ 
        ...allVfxValues, 
        rotationX: 0, 
        rotationY: 0, 
        rotationZ: 0,
        trigger: true 
      });
      setTimeout(() => {
        setTimelineValues(prev => ({ ...prev, trigger: false }));
      }, 100);
    }),
    'Reset Scale': button(() => {
      setTimelineValues({ 
        ...allVfxValues, 
        scale: 1,
        trigger: true 
      });
      setTimeout(() => {
        setTimelineValues(prev => ({ ...prev, trigger: false }));
      }, 100);
    })
  });

  // ✅ SIMPLIFIED: File operations in single group
  const fileControls = useControls('💾 File Operations', {
    'Save Settings': button(() => {
      fileManager.saveJSON(allVfxValues, 'vfx-settings.json');
    }),
    'Load Settings': button(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    })
  });

  const timelineControls = useControls('🎬 Timeline', {
    timelineVisible: { value: true, label: 'Show Timeline' },
    enableTimeline: { value: true, label: 'Enable Timeline System' }
  });

  const timelineVisible = timelineControls.timelineVisible;
  const timelineEnabled = timelineControls.enableTimeline;

  // ✅ SIMPLIFIED: Setup
  const timelineModel = useMemo(() => getTimelineModel(), []);
  const normalizeFunctions = useMemo(() => createNormalizeFunctions(), []);
  const parameterMapping = useMemo(() => createParameterMapping(), []);

  const [currentTime, setCurrentTime] = useState(0);
  const timelineRef = useRef(null);
  const fileInputRef = useRef();

  // Canvas styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      canvas {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 0 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ✅ SEPARATED: Timeline updates only when timeline system is enabled
  const handleLevaUpdate = useCallback((interpolatedValues) => {
    if (!interpolatedValues || !timelineEnabled) return;
    
    setTimelineValues({
      ...allVfxValues,
      ...interpolatedValues,
      timelineActive: true,
      isTimelinePlaying: interpolatedValues.isPlaying || false,
      currentTime: currentTime
    });
    setIsTimelineActive(true);
  }, [allVfxValues, currentTime, timelineEnabled]);

  // ✅ SIMPLIFIED: Final values logic - timeline only overrides when enabled
  const finalVfxValues = useMemo(() => {
    if (timelineEnabled && isTimelineActive && Object.keys(timelineValues).length > 0) {
      return timelineValues;
    }
    return allVfxValues;
  }, [allVfxValues, timelineValues, isTimelineActive, timelineEnabled]);

  // File import
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileManager.loadJSON(file, (model) => {
      const timeline = timelineRef.current?.getTimeline?.();
      if (timeline?.setModel) {
        timeline.setModel(model);
      }
    });
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      
      <Canvas
        shadows
        camera={{ 
          position: [5, 5, 5], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance" 
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4169E1" />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
            autoRotate={false}
          />
          
          {/* Ground Grid */}
          <Grid 
            position={[0, -2, 0]}
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#333"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#666"
            fadeDistance={24}
            fadeStrength={1}
          />

          {/* ✅ VfxEngine directly in Canvas */}
          <VfxEngine 
            allVfxValues={finalVfxValues}
            onComplete={() => {
              setTimelineValues(prev => ({ ...prev, trigger: false }));
            }}
          />
          
          {/* Debug Stats */}
          {DEBUG && <Stats />}
        </Suspense>
      </Canvas>
      
      {/* ✅ CONDITIONAL: Timeline only renders when enabled */}
      {timelineEnabled && (
        <AnimationTimeline
          ref={timelineRef}
          visible={timelineVisible}
          duration={3000}
          vfxValues={allVfxValues}
          onLevaUpdate={handleLevaUpdate}
          onTimeChange={setCurrentTime}
          onPlaybackChange={(isPlaying) => {
            if (!isPlaying) {
              setIsTimelineActive(false);
              setTimelineValues({});
            }
          }}
          initialModel={timelineModel}
          normalizeFunctions={normalizeFunctions}
          parameterMapping={parameterMapping}
          shouldPlay={false}
        />
      )}
    </>
  );
};

export default TimelineController;