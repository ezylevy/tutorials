# טרמינל המדריכים · Ezi Levy Tutorials

Live: https://ezylevy.github.io/tutorials/

Interactive Hebrew (RTL) step-by-step AI tutorials by Ezi Levy. Static site, no build step, deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

| Gate | Tutorial | Folder | Progress key (localStorage) |
|------|----------|--------|-----------------------------|
| 01 | הדרכון ל-Claude Code | `claude-code/` | `cc-passport-v1` → `stamps`, 9 |
| 02 | רישיון טיס ל-Copilot | `copilot/` | `ezi-copilot-license-v1` → `wings`, 10 |
| 03 | בית הספר לסוכנים (Claude Code למתקדמים) | `claude-agents/` | `ezi-cc-agents-v1` → `badges`, 10 |

## Adding a tutorial

1. Build it with the `tutorial-site-builder` skill directly in a new folder here, e.g. `gemini/` (its own `index.html` + `assets/`).
2. In its top bar nav add `<a href="../index.html">→ כל המדריכים</a>` and set its canonical to `https://ezylevy.github.io/tutorials/<folder>/`.
3. In the hub `index.html`:
   - copy a row in `#boardList` (next gate number, link, `data-key`, `data-field`, `data-total`);
   - copy a `.gate-card` (cover art, title, chips, `--accent` color, same `data-*`);
   - move the "בקרוב" row and card to the next gate number;
   - add it to the JSON-LD `ItemList`.
4. `git add . && git commit && git push` — Pages redeploys in about a minute.

Design: same tokens across hub and tutorials (night navy, gold/amber, paper, Karantina + Assistant + Amatic SC + JetBrains Mono). Each tutorial has its own metaphor and accent color.
