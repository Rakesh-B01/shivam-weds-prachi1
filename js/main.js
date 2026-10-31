/* Wedding invitation — site behaviour. Content comes from config.js */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  const CFG = window.WEDDING_CONFIG;
  const STICKERS = window.STICKERS || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), CFG);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 700px)').matches;

  /* ---------------- text bindings ---------------- */
  $$('[data-bind]').forEach((el) => { el.textContent = get(el.dataset.bind) ?? ''; });
  /* Images can be a single path or a list: the first file that exists is used.
     e.g. ['assets/illustrations/haldi.jpg', 'assets/characters/haldi.svg'] → painted art if present, else the cartoon. */
  const sources = (v) => (Array.isArray(v) ? v : [v]).filter(Boolean);
  const isPainted = (src) => !/\.svg(\?|$)/i.test(src);
  function setImg(img, value, onReady) {
    const list = sources(value);
    let i = 0;
    img.onerror = () => { if (++i < list.length) img.src = list[i]; };
    img.onload = () => onReady && onReady(img.currentSrc || img.src);
    img.src = list[0];
  }
  setImg($('#heroImg'), CFG.hero.image);

  /* ---------------- family invitation ---------------- */
  (function familyCard() {
    const F = CFG.family;
    const card = $('#familyCard');
    if (!F || !card) { $('#family')?.remove(); return; }
    const line = (cls, text, attrs = '') => (text ? `<p class="${cls}" ${attrs}>${esc(text)}</p>` : '');
    card.innerHTML = `
      ${line('family__ganesh', F.ganesh, 'lang="hi"')}
      <span class="family__kalash" aria-hidden="true">${STICKERS.kalash || ''}</span>
      ${F.shloka ? `<p class="family__shloka" lang="hi">${F.shloka.map(esc).join('<br>')}</p>` : ''}
      ${line('family__hosts', F.hosts)}
      ${line('family__request', F.request)}
      ${line('family__occasion', F.occasion)}
      ${line('family__relation', F.relation)}
      <p class="family__name">${esc(CFG.couple.groom)}</p>
      ${F.groomLine ? `<p class="family__lineage">(${esc(F.groomLine)})</p>` : ''}
      <p class="family__with">With</p>
      <p class="family__name">${esc(CFG.couple.bride)}</p>
      ${F.brideLine ? `<p class="family__lineage">(${esc(F.brideLine)})</p>` : ''}
      <span class="family__divider" aria-hidden="true"></span>
      ${F.compliments ? `<div class="family__compliments"><small>With Best Compliments From</small>${F.compliments.map((c) => `<span>${esc(c)}</span>`).join('')}</div>` : ''}
      ${F.residence ? `<p class="family__residence">${esc(F.residence)}</p>` : ''}
      ${F.couplet ? `<blockquote class="family__couplet"><p>${F.couplet.map(esc).join('<br>')}</p>${F.coupletFrom ? `<footer>— ${esc(F.coupletFrom)}</footer>` : ''}</blockquote>` : ''}`;
  })();

  /* ---------------- stickers ---------------- */
  function sticker(name, size, anim) {
    const el = document.createElement('span');
    el.className = 'sticker' + (anim ? ` anim-${anim}` : '');
    el.innerHTML = STICKERS[name] || STICKERS.heart;
    if (size) { el.style.width = size + 'px'; el.style.height = size + 'px'; }
    if (anim) el.style.animationDelay = `-${rand(0, 5).toFixed(2)}s`;
    return el;
  }
  $$('[data-sticker]').forEach((el) => { el.innerHTML = STICKERS[el.dataset.sticker] || ''; });
  $$('[data-stickers]').forEach((layer) => {
    layer.dataset.stickers.split(',').forEach((spec) => {
      const [name, left, top, size, anim] = spec.trim().split(':');
      const s = sticker(name, +size * (isMobile ? 0.85 : 1), anim);
      s.style.left = left + '%';
      s.style.top = top + '%';
      layer.appendChild(s);
    });
  });

  /* ---------------- toran (hanging garland) ---------------- */
  (function buildToran() {
    // Draped marigold swags with roses, leaves and hanging strands — drawn as one SVG sized to the screen.
    const toran = $('.toran');
    if (!toran) return;
    const f = (n) => n.toFixed(1);
    const q = (p0, p1, p2, t) => [
      (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
      (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
    ];
    const marigold = (x, y, r, g) => {
      let s = '';
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2;
        s += `<circle cx="${f(x + Math.cos(a) * r * 0.78)}" cy="${f(y + Math.sin(a) * r * 0.78)}" r="${f(r * 0.42)}" fill="url(#${g})"/>`;
      }
      return s + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.82)}" fill="url(#${g})" stroke="rgba(140,55,0,.35)" stroke-width=".7"/>` +
        `<circle cx="${f(x - r * 0.2)}" cy="${f(y - r * 0.25)}" r="${f(r * 0.22)}" fill="#fff" opacity=".35"/>`;
    };
    const leaf = (x, y, ang, len) =>
      `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="M0,0 Q${f(len * 0.5)},${f(-len * 0.32)} ${f(len)},0 Q${f(len * 0.5)},${f(len * 0.32)} 0,0Z" fill="#3E8E4F"/><path d="M1,0 L${f(len * 0.9)},0" stroke="#2A6A3A" stroke-width=".9"/></g>`;
    const rose = (x, y, r) =>
      `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="url(#tRose)"/>` +
      `<path d="M${f(x - r * 0.5)},${f(y)} a${f(r * 0.5)},${f(r * 0.5)} 0 1 1 ${f(r * 0.55)},${f(r * 0.4)} a${f(r * 0.3)},${f(r * 0.3)} 0 1 1 ${f(-r * 0.1)},${f(-r * 0.5)}" fill="none" stroke="#FF8A9B" stroke-width="1.3" opacity=".8"/>`;

    function draw() {
      const W = Math.round(toran.clientWidth || window.innerWidth);
      const H = 130, top = 8, dip = 34;
      const swags = Math.max(3, Math.round(W / 130));
      const step = W / swags;
      let back = '', front = '', strands = '';
      // cord
      back += `<path d="M0,${top} H${W}" stroke="#8a5a2b" stroke-width="2.5"/>`;
      for (let i = 0; i < swags; i++) {
        const p0 = [i * step, top], p2 = [(i + 1) * step, top], p1 = [(i + 0.5) * step, top + dip * 2];
        const count = Math.round(step / 9.5);
        for (let k = 0; k <= count; k++) {
          const t = k / count;
          const [x, y] = q(p0, p1, p2, t);
          if (k % 4 === 1) back += leaf(x, y + 4, 70 + rand(-25, 25), 15);
          front += marigold(x, y, 7.6 + rand(-0.8, 0.8), Math.floor(k / 2) % 2 ? 'tY' : 'tO');
        }
      }
      for (let j = 0; j <= swags; j++) {
        const x = Math.min(Math.max(j * step, 10), W - 10);
        const L = j % 2 ? 54 : 78;
        let s = '';
        for (let y = top + 22; y < top + 18 + L; y += 12.5) s += marigold(x, y, 6.6, Math.round(y / 12.5) % 2 ? 'tY' : 'tO');
        const ey = top + 18 + L + 4;
        s += `<path d="M${f(x - 6)},${ey} Q${f(x)},${ey - 12} ${f(x + 6)},${ey} L${f(x + 7)},${ey + 7} H${f(x - 7)}Z" fill="#D4A64A" stroke="#8a5a2b" stroke-width=".8"/>` +
          `<circle cx="${f(x)}" cy="${ey + 10}" r="3" fill="#B3152F"/>`;
        strands += `<g class="toran-strand" style="transform-origin:${f(x)}px ${top + 10}px;animation-delay:-${rand(0, 4).toFixed(2)}s">${s}</g>`;
        // joint cluster
        front += leaf(x, top + 6, 200, 20) + leaf(x, top + 6, -20, 20) + leaf(x, top + 8, 100, 16) + rose(x, top + 7, 10.5);
      }
      toran.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
        <defs>
          <radialGradient id="tO" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFC857"/><stop offset=".6" stop-color="#F28C28"/><stop offset="1" stop-color="#C2501A"/></radialGradient>
          <radialGradient id="tY" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF0A0"/><stop offset=".6" stop-color="#F7B500"/><stop offset="1" stop-color="#D08400"/></radialGradient>
          <radialGradient id="tRose" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#F0566E"/><stop offset=".7" stop-color="#B3152F"/><stop offset="1" stop-color="#7A0E20"/></radialGradient>
        </defs>${back}${strands}${front}</svg>`;
      toran.dataset.w = W;
    }
    draw();
    window.addEventListener('resize', () => { if (Math.abs(toran.clientWidth - toran.dataset.w) > 30) draw(); });
  })();

  /* ---------------- falling petals ---------------- */
  if (!reduceMotion) {
    const box = $('.petals');
    const count = isMobile ? 16 : 28;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'petal' + (i % 4 === 0 ? ' marigold' : i % 5 === 0 ? ' gold' : '');
      p.style.left = rand(0, 100) + '%';
      p.style.animationDuration = rand(9, 17).toFixed(1) + 's';
      p.style.animationDelay = `-${rand(0, 17).toFixed(1)}s`;
      const s = rand(0.7, 1.3);
      p.innerHTML = `<i style="animation-duration:${rand(1.8, 3.6).toFixed(1)}s;transform:scale(${s.toFixed(2)})"></i>`;
      box.appendChild(p);
    }
  }

  /* ---------------- celebrations ---------------- */
  const events = CFG.events || [];
  const carousel = $('#eventCarousel');
  const ICONS = { date: '📅', time: '⏰', venue: '📍', dress: '👗' };
  const stickerSpots = [[4, 12, 46], [78, 8, 44], [2, 58, 40], [80, 52, 40], [44, 2, 34]];

  function parseLocal(date, time) { // IST wall-clock -> Date
    return new Date(`${date}T${time}:00+05:30`);
  }
  function fmtDate(date) {
    return parseLocal(date, '12:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
  }
  function fmtTime(date, time) {
    return parseLocal(date, time).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).replace(/\s?(am|pm)$/i, (m) => ' ' + m.trim().toUpperCase());
  }
  const utcStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const couple = `${CFG.couple.groom} & ${CFG.couple.bride}`;

  function calLinks(ev) {
    const start = parseLocal(ev.date, ev.start);
    const end = parseLocal(ev.date, ev.end || ev.start);
    if (end <= start) end.setTime(start.getTime() + 3 * 3600e3);
    const title = `${ev.name}${ev.subtitle ? ' (' + ev.subtitle + ')' : ''} · ${couple}`;
    const details = `${ev.description || ''}\nDress code: ${ev.dressCode}\n${location.href.split('#')[0]}`;
    const loc = [ev.venue, ev.address].filter(Boolean).join(', ');
    const google = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      `&text=${encodeURIComponent(title)}&dates=${utcStamp(start)}/${utcStamp(end)}` +
      `&details=${encodeURIComponent(details)}&location=${encodeURIComponent(loc)}&ctz=Asia/Kolkata`;
    const icsEsc = (s) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${CFG.couple.hashtag.replace(/\W/g, '')}//Invite//EN`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', `UID:${ev.id}-${ev.date}@${CFG.couple.hashtag.replace(/\W/g, '').toLowerCase()}`, `DTSTAMP:${utcStamp(new Date())}`,
      `DTSTART:${utcStamp(start)}`, `DTEND:${utcStamp(end)}`, `SUMMARY:${icsEsc(title)}`,
      `DESCRIPTION:${icsEsc(details)}`, `LOCATION:${icsEsc(loc)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(title)}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return { google, ics };
  }

  events.forEach((ev, i) => {
    const card = document.createElement('article');
    // Painted illustrations (JPG/PNG/WebP with their own background) fill the card; SVG cut-outs float on the theme colour
    card.className = `event theme-${ev.theme || ev.id}`;
    card.setAttribute('role', 'listitem');
    const sw = (ev.dressSwatches || []).map((c) => `<i style="background:${esc(c)}"></i>`).join('');
    // One open face: illustration on top, every detail underneath (no flipping)
    card.innerHTML = `
      <div class="event__inner">
        <div class="event__face event__front">
          <span class="event__badge">${String(i + 1).padStart(2, '0')}</span>
          <div class="event__art"><img alt="${esc(CFG.couple.groom)} and ${esc(CFG.couple.bride)} dressed for the ${esc(ev.name)}" loading="lazy" decoding="async" width="600" height="800"></div>
          <div class="event__body">
            <h3 class="event__name">${esc(ev.name)}</h3>
            ${ev.subtitle ? `<p class="event__sub">${esc(ev.subtitle)}</p>` : ''}
            ${ev.description ? `<p class="event__desc">${esc(ev.description)}</p>` : ''}
            <dl class="event__dl">
              <div class="event__row"><dt>${ICONS.date}</dt><dd><small>Date</small>${esc(fmtDate(ev.date))}</dd></div>
              <div class="event__row"><dt>${ICONS.time}</dt><dd><small>Time</small>${ev.schedule
                ? `<span class="schedule">${ev.schedule.map(([what, at]) => `<span><span>${esc(what)}</span><b>${esc(at)}</b></span>`).join('')}</span>`
                : `${esc(fmtTime(ev.date, ev.start))}${ev.end ? ' onwards' : ''}`}</dd></div>
              <div class="event__row"><dt>${ICONS.venue}</dt><dd><small>Venue</small>${esc(ev.venue)}${ev.address ? `<br>${esc(ev.address)}` : ''}</dd></div>
              ${ev.dressCode ? `<div class="event__row"><dt>${ICONS.dress}</dt><dd><small>Dress code</small>${esc(ev.dressCode)}<span class="swatches">${sw}</span></dd></div>` : ''}
            </dl>
            <div class="event__actions">
              <button class="event__btn js-cal" type="button" aria-haspopup="true" aria-expanded="false">📆 Add to Calendar</button>
              <a class="event__btn event__btn--ghost event__btn--map" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(ev.mapQuery || [ev.venue, ev.address].filter(Boolean).join(', '))}" target="_blank" rel="noopener" aria-label="Open directions to the ${esc(ev.name)} venue in Google Maps">📍 Location</a>
            </div>
          </div>
        </div>
      </div>`;
    const art = $('.event__art', card);
    // `painted: true` in config marks a painted scene saved as SVG (only applies to the first image, not the cartoon fallback)
    setImg($('img', art), ev.image, (src) => card.classList.toggle('event--painted',
      isPainted(src) || (ev.painted === true && decodeURI(src).endsWith(sources(ev.image)[0]))));
    (ev.stickers || []).forEach((name, k) => {
      const [l, t, s] = stickerSpots[k % stickerSpots.length];
      const st = sticker(name, s * (isMobile ? 0.9 : 1), k % 2 ? 'bob' : 'float');
      st.style.left = l + '%'; st.style.top = t + '%';
      art.appendChild(st);
    });

    $('.js-cal', card).addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const open = btn.getAttribute('aria-expanded') === 'true';
      closeCalMenus();
      if (open) return;
      const { google, ics } = calLinks(ev);
      const menu = document.createElement('div');
      menu.className = 'cal-menu';
      const icsUrl = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      menu.innerHTML = `<a href="${google}" target="_blank" rel="noopener">🟦 Google Calendar</a>
        <a href="${icsUrl}" download="${esc(ev.id)}-${esc(CFG.couple.groom)}-${esc(CFG.couple.bride)}.ics">🍎 Apple / Outlook (.ics)</a>`;
      btn.parentElement.appendChild(menu);
      btn.setAttribute('aria-expanded', 'true');
    });
    carousel.appendChild(card);

  });
  function closeCalMenus() {
    $$('.cal-menu').forEach((m) => m.remove());
    $$('.js-cal').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  }
  document.addEventListener('click', (e) => { if (!e.target.closest('.event__actions')) closeCalMenus(); });

  /* ---------------- confetti ---------------- */
  const confettiCanvas = $('#confetti');
  const cctx = confettiCanvas.getContext('2d');
  let particles = [], confettiRunning = false;
  const COLORS = ['#D4A64A', '#F3D58A', '#7A1F2B', '#E63E5C', '#F6A5B5', '#F28C28', '#FFFFFF'];
  function burst(x, y, n = 140, spread = 1) {
    if (reduceMotion) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = innerWidth * dpr; confettiCanvas.height = innerHeight * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI, 0) * spread + (spread < 1 ? -Math.PI / 2 * (1 - spread) : 0);
      const v = rand(5, 13);
      particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - rand(2, 5),
        r: rand(4, 8), rot: rand(0, 6.28), vr: rand(-0.25, 0.25),
        shape: i % 4 === 0 ? 'heart' : i % 3 === 0 ? 'circle' : 'rect',
        color: COLORS[i % COLORS.length], life: 0,
      });
    }
    if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(tick); }
  }
  function drawHeart(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.45, -s * 1.05, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.45, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35);
    ctx.fill();
  }
  function tick() {
    cctx.clearRect(0, 0, innerWidth, innerHeight);
    particles = particles.filter((p) => p.y < innerHeight + 40 && p.life < 420);
    for (const p of particles) {
      p.life++; p.vy += 0.22; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(p.rot); cctx.fillStyle = p.color;
      if (p.shape === 'heart') { cctx.fillStyle = p.color === '#FFFFFF' ? '#E63E5C' : p.color; drawHeart(cctx, p.r * 1.4); }
      else if (p.shape === 'circle') { cctx.beginPath(); cctx.arc(0, 0, p.r / 1.6, 0, 6.28); cctx.fill(); }
      else cctx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2 * Math.abs(Math.cos(p.life / 8)));
      cctx.restore();
    }
    if (particles.length) requestAnimationFrame(tick);
    else { confettiRunning = false; cctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* ---------------- scratch card ---------------- */
  const weddingDate = new Date(CFG.wedding.dateTime);
  $('#revealDate').textContent = CFG.wedding.dateLabel;
  $('#revealNames').textContent = `${CFG.couple.groom} & ${CFG.couple.bride}`;
  (function scratchCard() {
    const card = $('#scratchCard');
    const canvas = $('#scratchCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let drawnWidth = 0, scratching = false, last = null, moves = 0, revealed = false, dpr = 1;

    function heartPath(x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.35);
      ctx.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
      ctx.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
      ctx.fill();
    }
    function drawFoil() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#b8862f'); g.addColorStop(0.25, '#f3d58a'); g.addColorStop(0.45, '#c99a3a');
      g.addColorStop(0.6, '#f7e2a6'); g.addColorStop(0.8, '#b8862f'); g.addColorStop(1, '#e8c063');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // foil grain
      for (let i = 0; i < (w * h) / 40; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,.18)' : 'rgba(120,80,20,.12)';
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
      }
      // sheen stripes
      ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff';
      for (let x = -h; x < w; x += 36) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.lineTo(x + h + 10, 0); ctx.lineTo(x + 10, h); ctx.fill(); }
      ctx.restore();
      // maroon frame
      ctx.strokeStyle = 'rgba(122,31,43,.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.strokeRect(12, 12, w - 24, h - 24); ctx.setLineDash([]);
      // hearts
      const hearts = [[0.12, 0.25, 9], [0.88, 0.22, 11], [0.1, 0.78, 10], [0.9, 0.8, 8], [0.25, 0.5, 6], [0.76, 0.52, 7], [0.5, 0.15, 6], [0.5, 0.86, 7]];
      hearts.forEach(([hx, hy, s], k) => { ctx.fillStyle = k % 2 ? '#7A1F2B' : '#E63E5C'; heartPath(hx * w, hy * h, s * 1.3); });
      // text
      ctx.fillStyle = '#7A1F2B';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `700 ${Math.round(Math.min(34, w / 10))}px "Playfair Display", Georgia, serif`;
      ctx.fillText('Scratch Here', w / 2, h / 2 - 8);
      ctx.font = `500 ${Math.round(Math.min(15, w / 24))}px Poppins, sans-serif`;
      ctx.fillStyle = 'rgba(90,20,32,.85)';
      ctx.fillText('rub with your finger ✨', w / 2, h / 2 + 22);
      drawnWidth = w;
    }
    function point(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function scratchTo(p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(34, canvas.clientWidth / 9);
      ctx.beginPath();
      ctx.moveTo(last ? last.x : p.x, last ? last.y : p.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
      if (++moves % 8 === 0) checkProgress();
    }
    function checkProgress() {
      const { width, height } = canvas;
      const data = ctx.getImageData(0, 0, width, height).data;
      let clear = 0, total = 0;
      const step = 4 * 12; // sample every 12th pixel
      for (let i = 3; i < data.length; i += step) { total++; if (data[i] < 64) clear++; }
      if (clear / total >= 0.5) reveal();
    }
    function reveal() {
      if (revealed) return;
      revealed = true;
      scratching = false;
      canvas.classList.add('cleared');
      $('#scratchSkip').hidden = true;
      const r = card.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 170);
      setTimeout(() => burst(r.left + r.width * 0.2, r.top + r.height * 0.3, 60), 250);
      setTimeout(() => burst(r.left + r.width * 0.8, r.top + r.height * 0.3, 60), 450);
      const msg = $('#scratchMsg');
      msg.textContent = CFG.wedding.revealMessage;
      msg.classList.add('show');
      startCountdown();
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }
    canvas.addEventListener('pointerdown', (e) => {
      if (revealed) return;
      scratching = true; last = null;
      canvas.setPointerCapture?.(e.pointerId);
      scratchTo(point(e));
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!scratching) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      evs.forEach((ce) => scratchTo(point(ce)));
      e.preventDefault();
    });
    const stop = () => { if (scratching) { scratching = false; last = null; checkProgress(); } };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
    // Older iOS: make sure the page never scrolls while scratching
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    $('#scratchSkip').addEventListener('click', reveal);

    drawFoil();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!revealed && moves === 0) drawFoil(); });
    new ResizeObserver(() => {
      if (!revealed && Math.abs(canvas.clientWidth - drawnWidth) > 2) { drawFoil(); moves = 0; }
    }).observe(canvas);
  })();

  /* ---------------- countdown ---------------- */
  let cdTimer = null;
  function startCountdown() {
    const box = $('#countdown');
    box.hidden = false;
    const els = { d: $('[data-cd="d"]', box), h: $('[data-cd="h"]', box), m: $('[data-cd="m"]', box), s: $('[data-cd="s"]', box) };
    const pad = (n) => String(n).padStart(2, '0');
    const update = () => {
      let diff = Math.max(0, weddingDate - Date.now());
      if (diff === 0) {
        box.innerHTML = '<p class="scratch__msg" style="grid-column:1/-1;margin:0">Just married! 🎉</p>';
        clearInterval(cdTimer);
        return;
      }
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5); diff -= h * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      els.d.textContent = d; els.h.textContent = pad(h); els.m.textContent = pad(m); els.s.textContent = pad(Math.floor(diff / 1000));
    };
    update();
    clearInterval(cdTimer);
    cdTimer = setInterval(update, 1000);
  }

  /* ---------------- venue ---------------- */
  const q = encodeURIComponent(CFG.venue.mapQuery || `${CFG.venue.name}, ${CFG.venue.address}`);
  // Only load the map iframe when the section is close to the viewport
  const mapFrame = $('#venueMap');
  new IntersectionObserver((entries, obs) => {
    if (entries.some((e) => e.isIntersecting)) { mapFrame.src = `https://maps.google.com/maps?q=${q}&z=15&output=embed`; obs.disconnect(); }
  }, { rootMargin: '400px' }).observe(mapFrame);
  $('#directionsBtn').href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;

  /* ---------------- footer ---------------- */
  const tagBtn = $('#hashtag');
  tagBtn.textContent = CFG.couple.hashtag;
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }
  tagBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(CFG.couple.hashtag); toast('Hashtag copied! Use it on your posts 📸'); }
    catch { toast(CFG.couple.hashtag); }
  });
  // credit at the very bottom: logo (links to the channel), "Presented by …" and email
  const credit = CFG.credit;
  const creditBox = $('#footerCredit');
  if (credit && creditBox) {
    const link = (text) => credit.url ? `<a href="${esc(credit.url)}" target="_blank" rel="noopener">${text}</a>` : text;
    creditBox.innerHTML = `
      ${credit.url ? `<a class="footer__credit-logo" href="${esc(credit.url)}" target="_blank" rel="noopener" aria-label="${esc(credit.presentedBy)} on YouTube"><img alt="${esc(credit.presentedBy)} logo" width="56" height="56" loading="lazy" decoding="async"></a>` : ''}
      <p class="footer__credit-by">Presented by ${link(`<strong>${esc(credit.presentedBy)}</strong>`)}</p>
      ${credit.email ? `<p class="footer__credit-email">Email : <a href="mailto:${esc(credit.email)}">${esc(credit.email)}</a></p>` : ''}`;
    const logo = $('img', creditBox);
    if (logo) setImg(logo, credit.logo);
  } else if (creditBox) {
    creditBox.remove();
  }
  $('#contacts').innerHTML = `<p class="footer__rsvp">R.S.V.P.${CFG.contactsNote ? ` · ${esc(CFG.contactsNote)}` : ''}</p>` + (CFG.contacts || []).map((c) => {
    const tel = c.phone.replace(/[^\d+]/g, '');
    const wa = tel.replace(/\D/g, '');
    // name on its own line, phone number + WhatsApp below it
    return `<p class="footer__person"><strong>${esc(c.name)}</strong><span class="footer__phone"><a href="tel:${esc(tel)}">${esc(c.phone)}</a><a class="wa" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener" style="border:0">WhatsApp</a></span></p>`;
  }).join('');
  if (!reduceMotion) {
    const fh = $('.footer__hearts');
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.textContent = '❤';
      s.style.left = rand(2, 96) + '%';
      s.style.fontSize = rand(12, 26) + 'px';
      s.style.animationDuration = rand(6, 12) + 's';
      s.style.animationDelay = `-${rand(0, 12)}s`;
      fh.appendChild(s);
    }
  }

  /* ---------------- music (on by default — see config.music.autoplay) ---------------- */
  const musicBtn = $('#musicBtn');
  let player = null, playing = false;
  function makeSynth() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ac = new AC();
    const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    const delay = ac.createDelay(); delay.delayTime.value = 0.36;
    const fb = ac.createGain(); fb.gain.value = 0.32;
    const wet = ac.createGain(); wet.gain.value = 0.45;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
    // soft tanpura-like drone (Sa–Pa–Sa)
    [[130.81, 0.045], [196, 0.03], [261.63, 0.018]].forEach(([f, v]) => {
      const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const g = ac.createGain(); g.gain.value = v;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.15 + Math.random() * 0.1;
      const lg = ac.createGain(); lg.gain.value = v * 0.5; lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(master); o.start(); lfo.start();
    });
    // gentle Bhupali-style melody (C D E G A)
    const N = { A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25 };
    const tune = [['E4', 1], ['G4', 1], ['A4', 2], ['G4', 1], ['E4', 1], ['D4', 2], ['E4', 1], ['G4', 1], ['A4', 1], ['C5', 1], ['A4', 2], ['G4', 2],
      ['D5', 1], ['C5', 1], ['A4', 1], ['G4', 1], ['E4', 2], ['G4', 2], ['D4', 1], ['E4', 1], ['D4', 1], ['C4', 1], ['A3', 2], ['C4', 2], [null, 2]];
    const beat = 0.46;
    let next = ac.currentTime + 0.2, idx = 0;
    const schedule = () => {
      while (next < ac.currentTime + 1.2) {
        const [n, b] = tune[idx % tune.length];
        if (n) {
          const f = N[n], dur = b * beat;
          const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f;
          const vib = ac.createOscillator(); vib.frequency.value = 5.2;
          const vg = ac.createGain(); vg.gain.value = f * 0.005; vib.connect(vg); vg.connect(o.frequency);
          const g = ac.createGain();
          g.gain.setValueAtTime(0.0001, next);
          g.gain.exponentialRampToValueAtTime(0.14, next + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, next + dur * 1.5);
          o.connect(g); g.connect(master); g.connect(delay);
          o.start(next); vib.start(next); o.stop(next + dur * 1.6); vib.stop(next + dur * 1.6);
        }
        next += b * beat; idx++;
      }
    };
    let timer = null;
    return {
      async play() {
        // Browsers keep audio suspended until the visitor taps/clicks; report that instead of pretending to play
        await Promise.race([ac.resume(), new Promise((r) => setTimeout(r, 150))]);
        if (ac.state !== 'running') throw new Error('Autoplay blocked until the visitor interacts with the page');
        next = Math.max(next, ac.currentTime + 0.1);
        schedule(); timer = setInterval(schedule, 300);
        master.gain.cancelScheduledValues(ac.currentTime);
        master.gain.setTargetAtTime(0.7, ac.currentTime, 0.6);
      },
      pause() {
        clearInterval(timer);
        master.gain.cancelScheduledValues(ac.currentTime);
        master.gain.setTargetAtTime(0, ac.currentTime, 0.2);
        setTimeout(() => ac.suspend(), 600);
      },
    };
  }
  function makeAudio(src) {
    const a = new Audio(src);
    a.loop = true; a.volume = 0.55; a.preload = 'auto'; // music is on by default, so start loading straight away
    return { play: () => a.play(), pause: () => a.pause() };
  }
  // `musicOn` = what the visitor wants. It's ON by default and the button always shows it
  // (index.html starts the button as aria-pressed="true"). Tapping the button turns it off / on.
  let musicOn = !CFG.music || CFG.music.autoplay !== false;
  function showMusicState() {
    musicBtn.setAttribute('aria-pressed', String(musicOn));
    musicBtn.setAttribute('aria-label', musicOn ? 'Pause background music' : 'Play background music');
  }
  async function startMusic() {
    if (!player) player = CFG.music && CFG.music.src ? makeAudio(CFG.music.src) : makeSynth();
    if (!player) return false;
    try { await player.play(); playing = true; } catch { playing = false; }
    return playing;
  }
  function stopMusic() { if (player) player.pause(); playing = false; }

  // Browsers block sound until the visitor's first tap/click/key press. If the music couldn't start on
  // load, keep trying on each of those (they're the events that grant permission) until it plays.
  const UNLOCK_EVENTS = ['click', 'touchend', 'pointerup', 'keydown'];
  const unlock = async (e) => {
    if (e.target.closest && e.target.closest('#musicBtn')) return; // the button handles itself
    if (!musicOn || playing) return stopWaitingForTap();
    if (await startMusic()) stopWaitingForTap();
  };
  function waitForTap() { UNLOCK_EVENTS.forEach((t) => window.addEventListener(t, unlock, true)); }
  function stopWaitingForTap() { UNLOCK_EVENTS.forEach((t) => window.removeEventListener(t, unlock, true)); }

  musicBtn.addEventListener('click', async () => {
    musicOn = !musicOn;
    showMusicState();
    if (musicOn) { if (!(await startMusic())) waitForTap(); }
    else { stopMusic(); stopWaitingForTap(); }
  });
  // The music keeps playing (looping) until the visitor taps the music button — it isn't paused on tab switches.

  showMusicState();
  if (musicOn) startMusic().then((ok) => { if (!ok && musicOn) waitForTap(); });

  /* ---------------- welcome screen ("Tap to open the invitation") ---------------- */
  // Browsers only allow sound after a tap, so this tap starts the music as the invitation opens.
  const gate = $('#introGate');
  const gateBtn = $('#introGateBtn');
  if (gate && gateBtn) {
    gateBtn.focus({ preventScroll: true });
    gateBtn.addEventListener('click', () => {
      if (musicOn && !playing) startMusic().then((ok) => { if (ok) stopWaitingForTap(); });
      window.scrollTo(0, 0);
      document.documentElement.classList.remove('gate-closed'); // hero entrance animation plays now
      gate.classList.add('is-leaving');
      setTimeout(() => gate.remove(), 950);
    }, { once: true });
  } else {
    document.documentElement.classList.remove('gate-closed');
  }

  /* ---------------- scroll reveal ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));
})();
