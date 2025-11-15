import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Mouse-following gradient blob
const blob = document.getElementById('mouse-blob');

let mouseX = 0;
let mouseY = 0;
let blobX = 0;
let blobY = 0;

// Track mouse position
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Smooth animation loop
function animateBlob() {
  // Calculate the distance to move (15% of the gap creates smooth lag)
  const dx = mouseX - blobX;
  const dy = mouseY - blobY;
  
  blobX += dx * 0.15;
  blobY += dy * 0.15;
  
  // Update blob position using performant transform (translate by exactly half width/height to center)
  blob.style.transform = `translate3d(${blobX}px, ${blobY}px, 0) translate(-50%, -50%)`;
  
  requestAnimationFrame(animateBlob);
}

animateBlob();
