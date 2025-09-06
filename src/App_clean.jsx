import React, { useEffect } from 'react';
import { VfxSettingsProvider } from './contexts/VfxSettingsContext.jsx';
import TimelineController from './components/timeline/timelineLevaControl.jsx';

// Debug flag
const DEBUG = false;

const App = () => {
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

  // ✅ TIMELINE MODE: Contains all VFX functionality plus timeline
  return (
    <VfxSettingsProvider>
        <TimelineController />
    </VfxSettingsProvider>
  );
};

export default App;
