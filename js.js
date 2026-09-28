const navLinks = document.querySelectorAll('.nav-link');
const mainNav = document.getElementById('mainNav');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const searchForm = document.querySelector('.site-search');
const searchInput = searchForm?.querySelector('input');
const searchableCards = [...document.querySelectorAll('.searchable-card')];

function clearActiveNav() {
  navLinks.forEach(link => link.classList.remove('active'));
}

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    clearActiveNav();
    link.classList.add('active');
    mainNav.classList.remove('open');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
  });
});

mobileMenuButton.addEventListener('click', () => {
  const open = !mainNav.classList.contains('open');
  mainNav.classList.toggle('open', open);
  mobileMenuButton.setAttribute('aria-expanded', String(open));
});

searchForm?.addEventListener('submit', event => {
  event.preventDefault();
  const term = searchInput.value.trim().toLowerCase();
  searchableCards.forEach(card => card.classList.remove('search-match'));
  if (!term) return;

  const match = searchableCards.find(card => card.textContent.toLowerCase().includes(term));
  if (match) {
    match.classList.add('search-match');
    match.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => match.classList.remove('search-match'), 1800);
  }
});

const sections = [...document.querySelectorAll('main section[id]')];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const matchingLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
    if (matchingLink) {
      clearActiveNav();
      matchingLink.classList.add('active');
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });

sections.forEach(section => observer.observe(section));


// Review carousel
(() => {
  const track = document.getElementById('reviewCarousel');
  const dotsWrap = document.getElementById('reviewDots');
  const prev = document.querySelector('.review-arrow-left');
  const next = document.querySelector('.review-arrow-right');

  if (!track || !dotsWrap || !prev || !next) return;

  const cards = [...track.querySelectorAll('.review-card')];
  let page = 0;

  function cardsPerPage() {
    if (window.innerWidth <= 680) return 1;
    if (window.innerWidth <= 980) return 2;
    return 3;
  }

  function totalPages() {
    return Math.max(1, Math.ceil(cards.length / cardsPerPage()));
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalPages(); i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'review-dot';
      dot.setAttribute('aria-label', `Show review page ${i + 1}`);
      dot.addEventListener('click', () => {
        page = i;
        updateCarousel();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function updateCarousel() {
    const perPage = cardsPerPage();
    const pages = totalPages();
    page = Math.min(page, pages - 1);

    const viewport = track.parentElement;
    const gap = 18;
    const cardWidth = perPage === 1
      ? viewport.clientWidth
      : (viewport.clientWidth - gap * (perPage - 1)) / perPage;

    track.style.transform = `translateX(-${page * perPage * (cardWidth + gap)}px)`;

    [...dotsWrap.children].forEach((dot, index) => {
      dot.classList.toggle('active', index === page);
    });

    prev.disabled = page === 0;
    next.disabled = page === pages - 1;
  }

  prev.addEventListener('click', () => {
    if (page > 0) {
      page--;
      updateCarousel();
    }
  });

  next.addEventListener('click', () => {
    if (page < totalPages() - 1) {
      page++;
      updateCarousel();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      page = 0;
      buildDots();
      updateCarousel();
    }, 120);
  });

  buildDots();
  updateCarousel();
})();


// Contact attachment previews
(() => {
  const input = document.getElementById('contactFiles');
  const preview = document.getElementById('attachmentPreview');

  if (!input || !preview) return;

  input.addEventListener('change', () => {
    preview.innerHTML = '';

    [...input.files].forEach(file => {
      const item = document.createElement('div');
      item.className = 'attachment-item';

      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.className = 'attachment-thumb';
        img.alt = '';
        img.src = URL.createObjectURL(file);
        img.addEventListener('load', () => URL.revokeObjectURL(img.src), { once: true });
        item.appendChild(img);
      } else {
        const icon = document.createElement('div');
        icon.className = 'attachment-video-icon';
        icon.innerHTML = '<i class="bi bi-camera-video-fill" aria-hidden="true"></i>';
        item.appendChild(icon);
      }

      const name = document.createElement('span');
      name.className = 'attachment-name';
      name.textContent = file.name;
      item.appendChild(name);

      preview.appendChild(item);
    });
  });
})();


// ============================================================
// HEADER TAB SCROLL POSITIONS
// Change ONLY these numbers to move where each tab stops.
//
// Bigger number = section stops LOWER on the screen.
// Smaller number = section stops HIGHER on the screen.
// You can also use negative numbers.
// ============================================================
const HEADER_TAB_POSITIONS = {
  home: 0,
  about: -20,
  services: -60,
  testimonials: -10,
  contact: 5
};


// Smooth header navigation
(() => {
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  function getFixedHeaderHeight() {
    const header = document.querySelector('.site-header');
    const subHeader = document.querySelector('.sub-header');

    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const subHeaderHeight = subHeader ? subHeader.getBoundingClientRect().height : 0;

    return headerHeight + subHeaderHeight;
  }

  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();

      const sectionName = id.replace('#', '');
      const manualGap = HEADER_TAB_POSITIONS[sectionName] ?? 20;

      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        getFixedHeaderHeight() -
        manualGap;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: 'smooth'
      });


      const nav = document.querySelector('.main-nav');
      if (nav) nav.classList.remove('open');
    });
  });
})();




// Mobile menu polish
(() => {
  const menu = document.getElementById('mainNav');
  const button = document.getElementById('mobileMenuButton');

  if (!menu || !button) return;

  const closeMenu = () => {
    menu.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  };

  document.addEventListener('click', event => {
    if (!menu.classList.contains('open')) return;
    if (menu.contains(event.target) || button.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();

// ============================================================
// CLICK-TO-FALL HEADER LEAF
// The logo leaf detaches visually and falls with a smooth,
// wind-swept motion: steady downward movement, broad sweeping
// drifts, and 3D rotation so it no longer looks flat.
// ============================================================
(() => {
  const leaf = document.querySelector('.brand-leaf');
  if (!leaf) return;

  let falling = false;

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  function makeFallKeyframes(startRect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const startX = startRect.left;
    const leafW = startRect.width;

    const fallDistance = Math.max(vh - startRect.top + startRect.height + 70, 300);
    const mainSweep = Math.min(Math.max(vw * 0.085, 54), 130);
    const detailSweep = mainSweep * 0.28;
    const breezeBias = randomBetween(-28, 28);
    const phase = randomBetween(-0.5, 0.5);
    const steps = 56;

    const leftRoom = -(startX - 10);
    const rightRoom = vw - (startX + leafW) - 10;
    const clampX = x => Math.max(leftRoom, Math.min(rightRoom, x));

    return Array.from({ length: steps + 1 }, (_, i) => {
      const p = i / steps;
      const eased = 1 - Math.pow(1 - p, 1.18);

      // Broad wind sweep + smaller flutter. The vertical gust term intentionally
      // pushes upward at parts of each swing so the leaf traces soft arcs instead
      // of dropping in a straight line.
      const sweep = Math.sin(p * Math.PI * 2.2 + phase) * mainSweep * (0.68 + p * 0.5);
      const flutter = Math.sin(p * Math.PI * 5.2 + phase * 2.1) * detailSweep;
      const glide = breezeBias * (0.25 + p * 0.95);
      const x = clampX(sweep + flutter + glide);

      const gustLift = Math.sin(p * Math.PI * 4.4 + phase * 1.35) * fallDistance * 0.028;
      const arcLift = Math.abs(Math.sin(p * Math.PI * 2.2 + phase)) * fallDistance * 0.018;
      const y = fallDistance * eased - gustLift - arcLift;

      const rotateZ = Math.sin(p * Math.PI * 3.6 + phase * 1.7) * 24 + x * 0.065;
      const rotateY = Math.sin(p * Math.PI * 8.2 + phase * 3.1) * 42;
      const rotateX = Math.cos(p * Math.PI * 5.3 + phase * 1.2) * 12;
      const scaleX = 0.9 + (1 - Math.min(1, Math.abs(rotateY) / 52)) * 0.16;
      const opacity = p > 0.92 ? 1 - ((p - 0.92) / 0.08) : 1;

      return {
        offset: p,
        transform: `perspective(900px) translate3d(${x}px, ${y}px, 0) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scaleX(${scaleX})`,
        opacity,
        easing: 'linear'
      };
    });
  }

  function restoreLeaf(clone) {
    clone?.remove();
    leaf.classList.remove('is-falling-source');
    falling = false;
  }

  function fallLeaf(event) {
    event.preventDefault();
    event.stopPropagation();

    if (falling) return;
    falling = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      leaf.animate(
        [
          { transform: 'rotate(-8deg)', opacity: 1 },
          { transform: 'translateY(22px) rotate(12deg)', opacity: 0 }
        ],
        { duration: 420, easing: 'ease-in', fill: 'none' }
      ).finished.finally(() => {
        leaf.style.opacity = '';
        falling = false;
      });
      return;
    }

    const rect = leaf.getBoundingClientRect();
    const clone = leaf.cloneNode(true);
    clone.className = 'falling-brand-leaf';
    clone.removeAttribute('aria-hidden');
    clone.alt = '';

    Object.assign(clone.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      pointerEvents: 'none',
      zIndex: '9999',
      transformOrigin: '50% 50%',
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'visible',
      willChange: 'transform, opacity'
    });

    document.body.appendChild(clone);
    leaf.classList.add('is-falling-source');

    const duration = Math.round(randomBetween(7600, 9200));
    const animation = clone.animate(makeFallKeyframes(rect), {
      duration,
      iterations: 1,
      fill: 'forwards'
    });

    animation.finished
      .then(() => restoreLeaf(clone))
      .catch(() => restoreLeaf(clone));
  }

  leaf.setAttribute('role', 'button');
  leaf.setAttribute('tabindex', '0');
  leaf.setAttribute('aria-label', 'Drop the leaf');
  leaf.addEventListener('click', fallLeaf);
  leaf.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') fallLeaf(event);
  });
})();
