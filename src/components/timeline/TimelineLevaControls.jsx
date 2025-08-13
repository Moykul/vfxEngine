import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useControls, button } from 'leva';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import AnimationTimeline from './AnimationTimeline';
import VfxEngine from '../vfx/VfxEngine.jsx';
import { useVfxSettings } from '../../contexts/VfxSettingsContext.jsx';

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

const TimelineLevaControls = () => {
  const defaultValues = useMemo(() => getDefaultVfxValues(), []);
  
  // Direct transform values (like Scene.jsx in reference)
  const [cubeValues, setCubeValues] = useState({
    pos_x: 0,
    pos_y: 0, 
    pos_z: 0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    scale: 1,
    opacity: 1
  });
  
  const [currentTime, setCurrentTime] = useState(0);
  
  // Refs
  const timelineRef = useRef(null);
  const fileInputRef = useRef();
  
  // ✅ SHARED: Read VFX settings from shared context
  const { vfxSettings } = useVfxSettings();

  // Direct Leva controls (like timelineLevaControl.jsx reference)
  const [cubeControls, setCube] = useControls("Cube Transform", () => ({
    pos_x: { 
      value: 0, min: -5, max: 5, step: 0.01
    },
    pos_y: { 
      value: 0, min: -5, max: 5, step: 0.01
    },
    pos_z: { 
      value: 0, min: -5, max: 5, step: 0.01
    },
    rotation_x: {
      value: 0, min: -180, max: 180, step: 1
    },
    rotation_y: {
      value: 0, min: -180, max: 180, step: 1
    },
    rotation_z: {
      value: 0, min: -180, max: 180, step: 1
    },
    scale: {
      value: 1, min: 0.1, max: 3, step: 0.01
    },
    opacity: {
      value: 1, min: 0, max: 1, step: 0.01
    }
  }));

  // Timeline controls (like timelineLevaControl.jsx reference)
  const [{ timelineVisible }, setTimelineVisible] = useControls('Timeline', () => ({
    timelineVisible: { value: true, label: 'Show Timeline' }
  }));

  // Timeline updates (like timelineLevaControl.jsx reference)
  const handleLevaUpdate = useCallback((interpolated) => {
    if (!interpolated) return;
    
    console.log('🎬 Timeline update:', interpolated);
    
    // Update cube values directly
    setCube(interpolated);
    
  }, [setCube]);

  // Timeline setup (like timelineLevaControl.jsx reference)
  const timelineModel = useMemo(() => getTimelineModel(), []);
  const normalizeFunctions = useMemo(() => createNormalizeFunctions(), []);
  const parameterMapping = useMemo(() => createParameterMapping(), []);

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

  // File import for timeline
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

          {/* VFX Engine - the main visual */}
          <VfxEngine 
            allVfxValues={{
              ...vfxSettings,
              positionX: cubeControls.pos_x,
              positionY: cubeControls.pos_y,
              positionZ: cubeControls.pos_z,
              rotationX: cubeControls.rotation_x,
              rotationY: cubeControls.rotation_y,
              rotationZ: cubeControls.rotation_z,
              scale: cubeControls.scale,
              opacity: cubeControls.opacity
            }}
          />

          {/* Invisible reference cube for timeline testing only */}
          <mesh 
            position={[cubeControls.pos_x, cubeControls.pos_y, cubeControls.pos_z]}
            rotation={[
              cubeControls.rotation_x * Math.PI / 180,
              cubeControls.rotation_y * Math.PI / 180, 
              cubeControls.rotation_z * Math.PI / 180
            ]}
            scale={cubeControls.scale}
            visible={false}
          >
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial />
          </mesh>
          
          {/* Debug Stats */}
          {DEBUG && <Stats />}
        </Suspense>
      </Canvas>
      
      {/* Timeline (like timelineLevaControl.jsx reference) */}
      <AnimationTimeline
        ref={timelineRef}
        visible={timelineVisible}
        duration={5000}
        levaValues={cubeControls}
        onLevaUpdate={handleLevaUpdate}
        onTimeChange={setCurrentTime}
        initialModel={timelineModel}
        normalizeFunctions={normalizeFunctions}
        parameterMapping={parameterMapping}
      />
    </>
  );
};

export default TimelineLevaControls;
