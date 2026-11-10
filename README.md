# nutramigen_activations

**Flip the Mobile**: the Nutramigen ELEVATE congress quiz. It's a mobile web game built with HTML, SCSS and JavaScript, and hosted on Cloudflare.

---

## 1. First-time setup (once per computer)

1. Install **Node.js 20 or newer** from https://nodejs.org (choose the LTS version). To check whether you already have it:

   ```bash
   node -v
   ```

2. Open Terminal and go to the project folder:

   ```bash
   cd /Users/tiff/nutramigen_activations
   ```

3. Install the project's tools (Sass and Cloudflare's Wrangler). They go into a `node_modules/` folder, which git ignores:

   ```bash
   npm install
   ```

---

## 2. Commands

Run all of these from the project folder.

| What you want to do | Command | What happens |
| --- | --- | --- |
| **Work on the game** | `npm run dev` | Builds the game, opens a local server at **http://localhost:5173**, and rebuilds every time you save a file in `src/`. Refresh the browser to see changes. Press **Ctrl + C** to stop. |
| **Build** | `npm run build` | Compiles SCSS → CSS and copies everything into `dist/`, which is the finished site. |
| **Package (zip)** | `npm run package` | Builds, then creates **`nutramigen-activations.zip`** of `dist/` to hand off or upload anywhere. |
| **Test like Cloudflare** | `npm run preview` | Builds and runs the site in Cloudflare's local runtime. |
| **Deploy from your computer** | `npm run deploy` | Builds and publishes to Cloudflare. Run `npx wrangler login` once first. You normally don't need this, because pushing to GitHub deploys automatically (see below). |

**Testing the idle popup:** add `?warn=5&reset=5` to the URL, e.g. http://localhost:5173/?warn=5&reset=5. That shortens the wait before the popup and the wait before the reset to 5 seconds each.

---

## 3. Saving and publishing your changes

Cloudflare deploys automatically every time `main` is pushed to GitHub.

```bash
git add -A
```

```bash
git commit -m "Describe what you changed"
```

```bash
git push origin main
```

If `git push` asks for a password, use a **GitHub personal access token**, not your GitHub password. Create one at GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens, with access to this repo and **Contents: Read and write**. Alternatively, install **GitHub Desktop** and push from there.

Check the build at dash.cloudflare.com → Workers & Pages → **nutramigen-activations** → Deployments.

---

## 4. File structure

You edit only what's in **`src/`**. `dist/` is generated, so never edit it.

```
src/
├── index.html                 ← all screens + idle popup
├── data/
│   ├── questions.json         ← ✏️ THE 5 QUESTIONS (answers, correct answer, statement, ornament images)
│   └── copy.json              ← ✏️ all other on-screen text (titles, buttons, end screen, idle popup)
├── img/                       ← ✏️ all images — add your own files/folders here
│   ├── backgrounds/           ←   attract.svg (Nutramigen mobile), mobile.svg (CMPA mobile)
│   ├── ornaments/             ←   before/after art for each ornament
│   └── end/                   ←   qr-code.svg
├── scss/                      ← ✏️ styles
│   ├── main.scss              ←   entry file: lists the partials below
│   ├── _variables.scss        ←   colors, fonts, sizes, so change the look here first
│   ├── _base.scss             ←   page reset, layout container
│   ├── _shared.scss           ←   headlines, "tap" prompt, Return-to-start bar
│   ├── _attract.scss          ←   screen 1: "Tap anywhere to begin"
│   ├── _home.scss             ←   screen 2: the mobile + ornaments
│   ├── _question.scss         ←   screen 3: progress bar, question card, results
│   ├── _end.scss              ←   screen 4: score + QR code
│   └── _modal.scss            ←   "Are you still there?" popup
├── js/
│   ├── app.js                 ← game logic
│   ├── idle.js                ← inactivity timer
│   └── config.js              ← timings: popup after 45s, reset 30s later, zoom speed
└── _headers                   ← Cloudflare cache settings
scripts/build.mjs              ← build / dev server (used by the npm commands)
wrangler.jsonc                 ← Cloudflare config (builds, then serves dist/)
package.json                   ← the npm commands above
```

---

## 5. Editing content

### The five questions: `src/data/questions.json`

Each question is one block:

```json
{
  "id": "milk",
  "label": "Milk carton ornament",
  "position": { "x": 50, "y": 50 },
  "before": "img/ornaments/milk-carton.svg",
  "after": "img/ornaments/ice-cream.svg",
  "question": "What is the most common food allergy among infants and children younger than age 3?",
  "answers": ["Cow’s milk protein allergy", "Answer B", "Answer C", "Answer D"],
  "correctIndex": 0,
  "info": "Only Nutramigen has been clinically shown to help babies…"
}
```

| Field | Meaning |
| --- | --- |
| `id` | Unique name; any short word |
| `label` | What screen readers announce for the ornament |
| `position` | Where the ornament hangs on the mobile: `x` = % from the left, `y` = % from the top |
| `before` | "Problem" ornament: shown on the mobile and on the question screen |
| `after` | "Flipped" ornament: shown after answering, in color if correct and automatically black & white if incorrect |
| `answers` | Exactly 4. The A–D letters are added automatically. |
| `correctIndex` | Which answer is right: **0 = A, 1 = B, 2 = C, 3 = D** |
| `info` | The statement shown under the result |
| *optional* `questionImage`, `correctImage`, `incorrectImage` | Use separate artwork instead of `before`/`after` |

JSON is strict: keep the double quotes, put commas between items, and don't add a comma after the last item. If the game shows a blank screen after an edit, paste the file into https://jsonlint.com to find the typo.

### Images: `src/img/`

- Drop files anywhere inside `src/img/`. You can create new folders too, e.g. `src/img/logos/`.
- Reference them **without** `src/`, e.g. `"img/logos/nutramigen.png"`.
- PNG, JPG, SVG and WebP all work. Use **transparent PNGs** for ornaments.
- To use an image in SCSS: `background-image: url("../img/your-file.png");`. The path starts with `../` because the compiled CSS lives in `css/`.

### Styles: `src/scss/`

- Change colors, fonts and sizes in **`_variables.scss`**, e.g. `$color-brand: #e8732a;`.
- Each screen has its own partial. Edit the one you need and save; `npm run dev` recompiles it instantly.
- To add a new partial, create `src/scss/_name.scss`, put `@use "variables" as *;` at the top, and add `@use "name";` to `main.scss`.

---

## 6. How the game works

Layout and flow follow the **Wireframe** page in the Figma file *Nutramigen_Activations*.

1. **Attract**: "Is your CMPA knowledge ahead of what comes next?" Tap anywhere to begin.
2. **Flip the Mobile**: 5 "problem" ornaments. Tap one and the scene zooms into it.
3. **Question**: the progress bar shows `#/5` on the left and `XX% Complete` on the right, with the ornament and a card holding the question and answers A–D.
4. **After answering**: the ornament flips, in color if correct and black & white if incorrect. The card shows *Your answer* and *Correct answer*, then the statement, then **Select another ornament →** (or **See my score →** on the last question).
5. **End**: "Congratulations! You have scored a X/5." with the QR code.
6. **Idle**: after 45s with no taps, an "Are you still there?" popup appears. If nobody answers within 30s, the game resets to the attract screen.

---

## 7. Cloudflare setup (already done; for reference)

The project is a **Cloudflare Worker** named `nutramigen-activations`, connected to this GitHub repo. On every push to `main`, Cloudflare:

1. runs `npm install`,
2. runs the deploy command `npx wrangler deploy`, which first runs `npm run build` (set in `wrangler.jsonc`),
3. publishes `dist/` to `https://nutramigen-activations.<account>.workers.dev`.

If a build fails, open the failed deployment → **View build log**. To add a custom domain, go to the Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**.
