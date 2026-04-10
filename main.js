// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  mouseMultiplier: 1,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Integrate GSAP with Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// GSAP Animations
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Hero Parallax (Video scales down, Overlay fades)
  gsap.to('.hero-video-wrap', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    },
    scale: 1,
    ease: 'none'
  });

  // Character Reveal Animation Logic moves here (manual play logic removed)

  // 2. Character Reveal Animation Logic
  const titleElements = document.querySelectorAll('[data-motion="title-reveal"]');
  titleElements.forEach(el => {
    const text = el.innerText;
    el.innerHTML = '';
    
    // Split text into characters
    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.innerText = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      el.appendChild(span);
    });

    const chars = el.querySelectorAll('span');
    gsap.from(chars, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 100,
      opacity: 0,
      rotateX: -90,
      stagger: 0.02,
      duration: 1.2,
      ease: 'power4.out'
    });
  });

  // 3. Fade Up Animations
  const fadeUpElements = document.querySelectorAll('[data-motion="fade-up"]');
  fadeUpElements.forEach(el => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none reverse'
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  });

  // 4. Clip-Path Reveal (for images)
  const clipElements = document.querySelectorAll('[data-motion="clip-reveal"]');
  clipElements.forEach(el => {
    gsap.fromTo(el, {
      clipPath: 'inset(100% 0% 0% 0%)'
    }, {
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.5,
      ease: 'power4.inOut'
    });
  });

  // 5. Gallery Init (Pointing to the images in project folder)
  initGallery();

  // Set Year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.innerText = new Date().getFullYear();
});

function initGallery() {
  const container = document.querySelector('.gallery-grid');
  if(!container) return;

  // Using the images from the Audiction folder since moving failed
  const projects = [
    { title: 'Luz Natural', category: 'Photography', img: 'Audiction/project1.png' },
    { title: 'Movimento Fluido', category: 'Motion', img: 'Audiction/project2.png' },
    { title: 'Essência Editorial', category: 'Editorial', img: 'Audiction/project3.png' },
    { title: 'Sombras e Formas', category: 'Art', img: 'Audiction/project4.png' }
  ];

  projects.forEach((proj, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.position = 'relative';
    item.style.overflow = 'hidden';
    item.style.aspectRatio = index % 2 === 0 ? '1/1.2' : '1.2/1';
    
    item.innerHTML = `
      <div class="project-wrap" style="width: 100%; height: 100%; cursor: pointer;">
        <img src="${proj.img}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; filter: saturate(0);">
        <div class="project-info" style="position: absolute; bottom: 0; left: 0; padding: 2rem; background: rgba(255,255,255,0.9); color: black; width: 100%; transform: translateY(101%); transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);">
          <h4 class="eyebrow" style="margin-bottom: 0.5rem; color: #555;">${proj.category}</h4>
          <p class="serif" style="font-size: 1.5rem;">${proj.title}</p>
        </div>
      </div>
    `;

    // Hover interactions
    item.addEventListener('mouseenter', () => {
      gsap.to(item.querySelector('img'), { scale: 1.05, saturate: 1, duration: 0.6 });
      gsap.to(item.querySelector('.project-info'), { y: 0, duration: 0.4 });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(item.querySelector('img'), { scale: 1, saturate: 0, duration: 0.6 });
      gsap.to(item.querySelector('.project-info'), { y: '101%', duration: 0.4 });
    });

    container.appendChild(item);
  });
}
