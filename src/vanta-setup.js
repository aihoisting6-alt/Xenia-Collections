// Reusable Vanta background for npm projects.
// npm i vanta three@0.134.0
// Usage: import { initVanta } from './vanta-setup.js'; const effect = initVanta('#hero')
// Call effect.destroy() on unmount (important in React/Next.js).
import * as THREE from 'three'
import WAVES from 'vanta/dist/vanta.waves.min'
// Other effects: vanta.birds, vanta.net, vanta.globe, vanta.fog, vanta.clouds, vanta.dots ...

export function initVanta(el, options = {}) {
  return WAVES({
    el,
    THREE,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x1f2937,
    ...options,
  })
}
