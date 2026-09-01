/* Independent-samples t-test page */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  var EXAMPLE = {
    g1: '74\n81\n68\n77\n85\n70\n79\n83\n72\n76\n88\n69\n80\n75\n82',
    g2: '65\n70\n61\n68\n72\n59\n66\n74\n63\n67\n71\n58\n69\n64\n66'
  };

  PST.ready(function () {
    PST.bindCounter('g1', 'g1Count');
    PST.bindCounter('g2', 'g2Count');
    PST.bindExample('exampleBtn', EXAMPLE);
    PST.bindClear('clearBtn', ['g1', 'g2'], 'results');
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: 'Independent-samples t-test', filename: 'independent-t-results'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  function run() {
    var a = PST.parseNumbers(document.getElementById('g1').value);
    var b = PST.parseNumbers(document.getElementById('g2').value);
    var errors = PST.validateGroups(a, b, 3);
    if (errors.length) return PST.showErrors('results', 'verdict', errors);

    var opt = PST.readOptions();
    var res = S.independentT(a.values, b.values, opt.alternative);
    if (!isFinite(res.welch.t)) {
      return PST.showErrors('results', 'verdict',
        ['Both groups have zero variance, so a t-test cannot be computed.']);
    }

    var unequalVar = res.levene.p <= 0.05;
    var chosen = unequalVar ? res.welch : res.welch;   // Welch is reported either way
    var sig = chosen.p <= opt.alpha;
    var direction = res.diff > 0 ? 'improved' : (res.diff < 0 ? 'declined' : 'none');
    var gLabel = S.effect.labelD(res.g);

    var n1 = res.n1, n2 = res.n2;
    var normA = S.normalityScreen(a.values), normB = S.normalityScreen(b.values);

    var extra = [];
    if (normA.verdict === 'departure' || normB.verdict === 'departure') {
      extra.push('<b>Assumption not met.</b> ' +
        (normA.verdict === 'departure' ? 'The experimental group ' : 'The control group ') +
        'departs from normality. Re-run the comparison with the ' +
        '<a href="mann-whitney.html">Mann–Whitney U test</a> and report that result instead.');
    }
    var detectable = S.sampleSize.detectableIndependent(Math.min(n1, n2), opt.alpha, 0.8);
    if (!sig) {
      extra.push('At ' + Math.min(n1, n2) + ' students per group this study has 80% power to ' +
        'detect effects of about d = ' + PST.fixed(detectable, 2) + ' and larger. Anything ' +
        'smaller than that would very likely have gone undetected, whether or not it exists.');
    }

    var v = PST.effectivenessVerdict({
      significant: sig, p: chosen.p, alpha: opt.alpha,
      direction: sig ? direction : 'none',
      n: n1 + n2, design: 'two-group',
      effect: { name: "Hedges' g", value: PST.fixed(res.g, 2), label: gLabel + ' effect' },
      extra: extra
    });
    if (sig && direction === 'improved') v.title = 'The experimental group scored significantly higher';
    if (sig && direction === 'declined') v.title = 'The control group scored significantly higher';
    PST.renderVerdict('verdict', v.tone, v.title, v.paragraphs);

    PST.renderStats('statGrid', [
      { label: "Welch's t", value: PST.fixed(res.welch.t, 3), key: true,
        note: 'df = ' + PST.fixed(res.welch.df, 1) },
      { label: 'p-value (Welch)', value: S.formatP(res.welch.p), key: true,
        note: 'recommended by default' },
      { label: 'Difference of means', value: (res.diff > 0 ? '+' : '') + PST.fixed(res.diff, 2),
        note: '95% CI ' + PST.fixed(res.welch.ciLow, 2) + ' to ' + PST.fixed(res.welch.ciHigh, 2) },
      { label: "Cohen's d", value: PST.fixed(res.d, 2),
        note: '95% CI ' + PST.fixed(res.dCiLow, 2) + ' to ' + PST.fixed(res.dCiHigh, 2) },
      { label: "Hedges' g", value: PST.fixed(res.g, 2), note: gLabel + ' (small-sample corrected)' },
      { label: "Student's t", value: PST.fixed(res.student.t, 3), small: true,
        note: 'df = ' + res.student.df + ', p = ' + S.formatP(res.student.p) },
      { label: "Levene's test", value: 'p = ' + S.formatP(res.levene.p), small: true,
        note: unequalVar ? 'variances differ — use Welch' : 'variances comparable' }
    ]);

    var warns = [];
    warns.push({
      tone: unequalVar ? 'warn' : 'info',
      text: unequalVar
        ? "<b>The two groups have unequal variances</b> (Levene's test p = " + S.formatP(res.levene.p) +
          "). Welch's version is the only defensible one here; ignore Student's t above."
        : "<b>Variances are comparable</b> (Levene's test p = " + S.formatP(res.levene.p) +
          "), so Student's and Welch's versions agree closely. Welch's is reported as the headline result."
    });
    warns.push({
      tone: (normA.verdict === 'consistent' && normB.verdict === 'consistent') ? 'info' : 'danger',
      text: '<b>Normality screening.</b> Experimental group: ' +
        (normA.verdict === 'consistent' ? 'consistent with normal' : 'departs from normal') +
        '. Control group: ' +
        (normB.verdict === 'consistent' ? 'consistent with normal' : 'departs from normal') + '.' +
        ((normA.weak || normB.weak) ? ' With fewer than eight students the screening has almost no power.' : '')
    });
    if (Math.min(n1, n2) < 15) {
      warns.push({ tone: 'warn', text: '<b>Below the recommended group size.</b> With ' +
        Math.min(n1, n2) + ' students in the smaller group, the ' +
        '<a href="mann-whitney.html">Mann–Whitney U test</a> is generally the safer choice.' });
    }
    warns.push({ tone: 'info', text: '<b>Power.</b> To detect a medium effect (d = 0.5) at 80% ' +
      'power you would need 64 students per group; you have ' + n1 + ' and ' + n2 + '. See the ' +
      '<a href="../guides/sample-size.html">sample size guide</a>.' });
    PST.renderWarnings('warnBox', warns);

    var d1 = S.describe(a.values), d2 = S.describe(b.values);
    PST.renderChart('chartBox', 'Group means with 95% confidence intervals',
      PST.chart.meansCi([
        { label: 'Experimental', mean: d1.mean, low: d1.ciLow, high: d1.ciHigh, color: 'var(--blue)' },
        { label: 'Control', mean: d2.mean, low: d2.ciLow, high: d2.ciHigh, color: 'var(--ok)' }
      ]), [{ color: 'var(--blue)', text: 'experimental' }, { color: 'var(--ok)', text: 'control' }]);

    var box = document.getElementById('detailBox');
    box.innerHTML = '<h3>Group summaries</h3>';
    box.appendChild(PST.table(
      ['Group', 'n', 'Mean', 'SD', 'SE', '95% CI of the mean', 'Median', 'Min – Max'],
      [
        ['Experimental', d1.n, PST.fixed(d1.mean, 2), PST.fixed(d1.sd, 2), PST.fixed(d1.se, 2),
          PST.fixed(d1.ciLow, 2) + ' – ' + PST.fixed(d1.ciHigh, 2), PST.fixed(d1.median, 2),
          PST.fmt(d1.min, 1) + ' – ' + PST.fmt(d1.max, 1)],
        ['Control', d2.n, PST.fixed(d2.mean, 2), PST.fixed(d2.sd, 2), PST.fixed(d2.se, 2),
          PST.fixed(d2.ciLow, 2) + ' – ' + PST.fixed(d2.ciHigh, 2), PST.fixed(d2.median, 2),
          PST.fmt(d2.min, 1) + ' – ' + PST.fmt(d2.max, 1)]
      ], { numCols: [1, 2, 3, 4, 5, 6, 7] }));

    PST.renderInterpretation('interpBox',
      '<p>A sentence you can paste into your thesis:</p>' +
      '<p><em>"An independent-samples t-test with Welch\'s correction compared post-test ' +
      'scores in the experimental group (n = ' + n1 + ', M = ' + PST.fixed(d1.mean, 2) +
      ', SD = ' + PST.fixed(d1.sd, 2) + ') and the control group (n = ' + n2 + ', M = ' +
      PST.fixed(d2.mean, 2) + ', SD = ' + PST.fixed(d2.sd, 2) + '). ' +
      (sig ? 'The difference was statistically significant' : 'The difference did not reach significance') +
      ': t(' + PST.fixed(res.welch.df, 1) + ') = ' + PST.fixed(res.welch.t, 2) + ', p ' +
      (res.welch.p < 0.001 ? '< 0.001' : '= ' + S.formatP(res.welch.p)) +
      ', mean difference ' + PST.fixed(res.diff, 2) + ', 95% CI [' +
      PST.fixed(res.welch.ciLow, 2) + ', ' + PST.fixed(res.welch.ciHigh, 2) +
      '], Hedges\' g = ' + PST.fixed(res.g, 2) + '."</em></p>' +
      '<p>Report how the two groups were formed and confirm that they were equivalent on the ' +
      'pre-test. Without that, a post-test difference may simply be a starting difference that ' +
      'never went away.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
