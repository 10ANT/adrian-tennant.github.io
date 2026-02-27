/* ============================================
   ADRIAN TENNANT — Portfolio JS
   Fish flee cursor · Parallax · Dust · Reveals
   ============================================ */
(function () {
  'use strict';

  // ─── Cursor tracking ─────────────────────────────────────────
  let rawMX = 0, rawMY = 0; // page-space mouse (for fish)
  let normMX = 0, normMY = 0; // normalized -1…1 (for parallax)

  document.addEventListener('mousemove', (e) => {
    rawMX = e.clientX;
    rawMY = e.clientY;
    normMX = (e.clientX / window.innerWidth  - 0.5) * 2;
    normMY = (e.clientY / window.innerHeight - 0.5) * 2;
    document.body.style.setProperty('--cx', e.clientX + 'px');
    document.body.style.setProperty('--cy', e.clientY + 'px');
  });

  // Device tilt
  window.addEventListener('deviceorientation', (e) => {
    normMX =  (e.gamma || 0) / 25;
    normMY = -(e.beta  || 0) / 20;
  });

  // ─── Parallax ────────────────────────────────────────────────
  const layers = Array.from(document.querySelectorAll('.p-layer')).map(el => ({
    el, depth: parseFloat(el.dataset.depth) || 0.1, cx: 0, cy: 0,
  }));
  const STRENGTH = 60;
  let scrollY = 0;

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    document.getElementById('nav').classList.toggle('scrolled', scrollY > 50);
  }, { passive: true });

  function lerp(a, b, t) { return a + (b - a) * t; }

  let running = true;
  const hero = document.getElementById('hero');

  new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) tick();
  }, { threshold: 0 }).observe(hero);

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    layers.forEach(l => {
      l.cx = lerp(l.cx, normMX * STRENGTH * l.depth, 0.06);
      l.cy = lerp(l.cy, normMY * STRENGTH * l.depth * 0.6, 0.06);
      const scrollShift = scrollY * l.depth * 0.5;
      l.el.style.transform = `translate(${l.cx}px, ${l.cy - scrollShift}px)`;
    });
  }
  tick();

  // ─── Fish ─────────────────────────────────────────────────────
  const canvas = document.getElementById('fishCanvas');
  const ctx    = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Cursor repulsion radius & strength
  const FLEE_RADIUS   = 130;  // px — how close before they notice
  const FLEE_STRENGTH = 1.8;  // how strongly they veer away

  class Fish {
    constructor() { this.init(true); }

    init(scatter = false) {
      this.x   = scatter ? Math.random() * canvas.width : -80;
      this.y   = 60 + Math.random() * (canvas.height * 0.7);
      this.vx  = 0.55 + Math.random() * 1.0;
      this.vy  = (Math.random() - 0.5) * 0.25;
      this.len = 36 + Math.random() * 46;
      this.phase  = Math.random() * Math.PI * 2;
      this.freq   = 0.038 + Math.random() * 0.028;
      this.alpha  = 0.17 + Math.random() * 0.20;
      this.hue    = 38 + Math.random() * 28;
      this.sat    = 55 + Math.random() * 35;
      this.segments = 8;
      this.waveAmp  = 4 + Math.random() * 5;
      // flee state
      this.fleeVX = 0;
      this.fleeVY = 0;
    }

    update(mx, my) {
      this.phase += this.freq;

      // Distance from cursor (head position)
      const dx = this.x - mx;
      const dy = this.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < FLEE_RADIUS && dist > 0.1) {
        // Gently steer away — proportional to closeness
        const factor = (1 - dist / FLEE_RADIUS) * FLEE_STRENGTH;
        this.fleeVX = lerp(this.fleeVX, (dx / dist) * factor, 0.08);
        this.fleeVY = lerp(this.fleeVY, (dy / dist) * factor, 0.08);
      } else {
        // Decay flee impulse back to zero
        this.fleeVX = lerp(this.fleeVX, 0, 0.05);
        this.fleeVY = lerp(this.fleeVY, 0, 0.05);
      }

      this.x += this.vx + this.fleeVX;
      this.y += this.vy + this.fleeVY + Math.sin(this.phase * 0.5) * 0.28;

      // Soft vertical boundary
      if (this.y < 40)               this.vy += 0.04;
      if (this.y > canvas.height - 40) this.vy -= 0.04;
      this.vy *= 0.98; // damping

      if (this.x > canvas.width + 120) this.init();
    }

    draw() {
      // Build spine points
      const pts = [];
      for (let i = 0; i <= this.segments; i++) {
        const t    = i / this.segments;
        const px   = this.x - t * this.len;
        const wave = Math.sin(this.phase - t * Math.PI * 2) * this.waveAmp * (1 - t * 0.5);
        pts.push({ x: px, y: this.y + wave });
      }

      ctx.save();
      ctx.globalAlpha = this.alpha;

      // Body gradient
      const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[this.segments].x, pts[this.segments].y);
      grad.addColorStop(0,   `hsla(${this.hue},${this.sat}%,92%,0)`);
      grad.addColorStop(0.1, `hsla(${this.hue},${this.sat}%,92%,1)`);
      grad.addColorStop(0.5, `hsla(${this.hue+18},${this.sat}%,82%,1)`);
      grad.addColorStop(0.9, `hsla(${this.hue},${this.sat}%,90%,0.4)`);
      grad.addColorStop(1,   `hsla(${this.hue},${this.sat}%,90%,0)`);

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const mx2 = (pts[i-1].x + pts[i].x) / 2;
        const my2 = (pts[i-1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i-1].x, pts[i-1].y, mx2, my2);
      }
      ctx.lineWidth = 5;
      ctx.strokeStyle = grad;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Tail
      const tail = pts[this.segments];
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(tail.x - 12, tail.y - 7);
      ctx.lineTo(tail.x - 12, tail.y + 7);
      ctx.closePath();
      ctx.fillStyle = `hsla(${this.hue},${this.sat}%,88%,0.55)`;
      ctx.fill();

      // Eye
      ctx.beginPath();
      ctx.arc(pts[0].x - 4, pts[0].y - 1, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20,10,0,0.55)';
      ctx.fill();

      // Shimmer
      const mid = pts[Math.floor(this.segments * 0.3)];
      ctx.beginPath();
      ctx.arc(mid.x, mid.y - 1, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fill();

      ctx.restore();
    }
  }

  const fishes = Array.from({ length: 9 }, () => new Fish());

  function animateFish() {
    requestAnimationFrame(animateFish);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Pass cursor in canvas-space (rawMX/rawMY are already viewport coords)
    fishes.forEach(f => { f.update(rawMX, rawMY); f.draw(); });
  }
  animateFish();

  // ─── Dust motes ──────────────────────────────────────────────
  const dustContainer = document.getElementById('dustContainer');
  function spawnDust() {
    const d    = document.createElement('div');
    d.classList.add('dust');
    const size = 2 + Math.random() * 3;
    d.style.width  = size + 'px';
    d.style.height = size + 'px';
    d.style.left   = Math.random() * 100 + '%';
    d.style.bottom = (8 + Math.random() * 45) + '%';
    d.style.animationDuration = (7 + Math.random() * 8) + 's';
    d.style.animationDelay    = (Math.random() * 3) + 's';
    dustContainer.appendChild(d);
    setTimeout(() => d.remove(), 20000);
  }
  for (let i = 0; i < 14; i++) spawnDust();
  setInterval(spawnDust, 1100);

  // ─── Scroll reveals ──────────────────────────────────────────
  const targets = document.querySelectorAll(
    '.section-title, .section-label, .about-text p, .award, .project-card, .skill-group, .contact-sub, .btn-large, .social-links'
  );
  targets.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = [...e.target.parentElement.querySelectorAll('.reveal')];
      e.target.style.transitionDelay = siblings.indexOf(e.target) * 70 + 'ms';
      e.target.classList.add('visible');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  targets.forEach(el => io.observe(el));

  // ─── Mobile nav ──────────────────────────────────────────────
  const burger   = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.style.display === 'flex';
      navLinks.style.display = open ? 'none' : 'flex';
      if (!open) Object.assign(navLinks.style, {
        flexDirection:'column', position:'absolute', top:'100%',
        left:'0', right:'0', background:'rgba(245,240,232,0.97)',
        padding:'1.5rem 2rem', gap:'1.5rem', backdropFilter:'blur(20px)',
        borderBottom:'1.5px solid rgba(42,31,15,0.1)',
      });
    });
  }

  // ─── Fade in on load ─────────────────────────────────────────
  document.body.style.opacity = '0';
  window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.7s';
    document.body.style.opacity = '1';
  });

})();
