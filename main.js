document.addEventListener('DOMContentLoaded', () => {

  // 0. Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.5, // Deixa a rolagem mais lenta e suave (padrão é 1.2)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: true, // Ativa para touch no celular também
    touchMultiplier: 1.5 // Multiplicador para o celular não ficar tão preso
  });

  // Integra o Lenis com o ScrollTrigger do GSAP
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // 0.1 Rolagem Suave para Links Âncora (Botões e Menus)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#checkout-bar') return; // Ignora o link vazio e o link do rodapé se houver
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        lenis.scrollTo(targetElement, {
          duration: 1.2, // Rápido e fluido
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      }
    });
  });

  // 1. GSAP - Animação do Logo Hero e Navbar
  gsap.registerPlugin(ScrollTrigger);

  const heroLogo = document.getElementById('hero-logo-anim');
  const nav = document.getElementById('navbar');
  const navLogo = document.getElementById('nav-logo');

  if (heroLogo && nav) {
    const hero = document.getElementById('hero');
    
    let distanceToMoveUp = 0;
    let distanceToMoveLeft = 0;
    let targetScale = 0.3;

    function initAnimation() {
      // Temporarily clear any GSAP transforms to measure original DOM positions
      gsap.set(heroLogo, { clearProps: "all" });

      let heroRect = heroLogo.getBoundingClientRect();
      let navRect = navLogo.getBoundingClientRect();

      let absoluteHeroCenterY = heroRect.top + window.scrollY + (heroRect.height / 2);
      let navCenterY = navRect.top + (navRect.height / 2);
      distanceToMoveUp = absoluteHeroCenterY - navCenterY;

      let absoluteHeroCenterX = heroRect.left + window.scrollX + (heroRect.width / 2);
      let navCenterX = navRect.left + (navRect.width / 2);
      distanceToMoveLeft = absoluteHeroCenterX - navCenterX;

      if (heroRect.width > 0) {
        targetScale = navRect.width / heroRect.width;
      }
      
      // Update ScrollTrigger to pick up any layout changes
      ScrollTrigger.refresh();
    }

    // Measure initially and when page fully loads
    initAnimation();
    window.addEventListener('load', initAnimation);
    window.addEventListener('resize', initAnimation);

    // Configura o ScrollTrigger para a seção hero
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        // Quantidade total rolada na seção hero
        const currentScroll = self.progress * hero.offsetHeight;
        
        let scale = 1;
        let y = 0;
        let x = 0;

        if (currentScroll < distanceToMoveUp) {
          // Fase 1: O logo sobe naturalmente e vai encolhendo/movendo no X
          const scaleProgress = currentScroll / distanceToMoveUp;
          scale = 1 - (scaleProgress * (1 - targetScale));
          y = 0; 
          x = -(scaleProgress * distanceToMoveLeft);
        } else {
          // Fase 2: O logo atingiu o navbar, congela no Y e no X
          scale = targetScale; 
          y = currentScroll - distanceToMoveUp; 
          x = -distanceToMoveLeft;
        }
        
        // Garante que o logo fique sempre por cima
        gsap.set(heroLogo, { 
          scale: scale, 
          y: y,
          x: x,
          transformOrigin: "center center",
          zIndex: 105
        });
      },
      onEnter: () => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) heroContent.style.zIndex = '101';
      },
      onLeave: () => {
        // Quando o hero some da tela, o nav fica sólido
        nav.classList.add('nav-solid');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) mobileMenuBtn.classList.add('dark-mode');
        
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) heroContent.style.zIndex = '10';
        
        gsap.set(heroLogo, { opacity: 0 });
        gsap.set(navLogo, { opacity: 1 });
      },
      onEnterBack: () => {
        // Quando voltamos pro hero, o nav volta a ser transparente
        nav.classList.remove('nav-solid');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) mobileMenuBtn.classList.remove('dark-mode');

        const heroContent = document.querySelector('.hero-content');
        if (heroContent) heroContent.style.zIndex = '101';
        
        gsap.set(heroLogo, { opacity: 1 });
        gsap.set(navLogo, { opacity: 0 });
      },
      onLeaveBack: () => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) heroContent.style.zIndex = '10';
      }
    });
  }

  // 1.5 Lógica do Menu Mobile
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu() {
    const isOpen = mobileMenuBtn.classList.toggle('open');
    if (isOpen) {
      mobileMenuOverlay.classList.add('active');
      // Anima os links de menu de forma progressiva e espetacular com stagger
      gsap.fromTo(mobileNavLinks, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.2)", delay: 0.35, overwrite: "auto" }
      );
    } else {
      mobileMenuOverlay.classList.remove('active');
      gsap.to(mobileNavLinks, { opacity: 0, y: 15, duration: 0.3, ease: "power2.in", overwrite: "auto" });
    }
  }

  if (mobileMenuBtn && mobileMenuOverlay) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('open');
        mobileMenuOverlay.classList.remove('active');
        gsap.to(mobileNavLinks, { opacity: 0, y: 15, duration: 0.3, ease: "power2.in", overwrite: "auto" });
      });
    });
  }

  // 2. Lógica do Carrinho de Compras (Orçamentos)
  const serviceCheckboxes = document.querySelectorAll('.service-checkbox');
  const checkoutBar = document.getElementById('checkout-bar');
  const checkoutTotal = document.getElementById('checkout-total');
  const btnCheckout = document.getElementById('btn-checkout');
  const whatsappNumber = "5512992189414"; // Novo número atualizado

  let currentTotalVal = 0;
  function animateCounter(targetValue) {
    const obj = { val: currentTotalVal };
    gsap.to(obj, {
      val: targetValue,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        checkoutTotal.innerText = `R$ ${obj.val.toFixed(2).replace('.', ',')}`;
      }
    });
    currentTotalVal = targetValue;
  }

  function updateCheckout() {
    let total = 0;
    const selectedServices = [];

    serviceCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        total += parseFloat(checkbox.value);
        selectedServices.push(`${checkbox.dataset.name} (R$ ${checkbox.value.replace('.', ',')})`);
      }
    });

    if (total > 0) {
      // Exibe a barra
      checkoutBar.classList.add('visible');
      animateCounter(total);

      // Gera a mensagem base para o WhatsApp
      let baseMessage = "Olá, Naomi Domoto! Gostaria de agendar/orçar os seguintes procedimentos:\n\n";
      selectedServices.forEach(s => {
        baseMessage += `- ${s}\n`;
      });
      baseMessage += `\nTotal estimado: R$ ${total.toFixed(2).replace('.', ',')}`;

      // Salva a mensagem no dataset do botão para usarmos depois
      btnCheckout.dataset.message = baseMessage;
      btnCheckout.href = "#";
    } else {
      // Esconde a barra se nada estiver selecionado
      checkoutBar.classList.remove('visible');
      animateCounter(0);
      btnCheckout.href = "#";
    }
  }

  serviceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // Regra de exclusividade para Cílios
      if (this.checked && this.dataset.group === 'cilios') {
        serviceCheckboxes.forEach(other => {
          if (other !== this && other.dataset.group === 'cilios') {
            other.checked = false;
          }
        });
      }
      updateCheckout();
    });
  });

  // Lógica do Modal de Agendamento
  const schedulingOverlay = document.getElementById('scheduling-overlay');
  const schedulingCloseBtn = document.getElementById('scheduling-close-btn');
  const btnConfirmSchedule = document.getElementById('btn-confirm-schedule');
  const scheduleDate = document.getElementById('schedule-date');
  const scheduleTime = document.getElementById('schedule-time');

  if (btnCheckout && schedulingOverlay) {
    btnCheckout.addEventListener('click', (e) => {
      e.preventDefault();
      if (btnCheckout.dataset.message) {
        schedulingOverlay.classList.add('active');
      }
    });

    schedulingCloseBtn.addEventListener('click', () => {
      schedulingOverlay.classList.remove('active');
    });

    btnConfirmSchedule.addEventListener('click', () => {
      if (!scheduleDate.value || !scheduleTime.value) {
        alert("Por favor, selecione uma data e um horário completo para o agendamento.");
        return;
      }

      // Arredondamento inteligente de minutos para dezenas (ex: 14:13 -> 14:10)
      const timeParts = scheduleTime.value.split(':');
      let hours = parseInt(timeParts[0], 10);
      let minutes = parseInt(timeParts[1], 10);
      
      // Arredonda para a dezena mais próxima (ex: 13 vira 10, 18 vira 20)
      minutes = Math.round(minutes / 10) * 10;
      if (minutes === 60) {
        minutes = 0;
        hours += 1;
      }
      
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const finalTime = `${formattedHours}:${formattedMinutes}`;

      // Formata a data (YYYY-MM-DD para DD/MM/YYYY)
      const dateParts = scheduleDate.value.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

      // Junta a mensagem base com a data e hora formatada
      const finalMessage = btnCheckout.dataset.message + `\n\nGostaria de agendar para o dia ${formattedDate} às ${finalTime}.`;
      
      const encodedMessage = encodeURIComponent(finalMessage);
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      schedulingOverlay.classList.remove('active');
      
      // Abre o WhatsApp de forma segura usando a aba atual
      window.location.href = waUrl;
    });
  }

  // Lógica do Modal de Manutenção
  const btnNavMaintenance = document.querySelectorAll('.btn-nav-maintenance');
  const maintenanceOverlay = document.getElementById('maintenance-overlay');
  const maintenanceCloseBtn = document.getElementById('maintenance-close-btn');
  const maintCheckboxes = document.querySelectorAll('.maint-checkbox');
  const maintTotalEl = document.getElementById('maint-total');
  const btnConfirmMaint = document.getElementById('btn-confirm-maint');
  const maintDate = document.getElementById('maint-date');
  const maintTime = document.getElementById('maint-time');

  let selectedMaintName = "";
  let selectedMaintPrice = 0;

  let currentMaintVal = 0;
  function animateMaintCounter(targetValue) {
    const obj = { val: currentMaintVal };
    gsap.to(obj, {
      val: targetValue,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        maintTotalEl.innerText = `R$ ${obj.val.toFixed(2).replace('.', ',')}`;
      }
    });
    currentMaintVal = targetValue;
  }

  function updateMaintTotal() {
    selectedMaintPrice = 0;
    selectedMaintName = "";
    
    maintCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        selectedMaintPrice += parseFloat(checkbox.value);
        selectedMaintName = checkbox.dataset.name;
      }
    });

    animateMaintCounter(selectedMaintPrice);

    if (selectedMaintPrice > 0) {
      btnConfirmMaint.style.opacity = "1";
      btnConfirmMaint.style.pointerEvents = "all";
    } else {
      btnConfirmMaint.style.opacity = "0.5";
      btnConfirmMaint.style.pointerEvents = "none";
    }
  }

  if (maintenanceOverlay) {
    btnNavMaintenance.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Se estiver no mobile, fecha o menu primeiro
        if (mobileMenuBtn && mobileMenuOverlay) {
          mobileMenuBtn.classList.remove('open');
          mobileMenuOverlay.classList.remove('active');
        }
        
        maintenanceOverlay.classList.add('active');
      });
    });

    maintenanceCloseBtn.addEventListener('click', () => {
      maintenanceOverlay.classList.remove('active');
    });

    maintCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        // Regra de exclusividade para Manutenção (Apenas uma por vez)
        if (this.checked) {
          maintCheckboxes.forEach(other => {
            if (other !== this) {
              other.checked = false;
            }
          });
        }
        updateMaintTotal();
      });
    });

    btnConfirmMaint.addEventListener('click', () => {
      if (!maintDate.value || !maintTime.value) {
        alert("Por favor, selecione uma data e um horário completo para o agendamento da manutenção.");
        return;
      }

      // Arredondamento inteligente de minutos
      const timeParts = maintTime.value.split(':');
      let hours = parseInt(timeParts[0], 10);
      let minutes = parseInt(timeParts[1], 10);
      
      minutes = Math.round(minutes / 10) * 10;
      if (minutes === 60) {
        minutes = 0;
        hours += 1;
      }
      
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const finalTime = `${formattedHours}:${formattedMinutes}`;

      const dateParts = maintDate.value.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

      const finalMessage = `Olá, Naomi Domoto! Gostaria de agendar a ${selectedMaintName} para o dia ${formattedDate} às ${finalTime}.\nValor: R$ ${selectedMaintPrice.toFixed(2).replace('.', ',')}`;
      
      const encodedMessage = encodeURIComponent(finalMessage);
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      maintenanceOverlay.classList.remove('active');
      window.location.href = waUrl;
    });
  }

  // Atualiza o ano no footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.innerText = new Date().getFullYear();

  // Limita a data mínima para hoje nos calendários
  const today = new Date().toISOString().split('T')[0];
  if (maintDate) maintDate.min = today;
  if (scheduleDate) scheduleDate.min = today;

  // ==========================================
  // NOVOS MÓDULOS DE ANIMAÇÃO E INTERATIVIDADE
  // ==========================================

  // 1. Partículas do Hero (Brilhos dourados flutuantes)
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    const numParticles = 20;
    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      const randomLeft = Math.random() * 100;
      const randomDelay = Math.random() * 8;
      const randomDuration = 6 + Math.random() * 6;
      const randomScale = 0.4 + Math.random() * 0.8;
      
      particle.style.left = `${randomLeft}%`;
      particle.style.animationDelay = `${randomDelay}s`;
      particle.style.animationDuration = `${randomDuration}s`;
      particle.style.transform = `scale(${randomScale})`;
      
      particlesContainer.appendChild(particle);
    }
  }

  // 2. Parallax no Vídeo do Hero
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    const isMobile = window.innerWidth <= 900;
    gsap.to(heroVideo, {
      yPercent: isMobile ? 6 : 15,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: isMobile ? 0.5 : true
      }
    });
  }

  // 3. Scroll Reveal das Seções
  // 3.1 Fade-in de headers (eyebrow, h2, subtextos) por seção
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    const headings = section.querySelectorAll('.eyebrow, .h-large, .category-title, p[style*="color: var(--text-sub)"]');
    if (headings.length > 0) {
      gsap.from(headings, {
        opacity: 0,
        y: 25,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    }
  });

  // 3.2 Revelação individual e resiliente de cada card ao rolar a tela (About, Tips e Catálogo)
  // IMPORTANTE: Seleciona apenas os service-cards no catálogo para evitar os service-cards ocultos dentro de modais/overlays (manutenção)
  const cards = document.querySelectorAll('.about-card, .tip-card, .catalog-grid .service-card');
  cards.forEach(card => {
    gsap.from(card, {
      opacity: 0,
      y: 35,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 92%", // Dispara de forma individual quando cada card entra no viewport
        toggleActions: "play none none none"
      },
      onComplete: () => {
        // Limpa as propriedades inline após a animação de reveal para que os hovers CSS originais funcionem 100%
        gsap.set(card, { clearProps: "opacity,y,transform" });
      }
    });
  });

  // 4. Tilt 3D & Glow nos Cards (About & Tips)
  const cards3d = document.querySelectorAll('.about-card, .tip-card');
  cards3d.forEach(card => {
    const glow = document.createElement('div');
    glow.classList.add('card-glow');
    card.appendChild(glow);

    // Ativa apenas no Desktop para melhor desempenho e evitar conflito com touch
    if (window.innerWidth > 900) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = -(y - centerY) / 12;
        const rotateY = (x - centerX) / 12;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out"
        });
      });
    }
  });

  // 5. Ripple nos cliques dos service-cards do catálogo
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.tagName === 'INPUT') return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('card-ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      const existingRipples = card.querySelectorAll('.card-ripple');
      existingRipples.forEach(r => r.remove());
      
      card.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 850);
    });
  });

  // 6. Cursor Decorativo Personalizado (Apenas Desktop)
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorRing = document.getElementById('custom-cursor-ring');
  
  if (cursorDot && cursorRing && window.innerWidth > 900) {
    document.body.classList.add('custom-cursor-active');
    
    const dotX = gsap.quickTo(cursorDot, "left", { duration: 0.1, ease: "power3.out" });
    const dotY = gsap.quickTo(cursorDot, "top", { duration: 0.1, ease: "power3.out" });
    const ringX = gsap.quickTo(cursorRing, "left", { duration: 0.35, ease: "power3.out" });
    const ringY = gsap.quickTo(cursorRing, "top", { duration: 0.35, ease: "power3.out" });
    
    let isCursorVisible = false;
    
    window.addEventListener('mousemove', (e) => {
      if (!isCursorVisible) {
        gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.3 });
        isCursorVisible = true;
      }
      
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    });
    
    document.addEventListener('mouseleave', () => {
      gsap.to([cursorDot, cursorRing], { opacity: 0, duration: 0.3 });
      isCursorVisible = false;
    });
    
    document.addEventListener('mouseenter', () => {
      gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.3 });
      isCursorVisible = true;
    });
    
    const interactiveSelectors = 'a, button, label, input, .service-card';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('hovered');
        cursorDot.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('hovered');
        cursorDot.classList.remove('hovered');
      });
    });
  }

  // 7. Shrink da Navbar no Mobile ao rolar a página
  if (window.innerWidth <= 900) {
    ScrollTrigger.create({
      start: "top -50px", // Quando rola mais de 50px
      onEnter: () => nav.classList.add('nav-scrolled'),
      onLeaveBack: () => nav.classList.remove('nav-scrolled')
    });
  }

});
