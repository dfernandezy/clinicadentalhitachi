/**
 * Cookie Consent Banner – Clínica Dental Hitachi
 * Cumple: RGPD, LSSI-CE art. 22.2, guías AEPD 2023, Google Consent Mode v2
 * Accesibilidad: WCAG 2.1 AA (ARIA, teclado, foco)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'hitachi_cookie_consent';
  var consent = null;

  /* ── 1. Google Consent Mode v2: estado por defecto DENEGADO ── */
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  gtag('consent', 'default', {
    analytics_storage:    'denied',
    ad_storage:           'denied',
    ad_user_data:         'denied',
    ad_personalization:   'denied',
    functionality_storage: 'granted',
    security_storage:     'granted',
    wait_for_update: 500
  });

  /* ── 2. Leer consentimiento almacenado ── */
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) consent = JSON.parse(stored);
  } catch (e) {}

  if (consent) {
    applyConsent(consent);
    return; // Banner ya respondido → no mostrar
  }

  /* ── 3. Inyectar estilos ── */
  var style = document.createElement('style');
  style.textContent = [
    /* ── Banner: barra mínima en el fondo ── */
    '#ck-banner{',
      'position:fixed;bottom:0;left:0;right:0;z-index:99999;',
      'background:rgba(255,255,255,.97);backdrop-filter:blur(6px);',
      'border-top:1px solid #e8e8e8;',
      'box-shadow:0 -2px 12px rgba(0,0,0,.07);',
      'font-family:\'Poppins\',sans-serif;font-size:.78rem;color:#555;',
      'padding:10px 20px;',
      'display:flex;align-items:center;gap:12px;flex-wrap:nowrap;',
      'animation:ckSlideUp .3s ease;',
    '}',
    '@keyframes ckSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}',
    '#ck-banner p{margin:0;flex:1 1 0;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '#ck-banner a{color:#cc0000;text-decoration:none;border-bottom:1px dotted #cc0000;}',
    '#ck-banner a:hover{color:#990000;}',
    '#ck-actions{display:flex;gap:8px;align-items:center;flex-shrink:0;}',
    /* Botones compactos */
    '.ck-btn{',
      'padding:6px 14px;border-radius:50px;font-family:\'Poppins\',sans-serif;',
      'font-size:.75rem;font-weight:600;cursor:pointer;',
      'border:1.5px solid #cc0000;transition:all .18s ease;white-space:nowrap;line-height:1;',
    '}',
    '.ck-btn:focus-visible{outline:2px solid #0066cc;outline-offset:2px;}',
    '#ck-accept{background:#cc0000;color:#fff;}',
    '#ck-accept:hover{background:#990000;border-color:#990000;}',
    '#ck-reject{background:#fff;color:#cc0000;}',
    '#ck-reject:hover{background:#fff5f5;}',
    '#ck-manage{background:transparent;color:#999;border-color:transparent;font-size:.7rem;padding:6px 8px;}',
    '#ck-manage:hover{color:#333;border-color:#ccc;}',
    /* Panel de configuración */
    '#ck-panel{',
      'position:fixed;bottom:0;left:0;right:0;z-index:100000;',
      'background:#fff;border-top:2px solid #cc0000;',
      'box-shadow:0 -4px 24px rgba(0,0,0,.14);',
      'font-family:\'Poppins\',sans-serif;padding:20px 24px 18px;',
      'max-height:75vh;overflow-y:auto;display:none;',
    '}',
    '#ck-panel h2{font-size:1rem;margin:0 0 6px;color:#111;}',
    '#ck-panel > p{font-size:.78rem;color:#666;margin:0 0 14px;line-height:1.45;}',
    '#ck-panel a{color:#cc0000;}',
    '.ck-row{display:flex;justify-content:space-between;align-items:center;',
      'padding:10px 0;border-bottom:1px solid #f2f2f2;gap:12px;}',
    '.ck-row:last-of-type{border-bottom:none;}',
    '.ck-row-text strong{display:block;font-size:.82rem;color:#222;margin-bottom:2px;}',
    '.ck-row-text span{font-size:.74rem;color:#777;line-height:1.35;}',
    /* Toggle */
    '.ck-toggle{position:relative;width:38px;height:20px;flex-shrink:0;}',
    '.ck-toggle input{opacity:0;width:0;height:0;position:absolute;}',
    '.ck-slider{position:absolute;inset:0;background:#ddd;border-radius:20px;cursor:pointer;transition:.22s;}',
    '.ck-slider:before{content:"";position:absolute;width:14px;height:14px;',
      'border-radius:50%;background:#fff;left:3px;top:3px;transition:.22s;',
      'box-shadow:0 1px 3px rgba(0,0,0,.2);}',
    '.ck-toggle input:checked + .ck-slider{background:#cc0000;}',
    '.ck-toggle input:checked + .ck-slider:before{transform:translateX(18px);}',
    '.ck-toggle input:disabled + .ck-slider{opacity:.45;cursor:not-allowed;}',
    '.ck-toggle input:focus-visible + .ck-slider{outline:2px solid #0066cc;outline-offset:2px;}',
    '#ck-panel-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;}',
    '#ck-save{background:#cc0000;color:#fff;border-color:#cc0000;}',
    '#ck-save:hover{background:#990000;border-color:#990000;}',
    '#ck-cancel{background:#fff;color:#666;border-color:#ddd;}',
    '#ck-cancel:hover{border-color:#aaa;}',
    /* ── Responsive ── */
    '@media(max-width:640px){',
      '#ck-banner{flex-wrap:wrap;padding:10px 14px 12px;gap:8px;}',
      '#ck-banner p{white-space:normal;font-size:.74rem;flex-basis:100%;}',
      '#ck-actions{width:100%;justify-content:stretch;gap:6px;}',
      '#ck-accept,#ck-reject{flex:1;text-align:center;}',
      '#ck-manage{margin-left:auto;flex:0 0 auto;}',
      '#ck-panel{padding:16px 14px 14px;}',
    '}'
  ].join('');
  document.head.appendChild(style);

  /* Ruta a la política de cookies (funciona desde raíz y desde blogpaginas/) */
  var cookiesUrl = (window.location.pathname.indexOf('/blogpaginas/') !== -1)
    ? '../cookies.html' : 'cookies.html';

  /* ── 4. Crear banner HTML ── */
  var banner = document.createElement('div');
  banner.id = 'ck-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'true');
  banner.setAttribute('aria-label', 'Aviso de cookies');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = [
    '<p>',
      'Usamos cookies propias y de terceros para analizar el tráfico. ',
      '<a href="' + cookiesUrl + '">Más info</a>',
    '</p>',
    '<div id="ck-actions">',
      '<button class="ck-btn" id="ck-accept">Aceptar</button>',
      '<button class="ck-btn" id="ck-reject">Rechazar</button>',
      '<button class="ck-btn" id="ck-manage">⚙ Configurar</button>',
    '</div>'
  ].join('');

  /* ── 5. Crear panel de configuración ── */
  var panel = document.createElement('div');
  panel.id = 'ck-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Configurar cookies');
  panel.innerHTML = [
    '<h2>Configuración de cookies</h2>',
    '<p>Selecciona qué tipos de cookies deseas permitir. Puedes cambiar tu elección en cualquier momento desde la <a href="' + cookiesUrl + '">Política de cookies</a>.</p>',

    '<div class="ck-row">',
      '<div class="ck-row-text">',
        '<strong>Cookies esenciales</strong>',
        '<span>Necesarias para el funcionamiento básico del sitio. No se pueden desactivar.</span>',
      '</div>',
      '<label class="ck-toggle" aria-label="Cookies esenciales, siempre activas">',
        '<input type="checkbox" id="ck-essential" checked disabled>',
        '<span class="ck-slider"></span>',
      '</label>',
    '</div>',

    '<div class="ck-row">',
      '<div class="ck-row-text">',
        '<strong>Cookies analíticas</strong>',
        '<span>Google Analytics (GA4): nos ayudan a entender cómo se usa el sitio de forma anónima.</span>',
      '</div>',
      '<label class="ck-toggle" aria-label="Cookies analíticas">',
        '<input type="checkbox" id="ck-analytics">',
        '<span class="ck-slider"></span>',
      '</label>',
    '</div>',

    '<div class="ck-row">',
      '<div class="ck-row-text">',
        '<strong>Cookies de publicidad</strong>',
        '<span>Google Ads: permiten medir la eficacia de los anuncios y personalizar contenidos.</span>',
      '</div>',
      '<label class="ck-toggle" aria-label="Cookies de publicidad">',
        '<input type="checkbox" id="ck-ads">',
        '<span class="ck-slider"></span>',
      '</label>',
    '</div>',

    '<div id="ck-panel-actions">',
      '<button class="ck-btn" id="ck-save">Guardar preferencias</button>',
      '<button class="ck-btn" id="ck-cancel">Cancelar</button>',
    '</div>'
  ].join('');

  /* ── 6. Insertar en DOM cuando esté listo ── */
  function insertBanner() {
    document.body.appendChild(banner);
    document.body.appendChild(panel);
    bindEvents();
    // Empujar el contenido para que el banner no tape el footer
    function adjustPadding() {
      document.body.style.paddingBottom = banner.offsetHeight + 'px';
    }
    adjustPadding();
    window.addEventListener('resize', adjustPadding);
    // Mover foco al primer botón (accesibilidad)
    setTimeout(function () {
      var first = banner.querySelector('button');
      if (first) first.focus();
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertBanner);
  } else {
    insertBanner();
  }

  /* ── 7. Eventos ── */
  function bindEvents() {
    document.getElementById('ck-accept').addEventListener('click', function () {
      save({ analytics: true, ads: true });
    });
    document.getElementById('ck-reject').addEventListener('click', function () {
      save({ analytics: false, ads: false });
    });
    document.getElementById('ck-manage').addEventListener('click', function () {
      openPanel();
    });
    document.getElementById('ck-save').addEventListener('click', function () {
      save({
        analytics: document.getElementById('ck-analytics').checked,
        ads:       document.getElementById('ck-ads').checked
      });
    });
    document.getElementById('ck-cancel').addEventListener('click', function () {
      closePanel();
    });

    // Cerrar panel con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (panel.style.display === 'block') closePanel();
      }
    });
  }

  function openPanel() {
    banner.style.display = 'none';
    panel.style.display = 'block';
    setTimeout(function () {
      var first = panel.querySelector('button:not(:disabled)');
      if (first) first.focus();
    }, 50);
  }

  function closePanel() {
    panel.style.display = 'none';
    banner.style.display = 'flex';
    setTimeout(function () {
      var first = banner.querySelector('button');
      if (first) first.focus();
    }, 50);
  }

  /* ── 8. Guardar y aplicar ── */
  function save(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {}
    applyConsent(prefs);
    // Restaurar el padding del body
    document.body.style.paddingBottom = '';
    window.removeEventListener('resize', function(){});
    // Ocultar banner y panel
    if (banner.parentNode) banner.parentNode.removeChild(banner);
    if (panel.parentNode) panel.parentNode.removeChild(panel);
    // Recargar si se aceptaron cookies para que GA se inicialice
    if (prefs.analytics || prefs.ads) {
      window.location.reload();
    }
  }

  function applyConsent(prefs) {
    gtag('consent', 'update', {
      analytics_storage:   prefs.analytics ? 'granted' : 'denied',
      ad_storage:          prefs.ads       ? 'granted' : 'denied',
      ad_user_data:        prefs.ads       ? 'granted' : 'denied',
      ad_personalization:  prefs.ads       ? 'granted' : 'denied'
    });
  }

})();
