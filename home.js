/* fahadhasn.com — homepage-only interactions (preloader, hero, parallax) */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || reduced) return;

  var preloader = document.getElementById('preloader');
  var nav = document.getElementById('nav');

  // ── Preloader → hero entrance ──
  var intro = gsap.timeline({ paused: true });
  intro
    .set('#heroTitle .ht-inner', { yPercent: 115 })
    .set(['#heroSub', '#heroCta .btn', '#scrollCue'], { autoAlpha: 0, y: 26 })
    .set(nav, { autoAlpha: 0, y: -16 })
    .to('#heroTitle .ht-inner', { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.11 }, 0)
    .to(nav, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.45)
    .to('#heroSub', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.6)
    .to('#heroCta .btn', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09 }, 0.75)
    .to('#scrollCue', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1);

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
