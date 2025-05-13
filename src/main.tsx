
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global scroll lock state
let isScrollLocked = false;

// Set up event listener for the scroll lock event
window.addEventListener('scrollLock', (e: Event) => {
  const customEvent = e as CustomEvent<{ locked: boolean }>;
  isScrollLocked = customEvent.detail.locked;
  
  if (isScrollLocked) {
    document.body.style.overflow = 'hidden';
    console.log('Scroll locked');
  } else {
    document.body.style.overflow = '';
    console.log('Scroll unlocked');
  }
});

// Prevent default scrolling on wheel events when locked
document.addEventListener('wheel', (e) => {
  if (isScrollLocked) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent overscroll/bounce effect on touch devices
document.body.addEventListener('touchmove', (e) => {
  if (isScrollLocked) {
    e.preventDefault();
  }
}, { passive: false });

createRoot(document.getElementById("root")!).render(<App />);

// Add ScrollLockEvent to Window interface
declare global {
  interface Window {
    scrollLockEvent: CustomEvent<{ locked: boolean }>;
  }
}
