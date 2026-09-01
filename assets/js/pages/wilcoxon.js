/* Wilcoxon signed-rank test page */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  var EXAMPLE = {
    pre: '12\n15\n11\n18\n14\n16\n13\n17\n10\n15',
    post: '17\n19\n16\n21\n18\n19\n17\n20\n16\n18'
  };

  PST.ready(function () {
    PST.bindCounter('pre', 'preCount');
    PST.bindCounter('post', 'postCount');
    PST.bindExample('exampleBtn', EXAMPLE);
    PST.bindClear('clearBtn', ['pre', 'post'], 'results');
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: 'Wilcoxon signed-rank test', filename: 'wilcoxon-results'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  function run() {
    var a = PST.parseNumbers(document.getElementById('pre').value);
    var b = PST.parseNumbers(document.getElementById('post').value);
    var errors = PST.validatePaired(a, b);
    if (errors.length) return PST.showErrors('results', 'verdict', errors);

    var opt = PST.readOptions();
    var res = S.wilcoxon(a.values, b.values, opt.alternative);
    if (res.error) return PST.showErrors('results', 'verdict', [res.error]);

    var sig = res.p <= opt.alpha;
    var direction = res.wPlus > res.wMinus ? 'improved' : (res.wPlus < res.wMinus ? 'declined' : 'none');
    var rLabel = S.effect.labelR(res.r);

    /* -------- verdict -------- */
    var extra = [];
    if (res.nEffective < 6 && opt.alternative === 'two-sided') {
      extra.push('<b>Power warning.</b> With ' + res.nEffective + ' usable pairs the smallest ' +
        'two-sided p-value the test can produce is ' +
        (2 / Math.pow(2, res.nEffective)).toFixed(4) +
        '. Significance is unreachable unless every single student moves in the same direction.');
    }
    var v = PST.effectivenessVerdict({
      significant: sig, p: res.p, alpha: opt.alpha, direction: direction,
      n: res.nEffective, design: 'single-group',
      effect: { name: 'r', value: PST.fixed(res.r, 2), label: rLabel + ' effect' },
      extra: extra
    });
    PST.renderVerdict('verdict', v.tone, v.title, v.paragraphs);

    /* -------- headline statistics -------- */
    PST.renderStats('statGrid', [
      { label: 'T statistic', value: PST.fmt(res.T, 1), key: true,
        note: 'smaller sum of signed ranks' },
      { label: 'p-value', value: S.formatP(res.p), key: true,
        note: res.exact ? 'exact' : 'normal approximation' },
      { label: 'Pairs used', value: String(res.nEffective),
        note: res.zeros ? res.zeros + ' zero change' + (res.zeros > 1 ? 's' : '') + ' excluded' : 'no zero changes' },
      { label: 'Effect size r', value: PST.fixed(res.r, 2), note: rLabel },
      { label: 'W⁺ / W⁻', value: PST.fmt(res.wPlus, 1) + ' / ' + PST.fmt(res.wMinus, 1), small: true,
        note: 'ranks of gains / losses' },
      { label: 'Median change', value: (res.medianDiff > 0 ? '+' : '') + PST.fmt(res.medianDiff, 2),
        note: 'post − pre' }
    ]);

    /* -------- caveats -------- */
    var warns = [];
    warns.push({
      tone: res.exact ? 'info' : 'warn',
      text: res.exact
        ? '<b>Exact p-value.</b> ' + res.method + ' — no approximation was used, which is what makes the result trustworthy at this sample size.'
        : '<b>Approximate p-value.</b> ' + res.method + '. Ties among the absolute differences prevent the exact enumeration.'
    });
    if (res.zeros) {
      warns.push({ tone: 'warn', text: '<b>' + res.zeros + ' student' + (res.zeros > 1 ? 's' : '') +
        ' showed no change at all</b> and were removed from the analysis, reducing the effective sample to ' +
        res.nEffective + '. A large number of zero changes usually means the instrument was not sensitive enough.' });
    }
    if (res.nEffective < 15) {
      warns.push({ tone: 'warn', text: '<b>Small sample.</b> With ' + res.nEffective +
        ' pairs the test detects only fairly large shifts. Report the effect size and the ' +
        'normalized gain alongside the p-value, and state the power limitation in your text.' });
    }
    warns.push({ tone: 'info', text: '<b>No control group in this design.</b> A significant result ' +
      'shows that scores rose, not that your methodology raised them.' });
    PST.renderWarnings('warnBox', warns);

    /* -------- chart -------- */
    PST.renderChart('chartBox', 'Individual change from pre-test to post-test',
      PST.chart.slope(a.values, b.values), [
        { color: 'var(--ok)', text: 'improved' },
        { color: 'var(--danger)', text: 'declined' },
        { color: 'var(--muted-2)', text: 'no change' },
        { color: 'var(--blue)', text: 'group mean' }
      ]);

    /* -------- per-student detail -------- */
    var nonZero = [], map = [];
    a.values.forEach(function (p, i) {
      var d = b.values[i] - p;
      if (d !== 0) { nonZero.push(Math.abs(d)); map.push(i); }
    });
    var rk = S.rank(nonZero);
    var rankOf = {};
    map.forEach(function (orig, j) { rankOf[orig] = rk.ranks[j]; });

    var rows = a.values.map(function (p, i) {
      var d = b.values[i] - p;
      return [
        'S' + (i + 1), PST.fmt(p, 2), PST.fmt(b.values[i], 2),
        (d > 0 ? '+' : '') + PST.fmt(d, 2),
        d === 0 ? '—' : PST.fmt(rankOf[i], 1),
        d > 0 ? 'gain' : (d < 0 ? 'loss' : 'no change')
      ];
    });
    var box = document.getElementById('detailBox');
    box.innerHTML = '<h3>Per-student detail</h3>';
    box.appendChild(PST.table(
      ['Student', 'Pre-test', 'Post-test', 'Change', 'Rank of |change|', 'Direction'],
      rows, { numCols: [1, 2, 3, 4] }));

    /* -------- how to report -------- */
    var stat = 'T = ' + PST.fmt(res.T, 1) + ', n = ' + res.nEffective +
      ', p ' + (res.p < 0.001 ? '< 0.001' : '= ' + S.formatP(res.p)) +
      ', r = ' + PST.fixed(res.r, 2);
    PST.renderInterpretation('interpBox',
      '<p>A sentence you can paste into your thesis:</p>' +
      '<p><em>"A Wilcoxon signed-rank test was used to compare pre-test and post-test scores ' +
      'for the ' + res.nEffective + ' students who completed both assessments. ' +
      (sig
        ? 'Scores ' + (direction === 'improved' ? 'increased' : 'decreased') + ' significantly (' + stat + '), '
        : 'The change did not reach significance (' + stat + '), ') +
      'with a ' + rLabel + ' effect size. The median change was ' +
      (res.medianDiff > 0 ? '+' : '') + PST.fmt(res.medianDiff, 2) + ' points."</em></p>' +
      '<p>Add the design limitation immediately afterwards: with a single group and no ' +
      'control, the change cannot be attributed to the methodology alone.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
