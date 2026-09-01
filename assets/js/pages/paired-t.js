/* Paired-samples t-test page */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  var EXAMPLE = {
    pre: '52\n61\n48\n55\n67\n44\n58\n50\n63\n47\n56\n60',
    post: '68\n72\n61\n70\n79\n58\n74\n65\n77\n60\n69\n75'
  };

  PST.ready(function () {
    PST.bindCounter('pre', 'preCount');
    PST.bindCounter('post', 'postCount');
    PST.bindExample('exampleBtn', EXAMPLE);
    PST.bindClear('clearBtn', ['pre', 'post'], 'results');
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: 'Paired-samples t-test', filename: 'paired-t-results'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  function run() {
    var a = PST.parseNumbers(document.getElementById('pre').value);
    var b = PST.parseNumbers(document.getElementById('post').value);
    var errors = PST.validatePaired(a, b);
    if (errors.length) return PST.showErrors('results', 'verdict', errors);
    if (a.count < 3) {
      return PST.showErrors('results', 'verdict',
        ['At least three pairs are needed to compute a t-test. You have ' + a.count + '.']);
    }

    var opt = PST.readOptions();
    var res = S.pairedT(a.values, b.values, opt.alternative);
    if (!isFinite(res.t)) {
      return PST.showErrors('results', 'verdict',
        ['Every student changed by exactly the same amount, so the standard deviation of the ' +
         'differences is zero and t cannot be computed. Use the sign test instead.']);
    }

    var sig = res.p <= opt.alpha;
    var direction = res.meanDiff > 0 ? 'improved' : (res.meanDiff < 0 ? 'declined' : 'none');
    var norm = S.normalityScreen(res.diffs);
    var gLabel = S.effect.labelD(res.g);

    var extra = [];
    if (norm.verdict === 'departure') {
      extra.push('<b>Assumption not met.</b> The differences depart from normality ' +
        '(standardised skewness ' + PST.fixed(norm.ratioA, 2) + ' against a limit of ' +
        PST.fixed(norm.critA, 2) + '; standardised kurtosis ' + PST.fixed(norm.ratioE, 2) +
        ' against ' + PST.fixed(norm.critE, 2) + '). Re-run the comparison with the ' +
        '<a href="wilcoxon.html">Wilcoxon signed-rank test</a> and report that result instead.');
    }

    var v = PST.effectivenessVerdict({
      significant: sig, p: res.p, alpha: opt.alpha, direction: direction,
      n: res.n, design: 'single-group',
      effect: { name: "Hedges' g", value: PST.fixed(res.g, 2), label: gLabel + ' effect' },
      extra: extra
    });
    PST.renderVerdict('verdict', v.tone, v.title, v.paragraphs);

    PST.renderStats('statGrid', [
      { label: 't statistic', value: PST.fixed(res.t, 3), key: true, note: 'df = ' + res.df },
      { label: 'p-value', value: S.formatP(res.p), key: true,
        note: opt.alternative === 'two-sided' ? 'two-sided' : 'one-sided' },
      { label: 'Mean change', value: (res.meanDiff > 0 ? '+' : '') + PST.fixed(res.meanDiff, 2),
        note: '95% CI ' + PST.fixed(res.ciLow, 2) + ' to ' + PST.fixed(res.ciHigh, 2) },
      { label: "Cohen's d", value: PST.fixed(res.d, 2), note: S.effect.labelD(res.d) + ' (uncorrected)' },
      { label: "Hedges' g", value: PST.fixed(res.g, 2), note: gLabel + ' (small-sample corrected)' },
      { label: 'Pre → post mean', value: PST.fixed(res.meanPre, 1) + ' → ' + PST.fixed(res.meanPost, 1),
        small: true, note: 'n = ' + res.n + ', SD of change ' + PST.fixed(res.sdDiff, 2) }
    ]);

    var warns = [];
    warns.push({
      tone: norm.verdict === 'consistent' ? 'info' : 'danger',
      text: '<b>Normality of the differences: ' +
        (norm.verdict === 'consistent' ? 'consistent with normal.' : 'departure detected.') +
        '</b> ' + norm.message +
        (norm.weak ? ' With only ' + norm.n + ' pairs this screening has very little power, ' +
          'so treat a clean result as weak evidence at best.' : '')
    });
    if (res.n < 15) {
      warns.push({ tone: 'warn', text: '<b>Small sample.</b> Below fifteen pairs the ' +
        '<a href="wilcoxon.html">Wilcoxon signed-rank test</a> is usually the safer choice: ' +
        'it makes no normality assumption and loses very little power.' });
    } else if (res.n < 30) {
      warns.push({ tone: 'warn', text: '<b>n = ' + res.n + '.</b> The t-test is defensible here ' +
        'provided the normality screening passed, but report the confidence interval prominently.' });
    }
    warns.push({ tone: 'info', text: '<b>Report the confidence interval, not just p.</b> The mean ' +
      'change is ' + PST.fixed(res.meanDiff, 2) + ' points, and the data are consistent with a ' +
      'true change anywhere between ' + PST.fixed(res.ciLow, 2) + ' and ' + PST.fixed(res.ciHigh, 2) + '.' });
    warns.push({ tone: 'info', text: '<b>No control group in this design.</b> A significant result ' +
      'shows that scores rose, not that your methodology raised them.' });
    PST.renderWarnings('warnBox', warns);

    PST.renderChart('chartBox', 'Individual change from pre-test to post-test',
      PST.chart.slope(a.values, b.values), [
        { color: 'var(--ok)', text: 'improved' },
        { color: 'var(--danger)', text: 'declined' },
        { color: 'var(--blue)', text: 'group mean' }
      ]);

    var d1 = S.describe(a.values), d2 = S.describe(b.values), dd = S.describe(res.diffs);
    var box = document.getElementById('detailBox');
    box.innerHTML = '<h3>Summary of each measurement</h3>';
    box.appendChild(PST.table(
      ['', 'n', 'Mean', 'SD', 'Median', 'Min', 'Max', '95% CI of the mean'],
      [
        ['Pre-test', d1.n, PST.fixed(d1.mean, 2), PST.fixed(d1.sd, 2), PST.fixed(d1.median, 2),
          PST.fmt(d1.min, 2), PST.fmt(d1.max, 2),
          PST.fixed(d1.ciLow, 2) + ' – ' + PST.fixed(d1.ciHigh, 2)],
        ['Post-test', d2.n, PST.fixed(d2.mean, 2), PST.fixed(d2.sd, 2), PST.fixed(d2.median, 2),
          PST.fmt(d2.min, 2), PST.fmt(d2.max, 2),
          PST.fixed(d2.ciLow, 2) + ' – ' + PST.fixed(d2.ciHigh, 2)],
        ['Change', dd.n, PST.fixed(dd.mean, 2), PST.fixed(dd.sd, 2), PST.fixed(dd.median, 2),
          PST.fmt(dd.min, 2), PST.fmt(dd.max, 2),
          PST.fixed(dd.ciLow, 2) + ' – ' + PST.fixed(dd.ciHigh, 2)]
      ], { numCols: [1, 2, 3, 4, 5, 6, 7] }));

    PST.renderInterpretation('interpBox',
      '<p>A sentence you can paste into your thesis:</p>' +
      '<p><em>"A paired-samples t-test compared pre-test and post-test scores for ' + res.n +
      ' students. Mean scores ' + (sig ? 'rose significantly' : 'changed') + ' from ' +
      PST.fixed(res.meanPre, 2) + ' (SD = ' + PST.fixed(d1.sd, 2) + ') to ' +
      PST.fixed(res.meanPost, 2) + ' (SD = ' + PST.fixed(d2.sd, 2) + '); ' +
      't(' + res.df + ') = ' + PST.fixed(res.t, 2) + ', p ' +
      (res.p < 0.001 ? '< 0.001' : '= ' + S.formatP(res.p)) +
      ', mean difference ' + PST.fixed(res.meanDiff, 2) + ', 95% CI [' +
      PST.fixed(res.ciLow, 2) + ', ' + PST.fixed(res.ciHigh, 2) + '], Hedges\' g = ' +
      PST.fixed(res.g, 2) + '."</em></p>' +
      '<p>State which test you had planned in advance. Running both the t-test and Wilcoxon ' +
      'and reporting the more favourable one is a methodological error that examiners look for.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
