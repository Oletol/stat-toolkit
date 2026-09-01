/* Effect size calculator page */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  var FIELDS = {
    groups: `
      <div class="data-grid">
        <div class="field">
          <label for="g1">Experimental group — raw scores</label>
          <textarea id="g1" spellcheck="false"></textarea>
          <span class="count-pill" id="g1Count">0 values</span>
        </div>
        <div class="field">
          <label for="g2">Control group — raw scores</label>
          <textarea id="g2" spellcheck="false"></textarea>
          <span class="count-pill" id="g2Count">0 values</span>
        </div>
      </div>`,
    summary: `
      <div class="field-row">
        <div class="field"><label for="m1">Mean, group 1</label><input type="number" id="m1" step="any"></div>
        <div class="field"><label for="s1">SD, group 1</label><input type="number" id="s1" step="any" min="0"></div>
        <div class="field"><label for="n1">n, group 1</label><input type="number" id="n1" step="1" min="2"></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="m2">Mean, group 2</label><input type="number" id="m2" step="any"></div>
        <div class="field"><label for="s2">SD, group 2</label><input type="number" id="s2" step="any" min="0"></div>
        <div class="field"><label for="n2">n, group 2</label><input type="number" id="n2" step="1" min="2"></div>
      </div>`,
    paired: `
      <div class="data-grid">
        <div class="field">
          <label for="pre">Pre-test scores</label>
          <textarea id="pre" spellcheck="false"></textarea>
          <span class="count-pill" id="preCount">0 values</span>
        </div>
        <div class="field">
          <label for="post">Post-test scores</label>
          <textarea id="post" spellcheck="false"></textarea>
          <span class="count-pill" id="postCount">0 values</span>
        </div>
      </div>`,
    proportions: `
      <div class="field-row">
        <div class="field"><label for="k1">Effect count, group 1</label><input type="number" id="k1" step="1" min="0"></div>
        <div class="field"><label for="pn1">Size of group 1</label><input type="number" id="pn1" step="1" min="1"></div>
        <div class="field"><label for="k2">Effect count, group 2</label><input type="number" id="k2" step="1" min="0"></div>
        <div class="field"><label for="pn2">Size of group 2</label><input type="number" id="pn2" step="1" min="1"></div>
      </div>`,
    chi: `
      <div class="field-row">
        <div class="field"><label for="chi2">χ² value</label><input type="number" id="chi2" step="any" min="0"></div>
        <div class="field"><label for="cn">Total students N</label><input type="number" id="cn" step="1" min="2"></div>
        <div class="field"><label for="rows">Rows in the table</label><input type="number" id="rows" step="1" min="2" value="2"></div>
        <div class="field"><label for="cols">Columns in the table</label><input type="number" id="cols" step="1" min="2" value="2"></div>
      </div>`,
    z: `
      <div class="field-row">
        <div class="field"><label for="zval">Z statistic</label><input type="number" id="zval" step="any"></div>
        <div class="field"><label for="zn">Total observations N</label><input type="number" id="zn" step="1" min="2"></div>
      </div>
      <p class="hint">Use this when a rank test (Wilcoxon, Mann–Whitney) reported a Z value.
      For Wilcoxon, N is the number of pairs; for Mann–Whitney it is n₁ + n₂.</p>`
  };

  var EXAMPLES = {
    groups: { g1: '74\n81\n68\n77\n85\n70\n79\n83\n72\n76', g2: '65\n70\n61\n68\n72\n59\n66\n74\n63\n67' },
    summary: { m1: '76', s1: '5.4', n1: '20', m2: '66', s2: '5.1', n2: '20' },
    paired: { pre: '52\n61\n48\n55\n67\n44\n58\n50', post: '68\n72\n61\n70\n79\n58\n74\n65' },
    proportions: { k1: '19', pn1: '27', k2: '11', pn2: '25' },
    chi: { chi2: '7.76', cn: '100', rows: '2', cols: '3' },
    z: { zval: '2.64', zn: '20' }
  };

  PST.ready(function () {
    var modeEl = document.getElementById('mode');
    modeEl.addEventListener('change', function () { renderFields(modeEl.value); });
    renderFields(modeEl.value);

    document.getElementById('exampleBtn').addEventListener('click', function () {
      var ex = EXAMPLES[modeEl.value];
      Object.keys(ex).forEach(function (id) {
        var n = document.getElementById(id);
        if (n) { n.value = ex[id]; n.dispatchEvent(new Event('input', { bubbles: true })); }
      });
      PST.toast('Example data loaded');
    });
    document.getElementById('clearBtn').addEventListener('click', function () {
      renderFields(modeEl.value);
      document.getElementById('results').hidden = true;
    });
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: 'Effect size', filename: 'effect-size-results'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  function renderFields(mode) {
    document.getElementById('modeFields').innerHTML = FIELDS[mode];
    if (mode === 'groups') {
      PST.bindCounter('g1', 'g1Count'); PST.bindCounter('g2', 'g2Count');
    } else if (mode === 'paired') {
      PST.bindCounter('pre', 'preCount'); PST.bindCounter('post', 'postCount');
    }
  }

  function num(id) {
    var n = document.getElementById(id);
    if (!n || n.value === '') return NaN;
    return Number(n.value);
  }

  function run() {
    var mode = document.getElementById('mode').value;
    var errors = [], stats = [], title = '', paras = [], tone = 'info', detail = null;

    if (mode === 'groups') {
      var a = PST.parseNumbers(document.getElementById('g1').value);
      var b = PST.parseNumbers(document.getElementById('g2').value);
      errors = PST.validateGroups(a, b, 2);
      if (errors.length) return PST.showErrors('results', 'verdict', errors);
      var d1 = S.describe(a.values), d2 = S.describe(b.values);
      var e = S.effect.dIndependent(d1.n, d1.mean, d1.sd, d2.n, d2.mean, d2.sd);
      var small = Math.min(d1.n, d2.n) < 20;
      var lab = S.effect.labelD(e.g);
      title = "Cohen's d = " + PST.fixed(e.d, 2) + " · Hedges' g = " + PST.fixed(e.g, 2);
      tone = Math.abs(e.g) >= 0.5 ? 'ok' : 'warn';
      paras.push('The two groups differ by <b>' + PST.fixed(Math.abs(e.g), 2) +
        ' standard deviations</b> — a ' + lab + ' effect by Cohen\'s conventions.');
      paras.push('95% confidence interval for d: <b>' + PST.fixed(e.ciLow, 2) + ' to ' +
        PST.fixed(e.ciHigh, 2) + '</b>. ' +
        ((e.ciLow < 0 && e.ciHigh > 0)
          ? 'The interval includes zero, so the data are also compatible with no difference at all.'
          : 'The interval excludes zero, which corresponds to a significant difference.'));
      if (small) {
        paras.push("<b>Report Hedges' g, not Cohen's d.</b> With fewer than twenty students in a " +
          'group, d is biased upwards; g applies the correction (a factor of ' +
          PST.fixed(e.g / e.d, 3) + ' here).');
      }
      stats = [
        { label: "Cohen's d", value: PST.fixed(e.d, 3), key: true,
          note: '95% CI ' + PST.fixed(e.ciLow, 2) + ' – ' + PST.fixed(e.ciHigh, 2) },
        { label: "Hedges' g", value: PST.fixed(e.g, 3), key: true, note: lab + ' effect' },
        { label: 'Pooled SD', value: PST.fixed(e.sPooled, 3), note: 'the standardising unit' },
        { label: 'Group 1', value: PST.fixed(d1.mean, 2), note: 'n = ' + d1.n + ', SD = ' + PST.fixed(d1.sd, 2) },
        { label: 'Group 2', value: PST.fixed(d2.mean, 2), note: 'n = ' + d2.n + ', SD = ' + PST.fixed(d2.sd, 2) },
        { label: 'Raw difference', value: PST.fixed(d1.mean - d2.mean, 2), note: 'in score points' }
      ];

    } else if (mode === 'summary') {
      var m1 = num('m1'), s1 = num('s1'), n1 = num('n1');
      var m2 = num('m2'), s2 = num('s2'), n2 = num('n2');
      [['Mean, group 1', m1], ['SD, group 1', s1], ['n, group 1', n1],
       ['Mean, group 2', m2], ['SD, group 2', s2], ['n, group 2', n2]].forEach(function (p) {
        if (isNaN(p[1])) errors.push(p[0] + ' is missing.');
      });
      if (!errors.length) {
        if (s1 < 0 || s2 < 0) errors.push('Standard deviations cannot be negative.');
        if (n1 < 2 || n2 < 2) errors.push('Each group needs at least two students.');
        if (s1 === 0 && s2 === 0) errors.push('At least one group must have a non-zero standard deviation.');
      }
      if (errors.length) return PST.showErrors('results', 'verdict', errors);
      var es = S.effect.dIndependent(n1, m1, s1, n2, m2, s2);
      var lb = S.effect.labelD(es.g);
      title = "Cohen's d = " + PST.fixed(es.d, 2) + " · Hedges' g = " + PST.fixed(es.g, 2);
      tone = Math.abs(es.g) >= 0.5 ? 'ok' : 'warn';
      paras.push('The groups differ by <b>' + PST.fixed(Math.abs(es.g), 2) +
        ' standard deviations</b> — a ' + lb + ' effect.');
      paras.push('95% confidence interval for d: <b>' + PST.fixed(es.ciLow, 2) + ' to ' +
        PST.fixed(es.ciHigh, 2) + '</b>.');
      stats = [
        { label: "Cohen's d", value: PST.fixed(es.d, 3), key: true,
          note: '95% CI ' + PST.fixed(es.ciLow, 2) + ' – ' + PST.fixed(es.ciHigh, 2) },
        { label: "Hedges' g", value: PST.fixed(es.g, 3), key: true, note: lb + ' effect' },
        { label: 'Pooled SD', value: PST.fixed(es.sPooled, 3), note: 'the standardising unit' },
        { label: 'Raw difference', value: PST.fixed(m1 - m2, 2), note: 'in score points' }
      ];

    } else if (mode === 'paired') {
      var pa = PST.parseNumbers(document.getElementById('pre').value);
      var pb = PST.parseNumbers(document.getElementById('post').value);
      errors = PST.validatePaired(pa, pb);
      if (errors.length) return PST.showErrors('results', 'verdict', errors);
      var diffs = pb.values.map(function (v, i) { return v - pa.values[i]; });
      var sdd = S.sd(diffs), md = S.mean(diffs);
      if (sdd === 0) {
        return PST.showErrors('results', 'verdict',
          ['Every student changed by exactly the same amount, so the effect size is undefined.']);
      }
      var ep = S.effect.dPaired(diffs.length, md, sdd);
      var lp = S.effect.labelD(ep.g);
      title = "Paired d_z = " + PST.fixed(ep.d, 2) + " · Hedges' g = " + PST.fixed(ep.g, 2);
      tone = Math.abs(ep.g) >= 0.5 ? 'ok' : 'warn';
      paras.push('The average change is <b>' + PST.fixed(Math.abs(ep.d), 2) +
        ' standard deviations of the change itself</b> — a ' + lp + ' effect.');
      paras.push('95% confidence interval: <b>' + PST.fixed(ep.ciLow, 2) + ' to ' +
        PST.fixed(ep.ciHigh, 2) + '</b>.');
      paras.push('<b>Say that it is the paired form.</b> d for paired data is standardised by ' +
        'the SD of the differences, not by the SD of the scores, so it is not comparable with ' +
        'the d from a two-group study unless you say which one you computed.');
      stats = [
        { label: 'Paired d (d_z)', value: PST.fixed(ep.d, 3), key: true,
          note: '95% CI ' + PST.fixed(ep.ciLow, 2) + ' – ' + PST.fixed(ep.ciHigh, 2) },
        { label: "Hedges' g", value: PST.fixed(ep.g, 3), key: true, note: lp + ' effect' },
        { label: 'Mean change', value: PST.fixed(md, 2), note: 'post − pre' },
        { label: 'SD of the change', value: PST.fixed(sdd, 3), note: 'the standardising unit' },
        { label: 'n', value: String(diffs.length), note: 'pairs' }
      ];

    } else if (mode === 'proportions') {
      var k1 = num('k1'), pn1 = num('pn1'), k2 = num('k2'), pn2 = num('pn2');
      if ([k1, pn1, k2, pn2].some(isNaN)) errors.push('All four counts are required.');
      else {
        if (k1 > pn1 || k2 > pn2) errors.push('A count cannot exceed its group size.');
        if (pn1 < 1 || pn2 < 1) errors.push('Group sizes must be at least 1.');
      }
      if (errors.length) return PST.showErrors('results', 'verdict', errors);
      var p1 = k1 / pn1, p2 = k2 / pn2;
      var h = S.effect.h(p1, p2);
      var or = S.effect.oddsRatio(k1, pn1 - k1, k2, pn2 - k2);
      var lh = S.effect.labelD(h);
      title = "Cohen's h = " + PST.fixed(h, 2) + ' · odds ratio = ' + PST.fixed(or.or, 2);
      tone = h >= 0.5 ? 'ok' : 'warn';
      paras.push('The proportions are ' + PST.pct(p1, 1) + ' and ' + PST.pct(p2, 1) +
        ', a difference of ' + PST.pct(Math.abs(p1 - p2), 1) + ' percentage points. ' +
        "Cohen's h = <b>" + PST.fixed(h, 2) + '</b> — a ' + lh + ' effect.');
      paras.push('The odds ratio is <b>' + PST.fixed(or.or, 2) + '</b>, 95% CI ' +
        PST.fixed(or.ciLow, 2) + ' to ' + PST.fixed(or.ciHigh, 2) + '. ' +
        ((or.ciLow < 1 && or.ciHigh > 1)
          ? 'The interval includes 1, so the data are compatible with no association.'
          : 'The interval excludes 1, which corresponds to a significant association.'));
      paras.push('To test whether the difference is significant, use the ' +
        '<a href="fisher-phi.html">φ* criterion</a>.');
      stats = [
        { label: "Cohen's h", value: PST.fixed(h, 3), key: true, note: lh + ' effect' },
        { label: 'Odds ratio', value: PST.fixed(or.or, 3), key: true,
          note: '95% CI ' + PST.fixed(or.ciLow, 2) + ' – ' + PST.fixed(or.ciHigh, 2) },
        { label: 'Proportion 1', value: PST.pct(p1, 1), note: k1 + ' of ' + pn1 },
        { label: 'Proportion 2', value: PST.pct(p2, 1), note: k2 + ' of ' + pn2 },
        { label: 'Difference', value: PST.pct(p1 - p2, 1), note: 'percentage points' }
      ];

    } else if (mode === 'chi') {
      var chi2 = num('chi2'), cn = num('cn'), rows = num('rows'), cols = num('cols');
      if ([chi2, cn, rows, cols].some(isNaN)) errors.push('All four values are required.');
      else if (chi2 < 0 || cn < 2 || rows < 2 || cols < 2) {
        errors.push('χ² must be non-negative, N at least 2, and the table at least 2 × 2.');
      }
      if (errors.length) return PST.showErrors('results', 'verdict', errors);
      var v = S.effect.cramersV(chi2, cn, rows, cols);
      var lv = S.effect.labelR(v);
      title = "Cramér's V = " + PST.fixed(v, 3);
      tone = v >= 0.3 ? 'ok' : 'warn';
      paras.push("Cramér's V is <b>" + PST.fixed(v, 3) + '</b> — a ' + lv +
        ' association. V runs from 0 (no association between group and category) to 1 ' +
        '(the category is fully determined by the group).');
      paras.push('For a 2 × 2 table V is identical to the φ coefficient.');
      stats = [
        { label: "Cramér's V", value: PST.fixed(v, 3), key: true, note: lv + ' association' },
        { label: 'χ²', value: PST.fixed(chi2, 3), note: 'df = ' + ((rows - 1) * (cols - 1)) },
        { label: 'N', value: String(cn), note: rows + ' × ' + cols + ' table' },
        { label: 'p-value', value: S.formatP(1 - S.chi2Cdf(chi2, (rows - 1) * (cols - 1))),
          note: 'from the χ² distribution' }
      ];

    } else {
      var z = num('zval'), zn = num('zn');
      if (isNaN(z) || isNaN(zn)) errors.push('Both the Z statistic and N are required.');
      else if (zn < 2) errors.push('N must be at least 2.');
      if (errors.length) return PST.showErrors('results', 'verdict', errors);
      var r = S.effect.rFromZ(z, zn);
      var lr = S.effect.labelR(r);
      title = 'r = ' + PST.fixed(r, 3);
      tone = r >= 0.3 ? 'ok' : 'warn';
      paras.push('The rank-test effect size is <b>r = ' + PST.fixed(r, 3) + '</b> — a ' + lr +
        ' effect. This is the standard measure to accompany a Wilcoxon or Mann–Whitney result: ' +
        'r = |Z| ÷ √N, with 0.1 small, 0.3 medium and 0.5 large.');
      stats = [
        { label: 'Effect size r', value: PST.fixed(r, 3), key: true, note: lr + ' effect' },
        { label: 'Z', value: PST.fixed(z, 3), note: 'from the rank test' },
        { label: 'N', value: String(zn), note: 'observations' },
        { label: 'r²', value: PST.fixed(r * r, 3), note: 'share of variance accounted for' }
      ];
    }

    PST.renderVerdict('verdict', tone, title, paras);
    PST.renderStats('statGrid', stats);
    PST.renderWarnings('warnBox', [
      { tone: 'info', text: '<b>Always report the confidence interval.</b> A point estimate ' +
        'alone hides how much the sample size limits what you can claim. A wide interval is ' +
        'information, not an embarrassment.' },
      { tone: 'warn', text: '<b>The small / medium / large labels are conventions</b> proposed ' +
        'for behavioural research in general. If comparable teaching studies in your field ' +
        'routinely report d ≈ 0.4, that is the benchmark that matters for your work.' },
      { tone: 'info', text: '<b>An effect size is not a significance test.</b> Report it ' +
        'alongside the p-value from the appropriate criterion, never instead of it.' }
    ]);
    document.getElementById('chartBox').innerHTML = '';
    document.getElementById('detailBox').innerHTML = '';

    PST.renderInterpretation('interpBox',
      '<p>Report the effect size immediately after the test result, to two decimal places, ' +
      'with its confidence interval — for example: <em>"…, Hedges\' g = 0.68, 95% CI ' +
      '[0.11, 1.25]"</em>. Name the measure you used, and when the sample is small say ' +
      'explicitly that you used Hedges\' g rather than Cohen\'s d.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
