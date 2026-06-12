/* fahadhasn.com — homepage interactions (GSAP + Lenis) */
(function () {
  'use strict';

  clearTimeout(window.__bootGuard);

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(pointer: coarse)').matches;
  var preloader = document.getElementById('preloader');

  // ── Always-on basics (work without GSAP) ──
  document.getElementById('year').textContent = new Date().getFullYear();

  var hamburger = document.getElementById('hamburger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    hamburger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  }
  hamburger.addEventListener('click', function () {
    setMenu(!menu.classList.contains('open'));
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  // Bail out gracefully if GSAP failed to load or motion is reduced
  if (!window.gsap || reduced) {
    if (preloader) preloader.remove();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Smooth scroll (Lenis) ──
  var lenis = null;
  if (window.Lenis && !touch) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: -72, duration: 1.2 });
    else {
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el === 0 || target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      scrollToTarget(el);
    });
  });
  document.getElementById('toTop').addEventListener('click', function (e) {
    e.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Custom cursor ──
  if (!touch) {
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    var dotX = gsap.quickSetter(dot, 'x', 'px');
    var dotY = gsap.quickSetter(dot, 'y', 'px');
    var ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
    var ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
    var cursorShown = false;
    addEventListener('pointermove', function (e) {
      if (!cursorShown) {
        cursorShown = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
      }
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      cursorShown = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    });
    document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
    });
  }

  // ── Magnetic buttons ──
  if (!touch) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  // ── Card spotlight + 3D tilt ──
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  if (!touch) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
        ry(((e.clientX - r.left) / r.width - 0.5) * 7);
      });
      card.addEventListener('mouseleave', function () { rx(0); ry(0); });
    });
  }

  // ── Preloader → hero entrance ──
  var nav = document.getElementById('nav');
  var intro = gsap.timeline({ paused: true });
  intro
    .set('#heroTitle .ht-inner', { yPercent: 115 })
    .set(['#heroEyebrow', '#heroSub', '#heroCta .btn', '#scrollCue'], { autoAlpha: 0, y: 26 })
    .set(nav, { autoAlpha: 0, y: -16 })
    .to('#heroTitle .ht-inner', { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.11 }, 0)
    .to(nav, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.45)
    .to('#heroEyebrow', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.55)
    .to('#heroSub', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.7)
    .to('#heroCta .btn', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09 }, 0.82)
    .to('#scrollCue', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.05);

  var counter = { v: 0 };
  var preCount = document.getElementById('preCount');
  gsap.timeline()
    .to(counter, {
      v: 100, duration: 1.1, ease: 'power2.inOut',
      onUpdate: function () { preCount.textContent = Math.round(counter.v); }
    })
    .to('#preBar', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to(preloader, {
      yPercent: -100, duration: 0.85, ease: 'power4.inOut',
      onComplete: function () { preloader.remove(); }
    }, '+=0.15')
    .add(function () { intro.play(); }, '-=0.55');

  // ── Rotating role words ──
  (function () {
    var words = gsap.utils.toArray('#rotator span');
    if (words.length < 2) return;
    var tl = gsap.timeline({ repeat: -1, delay: 2 });
    var hold = 2.2, move = 0.55, t = 0;
    words.forEach(function (w, i) {
      var next = words[(i + 1) % words.length];
      tl.to(w, { yPercent: -100, autoAlpha: 0, duration: move, ease: 'power3.in' }, t + hold)
        .fromTo(next, { yPercent: 100, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: move, ease: 'power3.out', immediateRender: false },
          t + hold + move * 0.55);
      t += hold + move;
    });
  })();

  // ── Scroll progress bar ──
  gsap.to('#progressBar', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.4 }
  });
  gsap.set('#progressBar', { scaleX: 0 });

  // ── Nav: shrink + hide on scroll down ──
  ScrollTrigger.create({
    start: 80,
    onUpdate: function (self) {
      nav.classList.toggle('hidden', self.direction === 1 && !menu.classList.contains('open'));
    },
    onToggle: function (self) { nav.classList.toggle('scrolled', self.isActive); }
  });
  ScrollTrigger.create({
    start: 'top -40',
    onEnter: function () { nav.classList.add('scrolled'); },
    onLeaveBack: function () { nav.classList.remove('scrolled', 'hidden'); }
  });

  // ── Active nav link ──
  ['services', 'work', 'about', 'contact'].forEach(function (id) {
    var section = document.getElementById(id);
    var link = document.querySelector('[data-nav="' + id + '"]');
    if (!section || !link) return;
    ScrollTrigger.create({
      trigger: section, start: 'top 45%', end: 'bottom 45%',
      onToggle: function (self) { link.classList.toggle('active', self.isActive); }
    });
  });

  // ── Scroll reveals ──
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, {
      y: 54, autoAlpha: 0, duration: 1.05, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  gsap.utils.toArray('[data-reveal-group]').forEach(function (group) {
    gsap.from(group.querySelectorAll('.reveal-item'), {
      y: 54, autoAlpha: 0, duration: 1.05, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: group, start: 'top 85%' }
    });
  });

  // ── Stat count-up ──
  document.querySelectorAll('.stat-num').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: function () {
        gsap.to(obj, {
          v: target, duration: 2, ease: 'power3.out',
          onUpdate: function () {
            el.textContent = prefix + Math.round(obj.v).toLocaleString('en-US') + suffix;
          }
        });
      }
    });
  });

  // ── Marquee: infinite drift, speeds up with scroll velocity ──
  document.querySelectorAll('[data-marquee]').forEach(function (m) {
    var track = m.querySelector('.marquee-track');
    track.innerHTML += track.innerHTML;
    var dir = parseInt(m.getAttribute('data-dir'), 10) || 1;
    var tween = gsap.to(track, { xPercent: -50 * dir, ease: 'none', duration: 26, repeat: -1 });
    var speed = 1;
    ScrollTrigger.create({
      onUpdate: function (self) {
        speed = gsap.utils.clamp(1, 4, 1 + Math.abs(self.getVelocity()) / 900);
      }
    });
    gsap.ticker.add(function () {
      tween.timeScale(gsap.utils.interpolate(tween.timeScale(), speed, 0.06));
      speed = gsap.utils.interpolate(speed, 1, 0.04);
    });
  });

  // ── Parallax on feature screenshots ──
  if (matchMedia('(min-width: 901px)').matches) {
    gsap.utils.toArray('.shot').forEach(function (shot) {
      var speed = parseFloat(shot.getAttribute('data-speed')) || 0;
      gsap.to(shot, {
        yPercent: speed, ease: 'none',
        scrollTrigger: { trigger: '.feature-panel', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });
  }

  // ── Hero glow drifts away as you scroll ──
  gsap.to('.glow-hero', {
    autoAlpha: 0.3, yPercent: -30, ease: 'none',
    scrollTrigger: { trigger: '#numbers', start: 'top bottom', end: 'top top', scrub: true }
  });
})();
