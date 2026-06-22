(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ASSET_BASE = location.pathname.indexOf('/blogpaginas/') !== -1 ? '../' : '';
  var LOGO_DARK = ASSET_BASE + 'images/logo.webp';
  var LOGO_WHITE = ASSET_BASE + 'images/hitachilogowhite.png';
  var MIN_LOADER_MS = 1400;
  var EXIT_MS = 340;
  var CONTENT_ENTER_MS = 420;
  var navigating = false;
  var userScrolled = false;
  var curtain;
  var progressBar;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function resetScroll() {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (error) {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function stabilizeScroll() {
    resetScroll();
    if (window.ScrollTrigger) {
      if (typeof ScrollTrigger.clearScrollMemory === 'function') {
        ScrollTrigger.clearScrollMemory();
      }
      ScrollTrigger.refresh();
      resetScroll();
    }
  }

  function watchUserScroll() {
    userScrolled = false;
    function mark() {
      userScrolled = true;
    }
    window.addEventListener('wheel', mark, { once: true, passive: true });
    window.addEventListener('touchmove', mark, { once: true, passive: true });
    window.addEventListener('keydown', function (event) {
      if ([32, 33, 34, 35, 36, 38, 40].indexOf(event.keyCode) !== -1) {
        mark();
      }
    }, { once: true });
  }

  function guardScrollPosition() {
    watchUserScroll();
    [450, 900, 1400, 2200].forEach(function (delay) {
      window.setTimeout(function () {
        if (!userScrolled && window.scrollY > 60) {
          stabilizeScroll();
        }
      }, delay);
    });
  }

  function closeMobileMenu() {
    var sitenav = document.getElementById('sitenav');
    var navhide = document.querySelector('.navhide');
    var navshow = document.querySelector('.navshow');
    if (sitenav) sitenav.style.display = 'none';
    if (navhide) navhide.style.display = 'none';
    if (navshow) navshow.style.display = '';
    document.body.classList.remove('disablescroll');
  }

  function isIndexPage() {
    var path = location.pathname;
    return path === '/' || /\/index\.html?$/i.test(path) || path.endsWith('/');
  }

  function isInternalNavigation(link) {
    if (!link || link.hasAttribute('download')) return false;
    if (link.target && link.target !== '_self') return false;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return false;
    if (/^(mailto|tel|sms):/i.test(href)) return false;

    try {
      var url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return false;
      if (url.pathname === location.pathname && url.search === location.search) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function resolveUrl(src, base) {
    try {
      return new URL(src, base).href;
    } catch (error) {
      return null;
    }
  }

  function uniqueUrls(urls) {
    var seen = {};
    return urls.filter(function (url) {
      if (!url || seen[url]) return false;
      seen[url] = true;
      return true;
    });
  }

  function getCurrentPageImageUrls() {
    var urls = [];
    var imgs = document.querySelectorAll('img[src]');

    imgs.forEach(function (img, index) {
      var lazy = img.getAttribute('loading') === 'lazy';
      if (!lazy || index < 10) {
        var resolved = resolveUrl(img.currentSrc || img.src, location.href);
        if (resolved) urls.push(resolved);
      }
    });

    document.querySelectorAll('link[rel="preload"][as="image"]').forEach(function (link) {
      var resolved = resolveUrl(link.getAttribute('href'), location.href);
      if (resolved) urls.push(resolved);
    });

    return uniqueUrls(urls);
  }

  function preloadImages(urls, maxWait) {
    return new Promise(function (resolve) {
      if (!urls.length) {
        resolve();
        return;
      }

      var finished = false;
      var remaining = urls.length;

      function done() {
        if (finished) return;
        finished = true;
        resolve();
      }

      var timer = window.setTimeout(done, maxWait || 4500);

      urls.forEach(function (url) {
        var image = new Image();
        var finalize = function () {
          remaining -= 1;
          if (remaining <= 0) {
            window.clearTimeout(timer);
            done();
          }
        };
        image.onload = finalize;
        image.onerror = finalize;
        image.src = url;
      });
    });
  }

  function setProgress(value) {
    if (!progressBar) return;
    progressBar.classList.remove('is-indeterminate');
    progressBar.style.width = Math.min(100, Math.max(0, value)) + '%';
  }

  function preloadWithProgress(urls, maxWait) {
    if (!progressBar) return preloadImages(urls, maxWait);

    return new Promise(function (resolve) {
      if (!urls.length) {
        setProgress(100);
        resolve();
        return;
      }

      var finished = false;
      var remaining = urls.length;
      var loaded = 0;

      function done() {
        if (finished) return;
        finished = true;
        setProgress(100);
        resolve();
      }

      var timer = window.setTimeout(done, maxWait || 5000);

      urls.forEach(function (url) {
        var image = new Image();
        var finalize = function () {
          loaded += 1;
          remaining -= 1;
          setProgress(Math.round((loaded / urls.length) * 92) + 4);
          if (remaining <= 0) {
            window.clearTimeout(timer);
            done();
          }
        };
        image.onload = finalize;
        image.onerror = finalize;
        image.src = url;
      });
    });
  }

  function curtainMarkup() {
    return (
      '<div class="pt-curtain__overlay"></div>' +
      '<div class="pt-curtain__brand">' +
      '<div class="pt-curtain__logo-anchor">' +
      '<div class="pt-curtain__ring" aria-hidden="true"></div>' +
      '<img class="pt-curtain__logo pt-curtain__logo--dark" src="' + LOGO_DARK + '" alt="" width="88" height="88">' +
      '<img class="pt-curtain__logo pt-curtain__logo--white" src="' + LOGO_WHITE + '" alt="" width="100" height="100">' +
      '</div>' +
      '<p class="pt-curtain__title">Clínica Dental<br><strong>Hitachi</strong></p>' +
      '<div class="pt-curtain__progress"><span class="pt-curtain__progress-bar is-indeterminate"></span></div>' +
      '</div>'
    );
  }

  function getRevealOrigin(logoEl) {
    var rect = logoEl.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      radius: Math.max(rect.width, rect.height) / 2
    };
  }

  function applyMaskOrigin(overlay, origin) {
    overlay.style.setProperty('--pt-cx', origin.x + 'px');
    overlay.style.setProperty('--pt-cy', origin.y + 'px');
  }

  function freezeLoaderLogo(el) {
    el.querySelectorAll('.pt-curtain__logo').forEach(function (img) {
      img.style.animation = 'none';
    });
  }

  function finishLoaderExit(el) {
    el.classList.remove('is-active', 'is-revealing-circle', 'is-loading', 'is-logo-only');
    document.documentElement.classList.remove('pt-revealing');
    navigating = false;
    return playContentEnter('loader');
  }

  function runLoaderExitTimeline() {
    var el = ensureCurtain();
    var overlay = el.querySelector('.pt-curtain__overlay');
    var progress = el.querySelector('.pt-curtain__progress');
    var title = el.querySelector('.pt-curtain__title');
    var logo = el.querySelector('.pt-curtain__logo--dark') || el.querySelector('.pt-curtain__logo');
    var logoAnchor = el.querySelector('.pt-curtain__logo-anchor');
    var ring = el.querySelector('.pt-curtain__ring');

    if (!overlay || !logo) {
      document.documentElement.classList.remove('pt-loading', 'pt-revealing');
      el.classList.remove('is-active', 'is-loading');
      navigating = false;
      return playContentEnter('loader');
    }

    freezeLoaderLogo(el);
    setProgress(100);

    var handoffDur = 0.3;
    var revealDur = 0.75;
    var revealAt = handoffDur;

    if (typeof gsap === 'undefined') {
      el.classList.add('is-logo-only');
      el.classList.remove('is-loading');
      document.documentElement.classList.remove('pt-loading');
      document.documentElement.classList.add('pt-revealing');
      return wait(700).then(function () {
        return finishLoaderExit(el);
      });
    }

    var chrome = [progress, title].filter(Boolean);
    var endRadius = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight));
    var hole = { r: 0 };

    return new Promise(function (resolve) {
      var tl = gsap.timeline({
        onComplete: function () {
          finishLoaderExit(el).then(resolve);
        }
      });

      tl.to(chrome, {
        opacity: 0,
        duration: handoffDur,
        ease: 'power2.inOut'
      }, 0);

      if (logoAnchor) {
        tl.to(logoAnchor, {
          opacity: 0,
          scale: 0.88,
          duration: 0.12,
          ease: 'power2.in'
        }, revealAt - 0.12);
      }

      tl.add(function () {
          el.classList.add('is-logo-only');
          el.classList.remove('is-loading');
          el.classList.add('is-revealing-circle');

          var origin = getRevealOrigin(logo);
          applyMaskOrigin(overlay, origin);

          hole.r = Math.max(Math.round(origin.radius * 0.5), 4);
          overlay.style.setProperty('--pt-hole', hole.r + 'px');

          if (logoAnchor) {
            gsap.set(logoAnchor, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
          }

          document.documentElement.classList.remove('pt-loading');
          document.documentElement.classList.add('pt-revealing');

          if (ring) {
            gsap.set(ring, { scale: 1, opacity: 0.48, transformOrigin: '50% 50%' });
          }
        }, revealAt)
        .to(hole, {
          r: endRadius,
          duration: revealDur,
          ease: 'power2.inOut',
          onUpdate: function () {
            overlay.style.setProperty('--pt-hole', Math.round(hole.r) + 'px');
          }
        }, revealAt);

      if (ring) {
        tl.to(ring, {
          scale: function () {
            return (endRadius / getRevealOrigin(logo).radius) * 1.02;
          },
          opacity: 0,
          duration: revealDur,
          ease: 'power2.out',
          transformOrigin: '50% 50%'
        }, revealAt);
      }
    });
  }

  function ensureCurtain() {
    if (curtain) return curtain;

    curtain = document.getElementById('pt-curtain');
    if (curtain) {
      progressBar = curtain.querySelector('.pt-curtain__progress-bar');
      return curtain;
    }

    curtain = document.createElement('div');
    curtain.id = 'pt-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML = curtainMarkup();
    document.documentElement.appendChild(curtain);
    progressBar = curtain.querySelector('.pt-curtain__progress-bar');
    return curtain;
  }

  function onPageReady(mode) {
    stabilizeScroll();
    guardScrollPosition();
    window.dispatchEvent(new CustomEvent('pt:ready', { detail: { mode: mode || 'normal' } }));
  }

  function playContentEnter(mode) {
    document.documentElement.classList.remove('pt-exiting', 'pt-loading', 'pt-skeleton');
    resetScroll();

    if (mode === 'loader') {
      onPageReady('loader');
      return Promise.resolve();
    }

    if (mode === 'nav') {
      document.documentElement.classList.add('pt-gsap-enter');
      onPageReady('nav');
      return Promise.resolve();
    }

    document.documentElement.classList.add('pt-content-enter');
    return wait(CONTENT_ENTER_MS).then(function () {
      document.documentElement.classList.remove('pt-content-enter');
      onPageReady('normal');
    });
  }

  function handleFirstLoad() {
    ensureCurtain();
    if (!curtain.classList.contains('is-loading')) {
      curtain.classList.add('is-active', 'is-loading');
      document.documentElement.classList.add('pt-loading');
    }

    Promise.all([
      preloadWithProgress(getCurrentPageImageUrls(), 5000),
      wait(MIN_LOADER_MS)
    ]).then(function () {
      sessionStorage.setItem('pt-visited', '1');
      return runLoaderExitTimeline();
    });
  }

  function handleNavEnter() {
    sessionStorage.removeItem('pt-nav');
    resetScroll();
    playContentEnter('nav');
  }

  function handlePageEnter() {
    if (REDUCED) {
      document.documentElement.classList.remove('pt-loading', 'pt-skeleton', 'pt-exiting');
      return;
    }

    var cameFromNav = sessionStorage.getItem('pt-nav') === '1';
    var isFirstIndexVisit = isIndexPage() && !sessionStorage.getItem('pt-visited');

    if (isFirstIndexVisit) {
      handleFirstLoad();
      return;
    }

    if (cameFromNav) {
      handleNavEnter();
      return;
    }

    document.documentElement.classList.remove('pt-loading', 'pt-skeleton', 'pt-exiting');
    onPageReady('normal');
  }

  function prefetchTargetImages(url) {
    fetch(url, { credentials: 'same-origin' })
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var urls = [];
        doc.querySelectorAll('img[src]').forEach(function (img, index) {
          if (index > 14) return;
          var resolved = resolveUrl(img.getAttribute('src'), url);
          if (resolved) urls.push(resolved);
        });
        uniqueUrls(urls).forEach(function (src) {
          var image = new Image();
          image.src = src;
        });
      })
      .catch(function () {});
  }

  function playLightExit(url) {
    prefetchTargetImages(url);
    closeMobileMenu();
    resetScroll();
    document.documentElement.classList.add('pt-exiting');
    return wait(EXIT_MS).then(function () {
      sessionStorage.setItem('pt-nav', '1');
      location.href = url;
    });
  }

  function navigateTo(url) {
    if (navigating) return;
    if (REDUCED) {
      location.href = url;
      return;
    }
    navigating = true;
    playLightExit(url).catch(function () {
      navigating = false;
      document.documentElement.classList.remove('pt-exiting');
    });
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var link = event.target.closest('a[href]');
    if (!isInternalNavigation(link)) return;
    if (REDUCED) return;

    event.preventDefault();
    event.stopPropagation();
    navigateTo(link.href);
  }, true);

  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;
    navigating = false;
    if (curtain) {
      curtain.classList.remove('is-active', 'is-covering', 'is-revealing-circle', 'is-loading', 'is-logo-only');
    }
    document.documentElement.classList.remove('pt-loading', 'pt-exiting', 'pt-content-enter', 'pt-scroll-lock', 'pt-skeleton', 'pt-revealing');
    handlePageEnter();
  });

  window.addEventListener('load', function () {
    if (!document.documentElement.classList.contains('pt-loading')) {
      stabilizeScroll();
    }
  });

  resetScroll();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handlePageEnter);
  } else {
    handlePageEnter();
  }
})();
