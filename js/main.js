/**
 * Capitu Leitor PDF/EPUB PREMIUM — Main JavaScript
 * Interatividade, Lightbox de screenshots, FAQ Sanfona e Helper de Tracking.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Controle do Menu Mobile
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Fechar menu mobile ao clicar num link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Lightbox Modal para Screenshots
  const screenshotItems = document.querySelectorAll('.screenshot-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightboxModal && lightboxImg && lightboxClose) {
    screenshotItems.forEach(item => {
      item.addEventListener('click', () => {
        const imgSrc = item.getAttribute('data-full-img') || item.querySelector('img').src;
        const imgAlt = item.querySelector('img').alt || 'Screenshot do aplicativo Capitu Reader';
        
        lightboxImg.src = imgSrc;
        lightboxImg.alt = imgAlt;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloqueia scroll do fundo
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Fechar ao clicar fora da imagem
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // 3. Accordion do FAQ (Perguntas Frequentes)
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Fechar todos os outros itens para manter sanfona limpa
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
        });

        // Alternar o item clicado
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 4. Rastreamento de Eventos (Helper para Google Tag Manager / Analytics)
  window.trackCapituEvent = function(eventName, eventParams = {}) {
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push({
        event: eventName,
        ...eventParams
      });
      console.log(`[Capitu Analytics Event]: ${eventName}`, eventParams);
    }
  };

  // Monitorar cliques nos botões de download da Play Store
  const playStoreButtons = document.querySelectorAll('a[href*="play.google.com"]');
  playStoreButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const location = btn.getAttribute('data-location') || 'unknown';
      window.trackCapituEvent('click_play_store', {
        button_location: location,
        destination_url: btn.href
      });
    });
  });
});
