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
    mobileMenuBtn.classList.toggle('open');
    mobileMenuOverlay.classList.toggle('active');
  }

  if (mobileMenuBtn && mobileMenuOverlay) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('open');
        mobileMenuOverlay.classList.remove('active');
      });
    });
  }

  // 2. Lógica do Carrinho de Compras (Orçamentos)
  const serviceCheckboxes = document.querySelectorAll('.service-checkbox');
  const checkoutBar = document.getElementById('checkout-bar');
  const checkoutTotal = document.getElementById('checkout-total');
  const btnCheckout = document.getElementById('btn-checkout');
  const whatsappNumber = "5512992189414"; // Novo número atualizado

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
      checkoutTotal.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;

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

  function updateMaintTotal() {
    selectedMaintPrice = 0;
    selectedMaintName = "";
    
    maintCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        selectedMaintPrice += parseFloat(checkbox.value);
        selectedMaintName = checkbox.dataset.name;
      }
    });

    maintTotalEl.innerText = `R$ ${selectedMaintPrice.toFixed(2).replace('.', ',')}`;

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

});
