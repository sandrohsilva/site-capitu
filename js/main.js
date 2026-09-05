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

  // 5. Alternância de Abas nos Cards de Obras (Ficha Técnica / Antes de Ler)
  window.switchObraTab = function(button, targetId) {
    if (!button) return;
    const cardContainer = button.closest('.ficha-tecnica') || button.closest('.obra-card');
    const navContainer = button.closest('.card-tabs-nav');
    const idToOpen = targetId || button.getAttribute('data-tab');

    if (cardContainer && idToOpen) {
      if (navContainer) {
        navContainer.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
      }

      cardContainer.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });

      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      const targetContent = document.getElementById(idToOpen) || cardContainer.querySelector(`#${idToOpen}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    }
  };

  const tabButtons = document.querySelectorAll('.card-tabs-nav .tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = button.getAttribute('data-tab');
      window.switchObraTab(button, targetId);
    });
  });

  // 6. Carregamento Dinâmico de Obras (Fetch), Busca e Seleção Aleatória Inicial
  window.loadObraCard = function(obraId) {
    const container = document.getElementById('obra-active-container');
    if (!container || !obraId) return;

    // Atualizar classe ativa nas miniaturas do carrossel
    document.querySelectorAll('.carousel-thumb-item').forEach(thumb => {
      if (thumb.getAttribute('data-obra') === obraId) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });

    // Carregar fragmento HTML via Fetch
    fetch(`obras/${obraId}.html`)
      .then(response => {
        if (!response.ok) throw new Error(`Erro ao carregar obra: ${obraId}`);
        return response.text();
      })
      .then(html => {
        container.innerHTML = html;
        // Re-associar manipuladores de abas
        container.querySelectorAll('.card-tabs-nav .tab-btn').forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('data-tab');
            window.switchObraTab(button, targetId);
          });
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  // Inicialização do Catálogo no Universo Leitor
  const activeContainer = document.getElementById('obra-active-container');
  if (activeContainer) {
    const thumbs = document.querySelectorAll('.carousel-thumb-item');
    const availableObras = Array.from(thumbs).map(t => t.getAttribute('data-obra')).filter(Boolean);

    // Sorteio Aleatório Inicial caso existam obras cadastradas
    if (availableObras.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableObras.length);
      const randomObraId = availableObras[randomIndex];
      window.loadObraCard(randomObraId);
    }

    // Clique nas miniaturas do carrossel
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        const obraId = thumb.getAttribute('data-obra');
        window.loadObraCard(obraId);
      });
    });

    // Filtro de Busca Simples
    const searchInput = document.getElementById('obras-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        thumbs.forEach(thumb => {
          const title = (thumb.getAttribute('data-title') || '').toLowerCase();
          const author = (thumb.getAttribute('data-author') || '').toLowerCase();
          if (title.includes(query) || author.includes(query)) {
            thumb.style.display = 'flex';
          } else {
            thumb.style.display = 'none';
          }
        });
      });
    }
  }
});


