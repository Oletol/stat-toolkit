/* Hake normalized gain page */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  PST.ready(function () {
    PST.bindCounter('pre', 'preCount');
    PST.bindCounter('post', 'postCount');
    PST.bindExample('exampleBtn', {
      pre: '32\n45\n28\n51\n38\n42\n35\n48',
      post: '68\n74\n61\n79\n70\n72\n66\n77',
      maxScore: '100'
    });
    PST.bindClear('clearBtn', ['pre', 'post'], 'results');
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: 'Hake normalized gain', filename: 'normalized-gain-results'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  var BANDS = {
    high: { tone: 'ok', word: 'high' },
    medium: { tone: 'ok', word: 'medium' },
    low: { tone: 'warn', word: 'low' },
    negative: { tone: 'none', word: 'negative' },
    undefined: { tone: 'warn', word: 'undefined' }
  };

  function run() {
    var a = PST.parseNumbers(document.getElementById('pre').value);
    var b = PST.parseNumbers(document.getElementById('post').value);
    var maxScore = Number(document.getElementById('maxScore').value);
    var errors = PST.validatePaired(a, b);
    if (isNaN(maxScore) || maxScore <= 0) {
      errors.push('Enter the maximum possible score — use 100 if the data are percentages.');
    }
    if (!errors.length) {
      var over = a.values.concat(b.values).filter(function (v) { return v > maxScore; });
      if (over.length) {
        errors.push(over.length + ' score' + (over.length > 1 ? 's exceed' : ' exceeds') +
          ' the maximum of ' + maxScore + ' (largest: ' + Math.max.apply(null, over) +
          '). Check the maximum, or check the data.');
      }
      var neg = a.values.concat(b.values).filter(function (v) { return v < 0; });
      if (neg.length) errors.push('Scores cannot be negative.');
    }
    if (errors.length) return PST.showErrors('results', 'verdict', errors);

    var res = S.hakeGain(a.values, b.values, maxScore);
    var band = BANDS[res.classBand] || BANDS.undefined;

    var paras = [];
    paras.push('The class-average normalized gain is <b>⟨g⟩ = ' + PST.fixed(res.classGain, 3) +
      '</b>, which falls in the <b>' + band.word + '</b> band. The course captured ' +
      PST.pct(Math.max(0, Math.min(1, res.classGain)), 0) + ' of the improvement that was ' +
      'available to these students: mean scores moved from ' + PST.fixed(res.prePct, 1) +
      '% to ' + PST.fixed(res.postPct, 1) + '%, out of a possible ' +
      PST.fixed(100 - res.prePct, 1) + ' percentage points of headroom.');
    paras.push('The average of the individual gains is <b>' +
      PST.fixed(res.avgIndividualGain, 3) + '</b> (' + (BANDS[res.avgBand] || BANDS.undefined).word +
      ' band). Where this differs noticeably from the class average, the group is ' +
      'heterogeneous and both figures should be reported.');
    paras.push('<b>This is not a significance test.</b> The normalized gain measures how much ' +
      'the course achieved; it says nothing about whether the result could have arisen by ' +
      'chance. Pair it with the <a href="wilcoxon.html">Wilcoxon signed-rank test</a> — ' +
      'that combination is exactly what a small-sample study needs.');

    PST.renderVerdict('verdict', band.tone,
      'Normalized gain: ' + band.word + ' (⟨g⟩ = ' + PST.fixed(res.classGain, 2) + ')', paras);

    PST.renderStats('statGrid', [
      { label: 'Class-average gain ⟨g⟩', value: PST.fixed(res.classGain, 3), key: true,
        note: band.word + ' · from the group means' },
      { label: 'Average individual gain', value: PST.fixed(res.avgIndividualGain, 3), key: true,
        note: (BANDS[res.avgBand] || BANDS.undefined).word + ' · mean of each student\'s g' },
      { label: 'Mean pre-test', value: PST.fixed(res.meanPre, 2),
        note: PST.fixed(res.prePct, 1) + '% of maximum' },
      { label: 'Mean post-test', value: PST.fixed(res.meanPost, 2),
        note: PST.fixed(res.postPct, 1) + '% of maximum' },
      { label: 'Students', value: String(res.n),
        note: res.ceilingCount ? res.ceilingCount + ' at the ceiling, excluded' : 'all scored' },
      { label: 'SD of individual gains', value: PST.fixed(res.sdIndividual, 3),
        note: 'spread across students' }
    ]);

    var warns = [];
    if (res.ceilingCount) {
      warns.push({ tone: 'warn', text: '<b>' + res.ceilingCount + ' student' +
        (res.ceilingCount > 1 ? 's' : '') + ' already scored the maximum on the pre-test</b> and ' +
        'therefore had no room to gain. Their normalized gain is undefined and they are excluded ' +
        'from the individual average. If several students hit the ceiling, the instrument was ' +
        'too easy to measure what the course did.' });
    }
    if (res.counts.negative) {
      warns.push({ tone: 'danger', text: '<b>' + res.counts.negative + ' student' +
        (res.counts.negative > 1 ? 's' : '') + ' scored lower after the course.</b> Check for ' +
        'scoring errors, a harder post-test, or a mismatch between what was taught and what was ' +
        'tested before interpreting the group average.' });
    }
    warns.push({ tone: 'info', text: '<b>The bands come from Hake\'s original study</b> of more ' +
      'than 6 000 physics students: below 0.3 is low, 0.3 to 0.7 medium, above 0.7 high. They ' +
      'are conventions for comparison, not thresholds of statistical significance.' });
    warns.push({ tone: 'info', text: '<b>Why this measure and not raw gain.</b> A ten-point rise ' +
      'from 20% is a different achievement from a ten-point rise from 85%. Normalizing by the ' +
      'available headroom makes cohorts with different starting levels comparable — including ' +
      'your own successive cohorts.' });
    PST.renderWarnings('warnBox', warns);

    PST.renderChart('chartBox', 'Distribution of individual normalized gains',
      PST.chart.histogram(res.valid, { label: 'Individual normalized gains' }));

    var box = document.getElementById('detailBox');
    box.innerHTML = '<h3>Gain bands</h3>';
    box.appendChild(PST.table(['Band', 'Range of g', 'Students', 'Share'], [
      ['High', 'g > 0.7', String(res.counts.high), PST.pct(res.counts.high / res.n, 1)],
      ['Medium', '0.3 ≤ g ≤ 0.7', String(res.counts.medium), PST.pct(res.counts.medium / res.n, 1)],
      ['Low', '0 ≤ g < 0.3', String(res.counts.low), PST.pct(res.counts.low / res.n, 1)],
      ['Negative', 'g < 0', String(res.counts.negative), PST.pct(res.counts.negative / res.n, 1)],
      ['At the ceiling', 'undefined', String(res.ceilingCount), PST.pct(res.ceilingCount / res.n, 1)]
    ], { numCols: [2, 3] }));

    box.appendChild(PST.el('h3', { text: 'Per-student gains' }));
    var rows = a.values.map(function (p, i) {
      var g = res.individual[i];
      return ['S' + (i + 1), PST.fmt(p, 1), PST.fmt(b.values[i], 1),
        PST.fmt(b.values[i] - p, 1),
        g === null ? 'undefined (at ceiling)' : PST.fixed(g, 3),
        g === null ? '—' : (g < 0 ? 'negative' : g < 0.3 ? 'low' : g <= 0.7 ? 'medium' : 'high')];
    });
    box.appendChild(PST.table(
      ['Student', 'Pre-test', 'Post-test', 'Raw gain', 'Normalized g', 'Band'],
      rows, { numCols: [1, 2, 3, 4] }));

    PST.renderInterpretation('interpBox',
      '<p>A sentence you can paste into your thesis:</p>' +
      '<p><em>"Mean scores rose from ' + PST.fixed(res.prePct, 1) + '% to ' +
      PST.fixed(res.postPct, 1) + '% of the maximum, giving a class-average normalized gain of ' +
      '⟨g⟩ = ' + PST.fixed(res.classGain, 2) + ' — a ' + band.word +
      ' gain by Hake\'s classification. The average of the individual gains was ' +
      PST.fixed(res.avgIndividualGain, 2) + ' (SD = ' + PST.fixed(res.sdIndividual, 2) + ')."</em></p>' +
      '<p>The normalized gain is the measure to quote when comparing your course against ' +
      'published results, or against your own earlier cohorts: it is unaffected by sample size ' +
      'and by differences in how well students started.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
