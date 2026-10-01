(function () {
  const cfg = window.SITE_CONFIG;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  const waLink = text => `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text)}`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- WhatsApp и Instagram ссылки ---------- */
  document.querySelectorAll('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); });
  document.querySelectorAll('#igLink, .ig').forEach(a => { a.href = `https://www.instagram.com/${cfg.instagram}/`; });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Дневной / вечерний режим ---------- */
  const cord = $('#cord');
  function setTheme(night) {
    root.dataset.theme = night ? 'night' : 'day';
    cord.setAttribute('aria-pressed', String(night));
    cord.setAttribute('aria-label', night ? 'Выключить вечерний свет' : 'Включить вечерний свет');
  }
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  const hour = new Date().getHours();
  setTheme(saved ? saved === 'night' : (hour >= 19 || hour < 7));

  cord.addEventListener('click', () => {
    cord.classList.remove('pull'); void cord.offsetWidth; cord.classList.add('pull', 'used');
    setTimeout(() => {
      const night = root.dataset.theme !== 'night';
      setTheme(night);
      try { localStorage.setItem('theme', night ? 'night' : 'day'); } catch (e) {}
    }, 180);
  });

  /* ---------- Цветы в оформлении ---------- */
  $('#logoMark').innerHTML = Flower.make({ color: '#E2392B', shape: 'dahlia' });
  $('#heroFlower').innerHTML = Flower.make({ color: '#E2392B', shape: 'dahlia', bloom: !reduced });
  $('#lightLamp').insertAdjacentHTML('afterbegin', Flower.make({ color: '#F6B8C4', shape: 'lotus' }));

  const bouquet = [
    { c: '#EADBC4', s: 'dahlia', x: 2, y: 4, w: 62 },
    { c: '#F2A3B3', s: 'peony', x: 46, y: 0, w: 52 },
    { c: '#E8473A', s: 'poppy', x: 50, y: 46, w: 48 },
    { c: '#FFFFFF', s: 'lily', x: 10, y: 54, w: 44 },
    { c: '#7A1630', s: 'rose', x: 34, y: 34, w: 30 }
  ];
  $('#eventsBouquet').innerHTML = bouquet.map(f =>
    Flower.make({ color: f.c, shape: f.s }).replace('<svg ', `<svg style="left:${f.x}%;top:${f.y}%;width:${f.w}%;height:${f.w}%" `)
  ).join('');

  // лёгкий параллакс главного цветка за курсором
  const heroFlower = $('#heroFlower');
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      const x = (e.clientX / innerWidth - .5) * 24;
      const y = (e.clientY / innerHeight - .5) * 24;
      heroFlower.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ---------- Каталог ---------- */
  async function loadProducts() {
    if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
      try {
        const res = await fetch(`${cfg.supabaseUrl}/rest/v1/products?select=*&order=sort.asc,created_at.desc`, {
          headers: { apikey: cfg.supabaseAnonKey, Authorization: `Bearer ${cfg.supabaseAnonKey}` }
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows.length) return rows;
        }
      } catch (e) { console.warn('Supabase недоступен, показываю каталог по умолчанию', e); }
    }
    return window.DEFAULT_PRODUCTS;
  }

  const filtersEl = $('#filters');
  const gridEl = $('#grid');
  let products = [];
  let active = 'all';

  function renderFilters() {
    const count = key => key === 'all' ? products.length
      : key === 'new' ? products.filter(p => p.is_new).length
      : products.filter(p => p.category === key).length;
    const list = [{ key: 'all', label: 'Все' }, { key: 'new', label: 'Новое' }, ...window.CATEGORIES]
      .filter(f => f.key === 'all' || count(f.key) > 0);
    filtersEl.innerHTML = list.map(f =>
      `<button class="filter" role="tab" data-key="${f.key}" aria-selected="${f.key === active}">${f.label}<span class="count">${count(f.key)}</span></button>`
    ).join('');
  }

  function renderGrid() {
    const items = products.filter(p => active === 'all' || (active === 'new' ? p.is_new : p.category === active));
    gridEl.innerHTML = items.map((p, i) => {
      const color = p.color || '#E2392B';
      const media = p.image
        ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`
        : Flower.make({ color, shape: p.shape });
      const msg = `Здравствуйте! Интересует: «${p.title}». Подскажите цену и сроки?`;
      return `<article class="card" style="--i:${i};--c:${esc(color)}">
        <div class="card__media">${media}${p.is_new ? '<span class="card__new">Новое</span>' : ''}</div>
        <div class="card__body">
          <h3 class="card__title">${esc(p.title)}</h3>
          <p class="card__desc">${esc(p.description)}</p>
          <a class="card__cta" href="${waLink(msg)}" target="_blank" rel="noopener">Узнать цену</a>
        </div>
      </article>`;
    }).join('');
  }

  filtersEl.addEventListener('click', e => {
    const b = e.target.closest('.filter');
    if (!b) return;
    active = b.dataset.key;
    filtersEl.querySelectorAll('.filter').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    renderGrid();
  });

  loadProducts().then(list => { products = list; renderFilters(); renderGrid(); });

  /* ---------- Появление при прокрутке ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Секция «Свет»: лампа разгорается при прокрутке ---------- */
  const light = $('#light');
  function updateLight() {
    const r = light.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height * .6)));
    light.style.setProperty('--lit', reduced ? 1 : p.toFixed(3));
  }
  addEventListener('scroll', updateLight, { passive: true });
  addEventListener('resize', updateLight);
  updateLight();

  /* ---------- Конструктор заказа ---------- */
  const TYPES = [
    { key: 'floor', label: 'Ростовой цветок', min: 60, max: 250, def: 150, head: h => Math.min(110, Math.max(30, h * .38)) },
    { key: 'torsher', label: 'Торшер', min: 90, max: 200, def: 160, head: h => Math.min(75, Math.max(35, h * .32)), lit: true },
    { key: 'lamp', label: 'Ночник / светильник', min: 20, max: 60, def: 35, head: h => h * .85, short: true, lit: true },
    { key: 'zone', label: 'Фотозона', min: 120, max: 250, def: 200, head: h => Math.min(100, Math.max(40, h * .36)), cluster: true }
  ];
  const SHAPES = [
    { key: 'rose', label: 'Роза' }, { key: 'peony', label: 'Пион' }, { key: 'poppy', label: 'Мак' },
    { key: 'dahlia', label: 'Георгин' }, { key: 'lotus', label: 'Лотос' }, { key: 'lily', label: 'Лилия' }
  ];
  const COLORS = [
    { c: '#E2392B', n: 'алый' }, { c: '#FF7A45', n: 'коралловый' }, { c: '#FFB38A', n: 'персиковый' },
    { c: '#F4A7B9', n: 'нежно-розовый' }, { c: '#7A1630', n: 'бордовый' }, { c: '#6B3FA0', n: 'фиолетовый' },
    { c: '#EADBC4', n: 'айвори' }, { c: '#FFFFFF', n: 'белый' }
  ];

  const st = { type: TYPES[0], shape: 'peony', color: COLORS[3], height: 150, light: false };
  const bType = $('#bType'), bShape = $('#bShape'), bColor = $('#bColor');
  const bHeight = $('#bHeight'), bHeightOut = $('#bHeightOut'), bLight = $('#bLight');
  const stage = $('#stage'), plantEl = $('#plant'), ruler = $('#ruler');

  bType.innerHTML = TYPES.map(t => `<button type="button" class="chip" data-key="${t.key}">${t.label}</button>`).join('');
  bShape.innerHTML = SHAPES.map(s => `<button type="button" class="chip" data-key="${s.key}">${s.label}</button>`).join('');
  bColor.innerHTML = COLORS.map(c => `<button type="button" class="swatch" style="--c:${c.c}" data-c="${c.c}" aria-label="${c.n}" title="${c.n}"></button>`).join('') +
    `<label class="swatch swatch--custom" title="свой цвет"><input type="color" id="bCustom" value="#E2392B" aria-label="Свой цвет"></label>`;

  function setPressed(container, attr, val) {
    container.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === val)));
  }

  function applyType(t, keepHeight) {
    st.type = t;
    bHeight.min = t.min; bHeight.max = t.max;
    if (!keepHeight) st.height = t.def;
    st.height = Math.min(t.max, Math.max(t.min, st.height));
    bHeight.value = st.height;
    if (t.lit) { st.light = true; bLight.checked = true; }
  }

  function pxPerCm() {
    const usable = stage.clientHeight - 40 - 48;
    return usable / 260;
  }

  function plantHTML(h, scale, offsetX, bloom) {
    const t = st.type;
    const px = scale;
    const headCm = t.head(h);
    const headPx = headCm * px;
    const flower = Flower.make({ color: st.color.c, shape: st.shape, bloom });
    const cls = `plant ${t.short ? 'plant--short' : ''} ${st.light ? 'plant--lit' : ''}`;
    return `<div class="${cls}" style="height:${h * px}px;left:${offsetX}px">
      <div class="plant__head" style="width:${headPx}px;height:${headPx}px">${flower}</div>
      <div class="plant__stem" style="margin-top:${-headPx * .28}px"></div>
      <div class="plant__base"></div>
    </div>`;
  }

  let lastShapeKey = '';
  function renderStage() {
    const px = pxPerCm();
    stage.style.setProperty('--px', px + 'px');
    stage.style.setProperty('--stage-c', st.color.c);
    ruler.innerHTML = [0, 50, 100, 150, 200, 250].map(cm => `<span style="bottom:${cm * px}px">${cm}</span>`).join('');

    const key = st.shape + st.color.c + st.type.key;
    const bloom = !reduced && key !== lastShapeKey;
    lastShapeKey = key;

    const h = st.height;
    let html;
    if (st.type.cluster) {
      const gap = 46 * px;
      html = plantHTML(h * .62, px, -gap, bloom) + plantHTML(h * .8, px, gap, bloom) + plantHTML(h, px, 0, bloom);
    } else {
      html = plantHTML(h, px, 0, bloom);
    }
    plantEl.innerHTML = html + `<span class="plant__size" style="bottom:${h * px + 8}px;top:auto">≈ ${h} см</span>`;
  }

  function renderForm() {
    setPressed(bType, 'key', st.type.key);
    setPressed(bShape, 'key', st.shape);
    setPressed(bColor, 'c', st.color.c);
    bHeightOut.textContent = st.height;
    $('#bColorName').textContent = st.color.n;
    const shapeLabel = SHAPES.find(s => s.key === st.shape).label.toLowerCase();
    const note = $('#bNote').value.trim();
    const msg = [
      'Здравствуйте! Хочу заказать:',
      `• ${st.type.label}`,
      `• Цветок: ${shapeLabel}`,
      `• Цвет: ${st.color.n}`,
      `• Высота: около ${st.height} см`,
      st.light ? '• С подсветкой' : '• Без подсветки',
      note ? `• Пожелания: ${note}` : ''
    ].filter(Boolean).join('\n') + '\n\nПодскажите, пожалуйста, цену и сроки.';
    $('#bSend').href = waLink(msg);
  }

  function update() { renderForm(); renderStage(); }

  bType.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; applyType(TYPES.find(t => t.key === b.dataset.key)); update(); });
  bShape.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.shape = b.dataset.key; update(); });
  bColor.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.color = COLORS.find(c => c.c === b.dataset.c); update(); });
  $('#bCustom').addEventListener('input', e => { st.color = { c: e.target.value, n: `свой оттенок ${e.target.value}` }; update(); });
  bHeight.addEventListener('input', () => { st.height = +bHeight.value; update(); });
  bLight.addEventListener('change', () => { st.light = bLight.checked; update(); });
  $('#bNote').addEventListener('input', renderForm);
  addEventListener('resize', renderStage);

  applyType(TYPES[0]);
  st.height = 150; bHeight.value = 150;
  update();
})();
