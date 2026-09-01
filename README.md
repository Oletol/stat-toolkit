# Pedagogical Statistics Toolkit

A static website of statistical calculators for evaluating the effectiveness of a newly
designed course. Built for master's students who have to demonstrate that their teaching
methodology works — usually with one group, no control, and fewer than twenty students.

**Everything runs in the browser.** No server, no build step, no dependencies, no data
leaves the user's machine.

---

## What is in it

### Method finder (`index.html`)

A filter panel — what you are comparing, the measurement scale, the size of your groups,
what you need — narrows the catalogue to the methods that are actually admissible for that
combination, including the lower limits on sample size that usually decide the matter.

### Ten calculators (`methods/`)

| Page | Method | Design | Minimum n |
|---|---|---|---|
| `descriptives.html` | Descriptive statistics + normality screening | any | 3 |
| `sign-test.html` | Sign test (G), exact binomial | pre / post, one group | 5 |
| `wilcoxon.html` | Wilcoxon signed-rank test (T), exact for n ≤ 25 | pre / post, one group | 5 |
| `paired-t.html` | Paired-samples t-test + normality check | pre / post, one group | 7 |
| `mann-whitney.html` | Mann–Whitney U test, exact for n ≤ 20 | two groups | 3 + 5 |
| `independent-t.html` | Independent t-test (Student + Welch) + Levene | two groups | 15 |
| `fisher-phi.html` | Fisher's angular transformation φ* | proportions | 2 + 30 |
| `chi-square.html` | Pearson χ² + Yates + Fisher's exact | frequencies | expected ≥ 5 |
| `hake-gain.html` | Hake normalized gain ⟨g⟩ | pre / post, one group | any |
| `effect-size.html` | d, g, r, h, Cramér's V, odds ratio, all with CIs | any | 3 |

Each page carries a description of the method, its assumptions and limits, a data-entry
form that accepts a column pasted straight from a spreadsheet, the computed result with a
chart, and a plain-language interpretation that states whether the methodology can be
called effective — including the caveats that a single-group design forces on that claim.

### Four guides (`guides/`)

- **Study design & measurements** — how many measurement points a defensible claim needs.
- **Sample size & power** — reference tables plus an interactive power calculator.
- **Working with 5–7 students** — what still works at that size, what does not, and how to
  strengthen the evidence without recruiting anyone.
- **Pre-launch checklist** — 28 items to close before the first student enrols; ticks are
  stored in the visitor's own browser.

---

## Publishing on GitHub Pages

1. Create a repository and push the contents of this folder to it:

   ```bash
   git init
   git add .
   git commit -m "Pedagogical Statistics Toolkit"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```

2. In the repository, open **Settings → Pages**, set *Source* to **Deploy from a branch**,
   choose branch `main` and folder `/ (root)`, and save.

3. The site appears at `https://<user>.github.io/<repo>/` within a minute or two.

The `.nojekyll` file is included so GitHub serves the files as they are, without running
Jekyll over them. All internal links are relative, so the site also works from a
subdirectory, from a file share, or opened directly from disk.

To preview locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Structure

```
index.html                  Method finder
methods/*.html              Ten calculator pages
guides/*.html               Four guide pages
assets/css/style.css        The whole design system, light and dark themes
assets/js/stats.js          Statistics engine — distributions, tests, effect sizes
assets/js/ui.js             Shared UI: parsing, result rendering, SVG charts, export
assets/js/catalog.js        Method metadata used by the finder
assets/js/finder.js         The filter panel
assets/js/pages/*.js        One controller per page
tests/run.js                Verification harness (Node)
```

### The statistics engine

`assets/js/stats.js` is standalone and dependency-free. It implements the log-gamma,
incomplete gamma and incomplete beta functions, and from those the normal, Student *t*,
chi-square and *F* distributions; the exact null distributions of the Wilcoxon signed-rank
and Mann–Whitney statistics by dynamic programming; ranking with tie correction; the ten
tests; effect sizes with confidence intervals; power and sample-size formulas; and the
Pustylnik normality screening table.

It can also be used from Node:

```js
const S = require('./assets/js/stats.js');
S.wilcoxon([12, 15, 11], [17, 19, 16]);
```

### Verifying the calculations

```bash
node tests/run.js
```

The harness checks 54 values against references computed with SciPy — distribution
functions, every test statistic and p-value, exact distribution totals, effect sizes and
sample-size formulas. All agree to at least eight significant figures.

`tests/browser.js` additionally loads every page, runs every calculator with its example
data, checks for console errors and screenshots the result. It needs Playwright:

```bash
npm install playwright && npx playwright install chromium
node tests/browser.js
```

---

## Adding a method

1. Implement the test in `assets/js/stats.js` and add a case to `tests/run.js`.
2. Add an entry to `assets/js/catalog.js` so the finder knows about it.
3. Add a page controller in `assets/js/pages/`.
4. Add the page content to `build/methods.py` and run `python3 build/gen.py`.

The `build/` directory holds the small Python generator that produces the HTML from shared
templates, so that the header, navigation and footer stay identical across all fifteen
pages. The generated HTML is committed and is what GitHub Pages serves; the generator is
only needed if you want to change the shared chrome.

---

## Methodological basis

B. E. Starichenko, *Processing and Presenting Data from Pedagogical Research with a
Computer* (Ural State Pedagogical University, Yekaterinburg, 2004, 218 pp.) — the source of
the criteria, their applicability bounds and the critical-value tables.

Extended with material not covered in that textbook: exact small-sample distributions,
Welch's correction, Levene's test, Fisher's exact test, effect sizes with confidence
intervals (Cohen 1988; Hedges & Olkin 1985), power analysis, and Hake's normalized gain
(R. R. Hake, *American Journal of Physics* 66 (1998) 64–74).

---

## Browser support

Any current browser. No frameworks, no polyfills, no `localStorage` dependency for
functionality — the checklist uses it for convenience and degrades silently when it is
unavailable. Dark mode follows the operating system and can be overridden with the toggle
in the header.

---

## Licence

MIT. See `LICENSE`.

The calculators are a computational aid. They do not replace methodological judgement, and
a result they produce still has to be defended in the context of the study that generated
it.
