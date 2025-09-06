// Test script for VFX save/load functionality
// Run this in the browser console to test the save/load system

const testSaveLoadSystem = () => {
  console.log('🧪 Testing VFX Save/Load System...');
  
  // Test data structure
  const testVfxSettings = {
    pCount: 1000,
    duration: 5.0,
    pSize: 0.8,
    spread: 3.0,
    color: '#ff0000',
    colorEnd: '#0000ff',
    useGradient: true,
    gravity: -2.0,
    turbulence: 1.5,
    shape: 'explosion',
    particleTexture: 'Star',
    useSpritesheet: false,
    tornadoEnabled: false
  };

  const testCompleteSetup = {
    vfxSettings: testVfxSettings,
    timeline: {
      rows: [
        { id: 1, name: 'Test Row', keyframes: [] }
      ]
    },
    metadata: {
      version: "1.0",
      created: new Date().toISOString(),
      description: "Test Complete Setup",
      parameterCount: Object.keys(testVfxSettings).length,
      hasTimeline: true
    }
  };

  const testVfxOnly = {
    vfxSettings: testVfxSettings,
    metadata: {
      version: "1.0",
      created: new Date().toISOString(),
      description: "Test VFX Settings Only",
      parameterCount: Object.keys(testVfxSettings).length
    }
  };

  const testPreset = {
    name: "Test Preset",
    settings: testVfxSettings,
    metadata: {
      created: new Date().toISOString(),
      description: "Test preset"
    }
  };

  // Test file info utility
  console.log('📊 Testing fileManager.getFileInfo()...');
  
  const completeInfo = fileManager.getFileInfo(testCompleteSetup);
  console.log('Complete setup info:', completeInfo);
  
  const vfxOnlyInfo = fileManager.getFileInfo(testVfxOnly);
  console.log('VFX-only info:', vfxOnlyInfo);
  
  const presetInfo = fileManager.getFileInfo(testPreset);
  console.log('Preset info:', presetInfo);

  // Test validation
  console.log('🔍 Testing fileManager.validateVfxSettings()...');
  
  const validResult = fileManager.validateVfxSettings(testVfxSettings);
  console.log('Valid settings result:', validResult);
  
  const invalidResult = fileManager.validateVfxSettings({ invalid: true });
  console.log('Invalid settings result:', invalidResult);

  // Test save functionality (will trigger downloads)
  console.log('💾 Testing save functionality...');
  console.log('Note: This will trigger file downloads');
  
  // Uncomment to test actual saving:
  // fileManager.saveJSON(testCompleteSetup, 'test-complete-setup.json');
  // fileManager.saveJSON(testVfxOnly, 'test-vfx-only.json');
  // fileManager.saveJSON(testPreset, 'test-preset.json');

  console.log('✅ Save/Load system tests completed!');
  console.log('📝 Check the save/load buttons in the VFX interface to test loading');
  
  return {
    testVfxSettings,
    testCompleteSetup,
    testVfxOnly,
    testPreset,
    fileManager
  };
};

// Export for browser console testing
window.testSaveLoadSystem = testSaveLoadSystem;

console.log('🧪 VFX Save/Load test script loaded!');
console.log('💡 Run testSaveLoadSystem() in the console to test the system');
