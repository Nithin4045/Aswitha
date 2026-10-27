# For Aswitha — a birthday movie website

## What she sees
1. **Before midnight (28 Oct, India time):** a countdown.
2. **Movie ticket:** she types the code (default `15072024`, the day you first saw her).
3. **Film leader 3‑2‑1**, then the opening titles: *The Girl in the Blue T-shirt*, starring Aswitha.
4. **Hero:** her name and a live clock since 15 July 2024 (months : weeks : days : hours : minutes : seconds).
5. **10 chapters** of your story with polaroid photos and videos (tap a photo to open it big).
   The **Intermission film reel** sits in the middle.
6. **Her birthday:** cake with a candle she can tap, or blow into her phone's mic.
   A gentle original instrumental plays in the background; on phones, tap **Play music**
   if the browser blocks automatic playback.
7. **Ending:** "I love you in 1,000,000,000 ways", a chat where your messages end with
   *"I'm still waiting for your reply ❤️"* and she shows as *typing…*, then a box to write back to you.
8. **End credits:** "to be continued…"

## Files
- `config.js` — **the only file to edit**: story text, dates, captions, theme, code, email, WhatsApp
- `index.html`, `style.css`, `script.js` — the website itself
- `media/` — your photos, videos and song

## 1. Add photos & videos
Put files in `media` with these names (or change names/captions in `config.js`):

| Chapter | Files |
|---|---|
| 1 · Blue T-shirt (15‑07‑2024) | `ch1-first-sight.jpg.jpg` |
| 2 · Classes | `ch2-classes.jpg.jpg` |
| 3 · The girl without a name | `ch3-first-photo.jpg.jpg` |
| 4 · ISKCON (08‑10‑2024) | `ch4-iskcon.jpg.jpg`, `ch4-iskcon-2.jpg` |
| 5 · Tea at Asha | `ch5-asha-tea.jpg.jpg`, `ch5-video.mp4.mp4` |
| Intermission reel | `reel-01.jpg.mp4` … `reel-06.jpg.MOV` |
| 6 · First goodbye (24‑07‑2025) | `ch7-goodbye.jpg.jpg` |
| 7 · I saw you again (20‑09‑2025) | `ch8-reunion.jpg.jpg`, `ch8-video.mp4.MOV` |
| 8 · Longest night (17‑05‑2026) | `ch9-visit.jpg.jpg` |
| 9 · My first wish (28‑06‑2026) | `ch10-my-birthday.jpg.jpg`, `ch10-cake.jpg.jpg`, `ch10-video.mp4.mp4` |
| 10 · Closing the distance | `IMG20260724164947.jpg`, `ch11-video.mp4.mp4` |
| Birthday | `IMG-20260628-WA0108.jpg` |
| Music (optional) | `our-song.mp3` |

- Missing files show an "Add photo" frame — so fill every slot or remove it from `config.js`.
- Names are case-sensitive on GitHub (`IMG.JPG` ≠ `img.jpg`).
- Keep each video short, `.mp4`, under ~25 MB (GitHub refuses files over 100 MB).
- Portrait photos look best (the frames are 4:5).

## 2. Her reply
Set `email` and `whatsapp` (e.g. `919876543210`) in `config.js`.
Her message is emailed to you via FormSubmit. **The very first message sends you an
"Activate form" email — you must click it**, so send yourself a test first (see step 4).
If email fails, she gets a WhatsApp button. Don't want a reply box? Set `replyBox: false`.

## 3. Host on GitHub Pages
1. New repository (e.g. `for-aswitha`).
2. Add file → Upload files → drag in everything from this folder, including `media`.
3. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
4. Live in 1–2 minutes at `https://<username>.github.io/for-aswitha/`

## 4. Test before 28 October
- Open `https://<username>.github.io/for-aswitha/?preview` — skips the countdown.
- Try templates: add `&theme=krishna` or `&theme=blush`. Set your favourite as `theme` in `config.js`.
- Write a test reply at the end → click **Activate** in your email.
- The site remembers a reply on the device that sent it — so after testing, open it once in a
  private/incognito window to check it looks fresh, and send her the link **without** `?preview`.
- Test on your phone with the sound on.

## Privacy
Anyone with the link can open the site, and on a free GitHub account the repository (with her
photos) is public too. The code only stops casual visitors. Use a repo name that isn't obvious,
and delete the repo later if she prefers.
