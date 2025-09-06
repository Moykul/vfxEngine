// fileManager.jsx - Enhanced file operations for VFX settings and timeline JSON import/export

const fileManager = {
  // Save a JS object as a JSON file with better formatting and validation
  saveJSON: (data, filename = 'animation-timeline.json') => {
    try {
      // Validate data
      if (!data || typeof data !== 'object') {
        alert('⚠️ Invalid data to save.');
        return false;
      }

      // Create formatted JSON
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);

      // Provide feedback
      const fileSize = (blob.size / 1024).toFixed(1);
      console.log(`💾 File saved: ${filename} (${fileSize} KB)`);
      
      // Show success message with file info
      if (data.metadata) {
        alert(`✅ File saved successfully!\n📁 ${filename}\n📊 Size: ${fileSize} KB\n📝 ${data.metadata.description || 'No description'}`);
      } else {
        alert(`✅ File saved: ${filename} (${fileSize} KB)`);
      }
      
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      alert(`❌ Failed to save file: ${err.message}`);
      return false;
    }
  },

  // Load a JSON file with enhanced error handling and validation
  loadJSON: (file, onLoad) => {
    if (!file) {
      alert('⚠️ No file selected.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('⚠️ Please select a JSON file.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate loaded data
        if (!data || typeof data !== 'object') {
          alert('⚠️ Invalid JSON file content.');
          return;
        }

        console.log(`📂 File loaded: ${file.name}`, {
          size: `${(file.size / 1024).toFixed(1)} KB`,
          keys: Object.keys(data),
          hasVfxSettings: !!data.vfxSettings,
          hasTimeline: !!data.timeline,
          hasMetadata: !!data.metadata
        });

        if (onLoad) {
          onLoad(data);
        }
      } catch (err) {
        console.error('Load failed:', err);
        alert(`❌ Invalid JSON file: ${err.message}`);
      }
    };

    reader.onerror = () => {
      alert('❌ Failed to read file.');
    };

    reader.readAsText(file);
  },

  // Utility function to validate VFX settings structure
  validateVfxSettings: (settings) => {
    if (!settings || typeof settings !== 'object') {
      return { valid: false, message: 'Settings must be an object' };
    }

    const requiredFields = ['pCount', 'duration', 'pSize'];
    const missingFields = requiredFields.filter(field => !(field in settings));
    
    if (missingFields.length > 0) {
      return { 
        valid: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      };
    }

    return { valid: true, message: 'Valid VFX settings' };
  },

  // Utility function to get file info
  getFileInfo: (data) => {
    const info = {
      type: 'Unknown',
      description: 'Unknown file type',
      parameterCount: 0,
      hasTimeline: false
    };

    if (data.vfxSettings && data.timeline) {
      info.type = 'Complete Setup';
      info.description = 'VFX settings with timeline animation';
      info.parameterCount = Object.keys(data.vfxSettings).length;
      info.hasTimeline = true;
    } else if (data.vfxSettings) {
      info.type = 'VFX Settings';
      info.description = 'VFX parameters only';
      info.parameterCount = Object.keys(data.vfxSettings).length;
    } else if (data.settings) {
      info.type = 'Preset';
      info.description = `Preset: ${data.name || 'Custom'}`;
      info.parameterCount = Object.keys(data.settings).length;
    } else if (data.rows) {
      info.type = 'Timeline';
      info.description = 'Legacy timeline data';
      info.hasTimeline = true;
    }

    return info;
  }
};

export default fileManager;
