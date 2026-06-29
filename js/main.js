document.addEventListener('DOMContentLoaded', () => {
  const lenis = initLenis();

  initBurgerMenu(lenis);
  initLangDropdown();
  initAboutSlider();
  initFaqAccordion();
  initAos(lenis);
  initAnchorScroll(lenis);
});

function isSafari() {
  const ua = navigator.userAgent;
  return ua.includes('Safari') && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|OPR|Firefox/.test(ua);
}

function initLenis() {
  if (isSafari()) return null;

  return new Lenis({ autoRaf: true });
}

function initBurgerMenu(lenisInstance) {
  const burger = document.querySelector('.header__burger');
  const modal = document.querySelector('.modal');
  const overlay = document.querySelector('.modal__overlay');
  const closeBtn = document.querySelector('.modal__close');
  const content = modal?.querySelector('.modal__content');
  const navLinks = document.querySelectorAll('.modal__nav-link');
  const modalLinks = document.querySelectorAll('.modal__btn');

  if (!burger || !modal || !content) return;

  let isClosing = false;

  const openMenu = () => {
    if (isClosing) return;

    modal.classList.add('is-open');
    burger.classList.add('is-active');
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    modal.setAttribute('aria-hidden', 'false');
    lenisInstance?.stop();
  };

  const finishClose = () => {
    isClosing = false;
    document.body.classList.remove('menu-open');
    modal.setAttribute('aria-hidden', 'true');
    lenisInstance?.start();
  };

  const closeMenu = () => {
    if (!modal.classList.contains('is-open') || isClosing) return;

    isClosing = true;
    modal.classList.remove('is-open');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');

    const onTransitionEnd = (e) => {
      if (e.target !== content || e.propertyName !== 'transform') return;

      clearTimeout(closeTimer);
      content.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    };

    const closeTimer = setTimeout(() => {
      content.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    }, 350);

    content.addEventListener('transitionend', onTransitionEnd);
  };

  burger.addEventListener('click', () => {
    if (modal.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  modalLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

function initLangDropdown() {
  const lang = document.querySelector('.header__lang');

  if (!lang) return;

  const toggle = lang.querySelector('.header__lang-toggle');
  const current = lang.querySelector('.header__lang-current');
  const options = lang.querySelectorAll('.header__lang-option');

  if (!toggle || !current || !options.length) return;

  const open = () => {
    lang.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    lang.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const selectOption = (option) => {
    options.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });

    option.classList.add('is-active');
    option.setAttribute('aria-selected', 'true');
    current.textContent = option.textContent.trim();
    close();
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    lang.classList.contains('is-open') ? close() : open();
  });

  options.forEach((option) => {
    option.addEventListener('click', () => selectOption(option));
  });

  document.addEventListener('click', (e) => {
    if (!lang.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lang.classList.contains('is-open')) {
      close();
    }
  });
}

function initAboutSlider() {
  const swiperEl = document.querySelector('.about__slider');

  if (!swiperEl) return;

  new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    speed: 600,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: swiperEl.querySelector('.about__pagination'),
      clickable: true,
    },
  });
}

function initFaqAccordion() {
  const items = document.querySelectorAll('.faq__item');

  if (!items.length) return;

  const closeItem = (item) => {
    const button = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    item.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');
    answer?.setAttribute('aria-hidden', 'true');
  };

  const openItem = (item) => {
    const button = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    item.classList.add('is-open');
    button?.setAttribute('aria-expanded', 'true');
    answer?.setAttribute('aria-hidden', 'false');
  };

  items.forEach((item) => {
    const button = item.querySelector('.faq__question');

    if (!button) return;

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach(closeItem);

      if (!isOpen) {
        openItem(item);
      }
    });
  });
}

function initAos(lenisInstance) {
  if (typeof AOS === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const setAos = (selector, animation, delay = 0) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.setAttribute('data-aos', animation);
      if (delay) el.setAttribute('data-aos-delay', String(delay));
    });
  };

  const setAosStagger = (selector, animation, step = 80) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.setAttribute('data-aos', animation);
      el.setAttribute('data-aos-delay', String(index % 6 * step));
    });
  };

  setAos('.hero__content', 'fade-up');
  setAos('.hero__media, .hero__media--mobile', 'fade-up', 120);

  setAos('.about__content', 'fade-up');
  setAos('.about__slider', 'fade-up', 100);

  setAos('.products__title', 'fade-up');
  setAos('.products__group', 'fade-up');
  setAos('.products__group--dessert, .products__group--solutions', 'fade-up', 100);
  setAos('.products__footer', 'fade-up', 120);
  setAosStagger('.products__item', 'fade-up', 70);

  setAos('.why-choose__title', 'fade-up');
  setAos('.why-choose__mission', 'fade-up', 80);
  setAos('.why-choose__values', 'fade-up', 120);
  setAosStagger('.why-choose__item', 'fade-up', 70);

  setAos('.applications__title', 'fade-up');
  setAosStagger('.applications__item', 'fade-up', 80);

  setAos('.faq__title', 'fade-up');
  setAosStagger('.faq__item', 'fade-up', 50);

  setAos('.partnership__content', 'fade-up');
  setAos('.partnership__media', 'fade-up', 100);

  setAos('.contacts__title', 'fade-up');
  setAos('.contacts__content', 'fade-up', 80);
  setAos('.contacts__form', 'fade-up', 160);

  setAos('.footer .container', 'fade-up');

  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
    mirror: false,
  });

  if (lenisInstance) {
    lenisInstance.on('scroll', AOS.refresh);
  }
}

function initAnchorScroll(lenisInstance) {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      if (!href || href === '#') return;

      const target = document.querySelector(href);

      if (!target) return;

      e.preventDefault();

      if (lenisInstance) {
        lenisInstance.scrollTo(target);
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      history.pushState(null, '', href);
    });
  });
}
