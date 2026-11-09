# nutramigen_activations

Nutramigen mobile quiz game. Plain HTML/CSS/JavaScript — no build step — deployed to Cloudflare.

## How the game works

1. **Home** — 5 items on a scene. Tap one and the scene zooms into it.
2. **Question** — progress bar on top (`#/5` on the left, `XX% Complete` on the right), the item image, the question, and 4 answers.
3. **After answering** — the image swaps to its correct/incorrect version.
   - Correct: only the correct answer stays, in green, tagged "Correct".
   - Incorrect: your answer in red on the left ("Incorrect"), the correct answer in green on the right ("Correct").
   - Below that: an info note, then a ← button back to the remaining questions.
4. **End** — after all 5: a title and two columns (QR code | copy).
5. **Idle** — 30s with no taps shows a "still playing?" popup. Ignore it for 45s and the game resets to the homepage.

## File structure

```
public/                      ← everything Cloudflare serves
├── index.html               ← all screens (home, question, end, idle popup)
├── _headers                 ← Cloudflare cache headers
├── css/styles.css           ← styles; brand colors/fonts are tokens at the top
├── js/
│   ├── content.js           ← ✏️ ALL copy, questions, answers, info notes, image paths
│   ├── config.js            ← timings (idle 30s / 45s, zoom speed)
│   ├── idle.js              ← inactivity timer logic
│   └── app.js               ← game flow
└── assets/images/
    ├── home-background.svg  ← landing scene background
    ├── items/               ← item-N.svg, item-N-correct.svg, item-N-incorrect.svg
    └── end/qr-code.svg      ← QR code on the end screen
wrangler.jsonc               ← Cloudflare config
package.json                 ← npm scripts (dev / deploy)
```

### Swapping in real content

- **Copy & questions:** edit `public/js/content.js`. `correctIndex` is 0–3 (0 = first answer).
- **Images:** drop files into `public/assets/images/…` and update the paths in `content.js`. PNG, JPG, SVG and WebP all work.
- **Item placement on the home scene:** `position: { x, y }` in `content.js`, as % of the scene.
- **Colors/fonts:** the `:root` tokens at the top of `public/css/styles.css`.

## Run it locally

```bash
npm start
```

Then open http://localhost:5173. To test the idle popup quickly, use http://localhost:5173/?warn=5&reset=5 (seconds).

## Deploy to Cloudflare

The site deploys as a **Cloudflare Worker with static assets** (Cloudflare's recommended setup for new sites; `wrangler.jsonc` points it at `public/`). Once connected, every push to `main` deploys automatically and pull requests get preview URLs.

### One-time setup (Cloudflare dashboard)

1. Log in at https://dash.cloudflare.com → **Compute (Workers)** → **Workers & Pages** → **Create**.
2. Choose **Import a repository** → connect GitHub if prompted → select `tiffsetzler-calciumco/nutramigen_activations`.
3. Settings:
   - **Project name:** `nutramigen-activations` (must match `name` in `wrangler.jsonc`)
   - **Build command:** leave empty
   - **Deploy command:** `npx wrangler deploy`
   - **Production branch:** `main`
4. **Create and deploy.** You'll get a URL like `https://nutramigen-activations.<your-subdomain>.workers.dev`.

### Custom domain (optional)

Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**, e.g. `quiz.example.com`. The domain must be on Cloudflare DNS. Point the end-screen QR code wherever you need it — it's just an image.

### Deploying from your computer instead (optional)

```bash
npm install
```

```bash
npx wrangler login
```

```bash
npm run deploy
```
