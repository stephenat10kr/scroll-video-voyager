
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add the link to Google Fonts in the head element
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap';
document.head.appendChild(link);

createRoot(document.getElementById("root")!).render(<App />);
