/* Mann–Whitney U test page */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  var EXAMPLE = {
    g1: '18\n22\n25\n19\n24\n27\n21\n23\n26\n20',
    g2: '14\n16\n20\n13\n17\n15\n19\n12\n18\n16'
  };

  PST.ready(function () {
    PST.bindCounter('g1', 'g1Count');
    PST.bindCounter('g2', 'g2Count');
    PST.bindExample('exampleBtn', EXAMPLE);
    PST.bindClear('clearBtn', ['g1', 'g2'], 'results');
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: 'Mann–Whitney U test', filename: 'mann-whitney-results'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  function run() {
    var a = PST.parseNumbers(document.getElementById('g1').value);
    var b = PST.parseNumbers(document.getElementById('g2').value);
    var errors = PST.validateGroups(a, b, 3);
    if (errors.length) return PST.showErrors('results', 'verdict', errors);

    var opt = PST.readOptions();
    var res = S.mannWhitney(a.values, b.values, opt.alternative);
    var sig = res.p <= opt.alpha;
    var direction = res.meanRank1 > res.meanRank2 ? 'improved'
      : (res.meanRank1 < res.meanRank2 ? 'declined' : 'none');
    var rLabel = S.effect.labelR(res.r);

    var extra = [];
    var n1 = res.n1, n2 = res.n2, lo = Math.min(n1, n2), hi = Math.max(n1, n2);
    var reachable = !((lo === 3 && hi < 5) || lo < 3);
    if (opt.alternative === 'two-sided' && !reachable) {
      extra.push('<b>The test cannot reach significance at these group sizes.</b> With ' +
        n1 + ' and ' + n2 + ' students, no arrangement of the data produces a two-sided ' +
        'p-value below 0.05. Two-sided significance first becomes attainable at n₁ = 3 with ' +
        'n₂ ≥ 5, or with four students in each group.');
    }
    if (direction === 'improved') {
      extra.push('The rank-biserial correlation of ' + PST.fixed(Math.abs(res.rbc), 2) +
        ' means that a randomly chosen student from the first group outscores a randomly ' +
        'chosen student from the second in about ' +
        Math.round((Math.abs(res.rbc) + 1) / 2 * 100) + '% of comparisons.');
    }

    var v = PST.effectivenessVerdict({
      significant: sig, p: res.p, alpha: opt.alpha,
      direction: sig ? (direction === 'improved' ? 'improved' : 'declined') : 'none',
      n: n1 + n2, design: 'two-group',
      effect: { name: 'r', value: PST.fixed(res.r, 2), label: rLabel + ' effect' },
      extra: extra
    });
    if (sig && direction === 'improved') {
      v.title = 'The experimental group scored significantly higher';
    } else if (sig && direction === 'declined') {
      v.title = 'The control group scored significantly higher';
    }
    PST.renderVerdict('verdict', v.tone, v.title, v.paragraphs);

    PST.renderStats('statGrid', [
      { label: 'U statistic', value: PST.fmt(res.U, 1), key: true, note: 'smaller of U₁ and U₂' },
      { label: 'p-value', value: S.formatP(res.p), key: true,
        note: res.exact ? 'exact' : 'normal approximation' },
      { label: 'Group sizes', value: n1 + ' vs ' + n2, small: true, note: 'experimental vs control' },
      { label: 'Medians', value: PST.fmt(res.median1, 1) + ' vs ' + PST.fmt(res.median2, 1),
        small: true, note: 'experimental vs control' },
      { label: 'Mean ranks', value: PST.fixed(res.meanRank1, 1) + ' vs ' + PST.fixed(res.meanRank2, 1),
        small: true, note: 'higher rank = higher scores' },
      { label: 'Effect size r', value: PST.fixed(res.r, 2), note: rLabel },
      { label: 'Rank-biserial', value: PST.fixed(res.rbc, 2), note: 'probability of superiority' }
    ]);

    var warns = [];
    warns.push({
      tone: res.exact ? 'info' : 'warn',
      text: res.exact
        ? '<b>Exact p-value.</b> ' + res.method + '.'
        : '<b>Approximate p-value.</b> ' + res.method + '.'
    });
    if (Math.min(n1, n2) < 15) {
      warns.push({ tone: 'warn', text: '<b>Small groups.</b> With ' + Math.min(n1, n2) +
        ' students in the smaller group the test detects only large differences. Report the ' +
        'effect size with the p-value, and state the power limitation.' });
    }
    warns.push({ tone: 'info', text: '<b>Check the starting point.</b> If the groups were not ' +
      'formed at random, run this same test on the <em>pre-test</em> data. A non-significant ' +
      'result there is what licenses comparing the post-test scores.' });
    PST.renderWarnings('warnBox', warns);

    PST.renderChart('chartBox', 'Individual scores in each group',
      PST.chart.strip([a.values, b.values], ['Experimental', 'Control']), [
        { color: 'var(--blue)', text: 'experimental group' },
        { color: 'var(--ok)', text: 'control group' }
      ]);

    var d1 = S.describe(a.values), d2 = S.describe(b.values);
    var box = document.getElementById('detailBox');
    box.innerHTML = '<h3>Group summaries</h3>';
    box.appendChild(PST.table(
      ['Group', 'n', 'Median', 'Q1 – Q3', 'Mean', 'SD', 'Min – Max', 'Mean rank'],
      [
        ['Experimental', d1.n, PST.fixed(d1.median, 2),
          PST.fixed(d1.q1, 1) + ' – ' + PST.fixed(d1.q3, 1),
          PST.fixed(d1.mean, 2), PST.fixed(d1.sd, 2),
          PST.fmt(d1.min, 1) + ' – ' + PST.fmt(d1.max, 1), PST.fixed(res.meanRank1, 1)],
        ['Control', d2.n, PST.fixed(d2.median, 2),
          PST.fixed(d2.q1, 1) + ' – ' + PST.fixed(d2.q3, 1),
          PST.fixed(d2.mean, 2), PST.fixed(d2.sd, 2),
          PST.fmt(d2.min, 1) + ' – ' + PST.fmt(d2.max, 1), PST.fixed(res.meanRank2, 1)]
      ], { numCols: [1, 2, 3, 4, 5, 6, 7] }));

    PST.renderInterpretation('interpBox',
      '<p>A sentence you can paste into your thesis:</p>' +
      '<p><em>"A Mann–Whitney U test compared post-test scores in the experimental group ' +
      '(n = ' + n1 + ', Mdn = ' + PST.fmt(res.median1, 1) + ') and the control group ' +
      '(n = ' + n2 + ', Mdn = ' + PST.fmt(res.median2, 1) + '). ' +
      (sig ? 'The difference was statistically significant' : 'The difference did not reach significance') +
      ': U = ' + PST.fmt(res.U, 1) + ', p ' +
      (res.p < 0.001 ? '< 0.001' : '= ' + S.formatP(res.p)) + ', r = ' + PST.fixed(res.r, 2) + '."</em></p>' +
      '<p>Because this design has a control group, a significant result <em>can</em> be ' +
      'attributed to the methodology — provided the groups were equivalent at the start and ' +
      'differed only in how they were taught. State how the groups were formed.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
