import React, { useEffect, useState } from 'react';
import { useControls } from 'leva';
import { VfxSettingsProvider } from './contexts/VfxSettingsContext.jsx';
import VfxLevaControls from './components/vfx/VfxLevaControls.jsx';
import TimelineController from './components/timeline/timelineLevaControl.jsx';

// Debug flag
const DEBUG = false;

const App = () => {
  // ✅ MODE SWITCHER: Choose between VFX-only or Timeline mode
  const modeControls = useControls('🎛️ Mode Selection', {
    mode: {
      value: 'vfx',
      options: {
        'VFX Only': 'vfx',
        'Timeline + VFX': 'timeline'
      },
      label: 'Control Mode'
    }
  });

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

  // ✅ CONDITIONAL RENDERING: Switch between components based on mode
  return (
    <VfxSettingsProvider>
      <div style={{ display: modeControls.mode === 'vfx' ? 'block' : 'none' }}>
        <VfxLevaControls />
      </div>
      <div style={{ display: modeControls.mode === 'timeline' ? 'block' : 'none' }}>
        <TimelineController />
      </div>
    </VfxSettingsProvider>
  );
};

export default App;