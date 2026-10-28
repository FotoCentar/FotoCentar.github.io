document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('mainNavbar');
  const navLinks = [...document.querySelectorAll('.navbar-nav .nav-link, .mobile-nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const updateNavbar = () => { if (navbar) navbar.classList.toggle('navbar-scrolled', window.scrollY > 35); };
  updateNavbar(); window.addEventListener('scroll', updateNavbar, {passive:true});
  navLinks.forEach(link => link.addEventListener('click', () => {
    const menu = document.getElementById('mobileMenu');
    if (menu && menu.classList.contains('show') && window.bootstrap) bootstrap.Offcanvas.getInstance(menu)?.hide();
  }));
  const setActive = () => {
    let current = 'home';
    sections.forEach(section => { if (window.scrollY >= section.offsetTop - 160) current = section.id; });
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', setActive, {passive:true}); setActive();
  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const galleryFilters = [...document.querySelectorAll('.gallery-filter')];
  const applyGalleryFilter = (filter) => {
    galleryFilters.forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
    if (filter === 'all') {
      // In “All”, show one preview card for every category. Opening it still reveals the full album.
      const seenCategories = new Set();
      galleryItems.forEach(item => {
        const category = item.dataset.category;
        item.hidden = seenCategories.has(category);
        seenCategories.add(category);
      });
      return;
    }
    galleryItems.forEach(item => { item.hidden = item.dataset.category !== filter; });
  };
  galleryFilters.forEach(button => button.addEventListener('click', () => applyGalleryFilter(button.dataset.filter)));
  applyGalleryFilter(document.querySelector('.gallery-filter.active')?.dataset.filter || 'all');

  // Make the entire service card open its associated details modal.
  document.querySelectorAll('.service-card[data-modal-target]').forEach(card => {
    const openServiceModal = () => {
      const target = document.querySelector(card.dataset.modalTarget);
      if (target && window.bootstrap) bootstrap.Modal.getOrCreateInstance(target).show();
    };
    card.addEventListener('click', event => {
      if (event.target.closest('a, button')) return; // Keep the existing CTA button behavior.
      openServiceModal();
    });
    card.addEventListener('keydown', event => {
      if (event.target !== card || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      openServiceModal();
    });
  });
  document.querySelectorAll('.modal-contact-btn').forEach(button => button.addEventListener('click', () => {
    const modal = button.closest('.modal');
    if (modal && window.bootstrap) bootstrap.Modal.getInstance(modal)?.hide();
  }));
  const year = document.getElementById('currentYear'); if (year) year.textContent = new Date().getFullYear();
  const statObserver = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target; if (el.dataset.counted) return; el.dataset.counted = 'true';
    const target = Number(el.dataset.target || 0), suffix = el.dataset.suffix || ''; const duration = 1100; const start = performance.now();
    const tick = now => { const progress = Math.min((now-start)/duration,1); el.textContent = Math.floor(target * (1-Math.pow(1-progress,3))).toLocaleString('en-US') + suffix; if (progress < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); statObserver.unobserve(el);
  }), {threshold:.25}) : null;
  document.querySelectorAll('.about-stat-number').forEach(el => { if (statObserver) statObserver.observe(el); else el.textContent = (el.dataset.target || '0') + (el.dataset.suffix || ''); });
  // Bootstrap gallery modal and album navigation.
  const galleryModal = document.getElementById('galleryModal');
  const galleryButtons = [...document.querySelectorAll('.gallery-image-button')];
  let activeAlbumButtons = [];
  let activeGalleryIndex = 0;
  const modalImage = document.getElementById('galleryModalImage');
  const modalCategory = document.getElementById('galleryModalCategory');
  const modalTitle = document.getElementById('galleryModalTitle');
  const modalCounter = document.getElementById('galleryModalCounter');
  const modalPrev = document.getElementById('galleryModalPrev');
  const modalNext = document.getElementById('galleryModalNext');
  const currentLanguage = () => document.documentElement.lang === 'en';
  const translateGalleryLabel = (mk) => {
    if (!currentLanguage()) return mk;
    const map = {'Свадбена фотографија':'Wedding photography','Детска фотосесија':'Children’s photoshoot','Модна фотографија':'Fashion photography','Дрон снимање':'Drone photography','Фамилијарна фотосесија':'Family photoshoot','Крштевка':'Baptism','Свадбена приказна':'A wedding story','Емоции што остануваат':'Emotions that last','Детали од свадбениот ден':'Wedding day details','Мали моменти, големи спомени':'Little moments, big memories','Детски свет':'A child’s world','Едноставно, слатко, незаборавно':'Simple, sweet, unforgettable','Стил во фокус':'Style in focus','Повеќе од портрет':'More than a portrait','Поглед од височина':'A view from above','Воздушна перспектива':'An aerial perspective','Семејни спомени':'Family memories','Посебен семеен ден':'A special family day','Момент на нежност':'A tender moment','Семеен портрет':'Family portrait','Златна црковна светлина':'Golden church light'};
    return map[mk] || mk;
  };
  const updateGalleryModal = () => {
    if (!activeAlbumButtons.length) return;
    const button = activeAlbumButtons[activeGalleryIndex];
    const image = button.querySelector('img');
    if (!image || !modalImage) return;
    modalImage.classList.add('is-changing');
    const src = button.dataset.image || image.currentSrc || image.src;
    modalImage.src = src;
    modalImage.alt = image.alt || '';
    const category = button.dataset.categoryName || button.querySelector('.gallery-category')?.textContent.trim() || '';
    const title = button.querySelector('.gallery-item-title')?.textContent.trim() || image.alt || '';
    if (modalCategory) modalCategory.textContent = translateGalleryLabel(category);
    if (modalTitle) modalTitle.textContent = translateGalleryLabel(title);
    if (modalCounter) modalCounter.textContent = `${activeGalleryIndex + 1} / ${activeAlbumButtons.length}`;
    if (modalPrev) modalPrev.hidden = activeAlbumButtons.length < 2;
    if (modalNext) modalNext.hidden = activeAlbumButtons.length < 2;
    window.setTimeout(() => modalImage.classList.remove('is-changing'), 120);
  };
  galleryModal?.addEventListener('show.bs.modal', event => {
    const trigger = event.relatedTarget;
    if (!trigger) return;
    const album = trigger.dataset.album;
    activeAlbumButtons = galleryButtons.filter(button => button.dataset.album === album);
    if (!activeAlbumButtons.length) activeAlbumButtons = [trigger];
    activeGalleryIndex = Math.max(0, activeAlbumButtons.indexOf(trigger));
    updateGalleryModal();
  });
  modalPrev?.addEventListener('click', () => { if (!activeAlbumButtons.length) return; activeGalleryIndex = (activeGalleryIndex - 1 + activeAlbumButtons.length) % activeAlbumButtons.length; updateGalleryModal(); });
  modalNext?.addEventListener('click', () => { if (!activeAlbumButtons.length) return; activeGalleryIndex = (activeGalleryIndex + 1) % activeAlbumButtons.length; updateGalleryModal(); });
  document.addEventListener('keydown', event => {
    if (!galleryModal?.classList.contains('show')) return;
    if (event.key === 'ArrowLeft') modalPrev?.click();
    if (event.key === 'ArrowRight') modalNext?.click();
  });
  galleryModal?.addEventListener('hidden.bs.modal', () => { if (modalImage) modalImage.removeAttribute('src'); });
});
