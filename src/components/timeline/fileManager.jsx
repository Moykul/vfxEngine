// fileManager.js - Generic file operations for animation timeline JSON import/export

const fileManager = {
  // Save a JS object as a JSON file
  saveJSON: (data, filename = 'animation-timeline.json') => {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (err) {
      alert('Failed to export animation JSON.');
    }
  },

  // Load a JSON file and pass the parsed object to a callback
  loadJSON: (file, onLoad) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (onLoad) onLoad(data);
      } catch (err) {
        alert('Invalid animation JSON file.');
      }
    };
    reader.readAsText(file);
  }
};

export default fileManager;
