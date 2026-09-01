/* Descriptive statistics and normality screening page */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  PST.ready(function () {
    PST.bindCounter('data', 'dataCount');
    PST.bindExample('exampleBtn', {
      data: '52\n61\n48\n55\n67\n44\n58\n50\n63\n47\n56\n60\n53\n59\n45'
    });
    PST.bindClear('clearBtn', ['data'], 'results');
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: 'Descriptive statistics', filename: 'descriptive-statistics'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  function run() {
    var parsed = PST.parseNumbers(document.getElementById('data').value);
    var errors = [];
    if (parsed.invalid.length) {
      errors.push('These entries could not be read as numbers: ' +
        parsed.invalid.slice(0, 6).join(', ') + '.');
    }
    if (parsed.count < 3) {
      errors.push('At least three values are needed. You entered ' + parsed.count + '.');
    }
    if (errors.length) return PST.showErrors('results', 'verdict', errors);

    var x = parsed.values;
    var scale = document.getElementById('scaleType').value;
    var conf = Number(document.getElementById('conf').value);
    var d = S.describe(x);
    var tc = S.tInv(1 - (1 - conf) / 2, d.n - 1);
    var ciLow = d.mean - tc * d.se, ciHigh = d.mean + tc * d.se;
    var norm = S.normalityScreen(x);

    /* -------- verdict -------- */
    var tone, title, paras = [];
    if (scale === 'ordinal') {
      tone = 'info';
      title = 'Ordinal data — report the median, not the mean';
      paras.push('You marked these values as ordinal (levels, ranks, rubric grades). For an ' +
        'ordinal scale the correct summary is the median with the first and third quartiles: ' +
        '<b>Mdn = ' + PST.fixed(d.median, 2) + '</b>, Q1–Q3 = ' + PST.fixed(d.q1, 2) + '–' +
        PST.fixed(d.q3, 2) + '. The mean is shown below for completeness, but the distance ' +
        'between "low" and "medium" is not the same quantity as between "medium" and "high", ' +
        'so averaging those codes is not meaningful.');
      paras.push('Use a rank-based test on data like these: the ' +
        '<a href="wilcoxon.html">Wilcoxon signed-rank test</a> for a pre/post design, or the ' +
        '<a href="mann-whitney.html">Mann–Whitney U test</a> for two groups.');
    } else if (norm.verdict === 'consistent') {
      tone = 'ok';
      title = 'Consistent with a normal distribution — parametric tests are admissible';
      paras.push('Standardised skewness (' + PST.fixed(norm.ratioA, 2) + ' against a limit of ' +
        PST.fixed(norm.critA, 2) + ') and standardised kurtosis (' + PST.fixed(norm.ratioE, 2) +
        ' against ' + PST.fixed(norm.critE, 2) + ') both stay within the critical bounds, so ' +
        'the <a href="paired-t.html">paired</a> or <a href="independent-t.html">independent ' +
        't-test</a> may be used on these data.');
      if (norm.weak) {
        paras.push('<b>But note the sample size.</b> With ' + norm.n + ' observations this ' +
          'screening has almost no power — it fails to reject almost anything. Treat the ' +
          'result as "normality was not contradicted", not as "normality was demonstrated", ' +
          'and prefer a rank-based test anyway.');
      }
    } else {
      tone = 'warn';
      title = 'Departure from normality — use a rank-based test';
      paras.push('Standardised skewness is ' + PST.fixed(norm.ratioA, 2) + ' (limit ' +
        PST.fixed(norm.critA, 2) + ') and standardised kurtosis ' + PST.fixed(norm.ratioE, 2) +
        ' (limit ' + PST.fixed(norm.critE, 2) + '). At least one exceeds the critical value, so ' +
        'the t-test is not appropriate here. Use the ' +
        '<a href="wilcoxon.html">Wilcoxon signed-rank test</a> or the ' +
        '<a href="mann-whitney.html">Mann–Whitney U test</a> instead — they make no ' +
        'distributional assumption and lose very little power.');
    }
    PST.renderVerdict('verdict', tone, title, paras);

    /* -------- statistics -------- */
    PST.renderStats('statGrid', [
      { label: 'n', value: String(d.n), key: true, note: 'observations' },
      { label: scale === 'ordinal' ? 'Median' : 'Mean',
        value: PST.fixed(scale === 'ordinal' ? d.median : d.mean, 2), key: true,
        note: scale === 'ordinal'
          ? 'Q1–Q3 ' + PST.fixed(d.q1, 2) + '–' + PST.fixed(d.q3, 2)
          : (conf * 100) + '% CI ' + PST.fixed(ciLow, 2) + ' – ' + PST.fixed(ciHigh, 2) },
      { label: 'Standard deviation', value: PST.fixed(d.sd, 3), note: 'SE = ' + PST.fixed(d.se, 3) },
      { label: 'Median', value: PST.fixed(d.median, 2),
        note: 'IQR = ' + PST.fixed(d.iqr, 2) },
      { label: 'Range', value: PST.fmt(d.min, 2) + ' – ' + PST.fmt(d.max, 2), small: true,
        note: 'span ' + PST.fixed(d.range, 2) },
      { label: 'Skewness', value: PST.fixed(d.skewness, 3),
        note: 'SE ' + PST.fixed(d.seSkewness, 3) + ' · standardised ' + PST.fixed(norm.ratioA, 2) },
      { label: 'Kurtosis', value: PST.fixed(d.kurtosis, 3),
        note: 'SE ' + PST.fixed(d.seKurtosis, 3) + ' · standardised ' + PST.fixed(norm.ratioE, 2) },
      { label: 'Coefficient of variation', value: PST.pct(d.cv, 1),
        note: d.cv > 0.33 ? 'heterogeneous group' : 'relatively homogeneous group' }
    ]);

    /* -------- caveats -------- */
    var warns = [];
    if (d.n < 8) {
      warns.push({ tone: 'warn', text: '<b>The normality screening is unreliable below n = 8.</b> ' +
        'It has too little power to reject anything, so a clean result is not evidence of ' +
        'normality. With a group this small, prefer rank-based tests regardless.' });
    }
    warns.push({ tone: 'info', text: '<b>The confidence interval is the honest headline.</b> ' +
      'The mean of ' + PST.fixed(d.mean, 2) + ' is your best estimate, but the data are ' +
      'consistent with a true group mean anywhere between ' + PST.fixed(ciLow, 2) + ' and ' +
      PST.fixed(ciHigh, 2) + '. A wide interval is not a flaw in the analysis — it is what a ' +
      'small sample honestly implies.' });
    if (d.cv > 0.33) {
      warns.push({ tone: 'warn', text: '<b>The group is heterogeneous</b> (coefficient of ' +
        'variation ' + PST.pct(d.cv, 1) + ', above the conventional 33% threshold). A single ' +
        'mean describes this group poorly; consider reporting subgroups or the full distribution.' });
    }
    var outliers = x.filter(function (v) {
      return v < d.q1 - 1.5 * d.iqr || v > d.q3 + 1.5 * d.iqr;
    });
    if (outliers.length) {
      warns.push({ tone: 'warn', text: '<b>' + outliers.length + ' possible outlier' +
        (outliers.length > 1 ? 's' : '') + ':</b> ' + outliers.map(function (v) {
          return PST.fmt(v, 2);
        }).join(', ') + ' (outside 1.5 × IQR from the quartiles). Check these for data-entry ' +
        'errors before anything else; if they are genuine, a rank-based test is far less ' +
        'affected by them than a t-test.' });
    }
    PST.renderWarnings('warnBox', warns);

    PST.renderChart('chartBox', 'Distribution of the values',
      PST.chart.histogram(x, { label: 'Histogram of the entered scores' }));

    /* -------- full table -------- */
    var box = document.getElementById('detailBox');
    box.innerHTML = '<h3>Full summary</h3>';
    box.appendChild(PST.table(['Statistic', 'Value', 'Note'], [
      ['n', String(d.n), 'number of observations'],
      ['Mean', PST.fixed(d.mean, 4), 'arithmetic average'],
      ['Standard deviation', PST.fixed(d.sd, 4), 'sample SD, n − 1 denominator'],
      ['Variance', PST.fixed(d.variance, 4), 'SD squared'],
      ['Standard error of the mean', PST.fixed(d.se, 4), 'SD ÷ √n'],
      [(conf * 100) + '% confidence interval',
        PST.fixed(ciLow, 4) + ' – ' + PST.fixed(ciHigh, 4), 'for the population mean'],
      ['Minimum', PST.fmt(d.min, 4), ''],
      ['First quartile Q1', PST.fixed(d.q1, 4), '25% of values lie below'],
      ['Median', PST.fixed(d.median, 4), 'the middle value'],
      ['Third quartile Q3', PST.fixed(d.q3, 4), '75% of values lie below'],
      ['Maximum', PST.fmt(d.max, 4), ''],
      ['Interquartile range', PST.fixed(d.iqr, 4), 'Q3 − Q1, spread of the middle half'],
      ['Skewness A', PST.fixed(d.skewness, 4), 'positive = a long right tail'],
      ['Kurtosis E', PST.fixed(d.kurtosis, 4), 'positive = peaked, negative = flat'],
      ['Critical values used', PST.fixed(norm.critA, 2) + ' / ' + PST.fixed(norm.critE, 2),
        'Pustylnik, tabulated for n = ' + norm.tableN]
    ], { numCols: [1] }));

    PST.renderInterpretation('interpBox',
      '<p>A sentence you can paste into your thesis:</p>' +
      (scale === 'ordinal'
        ? '<p><em>"Scores were measured on an ordinal scale (n = ' + d.n +
          '); the median was ' + PST.fixed(d.median, 2) + ' with an interquartile range of ' +
          PST.fixed(d.q1, 2) + '–' + PST.fixed(d.q3, 2) + '."</em></p>'
        : '<p><em>"Scores (n = ' + d.n + ') averaged ' + PST.fixed(d.mean, 2) +
          ' (SD = ' + PST.fixed(d.sd, 2) + '), ' + (conf * 100) + '% CI [' +
          PST.fixed(ciLow, 2) + ', ' + PST.fixed(ciHigh, 2) + '], with a median of ' +
          PST.fixed(d.median, 2) + ' and a range of ' + PST.fmt(d.min, 1) + ' to ' +
          PST.fmt(d.max, 1) + '."</em></p>') +
      '<p>Always give n alongside the summary. A mean without its sample size cannot be ' +
      'interpreted, and cannot be combined with anyone else\'s results.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
