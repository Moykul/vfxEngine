import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useControls, button } from 'leva';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import VfxEngine from './VfxEngine.jsx';
import fileManager from '../timeline/fileManager';
import { getVfxValues } from './VfxParameters.js';
import { useVfxSettings } from '../../contexts/VfxSettingsContext.jsx';


// Debug flag for real-time updates
const DEBUG = false;

const VfxLevaControls = () => {
  const [vfxValues, setVfxValues] = useState(() => getVfxValues());
  const fileInputRef = useRef();
  
  // ✅ SHARED: Use shared VFX settings context
  const { vfxSettings, updateVfxSettings } = useVfxSettings();

  // ✅ VFX-FOCUSED: No transform controls - only effect parameters
  // Transform controls removed - handled by timeline mode only

  const particleControls = useControls("✨ Particles", {
    pCount: { value: vfxValues.pCount, min: 50, max: 2000, step: 10 },
    duration: { value: vfxValues.duration, min: 0.5, max: 10.0, step: 0.1 },
    pSize: { 
      value: vfxValues.pSize, 
      min: 0.01, 
      max: 1.0, 
      step: 0.01,
      label: 'Particle Size (real-time)'
    },
    spread: { value: vfxValues.spread, min: 0.5, max: 10, step: 0.1 },
    pAge: { value: vfxValues.pAge, min: 0.1, max: 3.0, step: 0.1 },
    sizeVariation: { value: vfxValues.sizeVariation, min: 0.0, max: 1.0, step: 0.1 },
    timeVariation: { value: vfxValues.timeVariation, min: 0.0, max: 1.0, step: 0.1 }
  });

  const colorControls = useControls("🎨 Colors & Effects", {
    color: { value: vfxValues.color },
    colorEnd: { value: vfxValues.colorEnd },
    useGradient: { value: vfxValues.useGradient },
    opacity: { value: vfxValues.opacity, min: 0.0, max: 1.0, step: 0.1 },
    blendMode: { 
      value: vfxValues.blendMode,
      options: { 'Additive': 0, 'Normal': 1, 'Multiply': 2, 'Subtractive': 3 }
    }
  });

  const physicsControls = useControls("⚡ Physics", {
    gravity: { value: vfxValues.gravity, min: -15.0, max: 15.0, step: 0.1 },
    turbulence: { value: vfxValues.turbulence, min: 0.0, max: 5.0, step: 0.1 },
    directionalForceX: { value: vfxValues.directionalForceX, min: -10.0, max: 10.0, step: 0.1 },
    directionalForceY: { value: vfxValues.directionalForceY, min: -10.0, max: 10.0, step: 0.1 },
    directionalForceZ: { value: vfxValues.directionalForceZ, min: -10.0, max: 10.0, step: 0.1 },
    streakLength: { value: vfxValues.streakLength, min: 0.0, max: 2.0, step: 0.1 }
  });

  const shapeControls = useControls("🔺 Shape & Texture", {
    shape: {
      value: vfxValues.shape,
      options: ['explosion', 'sphere', 'box', 'cone', 'circle', 'square', 'spiral', 'wave', 'glb', 'model']
    },
    shapeHeight: { value: vfxValues.shapeHeight, min: 0.5, max: 10.0, step: 0.1 },
    shapeAngle: { value: vfxValues.shapeAngle, min: 0, max: 360, step: 1 },
    heightMultiplier: { value: vfxValues.heightMultiplier, min: 0.1, max: 5.0, step: 0.1 },
    animationPreset: {
      value: vfxValues.animationPreset,
      options: ['none', 'fadeIn', 'fadeOut', 'spiral', 'burst', 'gravity']
    },
    particleTexture: {
      value: vfxValues.particleTexture,
      options: { 'Circle': 'Circle', 'Heart': 'Heart', 'Point': 'Point', 'Point Cross': 'Point Cross', 'Point Cross 2': 'Point Cross 2', 'Ring': 'Ring', 'Star': 'Star', 'Star 2': 'Star 2' }
    },
    motionBlur: { value: vfxValues.motionBlur }
  });

  // Combine all VFX controls (no transforms)
  const allVfxValues = useMemo(() => ({
    // Default transform values (not controllable in VFX mode)
    positionX: vfxValues.positionX,
    positionY: vfxValues.positionY,
    positionZ: vfxValues.positionZ,
    rotationX: vfxValues.rotationX,
    rotationY: vfxValues.rotationY,
    rotationZ: vfxValues.rotationZ,
    scale: vfxValues.scale,
    // VFX effect parameters only
    ...particleControls,
    ...colorControls,
    ...physicsControls,
    ...shapeControls
  }), [particleControls, colorControls, physicsControls, shapeControls]);

  // ✅ REAL-TIME: VFX trigger for animation playback
  const actionControls = useControls("🚀 Actions", {
    'Fire Current Settings!': button(() => {
      console.log('🚀 Firing VFX animation');
      // Trigger animation playback with current settings
      setVfxValues({ ...allVfxValues, trigger: true });
      // Auto-reset trigger after brief moment
      setTimeout(() => {
        setVfxValues(prev => ({ ...prev, trigger: false }));
      }, 100);
    }),
    'Debug Values': button(() => {
      console.log('🔍 Current VFX Values:', allVfxValues);
      console.log('🔍 Parameters count:', Object.keys(allVfxValues).length);
    })
  });

  // ✅ VFX-FOCUSED: No transform reset buttons since transforms aren't controllable
  // Removed Quick Transform controls - handled by timeline mode only

  // ✅ FILE: Operations for saving/loading VFX settings
  const fileControls = useControls('💾 File Operations', {
    'Save Settings': button(() => {
      fileManager.saveJSON(allVfxValues, 'vfx-settings.json');
    }),
    'Load Settings': button(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    })
  });

  // ✅ SHARED: Update shared VFX settings whenever controls change
  useEffect(() => {
    updateVfxSettings(allVfxValues);
  }, [allVfxValues, updateVfxSettings]);

  // Debug effect for real-time updates
  useEffect(() => {
    if (DEBUG) {
      console.log('🔄 Real-time VFX update:', {
        pSize: allVfxValues.pSize,
        pCount: allVfxValues.pCount,
        gravity: allVfxValues.gravity,
        color: allVfxValues.color,
        timestamp: Date.now()
      });
    }
  }, [allVfxValues]);

  // ✅ REAL-TIME: Always use current control values for live updates
  const finalVfxValues = useMemo(() => {
    // Always use current allVfxValues for real-time feedback
    // Add trigger state if needed for animation playback
    const baseValues = { ...allVfxValues };
    if (Object.keys(vfxValues).length > 0 && vfxValues.trigger) {
      baseValues.trigger = true;
    }
    return baseValues;
  }, [allVfxValues, vfxValues]);

  // File import handler
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    fileManager.loadJSON(file, (loadedValues) => {
      // Update VFX values with loaded settings
      setVfxValues({ ...loadedValues, trigger: true });
      setTimeout(() => {
        setVfxValues(prev => ({ ...prev, trigger: false }));
      }, 100);
    });
  };

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

          {/* ✅ VfxEngine with clean values */}
          <VfxEngine 
            allVfxValues={finalVfxValues}
            onComplete={() => {
              setVfxValues(prev => ({ ...prev, trigger: false }));
            }}
          />
          
          {/* Debug Stats */}
          {DEBUG && <Stats />}
        </Suspense>
      </Canvas>
    </>
  );
};

export default VfxLevaControls;
