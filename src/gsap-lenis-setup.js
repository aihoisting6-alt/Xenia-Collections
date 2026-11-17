// Reusable GSAP + ScrollTrigger + Lenis setup for npm projects.
// npm i gsap lenis    then    import { gsap, ScrollTrigger, lenis } from './gsap-lenis-setup.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

export const lenis = new Lenis({ lerp: 0.16, wheelMultiplier: 1.05 }) // no autoRaf: GSAP's ticker drives it; higher lerp = snappier
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

export { gsap, ScrollTrigger }

// Example:
// gsap.from('.box', { y: 80, opacity: 0, scrollTrigger: { trigger: '.box', start: 'top 70%' } })
