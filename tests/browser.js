/* End-to-end check: loads every page, runs each calculator, screenshots the result. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(ROOT, 'tests', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const METHODS = ['descriptives', 'sign-test', 'wilcoxon', 'paired-t', 'mann-whitney',
  'independent-t', 'fisher-phi', 'chi-square', 'hake-gain', 'effect-size'];
const GUIDES = ['study-design', 'sample-size', 'small-samples', 'checklist'];

(async () => {
  const EXE = process.env.PW_CHROME || undefined;  // set PW_CHROME to use a preinstalled Chromium
const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
  let problems = [];

  async function open(url, name) {
    const page = await browser.newPage({ viewport: { width: 1360, height: 1000 } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);
    return { page, errors, name };
  }

  function report(ctx, extra) {
    const real = ctx.errors.filter(e => !/favicon|fonts\.g|net::ERR_/i.test(e));
    if (real.length) { problems.push(ctx.name + ': ' + real.join(' | ')); }
    if (extra) problems.push(ctx.name + ': ' + extra);
  }

  // ---- home page ----
  {
    const ctx = await open('file://' + path.join(ROOT, 'index.html'), 'index');
    const cards = await ctx.page.$$eval('.method-card', n => n.length);
    if (cards < 10) report(ctx, 'expected 10 method cards, found ' + cards);
    // apply a filter
    await ctx.page.check('#f-design-paired');
    await ctx.page.check('#f-scale-ordinal');
    await ctx.page.waitForTimeout(150);
    const filtered = await ctx.page.$$eval('#methodList .method-card', n => n.length);
    if (filtered === 0 || filtered >= 10) report(ctx, 'filter did not narrow the list: ' + filtered);
    const count = await ctx.page.textContent('#resultCount');
    console.log('index: ' + cards + ' cards total, filter -> ' + filtered + ' (' + count.trim() + ')');
    await ctx.page.uncheck('#f-design-paired');
    await ctx.page.uncheck('#f-scale-ordinal');
    await ctx.page.waitForTimeout(120);
    await ctx.page.screenshot({ path: path.join(SHOTS, '00-index.png'), fullPage: false });
    report(ctx);
    await ctx.page.close();
  }

  // ---- method pages ----
  for (let i = 0; i < METHODS.length; i++) {
    const id = METHODS[i];
    const ctx = await open('file://' + path.join(ROOT, 'methods', id + '.html'), id);
    await ctx.page.click('#exampleBtn');
    await ctx.page.waitForTimeout(120);
    await ctx.page.click('#calcBtn');
    await ctx.page.waitForTimeout(400);

    const visible = await ctx.page.$eval('#results', n => !n.hidden);
    if (!visible) report(ctx, 'results stayed hidden');
    const verdict = (await ctx.page.textContent('#verdict')).trim();
    const stats = await ctx.page.$$eval('#statGrid .stat', n => n.length);
    const tone = await ctx.page.$eval('#verdict', n => n.className);
    if (!verdict) report(ctx, 'empty verdict');
    if (tone.indexOf('is-none') >= 0) report(ctx, 'error verdict: ' + verdict.slice(0, 160));
    if (stats === 0) report(ctx, 'no statistics rendered');
    const dash = await ctx.page.$$eval('#statGrid .v', n => n.filter(e => e.textContent.trim() === 'NaN').length);
    if (dash) report(ctx, dash + ' NaN values in the statistics grid');

    console.log(String(i + 1).padStart(2) + '. ' + id.padEnd(15) +
      ' stats=' + String(stats).padStart(2) + '  ' + verdict.split('\n')[0].slice(0, 70));

    await ctx.page.screenshot({ path: path.join(SHOTS, String(i + 1).padStart(2, '0') + '-' + id + '.png'), fullPage: true });
    report(ctx);
    await ctx.page.close();
  }

  // ---- guides ----
  for (const g of GUIDES) {
    const ctx = await open('file://' + path.join(ROOT, 'guides', g + '.html'), g);
    if (g === 'sample-size') {
      await ctx.page.fill('#d', '0.8');
      await ctx.page.fill('#haveN', '6');
      await ctx.page.waitForTimeout(200);
      const n = await ctx.page.$$eval('#ssResults .stat', x => x.length);
      if (n < 4) report(ctx, 'sample size calculator produced ' + n + ' tiles');
      const note = await ctx.page.textContent('#powerNote');
      console.log('sample-size: ' + n + ' tiles, note = ' + note.trim().slice(0, 60));
    }
    if (g === 'checklist') {
      const boxes = await ctx.page.$$eval('#checklist input[type=checkbox]', x => x.length);
      await ctx.page.check('#ck1'); await ctx.page.check('#ck2');
      await ctx.page.waitForTimeout(150);
      const txt = await ctx.page.textContent('#ckCount');
      if (boxes !== 28) report(ctx, 'expected 28 checklist items, found ' + boxes);
      console.log('checklist: ' + boxes + ' items, ' + txt.trim());
    }
    await ctx.page.screenshot({ path: path.join(SHOTS, 'g-' + g + '.png'), fullPage: true });
    report(ctx);
    await ctx.page.close();
  }

  // ---- dark theme spot check ----
  {
    const ctx = await open('file://' + path.join(ROOT, 'methods', 'wilcoxon.html'), 'dark');
    await ctx.page.click('.theme-toggle');
    await ctx.page.click('#exampleBtn');
    await ctx.page.click('#calcBtn');
    await ctx.page.waitForTimeout(400);
    await ctx.page.screenshot({ path: path.join(SHOTS, 'z-dark.png'), fullPage: false });
    report(ctx);
    await ctx.page.close();
  }

  await browser.close();
  console.log('\n' + (problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'No problems found.'));
  process.exit(problems.length ? 1 : 0);
})();
