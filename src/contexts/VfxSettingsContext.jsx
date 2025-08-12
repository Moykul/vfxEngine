import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDefaultVfxValues } from '../components/vfx/VfxParameters.js';

// Context for sharing VFX settings between VfxLevaControls and TimelineLevaControls
const VfxSettingsContext = createContext();

export const useVfxSettings = () => {
  const context = useContext(VfxSettingsContext);
  if (!context) {
    throw new Error('useVfxSettings must be used within a VfxSettingsProvider');
  }
  return context;
};

export const VfxSettingsProvider = ({ children }) => {
  const [vfxSettings, setVfxSettings] = useState(() => getDefaultVfxValues());

  // Debug logging when settings change
  useEffect(() => {
    console.log('🔄 VFX Settings updated:', {
      shape: vfxSettings.shape,
      particleTexture: vfxSettings.particleTexture,
      pSize: vfxSettings.pSize,
      color: vfxSettings.color
    });
  }, [vfxSettings]);

  const updateVfxSettings = (newSettings) => {
    setVfxSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <VfxSettingsContext.Provider value={{ vfxSettings, updateVfxSettings }}>
      {children}
    </VfxSettingsContext.Provider>
  );
};
