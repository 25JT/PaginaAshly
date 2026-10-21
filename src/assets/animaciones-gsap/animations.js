/**
 * ==============================================================================
 * Ashly 3.0 - Sistema Central de Animaciones GSAP, ScrollTrigger & Lenis
 * Ubicación: src/assets/animaciones-gsap/animations.js
 * 
 * Este archivo controla:
 * 0. Desplazamiento ultra-suave (Smooth Scroll) mediante Lenis sincronizado
 *    con el Ticker de GSAP y ScrollTrigger.
 * 1. Animación exclusiva de entrada de la barra de navegación (Navbar).
 * 2. Micro-interacciones de hover sobre cada elemento de la Nav.
 * 3. Animación de entrada y reposo continuo para la tipografía del Hero.
 * 4. Animaciones disparadas por Scroll (ScrollTrigger) a lo largo de toda la página
 *    (Eventos de auditoría en tiempo real, tarjetas de capacidades, descargas,
 *    tarjetas de donaciones, acordeón de preguntas frecuentes FAQ y footer).
 * 5. Navegación fluida por enlaces ancla (#auditoria, #descarga, etc.) mediante Lenis.
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
  // Evitar doble inicialización
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.25, // Duración de la desaceleración suave
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva exponencial suave estándar
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95, // Sensibilidad equilibrada de la rueda
    touchMultiplier: 1.8,
    infinite: false,
  });

  // 0.1 Sincronizar el scroll de Lenis con ScrollTrigger para que las coordenadas
  // de disparo se actualicen en tiempo real durante la inercia
  lenisInstance.on('scroll', ScrollTrigger.update);

  // 0.2 Conectar el motor de cuadros de Lenis al Ticker principal de GSAP
  // Esto elimina cualquier efecto de tirón o parpadeo (60fps / 120fps nativos)
  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });

  // 0.3 Desactivar el lagSmoothing de GSAP para que el scroll responda de inmediato
  gsap.ticker.lagSmoothing(0);

  // 0.4 Navegación suave al pulsar cualquier enlace con ancla (#)
  // (ej. "Memoria & Auditoría", "Descargas", "Donaciones", "FAQ")
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        // Desplazamiento cinematográfico hasta la sección,
        // compensando la altura de la cabecera fija (-70px)
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
 * 1. ANIMACIÓN DE ENTRADA DE LA BARRA DE NAVEGACIÓN (Solo al cargar la página)
 * ------------------------------------------------------------------------------
 * Hace que el header descienda suavemente desde la parte superior de la pantalla
 * y que sus elementos internos (logo, enlaces, badge de estado y botón)
 * aparezcan de manera escalonada y armónica.
 */
function initNavbarEntranceAnimation() {
  const header = document.querySelector('#main-header');
  if (!header) return;

  const brand = header.querySelector('.nav-brand');
  const links = header.querySelectorAll('.nav-link');
  const statusBadge = header.querySelector('.nav-status-badge');
  const ctaBtn = header.querySelector('.nav-cta-btn');

  // Estado inicial del contenedor de la barra de navegación
  gsap.set(header, {
    y: -80,
    opacity: 0,
  });

  // Estado inicial de los elementos internos
  if (brand) gsap.set(brand, { opacity: 0, x: -25, scale: 0.9 });
  if (links.length) gsap.set(links, { opacity: 0, y: -15 });
  if (statusBadge) gsap.set(statusBadge, { opacity: 0, scale: 0.8 });
  if (ctaBtn) gsap.set(ctaBtn, { opacity: 0, x: 25, scale: 0.9 });

  // Línea de tiempo de entrada
  const navTl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    delay: 0.15,
    onComplete: () => {
      // Limpiar propiedades inline para no interferir con posicionamiento CSS sticky
      gsap.set(header, { clearProps: 'transform,opacity' });
      if (brand) gsap.set(brand, { clearProps: 'opacity,transform,scale' });
      if (links.length) gsap.set(links, { clearProps: 'opacity,transform' });
      if (statusBadge) gsap.set(statusBadge, { clearProps: 'opacity,scale' });
      if (ctaBtn) gsap.set(ctaBtn, { clearProps: 'opacity,transform,scale' });
    }
  });

  // 1.1 Descenso suave del navbar completo
  navTl.to(header, {
    y: 0,
    opacity: 1,
    duration: 0.75,
  })
  // 1.2 Aparición de la marca y logo
  .to(brand, {
    opacity: 1,
    x: 0,
    scale: 1,
    duration: 0.5,
  }, '-=0.4')
  // 1.3 Aparición escalonada de los enlaces de navegación
  .to(links, {
    opacity: 1,
    y: 0,
    duration: 0.45,
    stagger: 0.07,
  }, '-=0.35')
  // 1.4 Aparición del badge de sistema operativo
  .to(statusBadge, {
    opacity: 1,
    scale: 1,
    duration: 0.4,
    ease: 'back.out(1.5)',
  }, '-=0.25')
  // 1.5 Entrada elástica del botón CTA de descarga
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
 * 2. MICRO-INTERACCIONES AL PASAR EL CURSOR (HOVER) EN LA NAVBAR
 * ------------------------------------------------------------------------------
 * Añade dinamismo reactivo a los elementos de la barra sin modificar su posición
 * pegajosa (sticky) fija en la pantalla.
 */
function initNavbarHoverInteractions() {
  const header = document.querySelector('#main-header');
  if (!header) return;

  // 2.1 Hover en el Logo de Ashly: ligera escala, rotación y brillo cian
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

  // 2.2 Hover en los Enlaces de Navegación: sutil elevación y resplandor
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

  // 2.3 Hover en la Insignia de Estado ("SISTEMA 100% OPERATIVO"):
  // Expande el contenedor y hace pulsar el indicador verde
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

  // 2.4 Hover en el Botón CTA de Descarga en Nav:
  // Elevación con sombra luminosa y efecto de click táctil
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
 * 3. ANIMACIONES DEL HERO (Tipografía, Entrada y Reposo continuo)
 * ------------------------------------------------------------------------------
 * Revela el titular palabra por palabra de forma escalonada con rotación 3D,
 * seguido de una onda flotante continua y resplandor neón en reposo.
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

  // Estado inicial
  gsap.set(heroBadge, { y: -20, opacity: 0 });
  gsap.set(words, { y: 45, opacity: 0, rotateX: -35, filter: 'blur(8px)' });
  gsap.set(desc, { y: 25, opacity: 0 });
  gsap.set(badgeItems, { scale: 0.85, opacity: 0, y: 15 });
  gsap.set(cta, { scale: 0.9, opacity: 0, y: 20 });
  gsap.set(subtext, { opacity: 0 });

  // Línea de tiempo de entrada al cargar
  const heroTl = gsap.timeline({
    delay: 0.3,
    onComplete: () => {
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

  // Animación en reposo continuo cuando ya cargó
  function startHeroIdleLoop() {
    // 3.1 Onda flotante senoidal continua en cada palabra del titular
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

    // 3.2 Resplandor neón pulsante en "Opera en tu ordenador."
    if (highlight) {
      gsap.to(highlight, {
        filter: 'drop-shadow(0 0 35px rgba(23,184,254,0.85)) drop-shadow(0 0 55px rgba(168,85,247,0.55))',
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // 3.3 Reacción táctil interactiva al pasar el cursor sobre cualquier palabra
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
 * 4. ANIMACIONES CON SCROLL (ScrollTrigger) PARA TODA LA PÁGINA
 * ------------------------------------------------------------------------------
 * Cada sección se activa con su propio timeline coordinado disparado al 85%
 * del viewport. Se usa 'once: true' y 'clearProps: all' para evitar que
 * cualquier tarjeta o elemento quede bloqueado en opacity: 0.
 */
function initScrollTriggerAnimations() {

  /**
   * 4.1 SECCIÓN DE SEGURIDAD & AUDITORÍA (#auditoria)
   * Anima el encabezado, la ventana del software mockup y las 14 filas
   * de eventos de auditoría de forma escalonada en un timeline coordinado.
   */
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

  /**
   * 4.2 SECCIÓN DE CAPACIDADES CENTRALES (#capacidades)
   * Se ejecuta en un timeline unificado al entrar la sección.
   * Garantiza que las 3 tarjetas de capacidades (Planner, Memoria, Local)
   * siempre aparezcan fluidamente junto al encabezado.
   */
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

      // Micro-interacción al hacer hover en cada tarjeta
      featureCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -7,
            duration: 0.25,
            ease: 'power2.out',
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
          });
        });
      });
    }
  }

  /**
   * 4.3 SECCIÓN DE DESCARGAS (#descarga)
   * Anima el título, la tarjeta del instalador de Windows y la nota de requisitos.
   */
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

      // Resplandor pulsante continuo en la tarjeta de descarga
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

  /**
   * 4.4 SECCIÓN DE DONACIONES (#donaciones)
   * Timeline unificado para encabezado y las 3 tarjetas de tiers (Fan, Tester, Sponsor).
   * Al estar en el mismo timeline, las tarjetas nunca se quedan invisibles.
   */
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

      // Efecto hover sobre cada tarjeta de donación
      tierCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -8,
            duration: 0.25,
            ease: 'power2.out',
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
          });
        });
      });
    }
  }

  /**
   * 4.5 SECCIÓN DE PREGUNTAS FRECUENTES FAQ (#faq)
   * Timeline unificado para encabezado y los acordeones FAQ.
   * Evita cualquier desajuste de scroll y asegura que las preguntas aparezcan siempre.
   */
  const faqSection = document.querySelector('#faq');
  if (faqSection) {
    const faqHeader = faqSection.querySelector('.text-center');
    const faqItems = faqSection.querySelectorAll('.space-y-4 > div');

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

      // Micro-interacción hover en las preguntas FAQ
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

  /**
   * 4.6 PIE DE PÁGINA (Footer)
   * Entrada sutil al aproximarse al final de la página.
   */
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
 * Asegura que cuando las fuentes de Google Fonts (Sora, Inter) y las imágenes
 * externas terminen de renderizarse, ScrollTrigger y Lenis recalculen las
 * alturas exactas del documento para un desplazamiento 100% coordinado.
 */
function setupScrollTriggerRefreshes() {
  const refreshAll = () => {
    ScrollTrigger.refresh();
    if (lenisInstance) {
      lenisInstance.resize();
    }
  };

  // 1. Refresco cuando la ventana y todas las imágenes cargan completamente
  window.addEventListener('load', refreshAll);

  // 2. Refresco cuando las fuentes web personalizadas estén listas
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshAll);
  }

  // 3. Refrescos de seguridad tras estabilización del layout dinámico
  setTimeout(refreshAll, 400);
  setTimeout(refreshAll, 1200);
}

/**
 * ------------------------------------------------------------------------------
 * INICIALIZADOR PRINCIPAL
 * Ejecuta todas las animaciones una vez que el DOM está listo en el navegador.
 * ------------------------------------------------------------------------------
 */
function initAllAnimations() {
  // 0. Inicialización de Lenis Smooth Scroll y sincronización con GSAP
  initSmoothScrollLenis();

  // 1. Animación de entrada exclusiva de la Navbar (solo al cargar)
  initNavbarEntranceAnimation();

  // 2. Micro-interacciones de cursor (hover) dentro de la Navbar
  initNavbarHoverInteractions();

  // 3. Animación tipográfica y elementos del Hero
  initHeroAnimations();

  // 4. Animaciones de scroll vinculadas a la posición del usuario (ScrollTrigger)
  initScrollTriggerAnimations();

  // 5. Configuración de refrescos automáticos de ScrollTrigger y Lenis
  setupScrollTriggerRefreshes();
}

// Escuchar evento de carga seguro en el navegador
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAnimations);
} else {
  initAllAnimations();
}
