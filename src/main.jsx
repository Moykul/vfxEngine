import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";

// Debug flag - set to true to see console logs
const DEBUG = true;

// Setup basic viewport and styling
function setupBasicStyling() {
  // if (DEBUG) console.log("Setting up basic styling");
  
  // Viewport meta tag
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    document.head.appendChild(viewportMeta);
  }
  viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
}

// Initialize VFX Engine app
function initApp() {
  // if (DEBUG) console.log("Initializing VFX Engine app");
  setupBasicStyling();
  
  // Add CSS fix for canvas and VFX rendering
  const style = document.createElement('style');
  style.textContent = `
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    
    #root {
      width: 100%;
      height: 100%;
    }
    
    canvas {
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 0 !important;
    }
    
    .vfx-container {
      position: relative !important;
      z-index: 1 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Render the VFX Engine app
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Document ready handler
// if (DEBUG) console.log("VFX Engine waiting for DOMContentLoaded");
document.addEventListener('DOMContentLoaded', initApp);