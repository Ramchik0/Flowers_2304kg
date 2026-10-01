/* Кабинет мастера: вход, загрузка фото, список работ. Работает через Supabase. */
const cfg = window.SITE_CONFIG;
const $ = s => document.querySelector(s);
const show = (el, on = true) => { el.hidden = !on; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BUCKET = 'products';

if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
  show($('#notConfigured'));
} else {
  start();
}

async function start() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const db = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

  $('#category').innerHTML = window.CATEGORIES.map(c => `<option value="${c.key}">${c.label}</option>`).join('');
  const catLabel = key => (window.CATEGORIES.find(c => c.key === key) || {}).label || key;

  function toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  }

  function setView(loggedIn) {
    show($('#loginPanel'), !loggedIn);
    show($('#addPanel'), loggedIn);
    show($('#listPanel'), loggedIn);
    show($('#logout'), loggedIn);
    if (loggedIn) loadList();
  }

  const { data: { session } } = await db.auth.getSession();
  setView(!!session);
  db.auth.onAuthStateChange((_e, s) => setView(!!s));

  /* ---------- Вход / выход ---------- */
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    show($('#loginError'), false);
    const { error } = await db.auth.signInWithPassword({ email: $('#email').value.trim(), password: $('#password').value });
    if (error) {
      $('#loginError').textContent = 'Неверная почта или пароль. Проверьте раскладку и попробуйте ещё раз.';
      show($('#loginError'));
    }
  });
  $('#logout').addEventListener('click', () => db.auth.signOut());

  /* ---------- Превью фото ---------- */
  $('#photo').addEventListener('change', () => {
    const f = $('#photo').files[0];
    const drop = $('#drop');
    drop.querySelector('img')?.remove();
    if (f) drop.insertAdjacentHTML('beforeend', `<img src="${URL.createObjectURL(f)}" alt="">`);
  });

  // Сжимаем фото на телефоне до 1600 px — так оно быстрее грузится и занимает меньше места
  async function compress(file) {
    const bmp = await createImageBitmap(file);
    const max = 1600;
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const toBlob = type => new Promise(r => canvas.toBlob(r, type, .82));
    let blob = await toBlob('image/webp');
    if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg');
    return blob;
  }

  /* ---------- Публикация ---------- */
  $('#addForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#publishBtn');
    show($('#addError'), false);
    btn.disabled = true;
    btn.textContent = 'Загружаю фото…';
    try {
      const blob = await compress($('#photo').files[0]);
      const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await db.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
      if (up.error) throw up.error;
      const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path);

      const ins = await db.from('products').insert({
        title: $('#title').value.trim(),
        category: $('#category').value,
        description: $('#description').value.trim(),
        color: $('#color').value,
        is_new: $('#isNew').checked,
        image: publicUrl,
        image_path: path
      });
      if (ins.error) throw ins.error;

      e.target.reset();
      $('#drop').querySelector('img')?.remove();
      toast('Опубликовано');
      loadList();
    } catch (err) {
      console.error(err);
      $('#addError').textContent = 'Не удалось опубликовать: ' + (err.message || err) + '. Проверьте интернет и попробуйте ещё раз.';
      show($('#addError'));
    } finally {
      btn.disabled = false;
      btn.textContent = 'Опубликовать';
    }
  });

  /* ---------- Список ---------- */
  let rows = [];
  async function loadList() {
    const { data, error } = await db.from('products').select('*').order('sort').order('created_at', { ascending: false });
    if (error) { $('#list').innerHTML = `<div class="msg msg--error">Не удалось загрузить список: ${esc(error.message)}</div>`; return; }
    rows = data;
    $('#countTag').textContent = rows.length;
    $('#list').innerHTML = rows.length ? rows.map(r => `
      <div class="item" data-id="${r.id}">
        <div class="item__img">${r.image ? `<img src="${esc(r.image)}" alt="" loading="lazy">` : Flower.make({ color: r.color, shape: r.shape })}</div>
        <div>
          <div class="item__title">${esc(r.title)}</div>
          <div class="item__meta">${esc(catLabel(r.category))}${r.description ? ' · ' + esc(r.description) : ''}</div>
        </div>
        <div class="item__actions">
          <button class="mini ${r.is_new ? 'mini--on' : ''}" data-act="new">${r.is_new ? 'В «Новом»' : 'Сделать новинкой'}</button>
          <button class="mini mini--danger" data-act="del">Удалить</button>
        </div>
      </div>`).join('')
      : '<div class="msg">Пока здесь пусто. Добавьте первую работу — она сразу появится на сайте.</div>';
  }

  $('#list').addEventListener('click', async e => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const row = rows.find(r => r.id === b.closest('.item').dataset.id);
    if (b.dataset.act === 'new') {
      const { error } = await db.from('products').update({ is_new: !row.is_new }).eq('id', row.id);
      if (!error) { toast(row.is_new ? 'Убрано из «Нового»' : 'Добавлено в «Новое»'); loadList(); }
    }
    if (b.dataset.act === 'del') {
      if (!confirm(`Удалить «${row.title}» с сайта?`)) return;
      const { error } = await db.from('products').delete().eq('id', row.id);
      if (error) { toast('Не удалось удалить'); return; }
      if (row.image_path) await db.storage.from(BUCKET).remove([row.image_path]);
      toast('Удалено');
      loadList();
    }
  });
}
