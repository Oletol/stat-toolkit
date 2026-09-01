/* Fisher's angular transformation (φ*) page */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  PST.ready(function () {
    PST.bindExample('exampleBtn', {
      k1: '19', n1: '27', k2: '11', n2: '25',
      lab1: 'Experimental group', lab2: 'Control group',
      effectName: 'reached the required competence level'
    });
    PST.bindClear('clearBtn', ['k1', 'n1', 'k2', 'n2'], 'results');
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: "Fisher's angular transformation (phi*)", filename: 'fisher-phi-results'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  function val(id) {
    var v = document.getElementById(id).value;
    return v === '' ? NaN : Number(v);
  }

  function run() {
    var k1 = val('k1'), n1 = val('n1'), k2 = val('k2'), n2 = val('n2');
    var lab1 = document.getElementById('lab1').value || 'Group 1';
    var lab2 = document.getElementById('lab2').value || 'Group 2';
    var effectName = document.getElementById('effectName').value || 'showed the effect';
    var alpha = Number(document.getElementById('alpha').value);
    var tails = document.getElementById('tails').value;

    var errors = [];
    [['k1', k1], ['n1', n1], ['k2', k2], ['n2', n2]].forEach(function (p) {
      if (isNaN(p[1]) || p[1] < 0 || p[1] !== Math.floor(p[1])) {
        errors.push('“' + p[0] + '” must be a whole number of students, zero or more.');
      }
    });
    if (!errors.length) {
      if (n1 < 1 || n2 < 1) errors.push('Both group sizes must be at least 1.');
      if (k1 > n1) errors.push('The count in ' + lab1 + ' (' + k1 + ') cannot exceed its size (' + n1 + ').');
      if (k2 > n2) errors.push('The count in ' + lab2 + ' (' + k2 + ') cannot exceed its size (' + n2 + ').');
    }
    if (errors.length) return PST.showErrors('results', 'verdict', errors);

    var res = S.fisherPhi(k1, n1, k2, n2);
    var p = tails === 'one' ? res.pOneSided : res.pTwoSided;
    var crit = tails === 'one' ? (alpha <= 0.01 ? res.crit01 : res.crit05) : S.normInv(1 - alpha / 2);
    var sig = res.applicable && p <= alpha;
    var hLabel = S.effect.labelD(res.h);

    var extra = [];
    if (!res.applicable) {
      extra.push('<b>The criterion is not applicable to these sample sizes.</b> ' +
        res.applicabilityNote + ' Admissible combinations are: n₁ = 2 with n₂ ≥ 30; n₁ = 3 ' +
        'with n₂ ≥ 7; n₁ = 4 with n₂ ≥ 5; and any comparison once both groups reach 5.');
    }
    extra.push('φ* = ' + PST.fixed(res.phiEmp, 3) + ' against the critical value ' +
      PST.fixed(crit, 2) + '. The textbook thresholds are 1.64 for p ≤ 0.05 and 2.31 for p ≤ 0.01 ' +
      '(Starichenko, Table 8).');
    extra.push('The difference between the proportions is ' +
      (res.diff > 0 ? '+' : '') + PST.pct(res.diff, 1) + ' with a 95% confidence interval from ' +
      PST.pct(res.diffCiLow, 1) + ' to ' + PST.pct(res.diffCiHigh, 1) + '.');

    var tone, title;
    if (!res.applicable) { tone = 'none'; title = 'The comparison cannot be made at these sample sizes'; }
    else if (sig && res.p1 > res.p2) { tone = 'ok'; title = lab1 + ' has a significantly higher proportion'; }
    else if (sig) { tone = 'ok'; title = lab2 + ' has a significantly higher proportion'; }
    else { tone = 'warn'; title = 'The difference between the proportions is not significant'; }

    var paras = [];
    if (res.applicable) {
      paras.push(sig
        ? 'The gap between ' + PST.pct(res.p1, 1) + ' and ' + PST.pct(res.p2, 1) +
          ' is statistically reliable (φ* = ' + PST.fixed(res.phiEmp, 2) + ', p = ' + S.formatP(p) +
          ', α = ' + alpha + ').'
        : 'The gap between ' + PST.pct(res.p1, 1) + ' and ' + PST.pct(res.p2, 1) +
          ' is not statistically reliable at this sample size (φ* = ' + PST.fixed(res.phiEmp, 2) +
          ', p = ' + S.formatP(p) + ', α = ' + alpha + '). Percentages that look far apart can ' +
          'easily be within chance variation when the groups are small — that is precisely what ' +
          'this criterion exists to check.');
      paras.push("Effect size: <b>Cohen's h = " + PST.fixed(res.h, 2) + '</b> (' + hLabel + ').');
    }
    extra.forEach(function (t) { paras.push(t); });
    PST.renderVerdict('verdict', tone, title, paras);

    PST.renderStats('statGrid', [
      { label: 'φ* empirical', value: PST.fixed(res.phiEmp, 3), key: true,
        note: 'critical value ' + PST.fixed(crit, 2) },
      { label: 'p-value', value: S.formatP(p), key: true,
        note: tails === 'one' ? 'one-sided' : 'two-sided' },
      { label: lab1, value: PST.pct(res.p1, 1),
        note: k1 + ' of ' + n1 + ' · 95% CI ' + PST.pct(res.ci1.low, 0) + '–' + PST.pct(res.ci1.high, 0) },
      { label: lab2, value: PST.pct(res.p2, 1),
        note: k2 + ' of ' + n2 + ' · 95% CI ' + PST.pct(res.ci2.low, 0) + '–' + PST.pct(res.ci2.high, 0) },
      { label: 'φ₁ / φ₂', value: PST.fixed(res.phi1, 3) + ' / ' + PST.fixed(res.phi2, 3),
        small: true, note: 'angles in radians' },
      { label: "Cohen's h", value: PST.fixed(res.h, 2), note: hLabel + ' effect' }
    ]);

    var warns = [];
    warns.push({
      tone: res.applicable ? 'info' : 'danger',
      text: '<b>Applicability.</b> ' + res.applicabilityNote
    });
    warns.push({ tone: 'info', text: '<b>No upper limit.</b> Unlike most criteria in the ' +
      'textbook, φ* places no ceiling on sample size — it works for two students or two thousand.' });
    warns.push({ tone: 'warn', text: '<b>The threshold must be fixed in advance.</b> Choosing the ' +
      'cut-off for “effect present” after seeing the data is the manoeuvre that invalidates ' +
      'this kind of result. Record your definition (“' + effectName + '”) in the research programme.' });
    if (Math.min(n1, n2) < 20) {
      warns.push({ tone: 'warn', text: '<b>Small groups.</b> The confidence intervals above show ' +
        'how imprecise these percentages are: with ' + Math.min(n1, n2) +
        ' students, one student changes the proportion by ' +
        PST.pct(1 / Math.min(n1, n2), 1) + '.' });
    }
    PST.renderWarnings('warnBox', warns);

    PST.renderChart('chartBox', 'Proportion showing the effect',
      PST.chart.proportions([
        { label: lab1, value: res.p1, color: 'var(--blue)', sub: k1 + ' of ' + n1 + ' students' },
        { label: lab2, value: res.p2, color: 'var(--ok)', sub: k2 + ' of ' + n2 + ' students' }
      ]));

    var box = document.getElementById('detailBox');
    box.innerHTML = '<h3>Calculation steps</h3>';
    box.appendChild(PST.table(
      ['Step', 'Formula', 'Result'],
      [
        ['Proportion in ' + lab1, 'P₁ = ' + k1 + ' ÷ ' + n1, PST.fixed(res.p1, 4)],
        ['Proportion in ' + lab2, 'P₂ = ' + k2 + ' ÷ ' + n2, PST.fixed(res.p2, 4)],
        ['Angle 1', 'φ₁ = 2·arcsin(√P₁)', PST.fixed(res.phi1, 4)],
        ['Angle 2', 'φ₂ = 2·arcsin(√P₂)', PST.fixed(res.phi2, 4)],
        ['Empirical value', 'φ* = |φ₁ − φ₂| · √(n₁n₂ ⁄ (n₁+n₂))', PST.fixed(res.phiEmp, 4)],
        ['Decision', 'φ* vs critical value ' + PST.fixed(crit, 2),
          sig ? 'significant' : 'not significant']
      ], { numCols: [2] }));

    PST.renderInterpretation('interpBox',
      '<p>A sentence you can paste into your thesis:</p>' +
      '<p><em>"In the ' + lab1.toLowerCase() + ', ' + k1 + ' of ' + n1 + ' students (' +
      PST.pct(res.p1, 1) + ') ' + effectName + ', against ' + k2 + ' of ' + n2 + ' (' +
      PST.pct(res.p2, 1) + ') in the ' + lab2.toLowerCase() + '. Fisher\'s angular ' +
      'transformation gives φ* = ' + PST.fixed(res.phiEmp, 2) + ', ' +
      (sig ? 'which exceeds the critical value of ' + PST.fixed(crit, 2) +
             ' — the difference is statistically significant (p = ' + S.formatP(p) + ')'
           : 'which is below the critical value of ' + PST.fixed(crit, 2) +
             ' — the difference is not statistically significant (p = ' + S.formatP(p) + ')') +
      ", Cohen's h = " + PST.fixed(res.h, 2) + '."</em></p>' +
      '<p>Quote the raw counts as well as the percentages. A reader cannot judge a percentage ' +
      'without knowing what it is a percentage of.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
