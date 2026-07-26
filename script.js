'use strict';

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const app = {
  init() {
    this.preloader();
    this.header();
    this.mobileMenu();
    this.petals();
    this.reveal();
    this.counters();
    this.serviceFilters();
    this.accordion();
    this.testimonials();
    this.forms();
    this.bookingModal();
    this.dateLimit();
    this.smoothLinks();
  },

  preloader() {
    const loader = qs('#preloader');
    if (!loader) return;
    const hide = () => window.setTimeout(() => loader.classList.add('is-hidden'), 350);
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide, { once: true });
  },

  header() {
    const header = qs('.site-header');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    update();
    window.addEventListener('scroll', update, { passive: true });
  },

  mobileMenu() {
    const toggle = qs('.menu-toggle');
    const nav = qs('#main-nav');
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-modal-open');
    };

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-modal-open', open);
    });
    qsa('a', nav).forEach((link) => link.addEventListener('click', close));
    window.addEventListener('resize', () => { if (window.innerWidth > 820) close(); });
  },

  petals() {
    const host = qs('#petals');
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const count = window.innerWidth < 600 ? 10 : 20;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.setProperty('--left', `${Math.random() * 100}%`);
      petal.style.setProperty('--size', `${8 + Math.random() * 11}px`);
      petal.style.setProperty('--duration', `${9 + Math.random() * 12}s`);
      petal.style.setProperty('--delay', `${-Math.random() * 18}s`);
      petal.style.setProperty('--drift', `${-90 + Math.random() * 180}px`);
      petal.style.setProperty('--rotate', `${Math.random() * 180}deg`);
      petal.style.setProperty('--opacity', `${0.22 + Math.random() * 0.42}`);
      fragment.appendChild(petal);
    }
    host.appendChild(fragment);
  },

  reveal() {
    const items = qsa('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(item);
    });
  },

  counters() {
    const counters = qsa('[data-counter]');
    if (!counters.length) return;
    const animate = (node) => {
      const target = Number(node.dataset.counter) || 0;
      const duration = 1100;
      const started = performance.now();
      const frame = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: .5 });
    counters.forEach((counter) => observer.observe(counter));
  },

  serviceFilters() {
    const tabs = qsa('.service-tab');
    const cards = qsa('.service-card');
    if (!tabs.length || !cards.length) return;
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
        });
        const filter = tab.dataset.filter;
        cards.forEach((card) => {
          const match = filter === 'all' || card.dataset.category.split(' ').includes(filter);
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  },

  accordion() {
    qsa('.accordion-item button').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.accordion-item');
        const open = item.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(open));
        const icon = qs('i', button);
        if (icon) icon.textContent = open ? '−' : '+';
      });
    });
  },

  testimonials() {
    const slides = qsa('.testimonial');
    const prev = qs('.slider-button--prev');
    const next = qs('.slider-button--next');
    if (!slides.length || !prev || !next) return;
    let current = 0;
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    };
    prev.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    window.setInterval(() => {
      if (!document.hidden) show(current + 1);
    }, 7000);
  },

  forms() {
    const form = qs('#booking-form');
    const status = qs('#form-status');
    if (!form || !status) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = 'Проверьте обязательные поля.';
        return;
      }
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      status.textContent = `${name || 'Спасибо'}, заявка сформирована. В демо-версии данные никуда не отправляются.`;
      this.showToast();
      form.reset();
      this.dateLimit();
    });
  },

  bookingModal() {
    const modal = qs('#booking-modal');
    const form = qs('#modal-form');
    if (!modal || !form) return;
    const steps = qsa('.modal-step', modal);
    const progress = qsa('.modal-progress span', modal);
    let current = 0;

    const showStep = (index) => {
      current = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((step, i) => step.classList.toggle('is-active', i === current));
      progress.forEach((bar, i) => bar.classList.toggle('is-active', i <= current));
    };
    const open = (service = '') => {
      modal.hidden = false;
      document.body.classList.add('is-modal-open');
      showStep(0);
      if (service) {
        const match = qsa('input[name="modal_service"]', modal).find((input) => service.toLowerCase().includes(input.value.toLowerCase()));
        if (match) match.checked = true;
      }
      window.setTimeout(() => qs('input, button', steps[0])?.focus(), 50);
    };
    const close = () => {
      modal.hidden = true;
      document.body.classList.remove('is-modal-open');
    };

    qsa('.booking-trigger').forEach((trigger) => trigger.addEventListener('click', () => open(trigger.dataset.service || '')));
    qsa('[data-close-modal]', modal).forEach((node) => node.addEventListener('click', close));
    qsa('.modal-next', modal).forEach((button) => {
      button.addEventListener('click', () => {
        if (current === 0 && !qs('input[name="goal"]:checked', form)) {
          qs('input[name="goal"]', form)?.focus();
          return;
        }
        showStep(current + 1);
      });
    });
    qsa('.modal-prev', modal).forEach((button) => button.addEventListener('click', () => showStep(current - 1)));

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const name = String(new FormData(form).get('modal_name') || '').trim();
      const status = qs('#modal-status');
      if (status) status.textContent = `${name || 'Спасибо'}, подбор готов. Это демонстрационная форма.`;
      this.showToast();
      window.setTimeout(() => {
        close();
        form.reset();
        showStep(0);
      }, 1100);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) close();
    });
  },

  dateLimit() {
    const input = qs('#booking-date');
    if (!input) return;
    const today = new Date();
    const max = new Date(today);
    max.setMonth(max.getMonth() + 4);
    const format = (date) => date.toISOString().split('T')[0];
    input.min = format(today);
    input.max = format(max);
  },

  smoothLinks() {
    qsa('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = qs(id);
        if (!target) return;
        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  },

  showToast() {
    const toast = qs('#toast');
    if (!toast) return;
    toast.classList.add('is-visible');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4200);
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
