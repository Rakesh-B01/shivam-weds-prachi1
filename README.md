# Vijay ❤ Rashima — Wedding Invitation Website

A mobile-first wedding invite built for sharing on WhatsApp. It's a plain static site (HTML/CSS/JS) with no build step, so it loads fast and you can host it anywhere for free.

**Sections:** Hero with falling petals → Family invitation card → The Celebrations (flip cards with Add to Calendar) → Scratch card date reveal + countdown → Venue + map → Footer. (The RSVP form was removed; the `/admin` page and `supabase/` setup are no longer used by the site.)

---

## 1. Preview locally

```bash
node scripts/serve.mjs
```
Then open http://localhost:5173 (and http://localhost:5173/admin/).

## 2. Edit the content — `config.js`

Everything on the page comes from **`config.js`**: names, hashtag, wedding date, love-story photos, every function (date, time, venue, dress code, colours, stickers), venue and map, RSVP text, contacts and music. Replace every `[PLACEHOLDER]` in it.

| What | Where |
|---|---|
| Wedding date for the scratch card and countdown | `wedding.dateTime` (ISO with `+05:30`) and `wedding.dateLabel` |
| Function dates/times (used by Add to Calendar) | `events[].date` `YYYY-MM-DD`, `start`/`end` `HH:MM` (IST) |
| Map | `venue.mapQuery`: venue name + city, or `"lat,lng"` |
| Contact | `contacts`: phone in international format, e.g. `+91 98765 43210` (it also builds the WhatsApp link) |

## 3. Replace the pictures

The hero uses a painted illustration (`assets/illustrations/hero.jpg`). It's a 3× high-quality upscale of the small original (`hero-source.jpg`), made with `node scripts/upscale.mjs` while `node scripts/serve.mjs` is running. If you get the full-size original, save it straight over `hero.jpg`, since a true high-resolution file always looks sharper. To create the other images in the same painted style, use the ready-made prompts in **[ILLUSTRATION-PROMPTS.md](ILLUSTRATION-PROMPTS.md)**. Painted JPG/PNG/WebP images fill the function cards automatically; transparent SVG cut-outs float on the card colour.

- **Character illustrations:** `assets/characters/*.svg`. Each slot is a **600×800 portrait**, and a transparent PNG/WebP works best. Drop in your own file (e.g. `haldi.png`) and update its path in `config.js` (`hero.image`, `events[].image`, `rsvp.thankYouImage`).
- **Love-story illustrations:** `assets/photos/photo1–6.svg` are illustrated scenes of the couple (café meet, starry first date, mountains, sunset proposal, families meet, mandap). To use your own illustrations instead, make them portrait 4:5 (e.g. 600×750) and update `story[].photo`.
- To regenerate the built-in cartoon characters after tweaking colours: `node scripts/make-art.mjs`.

### Borders and separators

The rose separators, the temple-arch border bands, the rose card corners and the footer garland are SVGs in `assets/decor/`. They're drawn by `node scripts/make-decor.mjs`; edit the colours or sizes at the top of that script and re-run it.

## 4. Background music (optional, off by default)

Put an MP3 in `assets/music/` and set `music.src: 'assets/music/your-song.mp3'`. If you leave it empty, a soft built-in instrumental (tanpura drone + Bhupali melody) plays when guests tap ♪. Music pauses automatically when the tab is hidden.

## 5. Connect the RSVP database (Supabase / Lovable Cloud)

Without this step the site runs in **demo mode**: RSVPs are saved only in the browser that submitted them. Do this before sharing the link.

1. Create a free project at [supabase.com](https://supabase.com). A Lovable Cloud project works too, because it's Supabase under the hood.
2. Open **SQL Editor**, paste **`supabase/schema.sql`**, **change the admin password** on the line marked ✏️, and click **Run**.
3. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key into `config.js`:
   ```js
   supabase: { url: 'https://xxxx.supabase.co', anonKey: 'eyJ...' },
   ```
4. Submit a test RSVP, then open `/admin` and log in with the password you set.

**Security model:** guests can only *insert* RSVPs. No one can read them through the public API. The admin page reads them through a database function that checks your (bcrypt-hashed) password. Use a strong password, because the anon key is public by design.

> If you add or rename a function in `config.js`, update the allowed list in the `functions` check in `schema.sql` too (e.g. `alter table rsvps drop constraint ...` and re-add it, or just re-create the table before going live).

## 6. WhatsApp link preview

WhatsApp can't run JavaScript, so the preview tags live in `index.html` `<head>`. After you deploy:

1. Replace every `https://YOUR-SITE-URL` with your real address (it **must** be absolute).
2. Update `og:title` / `og:description` if you change names or dates.
3. `assets/og-image.jpg` (1200×630) is already generated. To rebuild it after changing names, dates or the hero art: run `node scripts/serve.mjs`, then in another terminal run `node scripts/make-og.mjs`. It uses headless Edge or Chrome.

WhatsApp caches previews. To test a fresh one, add `?v=2` to the link.

## 7. Deploy (free)

Any static host works:
- **Netlify:** drag-and-drop this folder at app.netlify.com/drop.
- **Vercel:** `npx vercel` in this folder.
- **GitHub Pages:** push the folder and enable Pages.

`/admin` works automatically because it's `admin/index.html`, and it's marked `noindex`.

---

### File map
```
index.html            page structure + WhatsApp/OG tags
config.js             ✏️ all content
css/style.css         styles (colours in :root)
js/main.js            animations, gallery, cards, scratch card, RSVP, music
js/stickers.js        cute SVG sticker library (hearts, marigold, diya, kalash, rings…)
admin/index.html      RSVP dashboard + CSV export
supabase/schema.sql   database table, security rules, admin function
assets/               characters, photos, og-image, favicon, music
scripts/              local server, art + preview-image generators
```
