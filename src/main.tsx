
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root with specific options to help with WebGL performance
const root = createRoot(document.getElementById("root")!, {
  // This helps with WebGL stability across route changes
  onRecoverableError: (error) => {
    console.error("Recoverable error in React root:", error);
  }
});

root.render(<App />);
