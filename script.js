// Performance first: disable heavy canvas particles (scroll smoothness)
const ENABLE_PARTICLES = false;

// Particle System (optional)
const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const particles = [];
const mouse = { x: 0, y: 0 };
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(2, window.devicePixelRatio || 1);
let particlesRunning = false;
let isUserScrolling = false;
let scrollIdleTimer = 0;
let lastParticleFrame = 0;
const PARTICLE_FPS = 30; // cap to reduce main-thread work

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 1;
    this.speedY = (Math.random() - 0.5) * 1;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  }

  draw() {
    ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles.length = 0;
  // fewer particles + fewer connections = smoother scroll
  for (let i = 0; i < 38; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  if (!particlesRunning) return;
  if (isUserScrolling) {
    requestAnimationFrame(animateParticles);
    return;
  }

  const now = performance.now();
  const frameInterval = 1000 / PARTICLE_FPS;
  if (now - lastParticleFrame < frameInterval) {
    requestAnimationFrame(animateParticles);
    return;
  }
  lastParticleFrame = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  // NOTE: connection lines removed for smooth scrolling

  requestAnimationFrame(animateParticles);
}

if (ENABLE_PARTICLES && canvas && ctx) {
  canvas.width = Math.floor(window.innerWidth * DPR);
  canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  initParticles();
  if (!prefersReducedMotion) {
    particlesRunning = true;
    animateParticles();
  }

  window.addEventListener('resize', () => {
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initParticles();
  });

  document.addEventListener('visibilitychange', () => {
    if (prefersReducedMotion) return;
    particlesRunning = !document.hidden;
    if (particlesRunning) requestAnimationFrame(animateParticles);
  });
} else if (canvas) {
  // Hide canvas entirely to avoid extra compositing work
  canvas.style.display = 'none';
}

// Page Load Animation
const reveals = document.querySelectorAll(".reveal");

window.addEventListener('load', () => {
  reveals.forEach(el => {
    el.classList.add('load-animation');
  });
});

// Scroll Animation Observer
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  { threshold: 0.2 }
);

reveals.forEach(el => observer.observe(el));

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;

  // quicker + smoother exit
  const exitDelay = prefersReducedMotion ? 400 : 1100;
  setTimeout(() => {
    loader.style.transition = "opacity 450ms ease";
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
    setTimeout(() => loader.remove(), 520);
  }, exitDelay);
});

