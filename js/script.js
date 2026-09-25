/**
 * ==========================================================================
 * STACKLY MOTORS - MASTER SCRIPT (js/script.js)
 * Strict Single JavaScript File Architecture
 * Handles all 10 pages conditionally via document.body.dataset.page
 * ==========================================================================
 */

(function () {
  'use strict';

  // Global Popup Alert Protection: Ensure NO browser popup alerts/dialogs appear anywhere
  if (typeof window !== 'undefined') {
    window.alert = function (msg) {
      console.warn('[Popup Alert Suppressed]:', msg);
    };
    window.confirm = function (msg) {
      console.warn('[Popup Confirm Suppressed]:', msg);
      return true;
    };
    window.prompt = function (msg, def) {
      console.warn('[Popup Prompt Suppressed]:', msg);
      return def || '';
    };
  }

  // Execute initApp when DOM is ready or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  function initApp() {
    initPreloader();
    const page = document.body.dataset.page || detectPageFallback();

    // 1. Core Global Modules (common across public and dashboard views)
    if (typeof initCustomCursor === 'function') initCustomCursor();
    if (typeof initButtonEffects === 'function') initButtonEffects();
    if (typeof initIntersectionObserver === 'function') initIntersectionObserver();
    if (typeof initScrollReveal === 'function') initScrollReveal();
    initGlobal404Redirection();

    // Ensure dashboard user identity is dynamically populated from login storage
    if (page.includes('dashboard') || (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('dashboard'))) {
      const role = (page.includes('admin') || (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('admin'))) ? 'admin' : (page.includes('client') ? 'client' : 'user');
      if (typeof applyDashboardUserIdentity === 'function') {
        applyDashboardUserIdentity(role);
      }
    }

    // 2. Public Layout Modules (Navbar, Footer, Modals)
    if (document.querySelector('.site-header') && typeof initNavbar === 'function') {
      initNavbar();
    }

    // 3. Page-Specific Initializations
    switch (page) {
      case 'home':
        initHomePage();
        break;
      case 'about':
        initAboutPage();
        break;
      case 'services':
        initServicesPage();
        break;
      case 'blog':
        initBlogPage();
        break;
      case 'contact':
        initContactPage();
        break;
      case 'login':
        initLoginPage();
        break;
      case 'signup':
        initSignupPage();
        break;
      case 'user-dashboard':
        initUserDashboard();
        break;
      case 'client-dashboard':
        initClientDashboard();
        break;
      case 'admin-dashboard':
        initAdminDashboard();
        break;
      case '404':
        init404Page();
        break;
      default:
        // Try to initialize components if their elements are present in DOM
        initComponentFallbacks();
        break;
    }
  }

  /**
   * Fallback page detection based on pathname
   */
  function detectPageFallback() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('about')) return 'about';
    if (path.includes('service')) return 'services';
    if (path.includes('blog')) return 'blog';
    if (path.includes('contact')) return 'contact';
    if (path.includes('login')) return 'login';
    if (path.includes('signup')) return 'signup';
    if (path.includes('admin-dashboard') || path.includes('admindashboard')) return 'admin-dashboard';
    if (path.includes('user-dashboard') || path.includes('userdashboard')) return 'user-dashboard';
    if (path.includes('client-dashboard') || path.includes('clientdashboard')) return 'client-dashboard';
    if (path.includes('404')) return '404';
    return 'home';
  }

  /* ==========================================================================
     GLOBAL MODULES
     ========================================================================== */

  /**
   * Luxury Global Site Preloader Animation
   */
  function initPreloader() {
    const preloader = document.getElementById('sitePreloader');
    if (!preloader) return;

    let isDismissed = false;
    const hidePreloader = () => {
      if (isDismissed) return;
      isDismissed = true;
      preloader.classList.add('loaded');
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.style.display = 'none';
        }
      }, 600);
    };

    // Smooth transition out on page readiness
    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, 400);
    } else {
      window.addEventListener('load', () => {
        setTimeout(hidePreloader, 400);
      });
      // Safety timer fallback to guarantee clean display
      setTimeout(hidePreloader, 1400);
    }
  }

  /**
   * Luxury Custom Cursor (Follower + Dot)
   */
  function initCustomCursor() {
    // Only run on desktop devices that support hover
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 992) return;

    let dot = document.querySelector('.cursor-dot');
    let follower = document.querySelector('.cursor-follower');

    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'cursor-dot';
      document.body.appendChild(dot);
    }

    if (!follower) {
      follower = document.createElement('div');
      follower.className = 'cursor-follower';
      document.body.appendChild(follower);
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function animateFollower() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
      requestAnimationFrame(animateFollower);
    }
    requestAnimationFrame(animateFollower);

    // Interactive Hover States
    const interactives = document.querySelectorAll('a, button, input, select, textarea, .category-card, .vehicle-card, .menu-toggle');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => follower.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => follower.classList.remove('cursor-hover'));
    });
  }

  /**
   * Button Ripple & Magnetic Effect
   */
  function initButtonEffects() {
    // Ripple effect
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });

    // Subtle magnetic effect on desktop
    if (!window.matchMedia('(pointer: coarse)').matches && window.innerWidth >= 992) {
      const magneticBtns = document.querySelectorAll('.btn-gold, .btn-outline-gold');
      magneticBtns.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translate(0px, 0px)';
        });
      });
    }
  }

  /**
   * Intersection Observer for AOS Entrance Animations
   */
  function initIntersectionObserver() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    if (!animatedElements.length) return;

    // Enable animation class on body only when observer is ready
    document.body.classList.add('js-animate-ready');

    const revealElement = (el) => {
      el.classList.add('aos-animate');
      if (el.style.opacity === '0') {
        el.style.removeProperty('opacity');
      }
    };

    if (!('IntersectionObserver' in window)) {
      animatedElements.forEach(revealElement);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '120px 0px 120px 0px' }
    );

    animatedElements.forEach((el) => {
      observer.observe(el);
      // Immediately reveal elements already near or inside the initial viewport
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 150) {
        revealElement(el);
      }
    });

    // Safety fallback: Ensure ALL elements are visible after 500ms
    setTimeout(() => {
      animatedElements.forEach(revealElement);
    }, 500);
  }

  /**
   * Public Navigation Bar & Mobile Drawer
   */
  function initNavbar() {
    const header = document.querySelector('.site-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileBackdrop = document.querySelector('.mobile-nav-backdrop');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    // Sticky Scroll transition
    function checkScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    // Mobile Hamburger Toggle
    if (menuToggle && mobileNav) {
      function toggleMobileNav() {
        const isOpen = mobileNav.classList.contains('active');
        if (isOpen) {
          closeMobileNav();
        } else {
          openMobileNav();
        }
      }

      function openMobileNav() {
        menuToggle.classList.add('active');
        mobileNav.classList.add('active');
        if (mobileBackdrop) mobileBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      }

      function closeMobileNav() {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        if (mobileBackdrop) mobileBackdrop.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }

      menuToggle.addEventListener('click', toggleMobileNav);
      if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileNav);
      const closeBtn = mobileNav.querySelector('.mobile-nav-close, #mobileNavClose');
      if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);

      // Close mobile nav when clicking a link
      const mobileItems = mobileNav.querySelectorAll('a');
      mobileItems.forEach((link) => link.addEventListener('click', closeMobileNav));
    }

    // Active page indicator
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ==========================================================================
     HOME & ABOUT PAGE MODULES
     ========================================================================== */

  function initHomePage() {
    initScrollReveal();
    initDynamicCounters();
    initHeroSlider();
    initInteractiveTiltAndHover();
    initScrollProgressBar();
    initHeroParticles();
    initCard3DTilt();
    initCaseStudyParallax();
    initTestimonialLoop();
    initBackToTop();
    initNewsletterForm();
  }

  function initAboutPage() {
    initScrollReveal();
    initDynamicCounters();
    initScrollProgressBar();
    initCard3DTilt();
    initAboutAnimations();
    initBackToTop();
  }

  /**
   * Dedicated Interactive Animations for About Page
   */
  function initAboutAnimations() {
    // 1. Ambient Hero Particle Canvas
    initAboutHeroParticles();

    // 2. Interactive mouse parallax on diamond gallery
    const diamondWrap = document.querySelector('.diamond-gallery-wrap');
    if (diamondWrap && !window.matchMedia('(pointer: coarse)').matches) {
      diamondWrap.addEventListener('mousemove', (e) => {
        const rect = diamondWrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        const top = diamondWrap.querySelector('.diamond-top');
        const right = diamondWrap.querySelector('.diamond-right');
        const bottom = diamondWrap.querySelector('.diamond-bottom');

        if (top) top.style.transform = `rotate(45deg) translate(${x * 16}px, ${y * 16}px)`;
        if (right) right.style.transform = `rotate(45deg) translate(${x * -20}px, ${y * -20}px)`;
        if (bottom) bottom.style.transform = `rotate(45deg) translate(${x * 12}px, ${y * 12}px)`;
      });

      diamondWrap.addEventListener('mouseleave', () => {
        const cards = diamondWrap.querySelectorAll('.diamond-card');
        cards.forEach(card => card.style.transform = 'rotate(45deg) translate(0px, 0px)');
      });
    }

    // 3. Process Cards Cursor Spotlight Tracking
    const processCards = document.querySelectorAll('.process-stage-card');
    if (processCards.length && !window.matchMedia('(pointer: coarse)').matches) {
      processCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
      });
    }

    // 4. Timeline Fill Line & Beacon Glow on Scroll
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineLine = document.querySelector('.timeline-line');
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (timelineContainer && timelineLine) {
      let timelineTicking = false;
      const updateTimeline = () => {
        const rect = timelineContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight && rect.bottom > 0) {
          const totalDist = rect.height;
          const currentDist = windowHeight * 0.7 - rect.top;
          const fillPct = Math.min(Math.max((currentDist / totalDist) * 100, 0), 100);
          timelineLine.style.setProperty('--timeline-fill', `${fillPct}%`);

          // Activate markers when the laser passes them
          timelineItems.forEach((item) => {
            const itemRect = item.getBoundingClientRect();
            const triggerPoint = windowHeight * 0.75;
            if (itemRect.top <= triggerPoint) {
              item.classList.add('is-active');
            }
          });
        }
        timelineTicking = false;
      };

      window.addEventListener('scroll', () => {
        if (!timelineTicking) {
          window.requestAnimationFrame(updateTimeline);
          timelineTicking = true;
        }
      }, { passive: true });

      // Run once on load
      updateTimeline();
    }

    if (timelineItems.length && 'IntersectionObserver' in window) {
      const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

      timelineItems.forEach(item => timelineObserver.observe(item));
    }

    // 5. Featured Production Media Dual-Depth Parallax
    const caseCollage = document.querySelector('.case-media-collage');
    if (caseCollage && !window.matchMedia('(pointer: coarse)').matches) {
      const mainCard = caseCollage.querySelector('.collage-main-card');
      const subCard = caseCollage.querySelector('.collage-sub-card');

      caseCollage.addEventListener('mousemove', (e) => {
        const rect = caseCollage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        if (mainCard) mainCard.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
        if (subCard) subCard.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
      });

      caseCollage.addEventListener('mouseleave', () => {
        if (mainCard) mainCard.style.transform = 'translate(0px, 0px)';
        if (subCard) subCard.style.transform = 'translate(0px, 0px)';
      });
    }
  }

  /**
   * Ambient Floating Golden Particles in About Hero
   */
  function initAboutHeroParticles() {
    const canvas = document.getElementById('aboutHeroCanvas');
    const hero = document.getElementById('about-hero');
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationId = null;
    let isVisible = true;

    const resize = () => {
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    };

    class AboutParticle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 2 + 0.8;
        this.speedY = Math.random() * 0.4 + 0.15;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.alpha = Math.random() * 0.4 + 0.15;
        this.color = Math.random() > 0.4 ? 'rgba(253, 83, 1, ' : 'rgba(244, 173, 115, ';
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.shadowColor = 'rgba(253, 83, 1, 0.4)';
        ctx.shadowBlur = this.size * 3;
        ctx.fill();
        ctx.restore();
      }
    }

    resize();
    const count = Math.min(Math.floor(width / 35), 45);
    for (let i = 0; i < count; i++) {
      particles.push(new AboutParticle());
    }

    const render = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationId = requestAnimationFrame(render);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animationId) {
            render();
          } else if (!isVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        });
      }, { threshold: 0.1 });
      observer.observe(hero);
    }

    render();
    window.addEventListener('resize', resize, { passive: true });
  }

  /**
   * Global Scroll Progress Bar
   */
  function initScrollProgressBar() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = `${pct}%`;
    }, { passive: true });
  }

  /**
   * Floating Back to Top Button
   */
  function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Scroll Reveal Animation using IntersectionObserver
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (!revealElements.length) return;

    const reveal = (el) => {
      el.classList.add('is-revealed');
    };

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '120px 0px 120px 0px'
    });

    revealElements.forEach(el => {
      observer.observe(el);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 300) {
        reveal(el);
      }
    });

    // Safety fallback ensures everything is revealed
    setTimeout(() => {
      revealElements.forEach(reveal);
    }, 400);
  }

  /**
   * Smooth Easing Number Counters (41, 840, 340+, 99%, 12, 0)
   */
  function initDynamicCounters() {
    const counters = document.querySelectorAll('.count-up');
    if (!counters.length) return;

    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute('data-target') || '0');
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 2000;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease Out Quart
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentVal = Math.floor(ease * target);
        el.textContent = currentVal + (progress === 1 ? suffix : '');

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          el.textContent = target + suffix;
          el.classList.add('counted');
        }
      }

      requestAnimationFrame(updateNumber);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '100px 0px 100px 0px' });

    counters.forEach(c => {
      counterObserver.observe(c);
      const rect = c.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        animateCount(c);
      }
    });
  }

  /**
   * Top Reading Scroll Progress Bar
   */
  function initScrollProgressBar() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;

    let ticking = false;
    const updateProgress = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
      bar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    updateProgress();
  }

  /**
   * Hero Ambient Floating Golden/Orange Dust Particles
   */
  function initHeroParticles() {
    const canvas = document.getElementById('heroParticlesCanvas');
    const hero = document.getElementById('hero');
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationId = null;
    let isHeroVisible = true;
    let mouse = { x: -1000, y: -1000, radius: 110 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const colors = [
      'rgba(253, 83, 1, 0.45)',
      'rgba(244, 173, 115, 0.55)',
      'rgba(255, 255, 255, 0.4)',
      'rgba(253, 83, 1, 0.25)'
    ];

    const particleCount = window.innerWidth < 768 ? 22 : 45;
    const particles = [];

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * (width || window.innerWidth);
        this.y = initial ? Math.random() * (height || 800) : (height || 800) + 10;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedY = Math.random() * 0.45 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.opacity = Math.random() * 0.5 + 0.25;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.y -= this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.25;

        // Gentle cursor repulsion
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2;
          this.y -= (dy / dist) * force * 2;
        }

        if (this.y < -15 || this.x < -20 || this.x > width + 20) {
          this.reset(false);
        }
      }
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = 'rgba(253, 83, 1, 0.6)';
        ctx.shadowBlur = this.size * 3;
        ctx.fill();
        ctx.restore();
      }
    }

    resize();
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    const render = () => {
      if (!isHeroVisible) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(render);
    };

    // Pause rendering when hero is off-screen for maximum performance
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible && !animationId) {
          animationId = requestAnimationFrame(render);
        } else if (!isHeroVisible && animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      });
    }, { threshold: 0.05 });

    heroObserver.observe(hero);
    animationId = requestAnimationFrame(render);

    window.addEventListener('resize', () => {
      resize();
    }, { passive: true });
  }

  /**
   * 3D Dynamic Card Tilt on Cursor Movement (Format Cards & Testimonials)
   */
  function initCard3DTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cards = document.querySelectorAll('.format-card, .testimonial-peach-card, .process-step-card, .process-stage-card, .team-card, .timeline-content');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0px)';
      });
    });
  }

  /**
   * Interactive Dual-Image Parallax in Case Study Spotlight
   */
  function initCaseStudyParallax() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const container = document.querySelector('.case-study-media');
    const imgTop = document.querySelector('.case-study-img-top');
    const imgBottom = document.querySelector('.case-study-img-bottom');
    if (!container || !imgTop || !imgBottom) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      imgTop.style.transform = `translate(${x * -16}px, ${y * -16}px) scale(1.02)`;
      imgBottom.style.transform = `translate(${x * 18}px, ${y * 18}px) scale(1.02)`;
    });

    container.addEventListener('mouseleave', () => {
      imgTop.style.transform = 'translate(0px, 0px) scale(1)';
      imgBottom.style.transform = 'translate(0px, 0px) scale(1)';
    });
  }

  /**
   * Testimonials Infinite Marquee Interactive Controls
   * Pauses smooth loop on touchstart for reading, resumes on release
   */
  function initTestimonialLoop() {
    const loopContainer = document.querySelector('.testimonials-loop-container');
    const loopTrack = document.querySelector('.testimonials-loop-track');
    if (!loopContainer || !loopTrack) return;

    // Mobile / touch interactions
    loopContainer.addEventListener('touchstart', () => {
      loopTrack.classList.add('is-paused');
    }, { passive: true });

    loopContainer.addEventListener('touchend', () => {
      loopTrack.classList.remove('is-paused');
    }, { passive: true });

    loopContainer.addEventListener('touchcancel', () => {
      loopTrack.classList.remove('is-paused');
    }, { passive: true });
  }

  /**
   * Floating Back to Top Button
   */
  function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /**
   * Hero Image Auto-Scrolling Carousel (Changes smoothly every 3 seconds)
   */
  function initHeroSlider() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const track = slider.querySelector('.hero-slider-track');
    const slides = slider.querySelectorAll('.hero-slide');
    const dots = slider.querySelectorAll('.hero-slider-dot');
    if (!track || slides.length <= 1) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoSlideTimer = null;

    function goToSlide(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('active');
          dot.removeAttribute('aria-current');
        }
      });
    }

    function startAutoSlide() {
      stopAutoSlide();
      autoSlideTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 3000); // 3-second auto-transition
    }

    function stopAutoSlide() {
      if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
        autoSlideTimer = null;
      }
    }

    // Interactive dot pagination clicks
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(slideIndex)) {
          goToSlide(slideIndex);
          startAutoSlide(); // Reset 3s timer on manual interaction
        }
      });
    });

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    // Mobile touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;
    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoSlide();
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 45) {
        goToSlide(currentIndex + 1);
      } else if (touchEndX - touchStartX > 45) {
        goToSlide(currentIndex - 1);
      }
      startAutoSlide();
    }, { passive: true });

    // Start auto slide immediately
    startAutoSlide();
  }

  /**
   * Micro-interactions: Card Hover Physics & Arch Parallax
   */
  function initInteractiveTiltAndHover() {
    const heroFrame = document.querySelector('.hero-image-frame');
    if (heroFrame && !window.matchMedia('(pointer: coarse)').matches) {
      heroFrame.addEventListener('mousemove', (e) => {
        const rect = heroFrame.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        heroFrame.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.01)`;
      });

      heroFrame.addEventListener('mouseleave', () => {
        heroFrame.style.transform = 'perspective(1000px) rotateY(-2deg) rotateX(0deg) scale(1)';
      });
    }

    // Format cards subtle magnetic shift
    const formatCards = document.querySelectorAll('.format-card');
    formatCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }

  /**
   * Interactive Newsletter Form with Validation & Form Reset
   */
  function initNewsletterForm() {
    const form = document.getElementById('eventNewsletterForm') || document.querySelector('.newsletter-dark-card form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input, input[type="email"]');
      const email = input ? input.value.trim() : '';

      if (!email || !email.includes('@') || !email.includes('.')) {
        if (input) {
          input.focus();
          input.classList.add('is-invalid');
          if (typeof showToast === 'function') {
            showToast('Please enter a valid email address.', 'error');
          }
        }
        return false;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'SUBSCRIBE';

      if (submitBtn) {
        submitBtn.innerHTML = '<span>Subscribed!</span> <i class="fa-solid fa-check"></i>';
        submitBtn.disabled = true;
      }

      if (typeof showToast === 'function') {
        showToast('Thank you for subscribing! Your email has been registered.', 'success');
      }

      // Reset and clear all given datas completely
      form.reset();
      if (input) {
        input.value = '';
        input.classList.remove('is-invalid', 'is-valid');
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }, 3000);
    });
  }

  /**
   * Global Toast Notification Display
   */
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check" style="color: #FD5301; font-size: 1.1rem; margin-right: 8px;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    // Remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }


  /* ==========================================================================
     ABOUT PAGE MODULES (about.html)
     ========================================================================== */

  function initAboutPage() {
    // Numeric counter animation for the story floating stat
    animateCounters();

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  /**
   * Animated Counter helper
   */
  function animateCounters() {
    const counters = document.querySelectorAll('.counter-val');
    counters.forEach((counter) => {
      const target = +counter.getAttribute('data-target') || 25;
      let count = 0;
      const increment = Math.ceil(target / 40);

      function updateCount() {
        count += increment;
        if (count < target) {
          counter.textContent = count;
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target;
        }
      }
      updateCount();
    });
  }

  /* ==========================================================================
     SERVICES PAGE MODULES (services.html)
     ========================================================================== */

  function initServicesPage() {
    initFinancingCalculator();
    initTestDriveForm();
  }

  /**
   * Interactive Financing Payment Calculator
   */
  function initFinancingCalculator() {
    const priceSlider = document.querySelector('#calcVehiclePrice');
    const downSlider = document.querySelector('#calcDownPayment');
    const aprSlider = document.querySelector('#calcApr');
    const termBtns = document.querySelectorAll('.term-pill-btn');

    const priceDisplay = document.querySelector('#calcPriceDisplay');
    const downDisplay = document.querySelector('#calcDownDisplay');
    const aprDisplay = document.querySelector('#calcAprDisplay');
    const termDisplay = document.querySelector('#calcTermDisplay');
    const monthlyResult = document.querySelector('#calcMonthlyResult');
    const principalDisplay = document.querySelector('#calcPrincipalDisplay');
    const interestDisplay = document.querySelector('#calcInterestDisplay');

    if (!priceSlider || !downSlider || !aprSlider || !monthlyResult) return;

    let selectedTerm = 48;

    function recalculate() {
      const price = parseFloat(priceSlider.value);
      downSlider.max = Math.round(price * 0.8);
      let down = parseFloat(downSlider.value);
      if (down > downSlider.max) {
        down = downSlider.max;
        downSlider.value = down;
      }
      const apr = parseFloat(aprSlider.value);
      const principal = price - down;
      const downPercent = Math.round((down / price) * 100);

      const monthlyRate = (apr / 100) / 12;
      let monthlyPayment = 0;
      if (monthlyRate > 0) {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, selectedTerm)) / (Math.pow(1 + monthlyRate, selectedTerm) - 1);
      } else {
        monthlyPayment = principal / selectedTerm;
      }
      const totalPaid = monthlyPayment * selectedTerm;
      const totalInterest = Math.max(0, totalPaid - principal);

      if (priceDisplay) priceDisplay.textContent = '$' + Math.round(price).toLocaleString();
      if (downDisplay) downDisplay.textContent = '$' + Math.round(down).toLocaleString() + ` (${downPercent}%)`;
      if (aprDisplay) aprDisplay.textContent = apr.toFixed(2) + '% APR';
      if (termDisplay) termDisplay.textContent = selectedTerm + ' Months';
      monthlyResult.innerHTML = '$' + Math.round(monthlyPayment).toLocaleString() + ' <span style="font-size: 1rem; color: var(--text-dim); font-weight: 400;">/ mo</span>';
      if (principalDisplay) principalDisplay.textContent = '$' + Math.round(principal).toLocaleString();
      if (interestDisplay) interestDisplay.textContent = '$' + Math.round(totalInterest).toLocaleString();
    }

    priceSlider.addEventListener('input', recalculate);
    downSlider.addEventListener('input', recalculate);
    aprSlider.addEventListener('input', recalculate);

    termBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        termBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTerm = parseInt(btn.getAttribute('data-months'), 10) || 48;
        recalculate();
      });
    });

    recalculate();
  }

  /**
   * Test Drive Form Validation
   * Validates all fields, and on success redirects to 404.html as requested
   */
  /**
   * Test Drive Form Validation
   * Strict validation of all fields with real-time feedback; redirects to 404.html on success
   */
  function initTestDriveForm() {
    const form = document.querySelector('#testDriveForm');
    if (!form) return;

    const nameInput = form.querySelector('#tdName');
    const emailInput = form.querySelector('#tdEmail');
    const phoneInput = form.querySelector('#tdPhone');
    const vehicleSelect = form.querySelector('#tdVehicle');
    const dateInput = form.querySelector('#tdDate');
    const wrapper = form.closest('.test-drive-wrapper') || form;

    function valName() {
      if (!nameInput) return true;
      const v = nameInput.value.trim();
      if (!v) {
        setFieldError(nameInput, 'Full name is required');
        return false;
      }
      if (!validateStrictName(v)) {
        setFieldError(nameInput, 'Please enter your first and last name (letters only, min 2 words)');
        return false;
      }
      setFieldValid(nameInput);
      return true;
    }

    function valEmail() {
      if (!emailInput) return true;
      const v = emailInput.value.trim();
      if (!v) {
        setFieldError(emailInput, 'Email address is required');
        return false;
      }
      if (!validateStrictEmail(v)) {
        setFieldError(emailInput, 'Please enter a valid email address (e.g. name@domain.com)');
        return false;
      }
      setFieldValid(emailInput);
      return true;
    }

    function valPhone() {
      if (!phoneInput) return true;
      const v = phoneInput.value.trim();
      if (!v) {
        setFieldError(phoneInput, 'Phone number is required');
        return false;
      }
      if (!validateStrictPhone(v)) {
        setFieldError(phoneInput, 'Please enter a valid phone number (at least 10 digits)');
        return false;
      }
      setFieldValid(phoneInput);
      return true;
    }

    function valVehicle() {
      if (!vehicleSelect) return true;
      if (!vehicleSelect.value) {
        setFieldError(vehicleSelect, 'Please select a luxury vehicle model');
        return false;
      }
      setFieldValid(vehicleSelect);
      return true;
    }

    function valDate() {
      if (!dateInput) return true;
      if (!dateInput.value) {
        setFieldError(dateInput, 'Preferred appointment date is required');
        return false;
      }
      const selected = new Date(dateInput.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(selected.getTime()) || selected < today) {
        setFieldError(dateInput, 'Appointment date cannot be in the past');
        return false;
      }
      setFieldValid(dateInput);
      return true;
    }

    // Real-time listeners
    if (nameInput) {
      nameInput.addEventListener('blur', valName);
      nameInput.addEventListener('input', () => {
        const p = nameInput.closest('.form-group');
        if (p && p.classList.contains('invalid')) valName();
      });
    }
    if (emailInput) {
      emailInput.addEventListener('blur', valEmail);
      emailInput.addEventListener('input', () => {
        const p = emailInput.closest('.form-group');
        if (p && p.classList.contains('invalid')) valEmail();
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener('blur', valPhone);
      phoneInput.addEventListener('input', () => {
        const p = phoneInput.closest('.form-group');
        if (p && p.classList.contains('invalid')) valPhone();
      });
    }
    if (vehicleSelect) {
      vehicleSelect.addEventListener('change', valVehicle);
    }
    if (dateInput) {
      dateInput.addEventListener('change', valDate);
      dateInput.addEventListener('blur', valDate);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isNameValid = valName();
      const isEmailValid = valEmail();
      const isPhoneValid = valPhone();
      const isVehValid = valVehicle();
      const isDateValid = valDate();

      const allValid = isNameValid && isEmailValid && isPhoneValid && isVehValid && isDateValid;
      if (!allValid) {
        triggerCardShake(wrapper);
        if (!isNameValid && nameInput) nameInput.focus();
        else if (!isEmailValid && emailInput) emailInput.focus();
        else if (!isPhoneValid && phoneInput) phoneInput.focus();
        else if (!isVehValid && vehicleSelect) vehicleSelect.focus();
        else if (!isDateValid && dateInput) dateInput.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Request Consultation';

      if (submitBtn) {
        submitBtn.innerHTML = '<span>Request Submitted!</span> <i class="fa-solid fa-circle-check"></i>';
        submitBtn.disabled = true;
      }

      if (typeof showToast === 'function') {
        showToast('Thank you! Your consultation request has been submitted successfully.', 'success');
      }

      // Reset and clear all given datas
      form.reset();
      [nameInput, emailInput, phoneInput, vehicleSelect, dateInput].forEach((inp) => {
        if (inp) {
          inp.value = '';
          inp.classList.remove('is-valid', 'is-invalid');
          const group = inp.closest('.form-group');
          if (group) {
            group.classList.remove('valid', 'invalid');
            const err = group.querySelector('.auth-field-error, .error-msg, .c-error');
            if (err) err.remove();
          }
        }
      });

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }, 3500);
    });
  }

  /* ==========================================================================
     BLOG PAGE MODULES (blog.html)
     ========================================================================== */

  function initBlogPage() {
    initNewsletterForm();
  }

  /**
   * Newsletter Form Validation
   * Validates name & email strictly, on success redirects to 404.html
   */
  function initNewsletterForm() {
    const form = document.querySelector('#newsletterForm');
    if (!form) return;

    const nameInput = form.querySelector('#nlName');
    const emailInput = form.querySelector('#nlEmail');
    const errorMsg = form.querySelector('.newsletter-error');
    const box = form.closest('.newsletter-box') || form;

    function valNewsletter() {
      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';

      if (!nameVal) {
        if (errorMsg) {
          errorMsg.textContent = 'Please provide your full name.';
          errorMsg.style.display = 'block';
        }
        return false;
      }
      if (!validateStrictName(nameVal)) {
        if (errorMsg) {
          errorMsg.textContent = 'Please enter your first and last name (letters only, min 2 words).';
          errorMsg.style.display = 'block';
        }
        return false;
      }
      if (!emailVal) {
        if (errorMsg) {
          errorMsg.textContent = 'Please provide your email address.';
          errorMsg.style.display = 'block';
        }
        return false;
      }
      if (!validateStrictEmail(emailVal)) {
        if (errorMsg) {
          errorMsg.textContent = 'Please enter a valid email address (e.g. name@domain.com).';
          errorMsg.style.display = 'block';
        }
        return false;
      }
      if (errorMsg) errorMsg.style.display = 'none';
      return true;
    }

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (errorMsg && errorMsg.style.display === 'block') valNewsletter();
      });
    }
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        if (errorMsg && errorMsg.style.display === 'block') valNewsletter();
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!valNewsletter()) {
        triggerCardShake(box);
        if (nameInput && !validateStrictName(nameInput.value.trim())) nameInput.focus();
        else if (emailInput) emailInput.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Subscribe';

      if (submitBtn) {
        submitBtn.innerHTML = '<span>Subscribed!</span> <i class="fa-solid fa-check"></i>';
        submitBtn.disabled = true;
      }

      if (typeof showToast === 'function') {
        showToast('Thank you for subscribing to STACKLY Insights!', 'success');
      }

      // Reset and clear all given datas completely
      form.reset();
      if (nameInput) {
        nameInput.value = '';
        nameInput.classList.remove('is-invalid', 'is-valid');
      }
      if (emailInput) {
        emailInput.value = '';
        emailInput.classList.remove('is-invalid', 'is-valid');
      }
      if (errorMsg) errorMsg.style.display = 'none';

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }, 3500);
    });
  }

  /* ==========================================================================
     CONTACT PAGE MODULES (contact.html)
     ========================================================================== */

  function initContactPage() {
    initContactForm();
    initFaqAccordion();
  }

  /**
   * Contact Form Validation
   * Strict validation for Full Name, Email, Phone, Subject, Message; redirects to 404.html on success
   */
  function initContactForm() {
    const form = document.querySelector('#contactForm');
    if (!form) return;

    const nameInput = form.querySelector('#cName');
    const emailInput = form.querySelector('#cEmail');
    const phoneInput = form.querySelector('#cPhone');
    const subjectInput = form.querySelector('#cSubject');
    const messageInput = form.querySelector('#cMessage');
    const box = form.closest('.contact-form-inner, .contact-card') || form;

    function valName() {
      if (!nameInput) return true;
      const v = nameInput.value.trim();
      if (!v) {
        setFieldError(nameInput, 'Full name is required');
        return false;
      }
      if (!validateStrictName(v)) {
        setFieldError(nameInput, 'Please enter your first and last name (letters only, min 2 words)');
        return false;
      }
      setFieldValid(nameInput);
      return true;
    }

    function valEmail() {
      if (!emailInput) return true;
      const v = emailInput.value.trim();
      if (!v) {
        setFieldError(emailInput, 'Email address is required');
        return false;
      }
      if (!validateStrictEmail(v)) {
        setFieldError(emailInput, 'Please enter a valid email address (e.g. name@domain.com)');
        return false;
      }
      setFieldValid(emailInput);
      return true;
    }

    function valPhone() {
      if (!phoneInput) return true;
      const v = phoneInput.value.trim();
      if (!v) {
        setFieldError(phoneInput, 'Phone number is required');
        return false;
      }
      if (!validateStrictPhone(v)) {
        setFieldError(phoneInput, 'Please enter a valid phone number (at least 10 digits)');
        return false;
      }
      setFieldValid(phoneInput);
      return true;
    }

    function valSubject() {
      if (!subjectInput) return true;
      const v = subjectInput.value.trim();
      if (!v) {
        setFieldError(subjectInput, 'Subject is required');
        return false;
      }
      if (v.length < 4) {
        setFieldError(subjectInput, 'Subject must be at least 4 characters');
        return false;
      }
      setFieldValid(subjectInput);
      return true;
    }

    function valMessage() {
      if (!messageInput) return true;
      const v = messageInput.value.trim();
      if (!v) {
        setFieldError(messageInput, 'Message is required');
        return false;
      }
      if (v.length < 10) {
        setFieldError(messageInput, 'Message must be at least 10 characters long');
        return false;
      }
      setFieldValid(messageInput);
      return true;
    }

    // Real-time listeners
    if (nameInput) {
      nameInput.addEventListener('blur', valName);
      nameInput.addEventListener('input', () => {
        const p = nameInput.closest('.c-group');
        if (p && p.classList.contains('invalid')) valName();
      });
    }
    if (emailInput) {
      emailInput.addEventListener('blur', valEmail);
      emailInput.addEventListener('input', () => {
        const p = emailInput.closest('.c-group');
        if (p && p.classList.contains('invalid')) valEmail();
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener('blur', valPhone);
      phoneInput.addEventListener('input', () => {
        const p = phoneInput.closest('.c-group');
        if (p && p.classList.contains('invalid')) valPhone();
      });
    }
    if (subjectInput) {
      subjectInput.addEventListener('blur', valSubject);
      subjectInput.addEventListener('input', () => {
        const p = subjectInput.closest('.c-group');
        if (p && p.classList.contains('invalid')) valSubject();
      });
    }
    if (messageInput) {
      messageInput.addEventListener('blur', valMessage);
      messageInput.addEventListener('input', () => {
        const p = messageInput.closest('.c-group');
        if (p && p.classList.contains('invalid')) valMessage();
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isNameValid = valName();
      const isEmailValid = valEmail();
      const isPhoneValid = valPhone();
      const isSubjectValid = valSubject();
      const isMessageValid = valMessage();

      const allValid = isNameValid && isEmailValid && isPhoneValid && isSubjectValid && isMessageValid;
      if (!allValid) {
        triggerCardShake(box);
        if (!isNameValid && nameInput) nameInput.focus();
        else if (!isEmailValid && emailInput) emailInput.focus();
        else if (!isPhoneValid && phoneInput) phoneInput.focus();
        else if (!isSubjectValid && subjectInput) subjectInput.focus();
        else if (!isMessageValid && messageInput) messageInput.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';

      if (submitBtn) {
        submitBtn.innerHTML = '<span>Message Sent!</span> <i class="fa-solid fa-circle-check"></i>';
        submitBtn.disabled = true;
      }

      if (typeof showToast === 'function') {
        showToast('Thank you! Your message has been sent successfully. Our production team will contact you shortly.', 'success');
      }

      // Reset and clear all given datas completely
      form.reset();
      [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach((inp) => {
        if (inp) {
          inp.value = '';
          inp.classList.remove('is-valid', 'is-invalid');
          const group = inp.closest('.c-group, .form-group');
          if (group) {
            group.classList.remove('valid', 'invalid');
            const err = group.querySelector('.auth-field-error, .error-msg, .c-error');
            if (err) err.remove();
          }
        }
      });

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }, 3500);
    });
  }

  /**
   * FAQ Animated Accordion
   */
  function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach((item) => {
      const header = item.querySelector('.faq-header');
      const body = item.querySelector('.faq-body');

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other items
        items.forEach((other) => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBody = other.querySelector('.faq-body');
            if (otherBody) otherBody.style.maxHeight = null;
          }
        });

        if (isActive) {
          item.classList.remove('active');
          body.style.maxHeight = null;
        } else {
          item.classList.add('active');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }

  /* ==========================================================================
     AUTHENTICATION MODULES (login.html & signup.html)
     ========================================================================== */

  /**
   * Helper: Parses human-readable Name, First Name, and Initials from an Email Address
   * Example: "john.doe@company.com"           -> { fullName: "John Doe", firstName: "John", initials: "JD" }
   * Example: "alexander_wright@gmail.com"     -> { fullName: "Alexander Wright", firstName: "Alexander", initials: "AW" }
   * Example: "marcus.vance@auramotors.luxury" -> { fullName: "Marcus Vance", firstName: "Marcus", initials: "MV" }
   * Example: "elena@domain.com"               -> { fullName: "Elena", firstName: "Elena", initials: "EL" }
   */
  function parseNameFromEmail(email) {
    if (!email || typeof email !== 'string') {
      return { fullName: 'Valued Client', firstName: 'Client', initials: 'VC' };
    }

    const cleanEmail = email.trim();
    const atIndex = cleanEmail.indexOf('@');
    const userPart = (atIndex !== -1 ? cleanEmail.slice(0, atIndex) : cleanEmail).trim();

    if (!userPart) {
      return { fullName: 'Valued Client', firstName: 'Client', initials: 'VC' };
    }

    // Split on delimiters (dots, underscores, hyphens, pluses)
    let cleanUser = userPart.replace(/[._\-+]+/g, ' ');
    // Separate letters from numbers (e.g. "marcus23" -> "marcus 23")
    cleanUser = cleanUser.replace(/([a-zA-Z]+)(\d+)/g, '$1 $2').replace(/(\d+)([a-zA-Z]+)/g, '$1 $2').trim();

    const rawTokens = cleanUser.split(/\s+/).filter(Boolean);
    const hasLetters = rawTokens.some((t) => /[a-zA-Z]/.test(t));
    const tokens = hasLetters ? rawTokens.filter((t) => /[a-zA-Z]/.test(t)) : rawTokens;

    if (tokens.length === 0) {
      return { fullName: 'Valued Client', firstName: 'Client', initials: 'VC' };
    }

    const capitalizedWords = tokens.map((w) => {
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });

    const fullName = capitalizedWords.join(' ');
    const firstName = capitalizedWords[0];
    const initials = capitalizedWords.length > 1
      ? (capitalizedWords[0][0] + capitalizedWords[capitalizedWords.length - 1][0]).toUpperCase()
      : (capitalizedWords[0].slice(0, 2).toUpperCase());

    return { fullName, firstName, initials };
  }

  /**
   * Applies user name and email from localStorage (or defaults)
   * dynamically into the Welcome Section and Profile Logo Section of both dashboards
   */
  function applyDashboardUserIdentity(defaultRole) {
    let storedEmail = '';
    let storedName = '';
    let storedFirst = '';
    let storedInitials = '';

    try {
      storedEmail = localStorage.getItem('aura_user_email') || localStorage.getItem('user_email') || '';
      storedName = localStorage.getItem('aura_user_name') || localStorage.getItem('user_name') || '';
      storedFirst = localStorage.getItem('aura_user_firstname') || '';
      storedInitials = localStorage.getItem('aura_user_initials') || '';

      if (!storedEmail && localStorage.getItem('stackly_auth_user')) {
        const parsedAuth = JSON.parse(localStorage.getItem('stackly_auth_user'));
        if (parsedAuth && parsedAuth.email) {
          storedEmail = parsedAuth.email;
          storedName = parsedAuth.name || '';
          storedFirst = parsedAuth.firstName || '';
          storedInitials = parsedAuth.initials || '';
        }
      }
    } catch (err) {
      console.warn('localStorage read error', err);
    }

    // Always compute/derive name, first name, and initials if email is present
    if (storedEmail) {
      const parsed = parseNameFromEmail(storedEmail);
      if (!storedName) {
        storedName = parsed.fullName;
      }
      if (!storedFirst) {
        storedFirst = parsed.firstName;
      }
      if (!storedInitials) {
        storedInitials = parsed.initials;
      }
    }

    const defaultName = defaultRole === 'admin' ? 'Julian Vance' : defaultRole === 'client' ? 'VIP Delegate' : 'Marcus Vance';
    const defaultFirst = defaultRole === 'admin' ? 'Julian' : defaultRole === 'client' ? 'VIP' : 'Marcus';
    const defaultEmail = defaultRole === 'admin' ? 'admin@stackly.luxury' : defaultRole === 'client' ? 'client@stackly.luxury' : 'marcus.vance@apexinnovations.global';
    const defaultInitials = defaultRole === 'admin' ? 'JV' : defaultRole === 'client' ? 'VIP' : 'MV';

    const finalName = storedName || defaultName;
    const finalFirst = storedFirst || defaultFirst;
    const finalEmail = storedEmail || defaultEmail;
    const finalInitials = storedInitials || defaultInitials;

    // 1. Apply name in Welcome Section across all dashboards
    const welcomeEls = document.querySelectorAll(
      '.user-welcome-name, .client-welcome-name, .dash-welcome-name, .welcome-heading .highlight-orange, .dash-greeting h1 span, .welcome-heading span'
    );
    welcomeEls.forEach((el) => {
      el.textContent = finalName;
    });

    // 2. Apply name in Profile Logo / Topbar / Sidebar / Settings / Dossier Sections
    const profileNameEls = document.querySelectorAll(
      '.user-profile-name, .client-profile-name, .dash-profile-name, .topbar-user-badge h4, .dash-user-details h4'
    );
    profileNameEls.forEach((el) => {
      el.textContent = finalName;
    });

    // 3. Apply mail id in Profile Logo / Topbar / Sidebar / Settings / Dossier Sections
    const profileEmailEls = document.querySelectorAll(
      '.user-profile-email, .client-profile-email, .dash-profile-email, .topbar-user-badge .user-profile-email, .dash-user-details .user-profile-email'
    );
    profileEmailEls.forEach((el) => {
      el.textContent = finalEmail;
      el.setAttribute('title', finalEmail);
    });

    // 4. Apply initials badge on Profile Logo / Avatar
    const initialsEls = document.querySelectorAll(
      '.user-avatar-initials, .client-avatar-initials, .avatar-initials-badge, .dash-avatar-initials'
    );
    initialsEls.forEach((el) => {
      el.textContent = finalInitials;
    });

    // 5. Update Profile Avatar Image Alt Attribute
    const avatarImgs = document.querySelectorAll('.dash-user-avatar, .client-user-avatar, .topbar-user-avatar');
    avatarImgs.forEach((img) => {
      img.alt = `${finalName} Profile`;
    });
  }

  /**
   * Login Page Logic
   * Toggle between User and Client
   * Validate Email and Password
   * Extract & persist user email and derived name to localStorage
   * If User -> user-dashboard.html
   * If Client -> client-dashboard.html
   */
  /**
   * Login Page Logic
  /**
   * ========================================================================
   * LOGIN PAGE LOGIC & STRICT VALIDATION
   * ========================================================================
   * - Strict validation for Role, Email ID, Password
   * - Real-time inline field validation on blur and input
   * - Inline error messages (.auth-field-error) & visual state indicators (.is-invalid, .is-valid)
   * - Luxury card shake animation on error (.auth-shake)
   * - Password visibility toggle
   * - Role-based routing to Admin / User Dashboard
   */
  function initLoginPage() {
    initAuthAmbientCanvas();
    initAuthCardTilt();

    const loginForm = document.querySelector('#loginForm');
    const authCard = document.querySelector('.auth-card-container, .auth-media-card');
    const roleSelect = loginForm ? loginForm.querySelector('#loginRole') : null;
    const emailInput = loginForm ? loginForm.querySelector('#loginEmail') : null;
    const passwordInput = loginForm ? loginForm.querySelector('#loginPassword') : null;
    const pwdToggle = loginForm ? loginForm.querySelector('#pwdToggle') : null;
    const rememberMe = loginForm ? loginForm.querySelector('#rememberMe') : null;
    const submitBtn = loginForm ? loginForm.querySelector('#loginSubmitBtn, .auth-submit-btn') : null;

    // Password visibility toggle
    if (pwdToggle && passwordInput) {
      pwdToggle.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        pwdToggle.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
      });
    }

    const touched = {
      role: false,
      email: false,
      password: false
    };

    // Check if coming from successful registration
    if (sessionStorage.getItem('signup_registered') === 'true') {
      sessionStorage.removeItem('signup_registered');
      const savedEmail = localStorage.getItem('aura_user_email');
      if (emailInput && savedEmail) {
        emailInput.value = savedEmail;
      }
      if (roleSelect) {
        roleSelect.value = 'user';
      }
      if (passwordInput) {
        setTimeout(() => passwordInput.focus(), 200);
      }
    }

    // Strict Validation Functions
    function validateLoginRole(isTyping = false) {
      if (!roleSelect) return true;
      const val = roleSelect.value.trim();

      if (!val || val === '') {
        if (!isTyping || touched.role) {
          setFieldError(roleSelect, 'Please select your role (User or Admin)');
        } else {
          clearFieldError(roleSelect);
        }
        return false;
      }

      setFieldValid(roleSelect);
      return true;
    }

    function validateLoginEmail(isTyping = false) {
      if (!emailInput) return true;
      const val = emailInput.value.trim();

      if (!val) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, 'Email ID is required');
        } else {
          clearFieldError(emailInput);
        }
        return false;
      }

      if (!val.includes('@')) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, "Email address must include an '@' symbol");
        }
        return false;
      }

      const parts = val.split('@');
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, 'Please enter a complete email address (e.g. name@domain.com)');
        }
        return false;
      }

      const domainParts = parts[1].split('.');
      const tld = domainParts[domainParts.length - 1];
      if (domainParts.length < 2 || !tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, 'Please enter a valid domain extension (e.g. .com, .luxury)');
        }
        return false;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, 'Please enter a valid email address (e.g. name@domain.com)');
        }
        return false;
      }

      setFieldValid(emailInput);
      return true;
    }

    function validateLoginPassword(isTyping = false) {
      if (!passwordInput) return true;
      const val = passwordInput.value;

      if (!val) {
        if (!isTyping || touched.password) {
          setFieldError(passwordInput, 'Password is required');
        } else {
          clearFieldError(passwordInput);
        }
        return false;
      }

      if (val.length < 6) {
        if (!isTyping || touched.password) {
          setFieldError(passwordInput, 'Password must be at least 6 characters long');
        }
        return false;
      }

      setFieldValid(passwordInput);
      return true;
    }

    // Real-time Event Listeners
    if (roleSelect) {
      roleSelect.addEventListener('change', () => {
        touched.role = true;
        validateLoginRole(false);
      });
      roleSelect.addEventListener('blur', () => {
        touched.role = true;
        validateLoginRole(false);
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        if (touched.email || emailInput.classList.contains('is-invalid')) {
          validateLoginEmail(true);
        }
      });
      emailInput.addEventListener('blur', () => {
        touched.email = true;
        validateLoginEmail(false);
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        if (touched.password || passwordInput.classList.contains('is-invalid')) {
          validateLoginPassword(true);
        }
      });
      passwordInput.addEventListener('blur', () => {
        touched.password = true;
        validateLoginPassword(false);
      });
    }

    // Form Submission
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        touched.role = true;
        touched.email = true;
        touched.password = true;

        const isRoleValid = validateLoginRole(false);
        const isEmailValid = validateLoginEmail(false);
        const isPasswordValid = validateLoginPassword(false);

        const allValid = isRoleValid && isEmailValid && isPasswordValid;

        if (!allValid) {
          triggerCardShake(document.querySelector('.auth-card-container') || authCard);
          if (!isRoleValid && roleSelect) {
            roleSelect.focus();
          } else if (!isEmailValid && emailInput) {
            emailInput.focus();
          } else if (!isPasswordValid && passwordInput) {
            passwordInput.focus();
          }
          return;
        }

        const roleVal = roleSelect ? roleSelect.value.trim() : 'user';
        const emailVal = emailInput.value.trim();
        const parsed = parseNameFromEmail(emailVal);
        const formattedName = parsed.fullName;
        const firstName = parsed.firstName;
        const initials = parsed.initials;

        try {
          localStorage.setItem('aura_user_email', emailVal);
          localStorage.setItem('user_email', emailVal);
          localStorage.setItem('aura_user_name', formattedName);
          localStorage.setItem('user_name', formattedName);
          localStorage.setItem('aura_user_firstname', firstName);
          localStorage.setItem('aura_user_initials', initials);
          localStorage.setItem('aura_user_role', roleVal);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('stackly_auth_user', JSON.stringify({
            email: emailVal,
            name: formattedName,
            firstName: firstName,
            initials: initials,
            role: roleVal,
            remember: rememberMe ? rememberMe.checked : false,
            loggedInAt: Date.now()
          }));
        } catch (err) {
          console.warn('localStorage error', err);
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          const roleLabel = roleVal === 'admin' ? 'Admin' : 'User';
          submitBtn.innerHTML = '<span>Logging in as ' + roleLabel + '...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
        }

        const destination = roleVal === 'admin' ? 'admindashboard.html' : 'userdashboard.html';
        setTimeout(() => {
          window.location.href = destination;
        }, 500);
      });
    }

    // Social Logins Simulation
    window.handleSocialLogin = function (provider) {
      const roleVal = (roleSelect && roleSelect.value) ? roleSelect.value.trim() : 'user';
      const defaultName = roleVal === 'admin' ? 'Administrator' : 'User Member';
      const destination = roleVal === 'admin' ? 'admindashboard.html' : 'userdashboard.html';

      try {
        localStorage.setItem('aura_user_name', defaultName);
        localStorage.setItem('aura_user_firstname', defaultName.split(' ')[0]);
        localStorage.setItem('aura_user_role', roleVal);
        localStorage.setItem('stackly_auth_user', JSON.stringify({ name: defaultName, role: roleVal, provider: provider, loggedInAt: Date.now() }));
      } catch (err) {}

      setTimeout(() => {
        window.location.href = destination;
      }, 400);
    };
  }

  /**
   * ========================================================================
   * SIGNUP PAGE LOGIC & STRICT VALIDATION
   * ========================================================================
   * - Strict validation for Name, Email, Password, Confirm Password, Terms
   * - Real-time inline field validation on blur and input
   * - Password complexity checking (8+ chars, uppercase, lowercase, number, symbol)
   * - Password confirmation matching
   * - Inline error messages (.auth-field-error) & visual state indicators (.is-invalid, .is-valid)
   * - Luxury card shake animation on error (.auth-shake)
   * - Password visibility toggles
   */
  function initSignupPage() {
    initAuthAmbientCanvas();
    initAuthCardTilt();

    const signupForm = document.querySelector('#signupForm');
    const signupCard = document.querySelector('.signup-card, .auth-card-container');

    const nameInput = signupForm ? signupForm.querySelector('#signupName') : null;
    const emailInput = signupForm ? signupForm.querySelector('#signupEmail') : null;
    const passInput = signupForm ? signupForm.querySelector('#signupPassword') : null;
    const confirmInput = signupForm ? signupForm.querySelector('#signupConfirmPassword') : null;
    const termsInput = signupForm ? signupForm.querySelector('#signupTerms') : null;
    const submitBtn = signupForm ? signupForm.querySelector('#signupSubmitBtn, .signup-submit-btn, .auth-submit-btn') : null;

    const pwdToggle = document.querySelector('#signupPwdToggle');
    const confirmPwdToggle = document.querySelector('#signupConfirmPwdToggle');

    if (pwdToggle && passInput) {
      pwdToggle.addEventListener('click', () => {
        const isPassword = passInput.getAttribute('type') === 'password';
        passInput.setAttribute('type', isPassword ? 'text' : 'password');
        pwdToggle.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
      });
    }

    if (confirmPwdToggle && confirmInput) {
      confirmPwdToggle.addEventListener('click', () => {
        const isPassword = confirmInput.getAttribute('type') === 'password';
        confirmInput.setAttribute('type', isPassword ? 'text' : 'password');
        confirmPwdToggle.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
      });
    }

    const touched = {
      name: false,
      email: false,
      pass: false,
      confirm: false,
      terms: false
    };

    // Strict Individual Validators
    function validateName(isTyping = false) {
      if (!nameInput) return true;
      const val = nameInput.value.trim();

      if (!val) {
        if (!isTyping || touched.name) {
          setFieldError(nameInput, 'Name is required');
        } else {
          clearFieldError(nameInput);
        }
        return false;
      }

      if (val.length < 2) {
        if (!isTyping || touched.name) {
          setFieldError(nameInput, 'Name must be at least 2 characters long');
        }
        return false;
      }

      if (!/^[a-zA-Z\s'-]+$/.test(val)) {
        if (!isTyping || touched.name) {
          setFieldError(nameInput, 'Name can only contain letters, spaces, and hyphens');
        }
        return false;
      }

      setFieldValid(nameInput);
      return true;
    }

    function validateEmail(isTyping = false) {
      if (!emailInput) return true;
      const val = emailInput.value.trim();

      if (!val) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, 'Email address is required');
        } else {
          clearFieldError(emailInput);
        }
        return false;
      }

      if (!val.includes('@')) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, "Email address must include an '@' symbol");
        }
        return false;
      }

      const parts = val.split('@');
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, 'Please enter a complete email address (e.g. name@domain.com)');
        }
        return false;
      }

      const domainParts = parts[1].split('.');
      const tld = domainParts[domainParts.length - 1];
      if (domainParts.length < 2 || !tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, 'Please enter a valid domain extension (e.g. .com, .luxury)');
        }
        return false;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) {
        if (!isTyping || touched.email) {
          setFieldError(emailInput, 'Please enter a valid email address (e.g. name@domain.com)');
        }
        return false;
      }

      setFieldValid(emailInput);
      return true;
    }

    function validatePassword(isTyping = false) {
      if (!passInput) return true;
      const val = passInput.value;

      if (!val) {
        if (!isTyping || touched.pass) {
          setFieldError(passInput, 'Password is required');
        } else {
          clearFieldError(passInput);
        }
        return false;
      }

      if (val.length < 8) {
        if (!isTyping || touched.pass) {
          setFieldError(passInput, 'Password must be at least 8 characters long');
        }
        return false;
      }

      if (!/[A-Z]/.test(val)) {
        if (!isTyping || touched.pass) {
          setFieldError(passInput, 'Password must contain at least one uppercase letter (A-Z)');
        }
        return false;
      }

      if (!/[a-z]/.test(val)) {
        if (!isTyping || touched.pass) {
          setFieldError(passInput, 'Password must contain at least one lowercase letter (a-z)');
        }
        return false;
      }

      if (!/[0-9]/.test(val)) {
        if (!isTyping || touched.pass) {
          setFieldError(passInput, 'Password must contain at least one number (0-9)');
        }
        return false;
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) {
        if (!isTyping || touched.pass) {
          setFieldError(passInput, 'Password must contain at least one special symbol (!@#$%...)');
        }
        return false;
      }

      setFieldValid(passInput);
      return true;
    }

    function validateConfirmPassword(isTyping = false) {
      if (!confirmInput || !passInput) return true;
      const val = confirmInput.value;
      const passVal = passInput.value;

      if (!val) {
        if (!isTyping || touched.confirm) {
          setFieldError(confirmInput, 'Please confirm your password');
        } else {
          clearFieldError(confirmInput);
        }
        return false;
      }

      if (val !== passVal) {
        if (!isTyping || touched.confirm) {
          setFieldError(confirmInput, 'Passwords do not match');
        }
        return false;
      }

      setFieldValid(confirmInput);
      return true;
    }

    function validateTerms() {
      if (!termsInput) return true;
      const termsError = document.getElementById('signupTermsError');
      const parent = termsInput.closest('.auth-terms-row, .form-group');

      if (!termsInput.checked) {
        if (parent) {
          parent.classList.remove('valid');
          parent.classList.add('invalid');
        }
        if (termsError) {
          termsError.textContent = 'You must agree to the Terms and conditions';
          termsError.style.display = 'flex';
        }
        return false;
      }

      if (parent) {
        parent.classList.remove('invalid');
        parent.classList.add('valid');
      }
      if (termsError) {
        termsError.style.display = 'none';
        termsError.textContent = '';
      }
      return true;
    }

    // Attach real-time listeners
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (touched.name || nameInput.classList.contains('is-invalid')) {
          validateName(true);
        }
      });
      nameInput.addEventListener('blur', () => {
        touched.name = true;
        validateName(false);
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        if (touched.email || emailInput.classList.contains('is-invalid')) {
          validateEmail(true);
        }
      });
      emailInput.addEventListener('blur', () => {
        touched.email = true;
        validateEmail(false);
      });
    }

    if (passInput) {
      passInput.addEventListener('input', () => {
        if (touched.pass || passInput.classList.contains('is-invalid')) {
          validatePassword(true);
        }
        if (confirmInput && (touched.confirm || confirmInput.value)) {
          validateConfirmPassword(true);
        }
      });
      passInput.addEventListener('blur', () => {
        touched.pass = true;
        validatePassword(false);
      });
    }

    if (confirmInput) {
      confirmInput.addEventListener('input', () => {
        if (touched.confirm || confirmInput.classList.contains('is-invalid')) {
          validateConfirmPassword(true);
        }
      });
      confirmInput.addEventListener('blur', () => {
        touched.confirm = true;
        validateConfirmPassword(false);
      });
    }

    if (termsInput) {
      termsInput.addEventListener('change', () => {
        touched.terms = true;
        validateTerms();
      });
    }

    // Form Submission
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        touched.name = true;
        touched.email = true;
        touched.pass = true;
        touched.confirm = true;
        touched.terms = true;

        const isNameValid = validateName(false);
        const isEmailValid = validateEmail(false);
        const isPassValid = validatePassword(false);
        const isConfirmValid = validateConfirmPassword(false);
        const isTermsValid = validateTerms();

        const allValid = isNameValid && isEmailValid && isPassValid && isConfirmValid && isTermsValid;

        if (!allValid) {
          triggerCardShake(document.querySelector('.auth-card-container') || signupCard);
          if (!isNameValid && nameInput) nameInput.focus();
          else if (!isEmailValid && emailInput) emailInput.focus();
          else if (!isPassValid && passInput) passInput.focus();
          else if (!isConfirmValid && confirmInput) confirmInput.focus();
          else if (!isTermsValid && termsInput) termsInput.focus();
          return;
        }

        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const firstName = nameVal.split(' ')[0] || nameVal;

        try {
          localStorage.setItem('aura_user_email', emailVal);
          localStorage.setItem('aura_user_name', nameVal);
          localStorage.setItem('aura_user_firstname', firstName);
          localStorage.setItem('aura_user_role', 'user');
          sessionStorage.setItem('signup_registered', 'true');
        } catch (err) {
          console.warn('localStorage write error', err);
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Creating Account...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
        }

        // Reset and clear all given datas on the signup form
        signupForm.reset();
        [nameInput, emailInput, passInput, confirmInput].forEach((inp) => {
          if (inp) {
            inp.value = '';
            inp.classList.remove('is-valid', 'is-invalid');
          }
        });

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 500);
      });
    }
  }

  /* ==========================================================================
     DASHBOARD MODULES (user-dashboard.html & client-dashboard.html)
     ========================================================================== */

  /**
   * User Dashboard
   * Multi-view switching, hash routing, drawer toggle, and dynamic subtitle sync
   */
  function initUserDashboard() {
    applyDashboardUserIdentity('user');

    const sidebar = document.querySelector('.dash-sidebar');
    const toggleBtn = document.querySelector('.dash-mobile-toggle');
    const closeBtn = document.querySelector('.dash-sidebar-close');
    const backdrop = document.querySelector('.dash-sidebar-backdrop');
    const menuItems = document.querySelectorAll('.dash-sidebar .dash-menu-item');
    const viewPanels = document.querySelectorAll('.dash-view-panel');
    const subEl = document.getElementById('dashViewSubtitle');

    const subtitles = {
      'overview': 'Track active productions, live run-of-show cue sheets, and venue staging milestones.',
      'my-events': 'Portfolio of booked productions, staging timelines, and technical riders.',
      'book-event': 'Commission a bespoke corporate production, summit, or gala with STACKLY.',
      'schedules': 'Minute-by-minute run-of-show cue sheets and talent call times.',
      'invoices': 'Production budget dossiers, milestone settlements, and HMRC invoices.',
      'profile': 'Apex Global Innovations corporate profile, delegate clearances, and contacts.',
      'settings': 'Real-time production notifications, stage alerts, and portal security clearance.'
    };

    function showUserToast(msg) {
      const toast = document.getElementById('dashToast');
      const toastMsg = document.getElementById('toastMessage');
      if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        if (window._userToastTimer) clearTimeout(window._userToastTimer);
        window._userToastTimer = setTimeout(() => {
          toast.classList.remove('show');
        }, 3500);
      }
    }

    function openSidebar() {
      if (sidebar) {
        sidebar.classList.add('active');
        sidebar.classList.add('open');
      }
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('sidebar-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    function closeSidebar() {
      if (sidebar) {
        sidebar.classList.remove('active');
        sidebar.classList.remove('open');
      }
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', openSidebar);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    function switchView(viewId, updateHash = false) {
      if (!viewId) viewId = 'overview';
      viewId = viewId.replace('#', '').trim();

      const targetPanel = document.getElementById('view-' + viewId);
      if (!targetPanel) return;

      viewPanels.forEach((panel) => panel.classList.remove('active'));
      targetPanel.classList.add('active');

      closeSidebar();

      const mainContent = document.querySelector('.dash-main');
      if (mainContent) mainContent.scrollTop = 0;

      menuItems.forEach((item) => {
        const itemTarget = item.getAttribute('data-view') || (item.getAttribute('href') || '').replace('#', '');
        if (itemTarget === viewId) {
          item.classList.add('active');
        } else if (!item.classList.contains('dash-user-badge')) {
          item.classList.remove('active');
        }
      });

      if (subEl && subtitles[viewId]) {
        subEl.textContent = subtitles[viewId];
      }

      if (updateHash && window.location.hash !== '#' + viewId) {
        history.pushState(null, '', '#' + viewId);
      }
    }

    // Sidebar navigation clicks
    const allNavLinks = document.querySelectorAll('.dash-sidebar .dash-menu-item');
    allNavLinks.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (item.classList.contains('logout-btn')) {
          window.location.href = 'login.html';
          return;
        }
        const href = item.getAttribute('href');
        const viewId = item.getAttribute('data-view') || (href && href.startsWith('#') ? href.substring(1) : null);
        if (viewId && document.getElementById('view-' + viewId)) {
          e.preventDefault();
          switchView(viewId, true);
          closeSidebar();
        }
      });
    });

    // In-page internal anchor clicks (e.g. href="#schedules", href="#book-event")
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const targetId = anchor.getAttribute('href').substring(1);
      if (targetId && document.getElementById('view-' + targetId)) {
        e.preventDefault();
        switchView(targetId, true);
        closeSidebar();
      }
    });

    // Filter pills in My Events (#view-my-events)
    const eventFilterPills = document.querySelectorAll('#eventsFilterPills .filter-pill');
    const eventCards = document.querySelectorAll('#eventsContainer .event-card');
    eventFilterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        eventFilterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter');

        eventCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Event Search input in My Events
    const eventSearch = document.getElementById('eventSearchInput');
    if (eventSearch) {
      eventSearch.addEventListener('input', () => {
        const q = eventSearch.value.toLowerCase().trim();
        eventCards.forEach((card) => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(q) ? 'flex' : 'none';
        });
      });
    }

    // Interactive RFP Booking Form (#bookEventForm)
    const bookForm = document.getElementById('bookEventForm');
    if (bookForm) {
      // Tier radio button selection styling
      const tierCards = bookForm.querySelectorAll('.tier-card-option');
      tierCards.forEach((card) => {
        card.addEventListener('click', () => {
          tierCards.forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
          const radio = card.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
        });
      });

      bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('rfpEventTitle');
        const attendeesInput = document.getElementById('rfpAttendees');
        const citySelect = document.getElementById('rfpCity');
        const formatSelect = document.getElementById('rfpEventFormat');

        const title = titleInput ? titleInput.value.trim() : 'Corporate Summit';
        const attendees = attendeesInput ? attendeesInput.value : '1,000';
        const city = citySelect ? citySelect.options[citySelect.selectedIndex].text : 'London';
        const format = formatSelect ? formatSelect.options[formatSelect.selectedIndex].text : 'Conference';

        showUserToast(`✨ Production RFP for "${title}" (${attendees} pax in ${city}) transmitted to STACKLY Lead Producers.`);
        bookForm.reset();

        // Switch to My Events after 1.2s to show progress
        setTimeout(() => {
          switchView('my-events', true);
        }, 1200);
      });
    }

    // Schedule Day selector tabs
    const scheduleDayBtns = document.querySelectorAll('.btn-schedule-day');
    scheduleDayBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        scheduleDayBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const day = btn.getAttribute('data-day');
        showUserToast(`Loaded run-of-show cues for ${btn.textContent.trim()}`);
      });
    });

    // Action buttons & downloads
    const btnDownloadPack = document.getElementById('btnDownloadBriefPack');
    if (btnDownloadPack) {
      btnDownloadPack.addEventListener('click', () => {
        showUserToast('Generating and downloading Master Briefing Pack (PDF)...');
      });
    }

    const btnContactProd = document.getElementById('btnContactProducer');
    if (btnContactProd) {
      btnContactProd.addEventListener('click', () => {
        showUserToast('Direct priority line opened to Elena Rostova (Senior Technical Director).');
      });
    }

    const btnDownloadRider = document.getElementById('btnDownloadRider');
    if (btnDownloadRider) {
      btnDownloadRider.addEventListener('click', () => {
        showUserToast('Downloading Technical Staging Rider & Truss Blueprints (PDF)...');
      });
    }

    const btnDownloadAllInvoices = document.getElementById('btnDownloadAllInvoices');
    if (btnDownloadAllInvoices) {
      btnDownloadAllInvoices.addEventListener('click', () => {
        showUserToast('Bundling all Q4 production invoices into VAT compliant ZIP...');
      });
    }

    const notifBtn = document.getElementById('userNotifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        showUserToast('3 Alerts: Rigging clearance passed, Speaker decks ingested, Catering tasting confirmed.');
      });
    }

    const btnSaveSettings = document.getElementById('btnSaveSettings');
    if (btnSaveSettings) {
      btnSaveSettings.addEventListener('click', () => {
        showUserToast('Portal notification preferences and security settings saved.');
      });
    }

    const btnEditProfile = document.getElementById('btnEditProfile');
    if (btnEditProfile) {
      btnEditProfile.addEventListener('click', () => {
        showUserToast('Organization profile details updated successfully.');
      });
    }

    // Single item downloads
    document.querySelectorAll('.btn-download-spec').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ev = btn.getAttribute('data-event') || 'Event';
        showUserToast(`Downloading production briefing pack for ${ev}...`);
      });
    });

    document.querySelectorAll('.btn-single-invoice').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id') || 'Invoice';
        showUserToast(`Processing invoice dossier #${id}...`);
      });
    });

    document.querySelectorAll('.btn-upgrade-feature').forEach((btn) => {
      btn.addEventListener('click', () => {
        const feature = btn.getAttribute('data-feature') || 'Feature';
        showUserToast(`Added "${feature}" to your technical staging rider.`);
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
      switchView(hash, false);
    });

    const initialView = window.location.hash.replace('#', '') || 'overview';
    switchView(initialView, false);
  }

  /**
   * VIP Client Dashboard
   * Handles sidebar, tab navigation, and animated financing progress bar
   */
  function initClientDashboard() {
    applyDashboardUserIdentity('client');

    const sidebar = document.querySelector('.client-sidebar');
    const toggleBtn = document.querySelector('.client-mobile-toggle');
    const closeBtn = document.querySelector('.client-sidebar-close');
    const backdrop = document.querySelector('.client-sidebar-backdrop');
    const navItems = document.querySelectorAll('.client-nav-item');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        if (backdrop) backdrop.classList.add('active');
      });
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        if (item.classList.contains('logout-btn')) {
          window.location.href = 'login.html';
          return;
        }
        navItems.forEach((n) => n.classList.remove('active'));
        item.classList.add('active');
      });
    });

    // Financing Progress Bar Animation
    const finFill = document.querySelector('.fin-progress-fill');
    if (finFill) {
      setTimeout(() => {
        finFill.style.width = '68%';
      }, 300);
    }

    // Intercept all clicks on links and buttons inside .client-main-view and redirect to 404.html
    const mainArea = document.querySelector('.client-main-view');
    if (mainArea) {
      mainArea.addEventListener('click', (e) => {
        const interactive = e.target.closest('a, button, input[type="submit"], input[type="button"]');
        if (!interactive) return;

        // Allow mobile drawer toggle to operate
        if (interactive.classList.contains('client-mobile-toggle') || interactive.closest('.client-mobile-toggle')) {
          return;
        }

        // Never intercept elements inside the sidebar
        if (interactive.closest('.client-sidebar')) {
          return;
        }

        e.preventDefault();
        window.location.href = '404.html';
      });
    }
  }

  /**
   * Executive Admin Dashboard
   * Multi-view switching, hash routing, sidebar drawer, table filtering, live cue console, and new production modal
   */
  function initAdminDashboard() {
    applyDashboardUserIdentity('admin');

    const sidebar = document.querySelector('.admin-sidebar');
    const toggleBtn = document.querySelector('.dash-mobile-toggle');
    const closeBtn = document.querySelector('.dash-sidebar-close');
    const backdrop = document.querySelector('.dash-sidebar-backdrop');
    const menuItems = document.querySelectorAll('.admin-menu .dash-menu-item');
    const viewPanels = document.querySelectorAll('.dash-view-panel');
    const subEl = document.getElementById('adminViewSubtitle');

    const subtitles = {
      'overview': 'Real-time venue telemetry, active staging allocations, and global cue sheet telemetry.',
      'productions': 'Master production index across London, Paris, Zurich, and Singapore venues.',
      'clients': 'Enterprise accounts, multi-year production agreements, and account directors.',
      'venues': 'Technical specifications, rigging load limits, and 3-phase power database.',
      'cue-sheet': 'Live stage director cue sheet firing console and broadcast timing telemetry.',
      'reports': 'Production yield, margin analytics, crew utilization, and ISO sustainability.',
      'settings': 'AV broadcast protocols, Dante audio sync, and emergency intercom controls.',
      'profile': 'Julian Vance — Managing Director & Head of Global Productions Clearance.'
    };

    function showAdminToast(msg) {
      const toast = document.getElementById('adminToast');
      const toastMsg = document.getElementById('adminToastMessage');
      if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        if (window._adminToastTimer) clearTimeout(window._adminToastTimer);
        window._adminToastTimer = setTimeout(() => {
          toast.classList.remove('show');
        }, 3500);
      }
    }

    function openSidebar() {
      if (sidebar) {
        sidebar.classList.add('active');
        sidebar.classList.add('open');
      }
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('sidebar-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    function closeSidebar() {
      if (sidebar) {
        sidebar.classList.remove('active');
        sidebar.classList.remove('open');
      }
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', openSidebar);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    function switchView(viewId, updateHash = false) {
      if (!viewId) viewId = 'overview';
      viewId = viewId.replace('#', '').trim();

      const targetPanel = document.getElementById('view-' + viewId);
      if (!targetPanel) return;

      viewPanels.forEach((panel) => panel.classList.remove('active'));
      targetPanel.classList.add('active');

      closeSidebar();

      const mainContent = document.querySelector('.dash-main');
      if (mainContent) mainContent.scrollTop = 0;

      menuItems.forEach((item) => {
        const itemTarget = item.getAttribute('data-view') || (item.getAttribute('href') || '').replace('#', '');
        if (itemTarget === viewId) {
          item.classList.add('active');
        } else if (!item.classList.contains('dash-user-badge')) {
          item.classList.remove('active');
        }
      });

      if (subEl && subtitles[viewId]) {
        subEl.textContent = subtitles[viewId];
      }

      if (updateHash && window.location.hash !== '#' + viewId) {
        history.pushState(null, '', '#' + viewId);
      }
    }

    // Sidebar navigation clicks
    const allNavLinks = document.querySelectorAll('.admin-menu .dash-menu-item');
    allNavLinks.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (item.classList.contains('logout-btn')) {
          window.location.href = 'login.html';
          return;
        }
        const href = item.getAttribute('href');
        const viewId = item.getAttribute('data-view') || (href && href.startsWith('#') ? href.substring(1) : null);
        if (viewId && document.getElementById('view-' + viewId)) {
          e.preventDefault();
          switchView(viewId, true);
          closeSidebar();
        }
      });
    });

    // In-page internal anchor clicks (e.g. href="#cue-sheet", href="#productions")
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const targetId = anchor.getAttribute('href').substring(1);
      if (targetId && document.getElementById('view-' + targetId)) {
        e.preventDefault();
        switchView(targetId, true);
        closeSidebar();
      }
    });

    // Master Productions Table Filter Pills (#view-productions)
    const prodFilterPills = document.querySelectorAll('#adminProdFilterPills .filter-pill');
    const prodRows = document.querySelectorAll('#adminProductionsTableBody tr');
    prodFilterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        prodFilterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter');

        prodRows.forEach((row) => {
          const status = row.getAttribute('data-status');
          if (filter === 'all' || status === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });

    // Master Productions Search Input
    const prodSearch = document.getElementById('adminProdSearchInput');
    if (prodSearch) {
      prodSearch.addEventListener('input', () => {
        const q = prodSearch.value.toLowerCase().trim();
        prodRows.forEach((row) => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(q) ? '' : 'none';
        });
      });
    }

    // Live Cue Console Clock
    function updateLiveClock() {
      const clockEl = document.getElementById('liveClockDisplay');
      if (!clockEl) return;
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}:${s} BST`;
    }
    setInterval(updateLiveClock, 1000);
    updateLiveClock();

    // Cue Firing Deck Controls
    const btnFire = document.getElementById('btnFireCue');
    const btnHold = document.getElementById('btnHoldCue');
    let currentCueIndex = 1;

    if (btnFire) {
      btnFire.addEventListener('click', () => {
        const cueRows = document.querySelectorAll('#cueConsoleTableBody tr');
        if (currentCueIndex < cueRows.length) {
          // Mark current as executed
          const currentTr = cueRows[currentCueIndex];
          const statusTd = currentTr.querySelector('td:last-child');
          if (statusTd) {
            statusTd.innerHTML = '<span class="status-pill live"><i class="fa-solid fa-check"></i> Executed</span>';
          }
          currentTr.style.background = 'rgba(0,229,153,0.06)';
          currentTr.style.borderLeft = '4px solid #00E599';

          currentCueIndex++;
          // Arm next cue
          if (currentCueIndex < cueRows.length) {
            const nextTr = cueRows[currentCueIndex];
            const nextStatusTd = nextTr.querySelector('td:last-child');
            if (nextStatusTd) {
              nextStatusTd.innerHTML = '<span class="status-pill upcoming"><i class="fa-solid fa-bolt"></i> Armed</span>';
            }
            nextTr.style.background = 'rgba(253,83,1,0.12)';
            nextTr.style.borderLeft = '4px solid var(--color-orange)';
            showAdminToast(`🎯 CUE ${currentCueIndex} FIRED & EXECUTED. Next cue is now ARMED.`);
          } else {
            showAdminToast('🏁 All cues in current segment successfully executed!');
          }
        } else {
          showAdminToast('All run-of-show cues for this block are concluded.');
        }
      });
    }

    if (btnHold) {
      btnHold.addEventListener('click', () => {
        showAdminToast('⚠️ STAGE HOLD TRIGGERED: Telemetry halted on current cue.');
      });
    }

    // Modal: Add New Production
    const modalBackdrop = document.getElementById('newProductionModal');
    const btnOpenModal1 = document.getElementById('btnOpenNewProductionModal');
    const btnOpenModal2 = document.getElementById('btnAddNewProduction');
    const btnCloseModal = document.getElementById('btnCloseNewProdModal');
    const btnCancelModal = document.getElementById('btnCancelNewProd');
    const newProdForm = document.getElementById('newProductionForm');

    function openProdModal() {
      if (modalBackdrop) modalBackdrop.classList.add('active');
    }

    function closeProdModal() {
      if (modalBackdrop) modalBackdrop.classList.remove('active');
    }

    if (btnOpenModal1) btnOpenModal1.addEventListener('click', openProdModal);
    if (btnOpenModal2) btnOpenModal2.addEventListener('click', openProdModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeProdModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeProdModal);

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeProdModal();
      });
    }

    if (newProdForm) {
      newProdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('modalProdTitle').value.trim();
        const client = document.getElementById('modalProdClient').value.trim();
        const venue = document.getElementById('modalProdVenue').value.trim();
        const pax = document.getElementById('modalProdPax').value;
        const budget = Number(document.getElementById('modalProdBudget').value).toLocaleString();
        const date = document.getElementById('modalProdDate').value;

        // Prepend new row to table
        const tbody = document.getElementById('adminProductionsTableBody');
        if (tbody) {
          const newTr = document.createElement('tr');
          newTr.setAttribute('data-status', 'loadin');
          newTr.innerHTML = `
            <td>
              <strong>${title}</strong>
              <div style="font-size: 0.76rem; color: rgba(255,255,255,0.5);">Code: #PRD-NEW-${Math.floor(100 + Math.random() * 900)}</div>
            </td>
            <td>${client}</td>
            <td>${venue}</td>
            <td>${date || 'Upcoming'}</td>
            <td>${pax}</td>
            <td><span class="status-badge-admin status-loadin"><i class="fa-solid fa-truck-ramp-box"></i> Provisioned</span></td>
            <td><strong>£${budget}</strong></td>
            <td style="text-align: right;">
              <button class="btn-table-action btn-inspect-prod" data-name="${title}"><i class="fa-solid fa-eye"></i> Dossier</button>
            </td>
          `;
          tbody.insertBefore(newTr, tbody.firstChild);
        }

        closeProdModal();
        newProdForm.reset();
        showAdminToast(`✨ Production "${title}" provisioned for ${client} at ${venue}.`);
        setTimeout(() => switchView('productions', true), 600);
      });
    }

    // Reports and Dossier actions
    const btnTelemetryExport = document.getElementById('btnDownloadTelemetryReport');
    if (btnTelemetryExport) {
      btnTelemetryExport.addEventListener('click', () => {
        showAdminToast('Generating encrypted production telemetry audit report (CSV)...');
      });
    }

    const btnYieldExport = document.getElementById('btnExportYieldPDF');
    if (btnYieldExport) {
      btnYieldExport.addEventListener('click', () => {
        showAdminToast('Exporting Q4 Financial Yield & Gross Margin Audit (PDF)...');
      });
    }

    const btnClientsExport = document.getElementById('btnExportClients');
    if (btnClientsExport) {
      btnClientsExport.addEventListener('click', () => {
        showAdminToast('Exporting enterprise account roster to Excel format...');
      });
    }

    const adminNotifBtn = document.getElementById('adminNotifBtn');
    if (adminNotifBtn) {
      adminNotifBtn.addEventListener('click', () => {
        showAdminToast('5 Active Alerts: London Fire inspection 14:30, Paris uplink 100%, Dante sync nominal.');
      });
    }

    const btnSaveAdminSettings = document.getElementById('btnSaveAdminSettings');
    if (btnSaveAdminSettings) {
      btnSaveAdminSettings.addEventListener('click', () => {
        showAdminToast('Broadcast matrix routing and Dante network configurations committed.');
      });
    }

    document.querySelectorAll('.btn-inspect-prod').forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name') || 'Production';
        showAdminToast(`Opening master technical staging dossier for "${name}"...`);
      });
    });

    document.querySelectorAll('.btn-client-dossier').forEach((btn) => {
      btn.addEventListener('click', () => {
        const client = btn.getAttribute('data-client') || 'Client';
        showAdminToast(`Opening enterprise agreement and technical rider archives for ${client}...`);
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
      switchView(hash, false);
    });

    const initialView = window.location.hash.replace('#', '') || 'overview';
    switchView(initialView, false);
  }

  /**
   * Global Dashboard Toast Feedback Notification
   */
  window.showDashToast = function(msg) {
    const toast = document.getElementById('dashToast');
    const toastMsg = document.getElementById('dashToastMsg');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    if (window._dashToastTimer) clearTimeout(window._dashToastTimer);
    window._dashToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  };

  /**
   * Admin Inventory Search & Filter
   */
  window.filterInventoryTable = function() {
    const searchInput = document.getElementById('inventorySearch');
    const catFilter = document.getElementById('invCategoryFilter');
    const statusFilter = document.getElementById('invStatusFilter');
    const table = document.getElementById('inventoryTable');
    if (!table) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const cat = catFilter ? catFilter.value : 'all';
    const status = statusFilter ? statusFilter.value : 'all';

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      const rowText = row.textContent.toLowerCase();
      const rowCat = row.getAttribute('data-category') || '';
      const rowStatus = row.getAttribute('data-status') || '';

      const matchesQuery = !query || rowText.includes(query);
      const matchesCat = cat === 'all' || rowCat === cat;
      const matchesStatus = status === 'all' || rowStatus.toLowerCase().includes(status.toLowerCase());

      if (matchesQuery && matchesCat && matchesStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  };

  /* ==========================================================================
     404 PAGE MODULES (404.html)
     ========================================================================== */

  /**
   * 404 Animated Automotive Experience
   */
  function init404Page() {
    // Go Back Button
    const goBackBtn = document.querySelector('.btn-go-back');
    if (goBackBtn) {
      goBackBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = 'index.html';
        }
      });
    }

    // Interactive Gold Particle Canvas
    initParticleCanvas();

    // Multi-layer Mouse Parallax on 404 elements
    const pageWrapper = document.querySelector('.error-page-wrapper');
    const errorBox = document.querySelector('.error-content-box');
    const floatItems = document.querySelectorAll('.float-item');
    const radarCenter = document.querySelector('.error-visual-centerpiece');

    if (pageWrapper && window.innerWidth >= 992) {
      window.addEventListener('mousemove', (e) => {
        const normX = (e.clientX / window.innerWidth - 0.5);
        const normY = (e.clientY / window.innerHeight - 0.5);

        if (errorBox) {
          errorBox.style.transform = `translate(${normX * 24}px, ${normY * 24}px) rotateX(${-normY * 6}deg) rotateY(${normX * 6}deg)`;
        }

        if (radarCenter) {
          radarCenter.style.transform = `translate(${normX * 12}px, ${normY * 12}px)`;
        }

        floatItems.forEach((item, index) => {
          const depth = (index + 1) * 18;
          item.style.transform = `translate(${normX * depth}px, ${normY * depth}px)`;
        });
      });
    }
  }

  /**
   * Canvas Gold & Amber Particle Engine with Constellation Web for 404
   */
  function initParticleCanvas() {
    const canvas = document.querySelector('.error-particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let mouse = { x: -1000, y: -1000 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const particles = [];
    const count = 55;

    for (let i = 0; i < count; i++) {
      const isOrange = Math.random() > 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        speedX: (Math.random() - 0.5) * 0.7,
        speedY: (Math.random() - 0.5) * 0.7,
        color: isOrange ? '253, 83, 1' : '255, 168, 52',
        alpha: Math.random() * 0.5 + 0.25,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: 1
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      // Draw constellation links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(253, 83, 1, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particle points & mouse physics
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Twinkle
        p.alpha += p.twinkleSpeed * p.twinkleDir;
        if (p.alpha > 0.85) { p.alpha = 0.85; p.twinkleDir = -1; }
        if (p.alpha < 0.2) { p.alpha = 0.2; p.twinkleDir = 1; }

        // Mouse push interaction
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 120 && mdist > 0) {
          const force = (120 - mdist) / 120;
          p.x += (mdx / mdist) * force * 3;
          p.y += (mdy / mdist) * force * 3;
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.6)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }

  /* ==========================================================================
     UTILITY HELPERS
     ========================================================================== */

  function validateEmail(email) {
    return validateStrictEmail(email);
  }

  function validateStrictEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!regex.test(trimmed)) return false;
    const parts = trimmed.split('@');
    if (parts.length !== 2) return false;
    const domainParts = parts[1].split('.');
    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
    return true;
  }

  function validatePhone(phone) {
    return validateStrictPhone(phone);
  }

  function validateStrictPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const trimmed = phone.trim();
    if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(trimmed) && !/^\+?[0-9\s\-\(\)\.]{10,20}$/.test(trimmed)) {
      return false;
    }
    const digitsOnly = trimmed.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }

  function validateStrictName(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 2) return false;
    const nameRegex = /^[a-zA-ZÀ-ÿ]+(?:[ '-][a-zA-ZÀ-ÿ]+)*$/;
    return words.every((w) => w.length >= 2 && nameRegex.test(w));
  }

  function checkPasswordCriteria(pass) {
    const str = String(pass || '');
    return {
      hasLength: str.length >= 8,
      hasUpper: /[A-Z]/.test(str),
      hasLower: /[a-z]/.test(str),
      hasNumber: /[0-9]/.test(str),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(str)
    };
  }

  function setFieldError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('is-invalid');
    const parent = inputEl.closest('.form-group, .c-group, .auth-group, .s-group, .auth-field-group, .auth-terms-row');
    if (!parent) return;
    parent.classList.remove('valid');
    parent.classList.add('invalid');
    let errorEl = parent.querySelector('.form-error, .c-error, .auth-error, .s-error, .auth-field-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'auth-field-error';
      parent.appendChild(errorEl);
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  function clearFieldError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('is-invalid');
    const parent = inputEl.closest('.form-group, .c-group, .auth-group, .s-group, .auth-field-group, .auth-terms-row');
    if (!parent) return;
    parent.classList.remove('invalid');
    const errorEl = parent.querySelector('.form-error, .c-error, .auth-error, .s-error, .auth-field-error');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
  }

  function setFieldValid(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('is-invalid');
    const parent = inputEl.closest('.form-group, .c-group, .auth-group, .s-group, .auth-field-group, .auth-terms-row');
    if (!parent) return;
    parent.classList.remove('invalid');
    parent.classList.add('valid');
    const errorEl = parent.querySelector('.form-error, .c-error, .auth-error, .s-error, .auth-field-error');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
  }

  function triggerCardShake(cardEl) {
    if (!cardEl) return;
    cardEl.classList.remove('shake', 'card-shake');
    void cardEl.offsetWidth;
    cardEl.classList.add('card-shake');
    setTimeout(() => cardEl.classList.remove('shake', 'card-shake'), 600);
  }

  /**
   * Dynamic Count-Up Animation for Statistics Elements
   */
  function initScrollCounters() {
    const counters = document.querySelectorAll('.counter-val');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = +counter.getAttribute('data-target') || 25;
          let count = 0;
          const duration = 1600;
          const start = performance.now();

          function step(timestamp) {
            const progress = Math.min((timestamp - start) / duration, 1);
            const current = Math.floor(progress * target);
            counter.textContent = current.toLocaleString();
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              counter.textContent = target.toLocaleString() + (target > 100 ? '+' : '');
            }
          }
          requestAnimationFrame(step);
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.1 });

    counters.forEach((c) => observer.observe(c));
  }

  /**
   * Scroll-Triggered Progress Bar Animations
   */
  function initScrollProgressBars() {
    const progressFills = document.querySelectorAll('.stat-progress-fill');
    if (!progressFills.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const targetPercent = fill.getAttribute('data-progress') || '100';
          fill.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
          fill.style.width = targetPercent + '%';
          observer.unobserve(fill);
        }
      });
    }, { threshold: 0.1 });

    progressFills.forEach((fill) => observer.observe(fill));
  }

  /**
   * Wishlist / Favorite Vehicle Heart Toggle (LocalStorage Persisted)
   */
  function initFavoriteToggles() {
    let favorites = [];
    try {
      favorites = JSON.parse(localStorage.getItem('aura_favorites') || '[]');
    } catch (err) {
      favorites = [];
    }

    const favBtns = document.querySelectorAll('.btn-favorite');
    favBtns.forEach((btn) => {
      const vehId = btn.getAttribute('data-veh-id') || btn.closest('.vehicle-card')?.getAttribute('data-id');
      const icon = btn.querySelector('i');
      if (vehId && favorites.includes(vehId)) {
        btn.classList.add('active');
        if (icon) {
          icon.classList.remove('fa-regular');
          icon.classList.add('fa-solid');
        }
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isActive = btn.classList.toggle('active');
        const icon = btn.querySelector('i');
        if (icon) {
          if (isActive) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
          } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
          }
        }

        if (vehId) {
          if (isActive && !favorites.includes(vehId)) {
            favorites.push(vehId);
          } else if (!isActive) {
            favorites = favorites.filter((id) => id !== vehId);
          }
          try {
            localStorage.setItem('aura_favorites', JSON.stringify(favorites));
          } catch (err) {
            console.warn(err);
          }
        }
      });
    });
  }

  /**
   * Password Visibility Eye Toggle
   */
  function initPasswordToggles() {
    const toggleBtns = document.querySelectorAll('.password-toggle-btn');
    toggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        let input = targetId ? document.getElementById(targetId) : null;
        if (!input) {
          input = btn.closest('.password-input-wrap')?.querySelector('input');
        }
        if (!input) return;

        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');
        
        const icon = btn.querySelector('i');
        if (icon) {
          if (isPassword) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        }
      });
    });
  }

  // ========================================================================
  // DASHBOARD COMMON UTILITIES
  // ========================================================================

  function initDashboardCommon() {
    // Sidebar toggle (mobile)
    var toggle = document.querySelector('.dash-mobile-toggle');
    var sidebar = document.querySelector('.dash-sidebar');
    var backdrop = document.querySelector('.dash-sidebar-backdrop');
    var closeBtn = document.querySelector('.dash-sidebar-close');

    function openCommonSidebar() {
      if (sidebar) {
        sidebar.classList.add('open');
        sidebar.classList.add('active');
      }
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('sidebar-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    function closeCommonSidebar() {
      if (sidebar) {
        sidebar.classList.remove('open');
        sidebar.classList.remove('active');
      }
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    if (toggle && sidebar) {
      toggle.addEventListener('click', openCommonSidebar);
    }

    if (closeBtn && sidebar) {
      closeBtn.addEventListener('click', closeCommonSidebar);
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener('click', closeCommonSidebar);
    }

    // View switching via sidebar menu items & hash routing
    var menuItems = document.querySelectorAll('.dash-menu-item[data-view]');
    var viewPanels = document.querySelectorAll('.dash-view-panel');

    function switchDashboardView(targetView) {
      if (!targetView) return;

      // Update active menu item
      menuItems.forEach(function (mi) {
        var view = mi.getAttribute('data-view');
        if (view === targetView) {
          mi.classList.add('active');
        } else {
          mi.classList.remove('active');
        }
      });

      // Switch view panel
      viewPanels.forEach(function (panel) {
        panel.classList.remove('active');
        if (panel.id === 'view-' + targetView) {
          panel.classList.add('active');
        }
      });

      // Redraw chart if returning to overview
      if (targetView === 'overview' && typeof drawEventOverviewChart === 'function') {
        setTimeout(drawEventOverviewChart, 100);
      }

      // Close mobile sidebar if open
      closeCommonSidebar();
    }

    menuItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var targetView = this.getAttribute('data-view');
        window.location.hash = targetView;
        switchDashboardView(targetView);
      });
    });

    // Check initial hash on load
    if (window.location.hash) {
      var initialHash = window.location.hash.replace('#', '');
      switchDashboardView(initialHash);
    }

    window.addEventListener('hashchange', function () {
      if (window.location.hash) {
        var currentHash = window.location.hash.replace('#', '');
        switchDashboardView(currentHash);
      }
    });

    // Universal Table Filter Function
    window.filterTable = function (inputEl, tableId) {
      var query = inputEl ? inputEl.value.toLowerCase().trim() : '';
      var table = document.getElementById(tableId);
      if (!table) return;

      var rows = table.querySelectorAll('tbody tr');
      rows.forEach(function (row) {
        var text = row.textContent.toLowerCase();
        if (!query || text.indexOf(query) !== -1) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    };

    // Filter Pills Handler Setup
    function initFilterPills(containerId, tableId) {
      var container = document.getElementById(containerId);
      var table = document.getElementById(tableId);
      if (!container || !table) return;

      var pills = container.querySelectorAll('.filter-pill');
      var rows = table.querySelectorAll('tbody tr');

      pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          pills.forEach(function (p) { p.classList.remove('active'); });
          this.classList.add('active');

          var filter = this.getAttribute('data-filter');
          rows.forEach(function (row) {
            var cat = row.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          });
        });
      });
    }

    // Initialize Filter Pills across all views
    initFilterPills('eventsFilterPills', 'eventsTable');
    initFilterPills('clientsFilterPills', 'clientsTable');
    initFilterPills('bookingsFilterPills', 'bookingsTable');
    initFilterPills('usersFilterPills', 'usersTable');
    initFilterPills('paymentsFilterPills', 'paymentsTable');

    // Chat Composer
    window.sendChatMessage = function () {
      var input = document.getElementById('chatMessageInput');
      var body = document.getElementById('chatMessagesBody');
      if (!input || !body) return false;

      var msg = input.value.trim();
      if (!msg) return false;

      var now = new Date();
      var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble outgoing';
      bubble.innerHTML = msg + '<span class="chat-bubble-time">' + timeStr + '</span>';
      body.appendChild(bubble);

      input.value = '';
      body.scrollTop = body.scrollHeight;

      // Simulated auto-reply
      setTimeout(function () {
        var reply = document.createElement('div');
        reply.className = 'chat-bubble incoming';
        reply.innerHTML = 'Acknowledged! Our production desk has logged this update.' + '<span class="chat-bubble-time">' + timeStr + '</span>';
        body.appendChild(reply);
        body.scrollTop = body.scrollHeight;
      }, 1200);

      return false;
    };

    // Settings Tabs Navigation
    var settingsTabs = document.querySelectorAll('.settings-tab-btn');
    if (settingsTabs.length > 0) {
      settingsTabs.forEach(function (btn) {
        btn.addEventListener('click', function () {
          settingsTabs.forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');
          var tab = this.getAttribute('data-tab');
          if (window.showDashToast) window.showDashToast('Switched to ' + this.textContent.trim() + ' settings');
        });
      });
    }

    // Toast helper
    window.showDashToast = function (message) {
      var toast = document.getElementById('dashToast');
      var msgEl = document.getElementById('toastMessage');
      if (toast && msgEl) {
        msgEl.textContent = message;
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 3000);
      }
    };
  }

  // ========================================================================
  // ADMIN DASHBOARD
  // ========================================================================

  function initAdminDashboard() {
    initDashboardCommon();
    drawEventOverviewChart();
    animateDonutChart();
    initAdminActions();
  }

  function drawEventOverviewChart() {
    var canvas = document.getElementById('eventOverviewChart');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    var w = rect.width;
    var h = rect.height;
    var padTop = 20, padBottom = 30, padLeft = 35, padRight = 15;
    var chartW = w - padLeft - padRight;
    var chartH = h - padTop - padBottom;

    // Data
    var labels = ['Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'];
    var data = [5, 8, 12, 16, 20, 24];
    var maxVal = 25;

    // Animated draw
    var progress = 0;
    function animateChart() {
      progress += 0.025;
      if (progress > 1) progress = 1;
      var ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      for (var i = 0; i <= 5; i++) {
        var yy = padTop + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, yy);
        ctx.lineTo(w - padRight, yy);
        ctx.stroke();

        // Y labels
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal - (maxVal / 5) * i), padLeft - 8, yy + 3);
      }

      // X labels
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      labels.forEach(function (lbl, idx) {
        var x = padLeft + (chartW / (labels.length - 1)) * idx;
        ctx.fillText(lbl, x, h - 8);
      });

      // Gradient fill
      var grad = ctx.createLinearGradient(0, padTop, 0, h - padBottom);
      grad.addColorStop(0, 'rgba(253, 83, 1, 0.3)');
      grad.addColorStop(1, 'rgba(253, 83, 1, 0.02)');

      ctx.beginPath();
      data.forEach(function (val, idx) {
        var x = padLeft + (chartW / (data.length - 1)) * idx;
        var y = padTop + chartH - (val / maxVal) * chartH * ease;
        if (idx === 0) ctx.moveTo(x, y);
        else {
          var prevX = padLeft + (chartW / (data.length - 1)) * (idx - 1);
          var prevY = padTop + chartH - (data[idx - 1] / maxVal) * chartH * ease;
          var cpx1 = prevX + (x - prevX) / 2;
          var cpx2 = prevX + (x - prevX) / 2;
          ctx.bezierCurveTo(cpx1, prevY, cpx2, y, x, y);
        }
      });

      // Close area
      ctx.lineTo(padLeft + chartW, padTop + chartH);
      ctx.lineTo(padLeft, padTop + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line stroke
      ctx.beginPath();
      data.forEach(function (val, idx) {
        var x = padLeft + (chartW / (data.length - 1)) * idx;
        var y = padTop + chartH - (val / maxVal) * chartH * ease;
        if (idx === 0) ctx.moveTo(x, y);
        else {
          var prevX = padLeft + (chartW / (data.length - 1)) * (idx - 1);
          var prevY = padTop + chartH - (data[idx - 1] / maxVal) * chartH * ease;
          var cpx1 = prevX + (x - prevX) / 2;
          var cpx2 = prevX + (x - prevX) / 2;
          ctx.bezierCurveTo(cpx1, prevY, cpx2, y, x, y);
        }
      });
      ctx.strokeStyle = '#FD5301';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Data dots
      data.forEach(function (val, idx) {
        var x = padLeft + (chartW / (data.length - 1)) * idx;
        var y = padTop + chartH - (val / maxVal) * chartH * ease;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FD5301';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Value label
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '600 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(val * ease), x, y - 10);
      });

      if (progress < 1) requestAnimationFrame(animateChart);
    }

    // Start when visible
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateChart();
          observer.unobserve(canvas);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(canvas);
  }

  function animateDonutChart() {
    var svg = document.querySelector('.donut-svg');
    if (!svg) return;

    var segments = svg.querySelectorAll('.donut-segment');
    segments.forEach(function (seg) {
      var da = seg.getAttribute('stroke-dasharray');
      var segLen = parseFloat(da.split(' ')[0]);
      seg.style.strokeDasharray = '0 314';
      seg.style.transition = 'none';
    });

    setTimeout(function () {
      segments.forEach(function (seg, idx) {
        var da = seg.getAttribute('stroke-dasharray');
        seg.style.transition = 'stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1) ' + (idx * 0.15) + 's';
        seg.style.strokeDasharray = da;
      });
    }, 500);
  }

  function initAdminActions() {
    var createBtn = document.getElementById('btnCreateNewEvent');
    if (createBtn) {
      createBtn.addEventListener('click', function () {
        if (window.showDashToast) window.showDashToast('Create New Event wizard opening...');
      });
    }

    var notifBtn = document.getElementById('adminNotifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', function () {
        if (window.showDashToast) window.showDashToast('Notifications panel opened');
      });
    }
  }

  // ========================================================================
  // USER DASHBOARD
  // ========================================================================

  function initUserDashboard() {
    initDashboardCommon();
    animateProgressBars();
    initUserActions();
  }

  function animateProgressBars() {
    var bars = document.querySelectorAll('.progress-fill');
    bars.forEach(function (bar) {
      var target = bar.getAttribute('data-width') || bar.style.width;
      bar.style.width = '0%';
      setTimeout(function () {
        bar.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        bar.style.width = target;
      }, 600);
    });
  }

  function initUserActions() {
    var notifBtn = document.getElementById('userNotifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', function () {
        if (window.showDashToast) window.showDashToast('Notifications panel opened');
      });
    }
  }

  // ========================================================================
  // CLIENT DASHBOARD
  // ========================================================================

  function initClientDashboard() {
    initDashboardCommon();
  }

  // ========================================================================
  // SERVICES PAGE INTERACTIVE MODULE (ENHANCED)
  // ========================================================================

  function initServicesPage() {
    initSvcHeroCanvas();
    initSvcCardTilt();
    initSvcFormatHover();
    initSvcTestimonialsTilt();
    initSvcModal();
  }

  /**
   * Hero Ambient Floating Particle Network Canvas with Mouse Gravitation & Click Burst
   */
  function initSvcHeroCanvas() {
    var canvas = document.getElementById('svcHeroCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width, height;
    var particles = [];
    var particleCount = 55;
    var mouseX = -1000, mouseY = -1000;

    function resize() {
      width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.offsetHeight || 650;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2.2 + 1,
          baseAlpha: Math.random() * 0.5 + 0.25,
          orbitAngle: Math.random() * Math.PI * 2
        });
      }
    }

    resize();
    createParticles();

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', function () {
      mouseX = -1000;
      mouseY = -1000;
    });

    // Click burst particles
    canvas.addEventListener('click', function (e) {
      var rect = canvas.getBoundingClientRect();
      var clickX = e.clientX - rect.left;
      var clickY = e.clientY - rect.top;

      for (var i = 0; i < 15; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = Math.random() * 3 + 1.5;
        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.5 + 1.2,
          baseAlpha: 0.9,
          isBurst: true,
          life: 80
        });
      }
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.isBurst) {
          p.life--;
          p.baseAlpha *= 0.96;
          if (p.life <= 0 || p.baseAlpha <= 0.05) {
            particles.splice(i, 1);
            continue;
          }
        } else {
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Mouse gentle repel
          var dx = mouseX - p.x;
          var dy = mouseY - p.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            var angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * 1.8;
            p.y -= Math.sin(angle) * 1.8;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(253, 83, 1, ' + p.baseAlpha + ')';
        ctx.fill();

        // Connect lines
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var djx = p.x - p2.x;
          var djy = p.y - p2.y;
          var connDist = Math.sqrt(djx * djx + djy * djy);
          if (connDist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(253, 83, 1, ' + (0.18 * (1 - connDist / 110)) + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  /**
   * 3D Magnetic Tilt & Specular Glow on Solution Cards
   */
  function initSvcCardTilt() {
    var cards = document.querySelectorAll('.svc-solution-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -7;
        var rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-8px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /**
   * 3D Tilt on Testimonial Cards & Feature Cards
   */
  function initSvcTestimonialsTilt() {
    var testiCards = document.querySelectorAll('.svc-testi-card, .svc-feature-card');
    testiCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -5;
        var rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-6px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /**
   * Format Cards Hover Accent Animation
   */
  function initSvcFormatHover() {
    var formatCards = document.querySelectorAll('.svc-format-card');
    formatCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        var num = card.querySelector('.svc-format-num');
        if (num) num.style.transform = 'scale(1.1) translateX(4px)';
      });
      card.addEventListener('mouseleave', function () {
        var num = card.querySelector('.svc-format-num');
        if (num) num.style.transform = 'none';
      });

      card.addEventListener('click', function () {
        var title = card.querySelector('.svc-format-title');
        if (title) window.openSvcModal(title.textContent.trim());
      });
    });
  }

  /**
   * Interactive Quick Inquiry Modal Handlers
   */
  function initSvcModal() {
    var backdrop = document.getElementById('svcModalBackdrop');
    var closeBtn = document.getElementById('svcModalClose');
    if (!backdrop) return;

    window.openSvcModal = function (formatName) {
      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (formatName) {
        var select = document.getElementById('svcInquiryFormat');
        if (select) {
          for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].text.toLowerCase().includes(formatName.toLowerCase()) ||
                select.options[i].value.toLowerCase().includes(formatName.toLowerCase())) {
              select.selectedIndex = i;
              break;
            }
          }
        }
      }
    };

    window.closeSvcModal = function () {
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      var success = document.getElementById('svcModalSuccess');
      var form = document.getElementById('svcModalForm');
      if (success) success.classList.remove('is-visible');
      if (form) form.style.display = 'block';
    };

    if (closeBtn) closeBtn.addEventListener('click', window.closeSvcModal);

    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) window.closeSvcModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
        window.closeSvcModal();
      }
    });

    // Wire up CTA buttons and Learn more links to open the modal
    var learnLinks = document.querySelectorAll('.svc-card-link');
    learnLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var card = link.closest('.svc-solution-card');
        var title = card ? card.querySelector('.svc-card-title') : null;
        window.openSvcModal(title ? title.textContent.trim() : '');
      });
    });

    var ctaHero = document.querySelector('.btn-hero-cta');
    if (ctaHero) {
      ctaHero.addEventListener('click', function (e) {
        e.preventDefault();
        window.openSvcModal('Conferences');
      });
    }

    var ctaOffer = document.querySelector('.svc-offer-cta-btn');
    if (ctaOffer) {
      ctaOffer.addEventListener('click', function (e) {
        e.preventDefault();
        window.openSvcModal('Special Offer 10% Discount');
      });
    }

    window.submitSvcInquiry = function () {
      var nameInput = document.getElementById('svcInquiryName');
      var emailInput = document.getElementById('svcInquiryEmail');
      var phoneInput = document.getElementById('svcInquiryPhone');
      var dateInput = document.getElementById('svcInquiryDate');
      var detailsInput = document.getElementById('svcInquiryDetails');
      var nameVal = nameInput ? nameInput.value.trim() : '';
      var emailVal = emailInput ? emailInput.value.trim() : '';

      if (!nameVal || nameVal.length < 2) {
        if (nameInput) {
          nameInput.focus();
          nameInput.classList.add('is-invalid');
        }
        return false;
      } else if (nameInput) {
        nameInput.classList.remove('is-invalid');
      }

      if (!emailVal || !emailVal.includes('@') || !emailVal.includes('.')) {
        if (emailInput) {
          emailInput.focus();
          emailInput.classList.add('is-invalid');
        }
        return false;
      } else if (emailInput) {
        emailInput.classList.remove('is-invalid');
      }

      var submitBtn = document.querySelector('.svc-modal-submit-btn');
      var origBtnHtml = submitBtn ? submitBtn.innerHTML : '<span>Send Production Inquiry</span> <i class="fa-solid fa-arrow-right"></i>';
      if (submitBtn) {
        submitBtn.innerHTML = '<span>Inquiry Sent!</span> <i class="fa-solid fa-circle-check"></i>';
        submitBtn.disabled = true;
      }

      if (typeof showToast === 'function') {
        showToast('Thank you! Your service inquiry has been submitted successfully.', 'success');
      }

      // Reset and clear all given datas completely
      var modalForm = document.getElementById('svcModalForm');
      if (modalForm) modalForm.reset();
      [nameInput, emailInput, phoneInput, dateInput, detailsInput].forEach(function (inp) {
        if (inp) {
          inp.value = '';
          inp.classList.remove('is-invalid', 'is-valid');
        }
      });

      setTimeout(function () {
        if (typeof window.closeSvcModal === 'function') {
          window.closeSvcModal();
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
      }, 1000);

      return false;
    };
  }

  // ========================================================================
  // BLOG PAGE INTERACTIVE MODULE
  // ========================================================================

  function initBlogPage() {
    initBlogHeroCanvas();
    initBlogCardsTilt();
    initBlogModal();
  }

  /**
   * Hero Ambient Floating Particle Network Canvas for Blog Page
   */
  function initBlogHeroCanvas() {
    var canvas = document.getElementById('blogHeroCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width, height;
    var particles = [];
    var particleCount = 50;
    var mouseX = -1000, mouseY = -1000;

    function resize() {
      width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.offsetHeight || 600;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 2 + 1,
          baseAlpha: Math.random() * 0.5 + 0.25
        });
      }
    }

    resize();
    createParticles();

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', function () {
      mouseX = -1000;
      mouseY = -1000;
    });

    // Click burst
    canvas.addEventListener('click', function (e) {
      var rect = canvas.getBoundingClientRect();
      var clickX = e.clientX - rect.left;
      var clickY = e.clientY - rect.top;

      for (var i = 0; i < 16; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = Math.random() * 3 + 1.2;
        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.4 + 1,
          baseAlpha: 0.95,
          isBurst: true,
          life: 75
        });
      }
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.isBurst) {
          p.life--;
          p.baseAlpha *= 0.96;
          if (p.life <= 0 || p.baseAlpha <= 0.05) {
            particles.splice(i, 1);
            continue;
          }
        } else {
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Mouse gentle repel
          var dx = mouseX - p.x;
          var dy = mouseY - p.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            var angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * 1.6;
            p.y -= Math.sin(angle) * 1.6;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(253, 83, 1, ' + p.baseAlpha + ')';
        ctx.fill();

        // Connect lines
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var djx = p.x - p2.x;
          var djy = p.y - p2.y;
          var connDist = Math.sqrt(djx * djx + djy * djy);
          if (connDist < 105) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(253, 83, 1, ' + (0.16 * (1 - connDist / 105)) + ')';
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  /**
   * 3D Tilt on Blog Cards and Mosaic Images
   */
  function initBlogCardsTilt() {
    var cards = document.querySelectorAll('.blog-folder-card, .blog-mag-card, .blog-mosaic-img-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -5;
        var rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-6px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /**
   * Blog Cards Direct Navigation to 404
   */
  function initBlogModal() {
    var folderCards = document.querySelectorAll('.blog-folder-card');
    folderCards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '404.html';
      });
    });

    var magCards = document.querySelectorAll('.blog-mag-card');
    magCards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '404.html';
      });
    });

    window.openBlogModal = function () {
      window.location.href = '404.html';
    };
    window.closeBlogModal = function () {};
  }

  // ========================================================================
  // CONTACT PAGE INTERACTIVE MODULE
  // ========================================================================

  function initContactPage() {
    initScrollReveal();
    initBackToTop();
    initContactHeroParticles();
    initContactTilt();
    initContactForm();
  }

  /**
   * Ambient Floating Golden Particles on Contact Hero Canvas
   */
  function initContactHeroParticles() {
    var canvas = document.getElementById('contactHeroCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width, height;
    var particles = [];
    var particleCount = 45;
    var mouseX = -1000, mouseY = -1000;

    function resize() {
      var parent = canvas.parentElement || document.body;
      width = canvas.width = parent.offsetWidth || window.innerWidth;
      height = canvas.height = parent.offsetHeight || 550;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          baseAlpha: Math.random() * 0.45 + 0.2
        });
      }
    }

    resize();
    createParticles();

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });

    var hero = document.getElementById('contact-hero');
    if (hero) {
      hero.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      });

      hero.addEventListener('mouseleave', function () {
        mouseX = -1000;
        mouseY = -1000;
      });

      hero.addEventListener('click', function (e) {
        var rect = canvas.getBoundingClientRect();
        var clickX = e.clientX - rect.left;
        var clickY = e.clientY - rect.top;

        for (var i = 0; i < 15; i++) {
          var angle = Math.random() * Math.PI * 2;
          var speed = Math.random() * 2.5 + 1;
          particles.push({
            x: clickX,
            y: clickY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 2.2 + 1,
            baseAlpha: 0.9,
            isBurst: true,
            life: 60
          });
        }
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.isBurst) {
          p.life--;
          p.baseAlpha *= 0.96;
          if (p.life <= 0 || p.baseAlpha <= 0.05) {
            particles.splice(i, 1);
            continue;
          }
        } else {
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Gentle mouse repel
          var dx = mouseX - p.x;
          var dy = mouseY - p.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            var angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * 1.5;
            p.y -= Math.sin(angle) * 1.5;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(253, 83, 1, ' + p.baseAlpha + ')';
        ctx.fill();

        // Connect nearby particles
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var djx = p.x - p2.x;
          var djy = p.y - p2.y;
          var connDist = Math.sqrt(djx * djx + djy * djy);
          if (connDist < 95) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(253, 83, 1, ' + (0.14 * (1 - connDist / 95)) + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  /**
   * 3D Perspective Tilt on Contact Cards & Media
   */
  function initContactTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var tiltElements = document.querySelectorAll('.contact-form-card, .contact-hero-img-card, .contact-info-block');
    tiltElements.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -4;
        var rotateY = ((x - centerX) / centerX) * 4;

        el.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-4px)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /**
   * Contact Form Submission Handler
   */
  function initContactForm() {
    var form = document.getElementById('contactMainForm');
    var successMsg = document.getElementById('contactSuccessMsg');
    var submitBtn = document.getElementById('contactSubmitBtn');

    window.handleContactSubmit = function (e) {
      if (e && e.preventDefault) e.preventDefault();

      var nameInput = document.getElementById('contactName');
      var emailInput = document.getElementById('contactEmail');
      var messageInput = document.getElementById('contactMessage');
      var privacyInput = document.getElementById('contactPrivacy');

      if (!nameInput || !nameInput.value.trim()) {
        if (nameInput) {
          nameInput.classList.add('is-invalid');
          nameInput.focus();
        }
        return false;
      } else if (nameInput) {
        nameInput.classList.remove('is-invalid');
      }

      var emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!emailInput || !emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
        if (emailInput) {
          emailInput.classList.add('is-invalid');
          emailInput.focus();
        }
        return false;
      } else if (emailInput) {
        emailInput.classList.remove('is-invalid');
      }

      if (!messageInput || !messageInput.value.trim()) {
        if (messageInput) {
          messageInput.classList.add('is-invalid');
          messageInput.focus();
        }
        return false;
      } else if (messageInput) {
        messageInput.classList.remove('is-invalid');
      }

      if (privacyInput && !privacyInput.checked) {
        if (privacyInput) {
          privacyInput.focus();
        }
        return false;
      }

      var origBtnHtml = submitBtn ? submitBtn.innerHTML : '<span>Submit</span> <i class="fa-solid fa-arrow-right"></i>';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Message Sent!</span> <i class="fa-solid fa-circle-check"></i>';
      }

      if (typeof showToast === 'function') {
        showToast('Thank you! Your message has been sent successfully. Our production team will contact you shortly.', 'success');
      }

      // Reset and clear all given datas completely
      if (form) form.reset();
      var allInputs = form ? form.querySelectorAll('input, textarea, select') : [];
      allInputs.forEach(function (inp) {
        inp.value = '';
        inp.classList.remove('is-invalid', 'is-valid');
        var wrap = inp.closest('.contact-input-wrap, .contact-privacy-wrap');
        if (wrap) wrap.classList.remove('invalid', 'valid');
      });
      if (privacyInput) privacyInput.checked = false;

      if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.classList.add('show');
        setTimeout(function () {
          successMsg.style.display = 'none';
          successMsg.classList.remove('show');
        }, 5000);
      }

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
      }, 3500);

      return false;
    };

    if (form) {
      form.addEventListener('submit', window.handleContactSubmit);
    }
  }

  // ========================================================================
  // AUTH ANIMATION MODULES (Ambient Particles & Tilt)
  // ========================================================================

  /**
   * Ambient Floating Warm Gold/Orange Particles on Login Canvas
   */
  function initAuthAmbientCanvas() {
    var canvas = document.getElementById('authAmbientCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width, height;
    var particles = [];
    var particleCount = 35;
    var mouseX = -1000, mouseY = -1000;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          baseAlpha: Math.random() * 0.4 + 0.15
        });
      }
    }

    resize();
    createParticles();

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gentle mouse repel
        var dx = mouseX - p.x;
        var dy = mouseY - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          var angle = Math.atan2(dy, dx);
          p.x -= Math.cos(angle) * 1.2;
          p.y -= Math.sin(angle) * 1.2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(253, 83, 1, ' + p.baseAlpha + ')';
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  /**
   * 3D Perspective Tilt on Media Card
   */
  function initAuthCardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var card = document.getElementById('authMediaCard');
    if (!card) return;

    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -5;
      var rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-4px)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  }

  /**
   * Universal 404 Redirection Architecture
   * 1. Public Pages: All unused buttons, links, and icons redirect to 404.html EXCEPT Header Navlinks, Footer Links, and Auth navigation.
   * 2. Dashboard Pages (User & Admin): All buttons, links, icons, cards, and actions redirect to 404.html EXCEPT the Sidebar Navigation Menus and Mobile Drawer.
   * 3. Auth Pages: Social login buttons and unlinked actions redirect to 404.html while preserving login/signup validation and page switching.
   * 4. Forms: Validate inputs and reset data on submission.
   */
  function initGlobal404Redirection() {
    const page = document.body.dataset.page || detectPageFallback();
    const pathname = window.location.pathname.toLowerCase();

    // Determine page mode
    const isDashboard = page.includes('dashboard') || pathname.includes('dashboard');
    const isAuthPage = page === 'login' || page === 'signup' || pathname.includes('login') || pathname.includes('signup');
    const is404Page = page === '404' || pathname.includes('404');

    // 404 page handles its own navigation (home button, search)
    if (is404Page) return;

    // Attach capturing click listener to handle all unused buttons, links, icons, and clickable elements
    document.addEventListener('click', function (e) {
      // Find closest interactive element or icon
      const interactiveEl = e.target.closest(
        'a, button, [role="button"], input[type="button"], input[type="submit"], ' +
        'i, svg, [onclick], .dash-icon-btn, .action-icon-btn, .action-icon, ' +
        '.btn, .btn-primary, .btn-secondary, .btn-orange, .btn-outline, .btn-pill, ' +
        '.dash-user-badge, .dash-notif-btn, .welcome-date, .dash-stat-card, .event-card, ' +
        '.filter-pill, .btn-schedule-day, .btn-welcome-primary, .btn-welcome-secondary, ' +
        '.btn-create-event, .dash-table-actions, .dash-action-icon, .auth-social-btn, .auth-forgot, .social-icon, .social-btn, .clickable'
      );
      if (!interactiveEl) return;

      // ==========================================
      // A. DASHBOARD PAGES LOGIC (Admin & User Dashboards)
      // ==========================================
      if (isDashboard) {
        // Exempt the Sidebar Menus & Mobile Drawer Controls:
        const inSidebar = interactiveEl.closest('aside.dash-sidebar, aside.admin-sidebar, aside.client-sidebar, .dash-sidebar, .admin-sidebar, .client-sidebar, .dash-menu, .admin-menu, .client-menu');
        const isMobileSidebarToggle = interactiveEl.closest('.dash-mobile-toggle, .dash-sidebar-close, .dash-sidebar-backdrop, .client-mobile-toggle') ||
                                      interactiveEl.classList.contains('dash-mobile-toggle') ||
                                      interactiveEl.classList.contains('dash-sidebar-close') ||
                                      interactiveEl.classList.contains('dash-sidebar-backdrop') ||
                                      interactiveEl.classList.contains('client-mobile-toggle');

        if (inSidebar || isMobileSidebarToggle) {
          // Allow normal sidebar menu behavior (switching views, logout to login.html, logo to index.html, drawer open/close)
          return;
        }

        // Allow interacting with form input fields / dropdowns / toggles (not buttons/submits)
        const form = interactiveEl.closest('form');
        if (form) {
          if (['INPUT', 'SELECT', 'TEXTAREA', 'LABEL'].includes(interactiveEl.tagName) && interactiveEl.type !== 'submit' && interactiveEl.type !== 'button') return;
          if (interactiveEl.classList.contains('auth-pwd-toggle') || interactiveEl.closest('.auth-pwd-toggle')) return;

          // If it's a submit button inside a form, validate form first
          if (interactiveEl.type === 'submit' || interactiveEl.classList.contains('btn-submit')) {
            if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
              form.reportValidity();
              e.preventDefault();
              return;
            }
          }
        }

        // All other unused links, buttons, and icons in the dashboard redirect to 404.html
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = '404.html';
        return;
      }

      // ==========================================
      // B. AUTH PAGES LOGIC (login.html, signup.html)
      // ==========================================
      if (isAuthPage) {
        // Allow form inputs, password toggles, main submit buttons, and page links (login <-> signup, back to home)
        if (interactiveEl.closest('#loginForm, #signupForm') && !interactiveEl.classList.contains('auth-social-btn') && !interactiveEl.closest('.auth-social-btn, .auth-forgot')) {
          return;
        }
        if (interactiveEl.closest('.auth-brand-logo, .auth-back-btn, .auth-switch-link') ||
            (interactiveEl.tagName === 'A' && (interactiveEl.getAttribute('href') === 'index.html' || interactiveEl.getAttribute('href') === 'signup.html' || interactiveEl.getAttribute('href') === 'login.html'))) {
          return;
        }

        // Unused buttons/icons on auth pages (Social Logins, Forgot password, etc.) redirect to 404.html
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = '404.html';
        return;
      }

      // ==========================================
      // C. PUBLIC PAGES LOGIC (index, about, services, blog, contact)
      // ==========================================
      // 1. Check if inside Header / Navbar / Mobile Navigation Controls
      const inHeader = interactiveEl.closest('header, .site-header, .navbar, nav, .nav-links, .nav-menu, .mobile-nav, .mobile-nav-links, .mobile-nav-link, .mobile-nav-backdrop, .mobile-nav-footer, .header-action, .header-btn, .brand-logo, .logo, .menu-toggle, #menuToggle, #mobileMenuBtn, #mobileNavClose, #navOverlay, .nav-item, .nav-link') ||
                       interactiveEl.classList.contains('menu-toggle') ||
                       interactiveEl.classList.contains('mobile-nav-backdrop') ||
                       interactiveEl.classList.contains('mobile-nav-link') ||
                       interactiveEl.tagName === 'SPAN' && interactiveEl.parentElement && interactiveEl.parentElement.classList.contains('menu-toggle');
      if (inHeader) return;

      // 2. Check if inside Footer
      const inFooter = interactiveEl.closest('footer, .site-footer, .footer-wrap, .footer-container, .footer-col, .footer-bottom, .footer-links, .footer-nav, .footer-social, .footer-copyright');
      if (inFooter) return;

      // 3. Check if inside a Form
      const form = interactiveEl.closest('form');
      if (form) {
        if (['INPUT', 'SELECT', 'TEXTAREA', 'LABEL'].includes(interactiveEl.tagName) && interactiveEl.type !== 'submit' && interactiveEl.type !== 'button') return;
        if (interactiveEl.classList.contains('auth-pwd-toggle') || interactiveEl.closest('.auth-pwd-toggle')) return;

        // If it's a submit button, validate form first
        if (interactiveEl.type === 'submit' || interactiveEl.classList.contains('svc-modal-submit-btn')) {
          if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
            form.reportValidity();
            e.preventDefault();
            return;
          }
        }
      }

      // 4. Accordions or modal close
      if (interactiveEl.classList.contains('faq-header') || interactiveEl.closest('.faq-header')) {
        return;
      }
      if (interactiveEl.classList.contains('svc-modal-close') || interactiveEl.closest('.svc-modal-close') || interactiveEl.id === 'svcModalClose') {
        return;
      }

      // 5. For ALL other unused buttons, links, and icons in the webpage:
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = '404.html';
    }, true);
  }

  function initComponentFallbacks() {
    if (document.querySelector('.hero-slider-dot')) initHeroSlider();
    if (document.querySelector('.faq-item')) initFaqAccordion();
  }

})();



