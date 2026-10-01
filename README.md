# flowers_kg2304: website

Static site for a handmade foam-flower and flower-lamp workshop in Bishkek (Instagram: @flowers_kg2304).
No build step: plain HTML, CSS and JS.

```
index.html        main page
admin.html        owner's cabinet (photo upload)
css/style.css     all styles and design tokens
js/flower.js      SVG flower generator (placeholders, hero, order builder)
js/app.js         site logic: night mode, catalogue, order builder
js/config.js      WhatsApp number, Supabase keys, categories
js/products.js    default catalogue (used until Supabase is connected)
supabase/setup.sql  database and storage setup
```

## Run locally

```bash
python3 -m http.server 5173
```

Open http://localhost:5173.

## Free photo uploads for the owner (Supabase)

1. Create a free project at https://supabase.com.
2. Open **SQL Editor**, paste in `supabase/setup.sql`, replace `owner@example.com` with the owner's email, and click **Run**.
3. Under **Authentication → Users → Add user**, create the owner's account (same email, plus a password).
4. Under **Authentication → Sign In / Providers**, turn off **Allow new users to sign up**.
5. Under **Project Settings → API**, copy the **Project URL** and the **anon public** key into `js/config.js`.

After that, the owner opens `/admin.html` on their phone, signs in, picks a photo and taps «Опубликовать».
Photos are compressed on the phone to 1600 px (WebP) before upload, so the free 1 GB of storage holds thousands of them.
Only email addresses listed in the `admins` table can add or delete items. Everyone else can only view.

Note: on the free plan, Supabase pauses a project after 7 days without any requests. Visits to the site count as
requests, so this only happens if nobody opens the site for a whole week. The owner can restore the project in one click from the dashboard.

## Free hosting

Any static host works: **Cloudflare Pages**, Netlify or GitHub Pages. Upload the folder, or connect a Git repo,
and leave the build command empty. A domain such as `flowers2304.kg` can be connected later.

## Editing content

- WhatsApp number: `js/config.js` → `whatsapp`
- Catalogue sections: `js/config.js` → `CATEGORIES`
- Text: directly in `index.html`

---

## Инструкция для мастера

1. Откройте на телефоне `ваш-сайт/admin.html` и войдите по почте и паролю.
2. Нажмите «Выберите фото» и выберите снимок из галереи или сфотографируйте цветок.
3. Напишите название, выберите раздел и при желании добавьте описание.
4. Нажмите «Опубликовать». Работа сразу появится на сайте.
5. В списке ниже можно отметить работу как новинку или удалить её.
