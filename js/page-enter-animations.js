(function () {
  'use strict';

  var ran = false;

  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isIndex() {
    var path = location.pathname;
    return path === '/' || /\/index\.html?$/i.test(path) || path.endsWith('/');
  }

  function pathIncludes(segment) {
    return location.pathname.indexOf(segment) !== -1;
  }

  function finishEnter() {
    document.documentElement.classList.remove('pt-gsap-enter');
  }

  function addBannerFlash() {
    var banner = document.querySelector('.banner');
    if (!banner || banner.querySelector('.pt-banner-flash')) return null;

    var flash = document.createElement('div');
    flash.className = 'pt-banner-flash';
    flash.setAttribute('aria-hidden', 'true');
    banner.appendChild(flash);
    return flash;
  }

  function animateIndexWow() {
    var banner = document.querySelector('.banner');
    if (!banner) return;

    var flash = addBannerFlash();
    var text = banner.querySelector('.text');
    var line = document.createElement('span');
    line.className = 'pt-hero-line';
    line.setAttribute('aria-hidden', 'true');
    if (text) text.insertBefore(line, text.firstChild);

    gsap.set('header', { y: -48, opacity: 0 });
    gsap.set('.banner', { scale: 1.12, opacity: 0 });
    gsap.set('.banner .text h1, .banner .text h2, .banner .text p', { y: 72, opacity: 0 });
    gsap.set('.horario-container', { y: 36, opacity: 0 });
    gsap.set('.contact-info a', { y: -18, opacity: 0 });
    if (text) gsap.set(text, { clipPath: 'inset(0 0 100% 0)' });
    if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    if (flash) gsap.set(flash, { opacity: 0.55 });

    var tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      onComplete: finishEnter
    });

    tl.to('header', { y: 0, opacity: 1, duration: 1.05, ease: 'power3.out' }, 0)
      .to('.banner', { scale: 1, opacity: 1, duration: 2, ease: 'power2.inOut' }, 0.08)
      .to(flash, { opacity: 0, duration: 1.35, ease: 'power2.out' }, 0.12)
      .to(text, { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power4.inOut' }, 0.28)
      .to(line, { scaleX: 1, duration: 0.9, ease: 'power4.inOut' }, 0.42)
      .to('.banner .text h1', { y: 0, opacity: 1, duration: 1.15 }, 0.38)
      .to('.banner .text h2', { y: 0, opacity: 1, duration: 1.05 }, 0.52)
      .to('.banner .text p', { y: 0, opacity: 1, duration: 0.95 }, 0.64)
      .to('.contact-info a', { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power3.out' }, 0.58)
      .to('.horario-container', { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.78);
  }

  function animateIndexNav() {
    if (!document.querySelector('.banner')) return;

    gsap.set('header', { y: -28, opacity: 0 });
    gsap.set('.banner', { scale: 1.05, opacity: 0 });
    gsap.set('.banner .text h1, .banner .text h2, .banner .text p', { y: 40, opacity: 0 });
    gsap.set('.horario-container', { y: 24, opacity: 0 });

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: finishEnter
    })
      .to('header', { y: 0, opacity: 1, duration: 0.75 }, 0)
      .to('.banner', { scale: 1, opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.06)
      .to('.banner .text h1', { y: 0, opacity: 1, duration: 0.85 }, 0.22)
      .to('.banner .text h2', { y: 0, opacity: 1, duration: 0.8 }, 0.32)
      .to('.banner .text p', { y: 0, opacity: 1, duration: 0.75 }, 0.42)
      .to('.horario-container', { y: 0, opacity: 1, duration: 0.7 }, 0.52);
  }

  function animateIndexLight() {
    if (!document.querySelector('.banner')) return;

    gsap.from('.banner .text h1, .banner .text h2, .banner .text p', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.09,
      ease: 'power3.out',
      onComplete: finishEnter
    });
  }

  function animateHeroPair(titleSel, textSel, nav) {
    var title = document.querySelector(titleSel);
    var text = document.querySelector(textSel);
    if (!title && !text) return;

    var els = [title, text].filter(Boolean);
    gsap.set(els, { y: nav ? 44 : 18, opacity: 0 });

    gsap.to(els, {
      y: 0,
      opacity: 1,
      duration: nav ? 0.95 : 0.55,
      stagger: nav ? 0.14 : 0.08,
      ease: 'power4.out',
      onComplete: finishEnter
    });
  }

  function animateContacto(nav) {
    if (!document.querySelector('.c-hero__h1')) return;

    var tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      onComplete: finishEnter
    });
    var y = nav ? 36 : 16;
    var dur = nav ? 0.85 : 0.5;

    gsap.set('.c-hero__eyebrow, .c-hero__h1, .c-hero__sub, .c-hero__ctas, .c-hero__trust', { opacity: 0, y: y });

    tl.to('.c-hero__eyebrow', { y: 0, opacity: 1, duration: dur }, 0)
      .to('.c-hero__h1', { y: 0, opacity: 1, duration: dur + 0.15 }, 0.12)
      .to('.c-hero__sub', { y: 0, opacity: 1, duration: dur }, 0.24)
      .to('.c-hero__ctas', { y: 0, opacity: 1, duration: dur }, 0.34)
      .to('.c-hero__trust', { y: 0, opacity: 1, duration: dur - 0.1 }, 0.44);
  }

  function animateInstalacionesCSS() {
    var els = document.querySelectorAll('#hero .hero-animate');
    if (!els.length) return;
    requestAnimationFrame(function () {
      window.setTimeout(function () {
        els.forEach(function (el) {
          el.classList.add('is-visible');
        });
        finishEnter();
      }, 80);
    });
  }

  function animateInstalaciones() {
    var els = document.querySelectorAll('#hero .hero-animate');
    if (!els.length) return;

    els.forEach(function (el) {
      el.classList.remove('is-visible');
    });
    gsap.set(els, { y: 40, opacity: 0 });

    gsap.to(els, {
      y: 0,
      opacity: 1,
      duration: 0.95,
      stagger: 0.13,
      ease: 'power4.out',
      onComplete: function () {
        els.forEach(function (el) {
          el.classList.add('is-visible');
        });
        finishEnter();
      }
    });
  }

  function animateEquipo(nav) {
    if (!document.querySelector('.eq-hero')) return;

    var els = document.querySelectorAll('.eq-hero__eyebrow, .eq-hero h1, .eq-hero p');
    gsap.set(els, { y: nav ? 36 : 18, opacity: 0 });

    gsap.to(els, {
      y: 0,
      opacity: 1,
      duration: nav ? 0.9 : 0.55,
      stagger: nav ? 0.12 : 0.08,
      ease: 'power4.out',
      onComplete: finishEnter
    });
  }

  function run(event) {
    if (ran || prefersReduced() || typeof gsap === 'undefined') return;

    var mode = (event && event.detail && event.detail.mode) || 'normal';
    var nav = mode === 'nav';
    var wow = mode === 'loader';

    ran = true;

    if (isIndex()) {
      if (wow) finishEnter();
      else if (nav) animateIndexNav();
      else animateIndexLight();
      return;
    }

    if (pathIncludes('instalaciones')) {
      if (nav || wow) animateInstalaciones();
      else animateInstalacionesCSS();
      return;
    }

    if (pathIncludes('nosotros')) animateHeroPair('.nosotros-hero h1', '.nosotros-hero p', nav);
    else if (pathIncludes('servicios')) animateHeroPair('.servicios-hero h1', '.servicios-hero p', nav);
    else if (pathIncludes('contacto')) animateContacto(nav);
    else if (pathIncludes('blog.html')) animateHeroPair('.blog-hero h1', '.blog-hero p', nav);
    else if (pathIncludes('equipo')) animateEquipo(nav);
    else finishEnter();
  }

  window.addEventListener('pt:ready', run, { once: true });
})();
