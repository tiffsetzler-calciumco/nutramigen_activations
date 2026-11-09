# nutramigen_activations

Nutramigen mobile quiz game. Plain HTML/CSS/JavaScript — no build step — deployed to Cloudflare.

## How the game works

Layout and flow follow the **Wireframe** page in Figma (Nutramigen_Activations).

1. **Attract**: "Is your CMPA knowledge ahead of what comes next?" Tap anywhere to begin.
2. **Flip the Mobile**: a mobile with 5 "problem" ornaments. Tap one and the scene zooms into it.
3. **Question**: progress bar (`#/5` left, `XX% Complete` right), the ornament, and a card with the question and answers A–D.
4. **After answering**: the ornament flips to its "after" version, in color if correct and black & white if incorrect. The card shows *Your answer* | *Correct answer*, a "Your answer is correct/incorrect!" note with the Nutramigen statement, then **Select another ornament →** (or **See my score →** on the last one). Answered ornaments stay flipped on the mobile.
5. **End**: "Congratulations! You have scored a X/5." with the QR code and share copy.
6. **Idle**: after 45s with no taps a "still there?" popup appears. Ignore it for 30s and the game resets to the attract screen. A "Return to start" bar sits at the bottom of every screen.

## File structure

```
public/                        ← everything Cloudflare serves
├── index.html                 ← all screens + idle popup
├── _headers                   ← Cloudflare cache headers
├── css/styles.css             ← styles; colors/fonts are tokens at the top
├── js/
│   ├── content.js             ← ✏️ ALL copy, questions, answers, statements, image paths
│   ├── config.js              ← timings (idle 45s / 30s, zoom speed)
│   ├── idle.js                ← inactivity timer
│   └── app.js                 ← game flow
└── assets/images/
    ├── backgrounds/           ← attract.svg (Nutramigen mobile), mobile.svg (CMPA mobile)
    ├── ornaments/             ← before/after art per ornament (milk-carton → ice-cream, etc.)
    └── end/qr-code.svg        ← QR code on the end screen
wrangler.jsonc                 ← Cloudflare config
package.json                   ← npm scripts (start / dev / deploy)
```

### Swapping in real content

- **Copy & questions:** edit `public/js/content.js`. `correctIndex` is 0–3 (0 = A).
- **Ornament art:** each ornament needs a `before` image and an `after` image, ideally transparent PNGs cut out from the Figma renders. The black-and-white incorrect version is made automatically. To use a separate image instead, set `incorrectImage`.
- **Backgrounds:** replace the files in `assets/images/backgrounds/`. Nudge each ornament's `position` in `content.js` so it lines up with its string.
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
