(function () {
  var CLIENT_ID = 'e474db81-3ade-4f2a-bc7a-25f2275343a2';
  var API = 'https://www.wixapis.com';
  var grid = document.getElementById('projects-grid');
  if (!grid || !window.fetch) return;
  var PF = "'CoFo Peshka', 'CoFo Peshka Variable', 'Heebo', sans-serif";

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mediaId(v) {
    if (!v) return '';
    if (typeof v === 'object') v = v.src || v.url || '';
    v = String(v);
    var m = /^wix:image:\/\/v1\/([^\/#?]+)/.exec(v);
    if (m) return m[1];
    m = /static\.wixstatic\.com\/media\/([^\/?#]+)/.exec(v);
    if (m) return m[1];
    return /^https:\/\//.test(v) ? v : '';
  }
  function url(id, w, h) {
    if (!id) return '';
    if (/^https:\/\//.test(id)) return id;
    if (/\.gif$/i.test(id)) return 'https://static.wixstatic.com/media/' + id;
    var fit = h ? 'fill/w_' + w + ',h_' + h + ',al_c' : 'fit/w_' + w + ',h_' + w;
    return 'https://static.wixstatic.com/media/' + id + '/v1/' + fit + ',q_85,enc_avif,quality_auto/' + id;
  }
  function imgUrl(v, w, h) { return url(mediaId(v), w, h); }
  function safeUrl(u) {
    u = String(u || '');
    return /^(https?:\/\/|mailto:|#)/.test(u) ? u : '';
  }
  function focus(f) {
    f = String(f || '').trim();
    return /^\d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/.test(f) ? '; object-position: ' + f : '';
  }
  function badge(p) {
    return p.badge ? '<p style="margin: 4px 0 0; align-self: flex-start; font-size: 14px; font-weight: 700; color: #FBF9F5; border: 1px solid #FBF9F5; padding: 6px 12px; border-radius: 2px">' + esc(p.badge) + '</p>' : '';
  }
  function link(p) {
    var u = safeUrl(p.linkUrl);
    return u && p.linkText ? '<a href="' + esc(u) + '" style="color: #FBF9F5; font-weight: 600; font-size: 16px">' + esc(p.linkText) + '</a>' : '';
  }
  var TL = 'color: inherit; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 7px; text-decoration-color: rgba(251,249,245,0.35)';
  function titleLink(p, i) {
    return '<a href="#project-' + (i + 1) + '" data-open="' + i + '" style="' + TL + '">' + esc(p.title) + '</a>';
  }
  function imgLink(p, i, html) {
    return '<a href="#project-' + (i + 1) + '" data-open="' + i + '" aria-hidden="true" tabindex="-1" style="display: contents">' + html + '</a>';
  }
  function featured(p, i) {
    var src = imgUrl(p.image, 1600, 1000);
    return '<article style="flex: 1 1 100%; min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 24px 40px; padding-bottom: 48px; border-bottom: 1px solid #3A352E">' +
      (src ? imgLink(p, i, '<img src="' + esc(src) + '" alt="' + esc(p.imageAlt || p.title) + '" loading="lazy" style="display: block; flex: 3 1 520px; min-width: 0; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; cursor: pointer' + focus(p.imageFocus) + '">') : '') +
      '<div style="flex: 2 1 340px; min-width: 0; display: flex; flex-direction: column; gap: 14px">' +
      (p.label ? '<p style="margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; color: #D9D1C2">' + esc(p.label) + '</p>' : '') +
      '<h3 style="margin: 0; font-family: ' + PF + '; font-size: 34px; line-height: 1.15; font-weight: 800">' + titleLink(p, i) + '</h3>' +
      (p.description ? '<p style="margin: 0; color: #D9D1C2; font-size: 17px">' + esc(p.description) + '</p>' : '') +
      badge(p) + link(p) + '</div></article>';
  }
  function card(p, i) {
    var src = imgUrl(p.image, 1600, 1000);
    return '<article style="flex: 1 1 460px; min-width: 0; display: flex; flex-direction: column; gap: 12px">' +
      (src ? imgLink(p, i, '<img src="' + esc(src) + '" alt="' + esc(p.imageAlt || p.title) + '" loading="lazy" style="display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; cursor: pointer' + focus(p.imageFocus) + '">') : '') +
      (p.label ? '<p style="margin: 6px 0 0; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; color: #D9D1C2">' + esc(p.label) + '</p>' : '') +
      '<h3 style="margin: 0; font-size: 22px; font-weight: 700">' + titleLink(p, i) + '</h3>' +
      (p.description ? '<p style="margin: 0; color: #D9D1C2; font-size: 16px">' + esc(p.description) + '</p>' : '') +
      badge(p) + link(p) + '</article>';
  }

  /* ---------- project panel ---------- */
  var items = [];
  var panel = null;
  var gal = [];
  var cur = 0;
  function images(p) {
    var out = [];
    var seen = {};
    function add(v, alt) {
      var id = mediaId(v);
      if (!id || seen[id]) return;
      seen[id] = 1;
      var raw = typeof v === 'object' ? (v.src || v.url || '') : String(v);
      var w = /originWidth=(\d+)/.exec(raw);
      var h = /originHeight=(\d+)/.exec(raw);
      var ratio = w && h ? parseInt(w[1], 10) / parseInt(h[1], 10) : 1.5;
      if (typeof v === 'object' && v.settings && v.settings.width && v.settings.height) ratio = v.settings.width / v.settings.height;
      if (!(ratio > 0.3 && ratio < 4)) ratio = 1.5;
      out.push({ id: id, alt: alt || p.title, ratio: ratio });
    }
    add(p.image, p.imageAlt);
    (Array.isArray(p.gallery) ? p.gallery : []).forEach(function (g) {
      if (g && (!g.type || g.type === 'image')) add(g, g.title || g.description);
    });
    return out;
  }
  var slides = [];
  function panelHtml(p) {
    gal = images(p);
    var frames = (Array.isArray(p.animation) ? p.animation : []).map(function (g) {
      return { id: mediaId(g), alt: (g && (g.title || g.description)) || p.title };
    }).filter(function (f) { return f.id; });
    slides = gal.map(function (im, k) { return { alt: im.alt, id: im.id, g: k }; });
    if (frames.length > 1) slides.splice(Math.min(1, slides.length), 0, { alt: p.animationTitle || 'תכנון ראשוני, שלב אחרי שלב', frames: frames });
    var text = p.story || p.description || '';
    var u = safeUrl(p.linkUrl);
    return '<div style="position: sticky; top: 0; z-index: 2; background: #1C1A17; border-bottom: 1px solid #3A352E">' +
      '<div style="max-width: 1200px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px">' +
      '<span style="font-size: 14px; font-weight: 700; letter-spacing: 0.1em; color: #D9D1C2">מהסטודיו</span>' +
      '<button type="button" data-close style="background: none; border: 1px solid #FBF9F5; color: #FBF9F5; padding: 8px 16px; border-radius: 2px; font: inherit; font-size: 15px; cursor: pointer">חזרה לפרויקטים ×</button>' +
      '</div></div>' +
      '<div style="max-width: 1200px; margin: 0 auto; padding: 48px 24px 96px">' +
      '<div style="display: flex; flex-wrap: wrap; gap: 16px 48px; align-items: flex-end; margin-bottom: 32px">' +
      '<div style="flex: 1 1 420px; min-width: 0">' +
      (p.label ? '<p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; color: #D9D1C2">' + esc(p.label) + '</p>' : '') +
      '<h2 id="mm-panel-title" style="margin: 0; font-family: ' + PF + '; font-size: 44px; line-height: 1.15; font-weight: 800">' + esc(p.title) + '</h2>' +
      '</div>' +
      '<div style="flex: 1 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 14px">' +
      (text ? '<p style="margin: 0; color: #D9D1C2; font-size: 18px; white-space: pre-line">' + esc(text) + '</p>' : '') +
      badge(p) +
      (p.credit ? '<p style="margin: 0; font-size: 14px; color: #A39B8E">' + esc(p.credit) + '</p>' : '') +
      (u && p.linkText ? '<a href="' + esc(u) + '" style="color: #FBF9F5; font-weight: 600; font-size: 16px">' + esc(p.linkText) + '</a>' : '') +
      '</div></div>' +
      (slides.length ? '<div data-slider style="position: relative">' +
        '<div data-track style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; scrollbar-width: none; -ms-overflow-style: none; background: #141210">' +
        slides.map(function (sl, k) {
          var box0 = '<div data-slide="' + k + '" style="flex: 0 0 100%; min-width: 0; scroll-snap-align: start; aspect-ratio: 16 / 9; max-height: 68vh; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative">';
          if (sl.frames) {
            return box0 + '<div data-anim role="img" aria-label="' + esc(sl.alt) + '" style="position: relative; width: 100%; height: 100%">' +
              sl.frames.map(function (f, j) {
                return '<img src="' + esc(url(f.id, 1600)) + '" alt="" aria-hidden="true" style="position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: contain; background: transparent; opacity: ' + (j ? 0 : 1) + '; transition: opacity 0.2s linear">';
              }).join('') + '</div></div>';
          }
          return box0 + '<img data-img="' + sl.g + '" src="' + esc(url(sl.id, 2000)) + '" alt="' + esc(sl.alt) + '"' + (k > 1 ? ' loading="lazy"' : '') + ' style="display: block; width: 100%; height: 100%; object-fit: contain; background: transparent; cursor: zoom-in"></div>';
        }).join('') + '</div>' +
        (slides.length > 1 ?
          '<button type="button" data-go="next" aria-label="התמונה הבאה" dir="ltr" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; border-radius: 50%; background: rgba(28,26,23,0.72); border: 1px solid rgba(251,249,245,0.45); color: #FBF9F5; font-size: 26px; line-height: 1; cursor: pointer">‹</button>' +
          '<button type="button" data-go="prev" aria-label="התמונה הקודמת" dir="ltr" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; border-radius: 50%; background: rgba(28,26,23,0.72); border: 1px solid rgba(251,249,245,0.45); color: #FBF9F5; font-size: 26px; line-height: 1; cursor: pointer">›</button>' : '') +
        '</div>' +
        '<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px 24px; margin-top: 14px">' +
        '<p data-caption aria-live="polite" style="margin: 0; color: #D9D1C2; font-size: 15px; flex: 1 1 260px; min-width: 0">' + esc(slides[0].alt) + '</p>' +
        (slides.length > 1 ? '<div style="display: flex; align-items: center; gap: 14px">' +
          '<div style="display: flex; gap: 6px">' + slides.map(function (im, k) {
            return '<button type="button" data-go="' + k + '" aria-label="תמונה ' + (k + 1) + '" style="width: 9px; height: 9px; padding: 0; border-radius: 50%; border: 1px solid #FBF9F5; background: ' + (k ? 'transparent' : '#FBF9F5') + '; cursor: pointer"></button>';
          }).join('') + '</div>' +
          '<span data-count style="font-size: 14px; color: #A39B8E; font-variant-numeric: tabular-nums" dir="ltr">1 / ' + slides.length + '</span></div>' : '') +
        '</div>' : '') +
      '</div>';
  }
  var slideIdx = 0;
  function setSlide(i) {
    slideIdx = i;
    var cap = panel.querySelector('[data-caption]');
    if (cap && slides[i]) cap.textContent = slides[i].alt;
    var cnt = panel.querySelector('[data-count]');
    if (cnt) cnt.textContent = (i + 1) + ' / ' + slides.length;
    var dots = panel.querySelectorAll('button[data-go]:not([data-go="next"]):not([data-go="prev"])');
    for (var d = 0; d < dots.length; d++) {
      dots[d].style.background = d === i ? '#FBF9F5' : 'transparent';
      if (d === i) dots[d].setAttribute('aria-current', 'true'); else dots[d].removeAttribute('aria-current');
    }
  }
  function go(i) {
    if (!slides.length || !panel) return;
    i = (i + slides.length) % slides.length;
    var s = panel.querySelector('[data-slide="' + i + '"]');
    var track = panel.querySelector('[data-track]');
    if (s && track) {
      var tr = track.getBoundingClientRect();
      var sr = s.getBoundingClientRect();
      track.scrollBy({ left: sr.left - tr.left, behavior: 'smooth' });
    }
    setSlide(i);
  }
  var animTimer = null;
  function startAnim() {
    clearInterval(animTimer);
    animTimer = null;
    var anims = panel ? panel.querySelectorAll('[data-anim]') : [];
    if (!anims.length) return;
    try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) { /* ignore */ }
    var step = 0;
    animTimer = setInterval(function () {
      step++;
      for (var a = 0; a < anims.length; a++) {
        var imgs = anims[a].querySelectorAll('img');
        for (var j = 0; j < imgs.length; j++) imgs[j].style.opacity = j === step % imgs.length ? 1 : 0;
      }
    }, 1700);
  }
  function setupSlider() {
    slideIdx = 0;
    startAnim();
    var track = panel.querySelector('[data-track]');
    if (!track) return;
    var timer = null;
    track.addEventListener('scroll', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var tr = track.getBoundingClientRect();
        var mid = tr.left + tr.width / 2;
        var best = slideIdx;
        var bestD = Infinity;
        var sl = track.querySelectorAll('[data-slide]');
        for (var k = 0; k < sl.length; k++) {
          var r = sl[k].getBoundingClientRect();
          var dd = Math.abs(r.left + r.width / 2 - mid);
          if (dd < bestD) { bestD = dd; best = k; }
        }
        if (best !== slideIdx) setSlide(best);
      }, 80);
    });
  }
  var lastFocus = null;
  function openPanel(i, fromHash) {
    var p = items[i];
    if (!p) return;
    if (!panel) {
      panel = document.createElement('div');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', 'mm-panel-title');
      panel.setAttribute('dir', 'rtl');
      panel.style.cssText = "position: fixed; inset: 0; z-index: 40; overflow-y: auto; background: #1C1A17; color: #FBF9F5; font-family: 'CoFo Peshka', 'Assistant', sans-serif; font-size: 18px; line-height: 1.6";
      document.body.appendChild(panel);
      panel.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('[data-close],[data-img],[data-go]') : null;
        if (!t) return;
        if (t.hasAttribute('data-close')) closePanel();
        else if (t.hasAttribute('data-go')) {
          var g = t.getAttribute('data-go');
          go(g === 'next' ? slideIdx + 1 : g === 'prev' ? slideIdx - 1 : parseInt(g, 10));
        }
        else openBox(parseInt(t.getAttribute('data-img'), 10));
      });
    }
    lastFocus = document.activeElement;
    panel.innerHTML = panelHtml(p);
    panel.style.display = 'block';
    setupSlider();
    panel.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    if (!fromHash && location.hash !== '#project-' + (i + 1)) {
      try { history.pushState({ mmProject: i }, '', '#project-' + (i + 1)); } catch (e) { /* ignore */ }
    }
    var b = panel.querySelector('[data-close]');
    if (b) b.focus();
  }
  function hidePanel() {
    if (!panel || panel.style.display === 'none') return;
    if (box) box.style.display = 'none';
    clearInterval(animTimer);
    animTimer = null;
    panel.style.display = 'none';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function closePanel() {
    if (/^#project-\d+$/.test(location.hash) && history.state && history.state.mmProject != null) {
      history.back();
    } else {
      hidePanel();
      if (/^#project-\d+$/.test(location.hash)) {
        try { history.replaceState(null, '', location.pathname + location.search + '#projects'); } catch (e) { /* ignore */ }
      }
    }
  }
  function fromHash() {
    var m = /^#project-(\d+)$/.exec(location.hash);
    if (m && items[parseInt(m[1], 10) - 1]) openPanel(parseInt(m[1], 10) - 1, true);
    else hidePanel();
  }
  window.addEventListener('popstate', fromHash);
  window.addEventListener('hashchange', fromHash);

  /* ---------- full-screen image viewer ---------- */
  var box = null;
  function show(i) {
    if (!gal.length) return;
    cur = (i + gal.length) % gal.length;
    var im = gal[cur];
    box.querySelector('img').src = url(im.id, 2400);
    box.querySelector('img').alt = im.alt;
    box.querySelector('[data-cap]').textContent = (cur + 1) + ' / ' + gal.length;
  }
  function openBox(i) {
    if (!box) {
      box = document.createElement('div');
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'תמונה בגודל מלא');
      box.style.cssText = 'position: fixed; inset: 0; z-index: 50; background: rgba(20,18,16,0.97); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 56px 16px 24px; box-sizing: border-box';
      box.innerHTML = '<button type="button" data-x aria-label="סגירה" style="position: absolute; top: 12px; left: 16px; background: none; border: 0; color: #FBF9F5; font-size: 32px; cursor: pointer; line-height: 1">×</button>' +
        '<img alt="" style="max-width: 100%; max-height: calc(100vh - 120px); object-fit: contain; display: block">' +
        '<p data-cap style="margin: 12px 0 0; color: #D9D1C2; font-size: 14px; text-align: center"></p>' +
        '<button type="button" data-n aria-label="התמונה הבאה" dir="ltr" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); background: rgba(28,26,23,0.75); border: 1px solid rgba(251,249,245,0.4); color: #FBF9F5; font-size: 28px; width: 44px; height: 44px; cursor: pointer">‹</button>' +
        '<button type="button" data-p aria-label="התמונה הקודמת" dir="ltr" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: rgba(28,26,23,0.75); border: 1px solid rgba(251,249,245,0.4); color: #FBF9F5; font-size: 28px; width: 44px; height: 44px; cursor: pointer">›</button>';
      document.body.appendChild(box);
      box.addEventListener('click', function (e) {
        var t = e.target;
        if (t.hasAttribute('data-x') || t === box) box.style.display = 'none';
        else if (t.hasAttribute('data-n')) show(cur + 1);
        else if (t.hasAttribute('data-p')) show(cur - 1);
      });
    }
    box.style.display = 'flex';
    show(i);
    box.querySelector('[data-x]').focus();
  }
  document.addEventListener('keydown', function (e) {
    if (box && box.style.display !== 'none') {
      if (e.key === 'Escape') box.style.display = 'none';
      if (e.key === 'ArrowLeft') show(cur + 1);
      if (e.key === 'ArrowRight') show(cur - 1);
      return;
    }
    if (panel && panel.style.display !== 'none') {
      if (e.key === 'Escape') closePanel();
      if (e.key === 'ArrowLeft') go(slideIdx + 1);
      if (e.key === 'ArrowRight') go(slideIdx - 1);
    }
  });

  grid.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-open]') : null;
    if (!a) return;
    e.preventDefault();
    openPanel(parseInt(a.getAttribute('data-open'), 10));
  });

  /* ---------- data ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function token() {
    var saved = null;
    try { saved = JSON.parse(store('mm_visitor') || 'null'); } catch (e) { saved = null; }
    if (saved && saved.t && saved.exp > Date.now() + 60000) return Promise.resolve(saved.t);
    var body = saved && saved.r
      ? { clientId: CLIENT_ID, grantType: 'refresh_token', refreshToken: saved.r }
      : { clientId: CLIENT_ID, grantType: 'anonymous' };
    return fetch(API + '/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        if (!r.ok && saved && saved.r) { store('mm_visitor', ''); return token(); }
        if (!r.ok) throw new Error('token ' + r.status);
        return r.json().then(function (d) {
          store('mm_visitor', JSON.stringify({ t: d.access_token, r: d.refresh_token, exp: Date.now() + (d.expires_in || 14400) * 1000 }));
          return d.access_token;
        });
      });
  }

  token().then(function (t) {
    return fetch(API + '/wix-data/v2/items/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': t },
      body: JSON.stringify({ dataCollectionId: 'Projects', query: { sort: [{ fieldName: 'order', order: 'ASC' }], paging: { limit: 50, offset: 0 } } })
    });
  }).then(function (r) {
    if (!r.ok) throw new Error('query ' + r.status);
    return r.json();
  }).then(function (d) {
    items = (d.dataItems || []).map(function (i) { return i.data || {}; })
      .filter(function (p) { return p.title && p.visible !== false && p.showOnHome !== false; })
      .sort(function (a, b) { return (a.order == null ? 999 : a.order) - (b.order == null ? 999 : b.order); });
    if (!items.length) return;
    var nf = items.filter(function (p) { return !p.featured; }).length;
    grid.innerHTML = items.map(function (p, i) { return p.featured ? featured(p, i) : card(p, i); }).join('') + (nf % 2 ? '<span aria-hidden="true" style="flex: 1 1 460px; min-width: 0; height: 0; margin-top: -48px"></span>' : '');
    fromHash();
  }).catch(function () { /* keep the built-in projects */ });
})();