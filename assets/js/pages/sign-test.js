/* Sign test page */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  var EXAMPLE = {
    pre: '2\n1\n2\n3\n1\n2\n1\n2',
    post: '3\n3\n2\n3\n2\n3\n2\n3'
  };

  PST.ready(function () {
    PST.bindCounter('pre', 'preCount');
    PST.bindCounter('post', 'postCount');
    PST.bindExample('exampleBtn', EXAMPLE);
    PST.bindClear('clearBtn', ['pre', 'post'], 'results');
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: 'Sign test (G)', filename: 'sign-test-results'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  function run() {
    var a = PST.parseNumbers(document.getElementById('pre').value);
    var b = PST.parseNumbers(document.getElementById('post').value);
    var errors = PST.validatePaired(a, b);
    if (errors.length) return PST.showErrors('results', 'verdict', errors);

    var opt = PST.readOptions();
    var res = S.signTest(a.values, b.values, opt.alternative);

    if (res.nEffective === 0) {
      return PST.showErrors('results', 'verdict', [
        'Every student scored exactly the same before and after, so there is no shift to test. ' +
        'This usually means the instrument was not sensitive enough to register the change.'
      ]);
    }

    var sig = res.p <= opt.alpha;
    var direction = res.positive > res.negative ? 'improved'
      : (res.positive < res.negative ? 'declined' : 'none');

    var smallest = opt.alternative === 'two-sided'
      ? 2 / Math.pow(2, res.nEffective) : 1 / Math.pow(2, res.nEffective);

    var extra = [];
    if (smallest > opt.alpha) {
      extra.push('<b>The test cannot reach significance here.</b> With ' + res.nEffective +
        ' usable pairs the smallest attainable p-value is ' + smallest.toFixed(4) +
        ', which is above your α of ' + opt.alpha + '. No pattern of results could produce a ' +
        'significant outcome — you need more students, more measurement points, or the ' +
        '<a href="wilcoxon.html">Wilcoxon test</a>, which uses the magnitude of each change as well.');
    }

    var v = PST.effectivenessVerdict({
      significant: sig, p: res.p, alpha: opt.alpha, direction: direction,
      n: res.nEffective, design: 'single-group', extra: extra
    });
    PST.renderVerdict('verdict', v.tone, v.title, v.paragraphs);

    var ci = res.propCi;
    PST.renderStats('statGrid', [
      { label: 'G statistic', value: String(res.G), key: true, note: 'count of the rarer sign' },
      { label: 'p-value', value: S.formatP(res.p), key: true, note: 'exact binomial' },
      { label: 'Improved', value: String(res.positive), note: 'students whose score rose' },
      { label: 'Declined', value: String(res.negative), note: 'students whose score fell' },
      { label: 'No change', value: String(res.zeros), note: 'excluded from the test' },
      { label: 'Share improved', value: PST.pct(res.proportionImproved, 1),
        note: ci ? '95% CI ' + PST.pct(ci.low, 0) + ' – ' + PST.pct(ci.high, 0) : '' }
    ]);

    var warns = [];
    warns.push({ tone: 'info', text: '<b>Exact test.</b> The p-value comes from the binomial ' +
      'distribution directly, with no approximation, so it is valid at any sample size.' });
    if (res.zeros) {
      warns.push({ tone: 'warn', text: '<b>' + res.zeros + ' student' + (res.zeros > 1 ? 's' : '') +
        ' showed no change</b> and were excluded, leaving ' + res.nEffective + ' usable pairs.' });
    }
    warns.push({ tone: 'warn', text: '<b>Magnitude is discarded.</b> A one-point gain counts the ' +
      'same as a twenty-point gain. If your outcome is numeric, the ' +
      '<a href="wilcoxon.html">Wilcoxon signed-rank test</a> uses the same data more efficiently.' });
    warns.push({ tone: 'info', text: '<b>No control group in this design.</b> A significant result ' +
      'shows that scores rose, not that your methodology raised them.' });
    PST.renderWarnings('warnBox', warns);

    PST.renderChart('chartBox', 'Direction of change for each student',
      PST.chart.proportions([
        { label: 'Improved', value: res.positive / res.nPairs, color: 'var(--ok)',
          sub: res.positive + ' of ' + res.nPairs + ' students' },
        { label: 'Declined', value: res.negative / res.nPairs, color: 'var(--danger)',
          sub: res.negative + ' of ' + res.nPairs + ' students' },
        { label: 'No change', value: res.zeros / res.nPairs, color: 'var(--muted-2)',
          sub: res.zeros + ' of ' + res.nPairs + ' students' }
      ]));

    var rows = a.values.map(function (p, i) {
      var d = b.values[i] - p;
      return ['S' + (i + 1), PST.fmt(p, 2), PST.fmt(b.values[i], 2),
        d > 0 ? '+' : (d < 0 ? '−' : '0'),
        d > 0 ? 'improved' : (d < 0 ? 'declined' : 'no change')];
    });
    var box = document.getElementById('detailBox');
    box.innerHTML = '<h3>Per-student detail</h3>';
    box.appendChild(PST.table(['Student', 'Pre-test', 'Post-test', 'Sign', 'Direction'],
      rows, { numCols: [1, 2, 3] }));

    PST.renderInterpretation('interpBox',
      '<p>A sentence you can paste into your thesis:</p>' +
      '<p><em>"Of the ' + res.nPairs + ' students assessed, ' + res.positive + ' improved, ' +
      res.negative + ' declined and ' + res.zeros + ' showed no change. A sign test on the ' +
      res.nEffective + ' students who changed ' +
      (sig ? 'confirmed a significant shift' : 'did not detect a significant shift') +
      ' (G = ' + res.G + ', n = ' + res.nEffective + ', p = ' + S.formatP(res.p) + ')."</em></p>' +
      '<p>Because the sign test ignores the size of each change, pair it with a measure of ' +
      'magnitude — the <a href="hake-gain.html">normalized gain</a> works well and is valid at any n.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
