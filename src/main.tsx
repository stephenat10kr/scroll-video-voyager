
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a custom event bus for scroll locking
window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });

// Set up event listener for the scroll lock event
window.addEventListener('scrollLock', (e: Event) => {
  const customEvent = e as CustomEvent<{ locked: boolean }>;
  if (customEvent.detail.locked) {
    document.body.style.overflow = 'hidden';
    console.log('Scroll locked');
  } else {
    document.body.style.overflow = '';
    console.log('Scroll unlocked');
  }
});

// Prevent default scrolling on wheel events when locked
document.addEventListener('wheel', (e) => {
  if (window.scrollLockEvent.detail.locked) {
    e.preventDefault();
  }
}, { passive: false, capture: true });

// Prevent overscroll/bounce effect on touch devices
document.body.addEventListener('touchmove', (e) => {
  if (window.scrollLockEvent.detail.locked) {
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
