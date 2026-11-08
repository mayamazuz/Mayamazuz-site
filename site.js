/* מאיה מזוז אדריכלות: מקור לפניות ומדידה
   ---------------------------------------------------------------
   1. מקור: קישור עם ?src=instagram (או linkedin, gbp, letter...) נשמר
      לאורך הביקור, ומתווסף לכל הודעת וואטסאפ: "(דרך אינסטגרם)".
   2. נוסח לפי עמוד: לכל כפתור וואטסאפ יש data-wa עם נוסח הפתיחה שלו.
   3. מדידה: כדי להפעיל את Google Analytics, כותבים את מזהה המדידה
      (מתחיל ב־G-) בשורה GA_ID למטה. בלי מזהה, שום דבר לא נטען.
*/
(function () {
  var GA_ID = 'G-NLD0D3CZLB';
  var PHONE = '972524465443';
  var NAMES = {
    instagram: 'אינסטגרם', ig: 'אינסטגרם',
    ig_mazuzb: 'האינסטגרם של Mazuz B',
    linkedin: 'לינקדין', li: 'לינקדין',
    gbp: 'הפרופיל בגוגל', google: 'גוגל',
    facebook: 'פייסבוק', fb: 'פייסבוק',
    mazuzb: 'האתר של Mazuz B',
    letter: 'מכתב', email: 'מייל', whatsapp: 'וואטסאפ'
  };

  // --- מקור הביקור ---
  var src = '';
  try {
    var p = new URLSearchParams(location.search);
    src = (p.get('src') || p.get('utm_source') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30);
    if (src) sessionStorage.setItem('mm_src', src);
    else src = sessionStorage.getItem('mm_src') || '';
  } catch (e) {}
  var srcName = src ? (NAMES[src] || src) : '';

  function tag(line) {
    return srcName ? line + ' (דרך ' + srcName + ')' : line;
  }

  // --- מדידה ---
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }
  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    // הכתובת המלאה (עם הסימון) נמסרת ל־Analytics, ואז הסימון נמחק משורת הכתובת
    window.gtag('config', GA_ID, { page_location: location.href });
    try {
      var q = new URLSearchParams(location.search), dirty = false;
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src'].forEach(function (k) {
        if (q.has(k)) { q.delete(k); dirty = true; }
      });
      if (dirty) {
        var rest = q.toString();
        history.replaceState(history.state, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
      }
    } catch (e) {}
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    var foot = document.querySelector('footer > div');
    if (foot) {
      var note = document.createElement('p');
      note.textContent = 'האתר משתמש ב־Google Analytics כדי להבין מאיפה מגיעים מבקרים. לא נאסף מידע מזהה.';
      note.style.cssText = 'flex:1 1 100%;margin:8px 0 0;font-size:13px;color:#A39B8E';
      foot.appendChild(note);
    }
  }

  // --- כפתורי וואטסאפ ---
  var links = document.querySelectorAll('a[href^="https://wa.me/"]');
  for (var i = 0; i < links.length; i++) {
    (function (a) {
      var msg = a.getAttribute('data-wa');
      if (!msg) {
        try { msg = new URL(a.href).searchParams.get('text'); } catch (e) {}
      }
      msg = msg || 'היי מאיה, הגעתי מהאתר.';
      a.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(tag(msg));
      a.addEventListener('click', function () {
        track('whatsapp_click', { place: a.getAttribute('data-wa-place') || location.pathname, source: src || 'direct' });
      });
    })(links[i]);
  }

  // --- מייל ---
  var mails = document.querySelectorAll('a[href^="mailto:"]');
  for (var j = 0; j < mails.length; j++) {
    mails[j].addEventListener('click', function () { track('email_click', { page: location.pathname }); });
  }

  // --- מדריך: הדפסה ---
  var printBtn = document.querySelector('[data-track="guide_print"]');
  if (printBtn) printBtn.addEventListener('click', function () { track('guide_print'); });

  // לשימוש הטופס בדף הבית
  window.mmTag = tag;
  window.mmTrack = track;
})();
