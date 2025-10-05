// React imports for rendering and strict mode
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Global styles and main app component
import './index.css'
import App from './App.jsx'

// Mount the React app to the DOM root element
// StrictMode enables additional checks and warnings for development
createRoot(document.getElementById('root')).render(

  // StrictMode enabled for dev to run extra checks and catch bugs
  // Intentionally double invoked which isn't needed
  // <StrictMode>
  //   <App />
  // </StrictMode>

  <App />
)
