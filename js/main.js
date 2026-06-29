document.addEventListener('DOMContentLoaded', () => {
  const lenis = initLenis();

  initLangDropdown();
  initAboutSlider();
  initFaqAccordion();
  initProductsVideo();
  initHeroAnimation();
  initAos(lenis);
  const setActiveNav = initNavSpy(lenis);
  initBurgerMenu(lenis, setActiveNav);
  initProductPopup(lenis, setActiveNav);
  initAnchorScroll(lenis, setActiveNav);
});

function isSafari() {
  const ua = navigator.userAgent;
  return ua.includes('Safari') && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|OPR|Firefox/.test(ua);
}

function initLenis() {
  if (isSafari()) return null;

  return new Lenis({ autoRaf: true });
}

function getAnchorScrollOffset(extraGap = 16) {
  const header = document.querySelector('.header');

  if (!header) return extraGap;

  return header.getBoundingClientRect().bottom + extraGap;
}

function scrollToAnchor(href, lenisInstance, setActiveNav) {
  if (!href || href === '#') return;

  const target = document.querySelector(href);

  if (!target) return;

  const runScroll = () => {
    const offset = getAnchorScrollOffset();
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    if (lenisInstance) {
      lenisInstance.start();
      lenisInstance.scrollTo(top);
    } else {
      window.scrollTo({ top, behavior: 'smooth' });
    }

    setActiveNav?.(href.slice(1));
    history.pushState(null, '', href);
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(runScroll);
  });
}

function initBurgerMenu(lenisInstance, setActiveNav) {
  const burger = document.querySelector('.header__burger');
  const modal = document.querySelector('.modal');
  const overlay = document.querySelector('.modal__overlay');
  const closeBtn = document.querySelector('.modal__close');
  const content = modal?.querySelector('.modal__content');
  const navLinks = document.querySelectorAll('.modal__nav-link');
  const modalLinks = document.querySelectorAll('.modal__btn');

  if (!burger || !modal || !content) return;

  let isClosing = false;
  let closeCallback = null;

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

    const callback = closeCallback;
    closeCallback = null;
    callback?.();
  };

  const closeMenu = (onClosed) => {
    if (!modal.classList.contains('is-open')) {
      onClosed?.();
      return;
    }

    if (isClosing) {
      if (onClosed) closeCallback = onClosed;
      return;
    }

    isClosing = true;
    if (onClosed) closeCallback = onClosed;

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

  const handleModalLink = (link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      if (!href || href === '#') {
        e.preventDefault();
        closeMenu();
        return;
      }

      if (!document.querySelector(href)) return;

      e.preventDefault();
      e.stopPropagation();

      const navigate = () => scrollToAnchor(href, lenisInstance, setActiveNav);

      if (!modal.classList.contains('is-open')) {
        navigate();
        return;
      }

      closeMenu(navigate);
    });
  };

  burger.addEventListener('click', () => {
    if (modal.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeBtn?.addEventListener('click', () => closeMenu());
  overlay?.addEventListener('click', () => closeMenu());

  navLinks.forEach(handleModalLink);
  modalLinks.forEach(handleModalLink);

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

function initProductsVideo() {
  document.querySelectorAll('.products__item--video').forEach((item) => {
    const video = item.querySelector('.products__item-video');

    if (!video) return;

    const play = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    const pause = () => {
      video.pause();
      video.currentTime = 0;
    };

    item.addEventListener('mouseenter', play);
    item.addEventListener('mouseleave', pause);
    item.addEventListener('focusin', play);
    item.addEventListener('focusout', pause);
  });
}

function initProductPopup(lenisInstance, setActiveNav) {
  const popup = document.querySelector('.product-popup');
  const overlay = popup?.querySelector('.product-popup__overlay');
  const closeBtn = popup?.querySelector('.product-popup__close');
  const sampleBtn = popup?.querySelector('.product-popup__btn');
  const titleEl = popup?.querySelector('.product-popup__title');
  const mediaEl = popup?.querySelector('.product-popup__media');
  const scrollEl = popup?.querySelector('.product-popup__content-body');
  const items = document.querySelectorAll('.products__item');

  if (!popup || !items.length) return;

  const resetScroll = () => {
    if (scrollEl) scrollEl.scrollTop = 0;
  };

  const pauseItemVideo = (item) => {
    const video = item.querySelector('.products__item-video');
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  const open = (item) => {
    const title = item.querySelector('.products__item-title');
    const img = item.querySelector('.products__item-img--default');

    pauseItemVideo(item);

    if (titleEl && title) {
      titleEl.innerHTML = title.innerHTML;
    }

    if (mediaEl && img) {
      mediaEl.innerHTML = '';
      const image = img.cloneNode(true);
      image.classList.remove('products__item-img--default');
      image.classList.add('product-popup__image');
      mediaEl.appendChild(image);
    }

    resetScroll();

    popup.classList.add('is-open');
    document.body.classList.add('product-popup-open');
    popup.setAttribute('aria-hidden', 'false');
    lenisInstance?.stop();
  };

  const close = (onClosed) => {
    popup.classList.remove('is-open');
    document.body.classList.remove('product-popup-open');
    popup.setAttribute('aria-hidden', 'true');
    resetScroll();
    lenisInstance?.start();
    onClosed?.();
  };

  items.forEach((item) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');

    item.addEventListener('click', () => open(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(item);
      }
    });
  });

  closeBtn?.addEventListener('click', () => close());
  overlay?.addEventListener('click', () => close());

  sampleBtn?.addEventListener('click', (e) => {
    const href = sampleBtn.getAttribute('href');

    if (!href || href === '#') return;

    if (!document.querySelector(href)) return;

    e.preventDefault();
    e.stopPropagation();

    close(() => {
      scrollToAnchor(href, lenisInstance, setActiveNav);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('is-open')) {
      close();
    }
  });
}

function initHeroAnimation() {
  const hero = document.querySelector('.hero');

  if (!hero) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    hero.classList.add('is-animated');
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hero.classList.add('is-animated');
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

function initNavSpy(lenisInstance) {
  const navLinks = document.querySelectorAll('.header__nav-link, .modal__nav-link');

  if (!navLinks.length) return;

  const sections = [...navLinks]
    .map((link) => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return null;
      return document.querySelector(href);
    })
    .filter(Boolean);

  const uniqueSections = [...new Set(sections)];

  if (!uniqueSections.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  const updateActive = () => {
    const offset = 120;
    let currentId = '';

    uniqueSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) {
        currentId = section.id;
      }
    });

    if (currentId) {
      setActive(currentId);
    } else {
      navLinks.forEach((link) => link.classList.remove('is-active'));
    }
  };

  updateActive();

  if (lenisInstance) {
    lenisInstance.on('scroll', updateActive);
  } else {
    window.addEventListener('scroll', updateActive, { passive: true });
  }

  return setActive;
}

function initAnchorScroll(lenisInstance, setActiveNav) {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    if (link.closest('.modal') || link.closest('.product-popup')) return;

    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      if (!href || href === '#') return;

      const target = document.querySelector(href);

      if (!target) return;

      e.preventDefault();
      scrollToAnchor(href, lenisInstance, setActiveNav);
    });
  });
}
