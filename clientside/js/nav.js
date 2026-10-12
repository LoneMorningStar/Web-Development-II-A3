function svg(paths, size) {
  return '<svg class="icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
}

window.ICO = {
  flower: function (s) {
    s = s || 24;
    return svg(
      '<path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3 3 3 0 0 1 3-3m-3 3h1m-6 3a3 3 0 1 0 3-3m-3 3h1m6 0a3 3 0 1 1-3-3m3 3v-1"/><circle cx="12" cy="8" r="2"/><path d="M12 10v12"/><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"/><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"/>',
      s
    );
  },
  arrowRight: function (s) { s = s || 16; return svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', s); },
  arrowLeft: function (s) { s = s || 16; return svg('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>', s); },
  calendar: function (s) { s = s || 14; return svg('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>', s); },
  mapPin: function (s) { s = s || 14; return svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', s); },
  ticket: function (s) { s = s || 16; return svg('<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>', s); },
  target: function (s) { s = s || 16; return svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', s); },
  search: function (s) { s = s || 16; return svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', s); },
  x: function (s) { s = s || 16; return svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', s); },
  chevronDown: function (s) { s = s || 16; return svg('<path d="m6 9 6 6 6-6"/>', s); },
  plus: function (s) { s = s || 16; return svg('<path d="M12 5v14"/><path d="M5 12h14"/>', s); },
  edit: function (s) { s = s || 16; return svg('<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>', s); },
  trash: function (s) { s = s || 16; return svg('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', s); },
  user: function (s) { s = s || 16; return svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', s); },
  check: function (s) { s = s || 16; return svg('<path d="M20 6 9 17l-5-5"/>', s); }
};

/* ---------- Escape helper ---------- */
window.esc = function (s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/* ---------- Navbar entrance + scroll state + overlay menu ---------- */
(function () {
  var nav = document.querySelector('.site-nav');
  var burger = document.getElementById('burger');
  var overlay = document.getElementById('overlay');
  var pill = document.getElementById('nav-toggle');

  var flower = document.getElementById('nav-flower');
  if (flower) flower.innerHTML = window.ICO.flower(28);

  setTimeout(function () {
    document.documentElement.classList.add('mounted');
  }, 100);

  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (overlay) overlay.classList.toggle('is-open', open);
    if (burger) {
      burger.classList.toggle('is-active', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    if (pill) pill.textContent = open ? 'Close' : 'Navigate';
    document.body.classList.toggle('menu-open', open);
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(!overlay.classList.contains('is-open'));
    });
  }
  if (pill) {
    pill.addEventListener('click', function () {
      setMenu(!overlay.classList.contains('is-open'));
    });
  }
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (overlay && overlay.classList.contains('is-open') && window.innerWidth >= 768) setMenu(false);
  });
})();
