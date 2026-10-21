/**
 * ==============================================================================
 * Ashly 3.0 - Sistema Central de Animaciones GSAP, ScrollTrigger & Lenis
 * Ubicación: src/assets/animaciones-gsap/animations.js
 * 
 * Este archivo controla:
 * 0. Desplazamiento ultra-suave (Smooth Scroll) mediante Lenis sincronizado
 *    con el Ticker de GSAP y ScrollTrigger.
 * 1. Fondo interactivo global: Matriz de puntos y orbes difuminados reactivos
 *    al cursor (Canvas 2D de alto rendimiento con paralaje y resplandor neón).
 * 2. Transiciones Cinemáticas Variadas entre Secciones (Pinning + Lenis Scroll):
 *    - Escena 1 (Auditoría): Mega Zoom Frontal 30x (Warp Speed Zoom-Through estilo Lenis).
 *    - Escena 2 (Capacidades): Desplazamiento Lateral Cinematográfico (Opposing Kinetic Split).
 *    - Escena 3 (Descargas): Zoom Negativo / Dolly-Out 3D (Deep Space Pullback).
 *    - Escena 4 (Donaciones): Rotación 3D Isométrica (Perspective Monolith Flip).
 *    - Escena 5 (FAQ): Despliegue de Horizonte 3D con Escaneo Láser Esmeralda.
 * 3. Entrada suave (Scale-up) de cada sección vinculada a la salida de cada transición.
 * 4. Animación exclusiva de entrada de la barra de navegación (Navbar).
 * 5. Micro-interacciones de hover sobre cada elemento de la Nav.
 * 6. Animación de entrada y reposo continuo para la tipografía del Hero.
 * 7. Animaciones de scroll para el contenido interno de cada sección.
 * 8. Navegación fluida por enlaces ancla (#auditoria, #descarga, etc.) mediante Lenis.
 * ==============================================================================
 */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar el plugin ScrollTrigger en GSAP
gsap.registerPlugin(ScrollTrigger);

// Variable global para la instancia de Lenis
let lenisInstance = null;

/**
 * ------------------------------------------------------------------------------
 * 0. MOTOR DE DESPLAZAMIENTO SUAVE (LENIS SMOOTH SCROLL)
 * ------------------------------------------------------------------------------
 * Proporciona una inercia física suave y cinematográfica al hacer scroll
 * con la rueda del ratón, trackpad o navegación por teclado.
 * Se sincroniza al 100% con el requestAnimationFrame (raf) de GSAP.
 */
function initSmoothScrollLenis() {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva exponencial suave estándar
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.8,
    infinite: false,
  });

  // 0.1 Sincronizar el scroll de Lenis con ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);

  // 0.2 Conectar el motor de cuadros de Lenis al Ticker principal de GSAP
  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });

  // 0.3 Desactivar el lagSmoothing de GSAP para evitar saltos
  gsap.ticker.lagSmoothing(0);

  // 0.4 Navegación suave al pulsar cualquier enlace con ancla (#)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        lenisInstance.scrollTo(targetElement, {
          offset: -70,
          duration: 1.3,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    });
  });

  return lenisInstance;
}

/**
 * ------------------------------------------------------------------------------
 * 1. FONDO GLOBAL INTERACTIVO: MATRIZ DE PUNTOS Y DIFUMINADO AL CURSOR
 * ------------------------------------------------------------------------------
 * Dibuja un lienzo fijo a pantalla completa con la cuadrícula de puntos cian
 * que responde en tiempo real al movimiento del cursor:
 * - Los puntos se iluminan suavemente al pasar el ratón cerca (Spotlight dinámico).
 * - La matriz completa tiene un paralaje sutil al mover el cursor.
 * - Dos orbes ambientales difuminados (cian y púrpura) flotan de fondo con cadencia orgánica.
 */
function initGlobalDotMatrixCanvas() {
  const canvas = document.querySelector('#global-dot-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;

  // Parámetros de la matriz de puntos
  const DOT_SPACING = 30; // Distancia entre puntos (px)
  const BASE_DOT_SIZE = 1.8; // Tamaño del punto en reposo
  const INTERACTION_RADIUS = 190; // Radio de iluminación alrededor del cursor

  // Coordenadas con interpolación suave (Lerp)
  let mouse = {
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
  };

  let orbTime = 0;
  let isVisible = true;

  // Manejo de redimensionamiento con soporte Retina (DPR)
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Escuchar movimiento del cursor
  window.addEventListener('pointermove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  }, { passive: true });

  // Posición inicial centrada para el efecto de bienvenida
  mouse.x = width / 2;
  mouse.y = height / 3;
  mouse.targetX = width / 2;
  mouse.targetY = height / 3;

  // Pausar renderizado cuando la pestaña no está visible (ahorro de batería/recursos)
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible) requestAnimationFrame(render);
  });

  function render() {
    if (!isVisible) return;

    // Suavizado Lerp de la posición del ratón
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    orbTime += 0.007;

    ctx.clearRect(0, 0, width, height);

    // 1.1 Resplandor difuminado ambiental (Orbe Cian superior flotante)
    const orb1X = width * 0.48 + Math.sin(orbTime) * 110;
    const orb1Y = height * 0.32 + Math.cos(orbTime * 0.8) * 70;
    const radGlow1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 480);
    radGlow1.addColorStop(0, 'rgba(23, 184, 254, 0.08)');
    radGlow1.addColorStop(1, 'rgba(23, 184, 254, 0)');
    ctx.fillStyle = radGlow1;
    ctx.fillRect(0, 0, width, height);

    // 1.2 Resplandor difuminado ambiental (Orbe Púrpura inferior flotante)
    const orb2X = width * 0.62 + Math.cos(orbTime * 0.7) * 90;
    const orb2Y = height * 0.65 + Math.sin(orbTime * 0.9) * 85;
    const radGlow2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 440);
    radGlow2.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
    radGlow2.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = radGlow2;
    ctx.fillRect(0, 0, width, height);

    // 1.3 Resplandor Spotlight dinámico centrado en el cursor del usuario
    if (mouse.x > -500) {
      const spotGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, INTERACTION_RADIUS * 1.35);
      spotGlow.addColorStop(0, 'rgba(23, 184, 254, 0.15)');
      spotGlow.addColorStop(0.5, 'rgba(23, 184, 254, 0.05)');
      spotGlow.addColorStop(1, 'rgba(23, 184, 254, 0)');
      ctx.fillStyle = spotGlow;
      ctx.fillRect(0, 0, width, height);
    }

    // 1.4 Paralaje suave de la cuadrícula de puntos según el ángulo del ratón
    const parallaxX = ((mouse.x - width / 2) / width) * 12;
    const parallaxY = ((mouse.y - height / 2) / height) * 12;

    const startX = -DOT_SPACING + (parallaxX % DOT_SPACING);
    const startY = -DOT_SPACING + (parallaxY % DOT_SPACING);

    // 1.5 Dibujado de cada punto con iluminación por proximidad
    for (let x = startX; x < width + DOT_SPACING; x += DOT_SPACING) {
      for (let y = startY; y < height + DOT_SPACING; y += DOT_SPACING) {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = INTERACTION_RADIUS * INTERACTION_RADIUS;

        let size = BASE_DOT_SIZE;
        let alpha = 0.16;

        if (distSq < radiusSq) {
          const dist = Math.sqrt(distSq);
          const factor = 1 - dist / INTERACTION_RADIUS;
          const easeFactor = factor * factor;

          alpha = 0.16 + easeFactor * 0.80; // Sube hasta 0.96 cerca del cursor
          size = BASE_DOT_SIZE + easeFactor * 1.6;

          if (factor > 0.45) {
            ctx.fillStyle = `rgba(23, 184, 254, ${(factor - 0.45) * 0.35})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.fillStyle = `rgba(23, 184, 254, ${alpha})`;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/**
 * ------------------------------------------------------------------------------
 * 2. TRANSICIONES CINEMÁTICAS VARIADAS ENTRE SECCIONES (ScrollTrigger + Lenis)
 * ------------------------------------------------------------------------------
 * Cada una de las 5 secciones cuenta con un estilo de transición único:
 * 1. Auditoría: Mega Zoom Frontal 30x (Warp Speed Zoom-Through).
 * 2. Capacidades: Desplazamiento Lateral Cinematográfico (Opposing Kinetic Split).
 * 3. Descargas: Zoom Negativo / Dolly-Out 3D (Deep Space Pullback).
 * 4. Donaciones: Rotación Isométrica 3D (Perspective Monolith Flip).
 * 5. FAQ: Despliegue de Horizonte 3D con Escaneo Láser Esmeralda.
 */
function initCreativeSectionTransitions() {

  // ============================================================================
  // ESCENA 1 (Auditoría): Mega Zoom Frontal (Warp Speed Zoom-Through)
  // ============================================================================
  const scene1 = document.querySelector('.transition-scene-1');
  if (scene1) {
    const warpContent = scene1.querySelector('.zoom-warp-content');
    const warpHuge = scene1.querySelector('.zoom-warp-heading');

    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: scene1,
        start: 'top top',
        end: '+=45%',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    });

    tl1
      .to(warpHuge, {
        scale: 20,
        transformOrigin: '50% 50%',
        ease: 'power2.in',
        duration: 0.8,
      })
      .to(warpContent, {
        opacity: 0,
        filter: 'blur(10px)',
        duration: 0.35,
        ease: 'power1.in',
      }, '-=0.35');
  }

  // ============================================================================
  // ESCENA 2 (Capacidades): Desplazamiento Lateral Cinematográfico (Kinetic Split)
  // ============================================================================
  const scene2 = document.querySelector('.transition-scene-2');
  if (scene2) {
    const splitWrap = scene2.querySelector('.lateral-split-wrapper');
    const splitLeft = scene2.querySelector('.lateral-split-left');
    const splitRight = scene2.querySelector('.lateral-split-right');
    const splitBeam = scene2.querySelector('.lateral-split-beam');
    const splitBadge = scene2.querySelector('.lateral-split-badge');
    const splitSub = scene2.querySelector('.lateral-split-sub');

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: scene2,
        start: 'top top',
        end: '+=45%',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    });

    tl2
      // 1. El rayo de luz neón se expande dividiendo la pantalla
      .to(splitBeam, {
        width: '100vw',
        duration: 0.3,
        ease: 'power2.out',
      })
      // 2. "MOTOR" sale disparado velozmente hacia la IZQUIERDA
      .to(splitLeft, {
        x: '-90vw',
        opacity: 0,
        filter: 'blur(10px)',
        duration: 0.7,
        ease: 'power2.in',
      }, '-=0.1')
      // 3. "PLANNER" sale disparado velozmente hacia la DERECHA
      .to(splitRight, {
        x: '90vw',
        opacity: 0,
        filter: 'blur(10px)',
        duration: 0.7,
        ease: 'power2.in',
      }, '<')
      // 4. Se desvanecen los elementos auxiliares
      .to([splitBeam, splitBadge, splitSub, splitWrap], {
        opacity: 0,
        duration: 0.25,
      }, '-=0.3');
  }

  // ============================================================================
  // ESCENA 3 (Descargas): Zoom Negativo / Dolly-Out 3D (Deep Space Pullback)
  // ============================================================================
  const scene3 = document.querySelector('.transition-scene-3');
  if (scene3) {
    const dollyWrap = scene3.querySelector('.dolly-out-wrapper');
    const dollyHeading = scene3.querySelector('.dolly-out-heading');
    const dollyHud = scene3.querySelector('.dolly-out-hud');

    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: scene3,
        start: 'top top',
        end: '+=45%',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    });

    tl3
      // Zoom Negativo (Dolly-Out 3D): parte nítido en 1.0x y retrocede hacia el fondo disolviéndose suavemente
      .to(dollyHeading, {
        scale: 0.65,
        opacity: 0.2,
        transformOrigin: '50% 50%',
        duration: 0.6,
        ease: 'power2.in',
      })
      .to(dollyHud, {
        opacity: 0,
        scale: 0.8,
        duration: 0.35,
        ease: 'power2.in',
      }, '-=0.4')
      .to(dollyWrap, {
        opacity: 0,
        y: -35,
        duration: 0.3,
        ease: 'power2.in',
      }, '-=0.2');
  }

  // ============================================================================
  // ESCENA 4 (Donaciones): Rotación 3D Isométrica (Perspective Monolith Flip)
  // ============================================================================
  const scene4 = document.querySelector('.transition-scene-4');
  if (scene4) {
    const wrap3D = scene4.querySelector('.perspective-3d-wrapper');

    const tl4 = gsap.timeline({
      scrollTrigger: {
        trigger: scene4,
        start: 'top top',
        end: '+=45%',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    });

    tl4
      .to(wrap3D, {
        rotateX: -45,
        rotateY: 25,
        scale: 0.7,
        opacity: 0,
        y: -80,
        duration: 0.7,
        ease: 'power2.in',
      });
  }

  // ============================================================================
  // ESCENA 5 (FAQ): Despliegue de Horizonte 3D con Escaneo Láser Esmeralda
  // ============================================================================
  const scene5 = document.querySelector('.transition-scene-5');
  if (scene5) {
    const laserWrap = scene5.querySelector('.laser-unfold-wrapper');
    const laserLine = scene5.querySelector('.laser-sweep-line');

    const tl5 = gsap.timeline({
      scrollTrigger: {
        trigger: scene5,
        start: 'top top',
        end: '+=45%',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    });

    tl5
      .fromTo(laserLine, { top: '0%', opacity: 1 }, { top: '100%', opacity: 0.2, duration: 0.45, ease: 'linear' })
      .to(laserWrap, {
        y: -60,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.4,
        ease: 'power2.in',
      }, '-=0.2');
  }
}

/**
 * ------------------------------------------------------------------------------
 * 3. TRANSICIONES DE ESCALA SUAVE EN LAS SECCIONES DE CONTENIDO
 * ------------------------------------------------------------------------------
 * Acompaña a la salida de cada transición cinemática haciendo que el contenido
 * de la sección (#auditoria, #capacidades, #descarga, #donaciones, #faq)
 * entre con una escala suave desde 0.88 hasta 1.0.
 */
function initSectionZoomTransitions() {
  const zoomTargets = document.querySelectorAll('.section-zoom-target');

  zoomTargets.forEach((target) => {
    const parentSection = target.closest('section');
    if (!parentSection) return;

    gsap.fromTo(
      target,
      {
        scale: 0.88,
        opacity: 0.4,
        y: 50,
        transformOrigin: 'center top',
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: parentSection,
          start: 'top 85%',
          end: 'top 30%',
          scrub: 1.2,
        },
      }
    );
  });
}

/**
 * ------------------------------------------------------------------------------
 * 4. ANIMACIÓN DE ENTRADA DE LA BARRA DE NAVEGACIÓN (Solo al cargar la página)
 * ------------------------------------------------------------------------------
 */
function initNavbarEntranceAnimation() {
  const header = document.querySelector('#main-header');
  if (!header) return;

  const brand = header.querySelector('.nav-brand');
  const links = header.querySelectorAll('.nav-link');
  const statusBadge = header.querySelector('.nav-status-badge');
  const ctaBtn = header.querySelector('.nav-cta-btn');

  gsap.set(header, { y: -50, opacity: 0 });
  if (brand) gsap.set(brand, { opacity: 0, x: -20, scale: 0.95 });
  if (links.length) gsap.set(links, { opacity: 0, y: -10 });
  if (statusBadge) gsap.set(statusBadge, { opacity: 0, scale: 0.85 });
  if (ctaBtn) gsap.set(ctaBtn, { opacity: 0, x: 20, scale: 0.95 });

  const navTl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    delay: 0,
    onComplete: () => {
      gsap.set(header, { clearProps: 'all' });
      if (brand) gsap.set(brand, { clearProps: 'all' });
      if (links.length) gsap.set(links, { clearProps: 'all' });
      if (statusBadge) gsap.set(statusBadge, { clearProps: 'all' });
      if (ctaBtn) gsap.set(ctaBtn, { clearProps: 'all' });
    }
  });

  navTl.to(header, {
    y: 0,
    opacity: 1,
    duration: 0.75,
  })
  .to(brand, {
    opacity: 1,
    x: 0,
    scale: 1,
    duration: 0.5,
  }, '-=0.4')
  .to(links, {
    opacity: 1,
    y: 0,
    duration: 0.45,
    stagger: 0.07,
  }, '-=0.35')
  .to(statusBadge, {
    opacity: 1,
    scale: 1,
    duration: 0.4,
    ease: 'back.out(1.5)',
  }, '-=0.25')
  .to(ctaBtn, {
    opacity: 1,
    x: 0,
    scale: 1,
    duration: 0.5,
    ease: 'elastic.out(1, 0.65)',
  }, '-=0.2');
}

/**
 * ------------------------------------------------------------------------------
 * 5. MICRO-INTERACCIONES AL PASAR EL CURSOR (HOVER) EN LA NAVBAR
 * ------------------------------------------------------------------------------
 */
function initNavbarHoverInteractions() {
  const header = document.querySelector('#main-header');
  if (!header) return;

  const logo = header.querySelector('.nav-logo');
  const brand = header.querySelector('.nav-brand');
  if (brand && logo) {
    brand.addEventListener('mouseenter', () => {
      gsap.to(logo, {
        scale: 1.14,
        rotate: 6,
        boxShadow: '0 0 18px rgba(23, 184, 254, 0.75)',
        duration: 0.25,
        ease: 'power2.out',
      });
    });
    brand.addEventListener('mouseleave', () => {
      gsap.to(logo, {
        scale: 1,
        rotate: 0,
        boxShadow: '0 0 12px rgba(23, 184, 254, 0.4)',
        duration: 0.35,
        ease: 'power2.out',
      });
    });
  }

  const navLinks = header.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, {
        y: -2,
        color: '#17b8fe',
        textShadow: '0 0 12px rgba(23, 184, 254, 0.5)',
        duration: 0.2,
        ease: 'power1.out',
      });
    });
    link.addEventListener('mouseleave', () => {
      gsap.to(link, {
        y: 0,
        color: '#cbd5e1',
        textShadow: 'none',
        duration: 0.25,
        ease: 'power1.out',
      });
    });
  });

  const statusBadge = header.querySelector('.nav-status-badge');
  if (statusBadge) {
    const dot = statusBadge.querySelector('span');
    statusBadge.addEventListener('mouseenter', () => {
      gsap.to(statusBadge, {
        scale: 1.05,
        borderColor: 'rgba(52, 211, 153, 0.6)',
        boxShadow: '0 0 15px rgba(52, 211, 153, 0.3)',
        duration: 0.25,
      });
      if (dot) {
        gsap.to(dot, { scale: 1.4, duration: 0.2, yoyo: true, repeat: 1 });
      }
    });
    statusBadge.addEventListener('mouseleave', () => {
      gsap.to(statusBadge, {
        scale: 1,
        borderColor: 'rgba(52, 211, 153, 0.3)',
        boxShadow: 'none',
        duration: 0.3,
      });
    });
  }

  const ctaBtn = header.querySelector('.nav-cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('mouseenter', () => {
      gsap.to(ctaBtn, {
        scale: 1.05,
        y: -1.5,
        boxShadow: '0 0 25px rgba(23, 184, 254, 0.55)',
        duration: 0.22,
        ease: 'power2.out',
      });
    });
    ctaBtn.addEventListener('mouseleave', () => {
      gsap.to(ctaBtn, {
        scale: 1,
        y: 0,
        boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.25)',
        duration: 0.3,
        ease: 'power2.out',
      });
    });
    ctaBtn.addEventListener('mousedown', () => {
      gsap.to(ctaBtn, { scale: 0.96, duration: 0.1 });
    });
    ctaBtn.addEventListener('mouseup', () => {
      gsap.to(ctaBtn, { scale: 1.05, duration: 0.15 });
    });
  }
}

/**
 * ------------------------------------------------------------------------------
 * 6. ANIMACIONES DEL HERO (Tipografía, Entrada y Reposo continuo)
 * ------------------------------------------------------------------------------
 */
function initHeroAnimations() {
  const heroBadge = document.querySelector('.hero-badge');
  const words = document.querySelectorAll('.hero-word');
  const desc = document.querySelector('.hero-desc');
  const badgeItems = document.querySelectorAll('.hero-badge-item');
  const cta = document.querySelector('.hero-cta-btn');
  const subtext = document.querySelector('.hero-subtext');
  const highlight = document.querySelector('.hero-highlight');

  if (!words.length) return;

  gsap.set(heroBadge, { y: -15, opacity: 0 });
  gsap.set(words, { y: 35, opacity: 0, rotateX: -25, filter: 'blur(6px)' });
  gsap.set(desc, { y: 20, opacity: 0 });
  gsap.set(badgeItems, { scale: 0.9, opacity: 0, y: 10 });
  gsap.set(cta, { scale: 0.92, opacity: 0, y: 15 });
  gsap.set(subtext, { opacity: 0 });

  // Liberar la clase anti-FOUC para que GSAP tome control continuo y fluido
  document.documentElement.classList.remove('gsap-loading');

  const heroTl = gsap.timeline({
    delay: 0.05,
    onComplete: () => {
      document.documentElement.classList.remove('gsap-loading');
      startHeroIdleLoop();
    },
  });

  heroTl
    .to(heroBadge, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
    .to(words, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: 'blur(0px)',
      duration: 0.85,
      stagger: 0.08,
      ease: 'back.out(1.5)',
    }, '-=0.3')
    .to(desc, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.4')
    .to(badgeItems, {
      scale: 1,
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: 'back.out(1.4)',
    }, '-=0.3')
    .to(cta, {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.6)',
    }, '-=0.2')
    .to(subtext, { opacity: 1, duration: 0.5 }, '-=0.3');

  function startHeroIdleLoop() {
    gsap.to(words, {
      y: -5,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: {
        each: 0.12,
        from: 'center',
      },
    });

    if (highlight) {
      gsap.to(highlight, {
        filter: 'drop-shadow(0 0 35px rgba(23,184,254,0.85)) drop-shadow(0 0 55px rgba(168,85,247,0.55))',
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    words.forEach((word) => {
      word.addEventListener('mouseenter', () => {
        gsap.to(word, {
          y: -8,
          scale: 1.08,
          duration: 0.18,
          ease: 'power1.out',
          onComplete: () => {
            gsap.to(word, { y: 0, scale: 1, duration: 0.35, ease: 'bounce.out' });
          },
        });
      });
    });
  }
}

/**
 * ------------------------------------------------------------------------------
 * 7. ANIMACIONES DE ELEMENTOS INTERNOS POR SECCIÓN (ScrollTrigger)
 * ------------------------------------------------------------------------------
 */
function initScrollTriggerAnimations() {

  // 7.1 Auditoría & Memoria (#auditoria)
  const auditoriaSection = document.querySelector('#auditoria');
  if (auditoriaSection) {
    const headerBlock = auditoriaSection.querySelector('.text-center');
    const softwareWindow = auditoriaSection.querySelector('.rounded-xl.border');
    const alertBanner = auditoriaSection.querySelector('.bg-\\[\\#241c03\\]\\/85');
    const tableRows = auditoriaSection.querySelectorAll('tbody tr');

    const audTl = gsap.timeline({
      scrollTrigger: {
        trigger: auditoriaSection,
        start: 'top 85%',
        once: true,
      },
      defaults: { ease: 'power3.out' },
    });

    if (headerBlock) {
      audTl.from(headerBlock.children, {
        y: 35,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        clearProps: 'all',
      });
    }

    if (softwareWindow) {
      audTl.from(softwareWindow, {
        y: 45,
        scale: 0.97,
        opacity: 0,
        duration: 0.75,
        clearProps: 'opacity,transform,scale',
      }, '-=0.3');
    }

    if (alertBanner) {
      audTl.from(alertBanner, {
        x: -25,
        opacity: 0,
        duration: 0.5,
        clearProps: 'all',
      }, '-=0.35');
    }

    if (tableRows.length) {
      audTl.from(tableRows, {
        x: -20,
        opacity: 0,
        duration: 0.35,
        stagger: 0.035,
        clearProps: 'all',
      }, '-=0.25');
    }
  }

  // 7.2 Capacidades Centrales (#capacidades)
  const capacidadesSection = document.querySelector('#capacidades');
  if (capacidadesSection) {
    const capHeader = capacidadesSection.querySelector('.text-center');
    const featureCards = capacidadesSection.querySelectorAll('.grid > div');

    const capTl = gsap.timeline({
      scrollTrigger: {
        trigger: capacidadesSection,
        start: 'top 85%',
        once: true,
      },
      defaults: { ease: 'power3.out' },
    });

    if (capHeader) {
      capTl.from(capHeader.children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        clearProps: 'all',
      });
    }

    if (featureCards.length) {
      capTl.from(featureCards, {
        y: 40,
        opacity: 0,
        scale: 0.95,
        duration: 0.65,
        stagger: 0.12,
        clearProps: 'all',
      }, '-=0.3');

      featureCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { y: -7, duration: 0.25, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
        });
      });
    }
  }

  // 7.3 Descargas (#descarga)
  const descargaSection = document.querySelector('#descarga');
  if (descargaSection) {
    const descHeader = descargaSection.querySelector('.text-center');
    const downloadCard = descargaSection.querySelector('.max-w-md');
    const specsNote = descargaSection.querySelector('.max-w-3xl');

    const descTl = gsap.timeline({
      scrollTrigger: {
        trigger: descargaSection,
        start: 'top 85%',
        once: true,
      },
      defaults: { ease: 'power3.out' },
    });

    if (descHeader) {
      descTl.from(descHeader.children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        clearProps: 'all',
      });
    }

    if (downloadCard) {
      descTl.from(downloadCard, {
        scale: 0.92,
        y: 40,
        opacity: 0,
        duration: 0.75,
        ease: 'back.out(1.3)',
        clearProps: 'opacity,transform',
      }, '-=0.3');

      gsap.to(downloadCard, {
        boxShadow: '0 0 45px rgba(23, 184, 254, 0.45)',
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    if (specsNote) {
      descTl.from(specsNote, {
        y: 25,
        opacity: 0,
        duration: 0.55,
        clearProps: 'all',
      }, '-=0.2');
    }
  }

  // 7.4 Donaciones (#donaciones)
  const donacionesSection = document.querySelector('#donaciones');
  if (donacionesSection) {
    const donHeader = donacionesSection.querySelector('.text-center');
    const tierCards = donacionesSection.querySelectorAll('.grid > div');

    const donTl = gsap.timeline({
      scrollTrigger: {
        trigger: donacionesSection,
        start: 'top 85%',
        once: true,
      },
      defaults: { ease: 'power3.out' },
    });

    if (donHeader) {
      donTl.from(donHeader.children, {
        y: 35,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        clearProps: 'all',
      });
    }

    if (tierCards.length) {
      donTl.from(tierCards, {
        y: 45,
        opacity: 0,
        scale: 0.95,
        duration: 0.7,
        stagger: 0.13,
        clearProps: 'all',
      }, '-=0.3');

      tierCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { y: -8, duration: 0.25, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
        });
      });
    }
  }

  // 7.5 Preguntas Frecuentes FAQ (#faq)
  const faqSection = document.querySelector('#faq');
  if (faqSection) {
    const faqHeader = faqSection.querySelector('.text-center');
    const faqItems = faqSection.querySelectorAll('.faq-accordion-list > div, .space-y-4 > div');

    const faqTl = gsap.timeline({
      scrollTrigger: {
        trigger: faqSection,
        start: 'top 85%',
        once: true,
      },
      defaults: { ease: 'power3.out' },
    });

    if (faqHeader) {
      faqTl.from(faqHeader.children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        clearProps: 'all',
      });
    }

    if (faqItems.length) {
      faqTl.from(faqItems, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        clearProps: 'all',
      }, '-=0.25');

      faqItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
          gsap.to(item, {
            x: 6,
            borderColor: 'rgba(23, 184, 254, 0.45)',
            duration: 0.2,
          });
        });
        item.addEventListener('mouseleave', () => {
          gsap.to(item, {
            x: 0,
            borderColor: 'rgba(22, 34, 63, 1)',
            duration: 0.25,
          });
        });
      });
    }
  }

  // 7.6 Pie de Página (Footer)
  const siteFooter = document.querySelector('.site-footer');
  if (siteFooter) {
    gsap.from(siteFooter, {
      scrollTrigger: {
        trigger: siteFooter,
        start: 'top 95%',
        once: true,
      },
      y: 25,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'all',
    });
  }
}

/**
 * ------------------------------------------------------------------------------
 * GESTIÓN DE RECALCULO DE SCROLLTRIGGER Y LENIS
 * ------------------------------------------------------------------------------
 */
function setupScrollTriggerRefreshes() {
  const refreshAll = () => {
    ScrollTrigger.refresh();
    if (lenisInstance) {
      lenisInstance.resize();
    }
  };

  window.addEventListener('load', refreshAll);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshAll);
  }

  setTimeout(refreshAll, 400);
  setTimeout(refreshAll, 1200);
}

/**
 * ------------------------------------------------------------------------------
 * INICIALIZADOR PRINCIPAL
 * ------------------------------------------------------------------------------
 */
function initAllAnimations() {
  // 0. Motor de desplazamiento suave Lenis
  initSmoothScrollLenis();

  // 1. Lienzo global interactivo de matriz de puntos y resplandor al cursor
  initGlobalDotMatrixCanvas();

  // 2. Transiciones Cinemáticas Variadas entre Secciones (Zoom, Split, Dolly, 3D, Láser)
  initCreativeSectionTransitions();

  // 3. Transiciones de escala suave de las secciones de contenido
  initSectionZoomTransitions();

  // 4. Animación de entrada exclusiva de la Navbar (solo al cargar)
  initNavbarEntranceAnimation();

  // 5. Micro-interacciones de cursor (hover) dentro de la Navbar
  initNavbarHoverInteractions();

  // 6. Animación tipográfica y elementos del Hero
  initHeroAnimations();

  // 7. Animaciones de scroll para elementos internos
  initScrollTriggerAnimations();

  // 8. Configuración de refrescos automáticos de ScrollTrigger y Lenis
  setupScrollTriggerRefreshes();
}

// Escuchar evento de carga seguro en el navegador
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAnimations);
} else {
  initAllAnimations();
}
