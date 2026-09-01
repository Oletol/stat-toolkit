/* Sample size and power calculator (guides/sample-size.html) */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  PST.ready(function () {
    ['d', 'alpha', 'power', 'attrition', 'haveN'].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) n.addEventListener('input', update);
      if (n) n.addEventListener('change', update);
    });
    update();
  });

  function update() {
    var d = Number(document.getElementById('d').value);
    var alpha = Number(document.getElementById('alpha').value);
    var power = Number(document.getElementById('power').value);
    var attr = Number(document.getElementById('attrition').value);
    var box = document.getElementById('ssResults');

    if (!isFinite(d) || d <= 0) {
      box.innerHTML = '<div class="callout is-warn">Enter an effect size greater than zero.</div>';
    } else {
      if (!isFinite(attr) || attr < 0 || attr >= 1) attr = 0;
      var indep = S.sampleSize.independent(d, alpha, power);
      var paired = S.sampleSize.paired(d, alpha, power);
      var nonparam = Math.ceil(paired * 1.15);
      var label = S.effect.labelD(d);

      PST.renderStats(box, [
        { label: 'Two groups: per group', value: String(indep), key: true,
          note: 'experimental and control, ' + (indep * 2) + ' students in total' },
        { label: 'One group, pre/post: total', value: String(paired), key: true,
          note: 'the same students measured twice' },
        { label: 'Rank test, pre/post', value: String(nonparam),
          note: 'Wilcoxon or sign test, +15%' },
        { label: 'Recruit for two groups', value: String(Math.ceil(indep / (1 - attr))),
          note: 'per group, allowing ' + PST.pct(attr, 0) + ' attrition' },
        { label: 'Recruit for one group', value: String(Math.ceil(paired / (1 - attr))),
          note: 'total, allowing ' + PST.pct(attr, 0) + ' attrition' },
        { label: 'Effect assumed', value: PST.fixed(d, 2), note: label + ' effect' }
      ]);
    }

    var have = Number(document.getElementById('haveN').value);
    var pbox = document.getElementById('powerResults');
    if (!isFinite(have) || have < 3) {
      pbox.innerHTML = '<div class="callout is-warn">Enter at least 3 students per group.</div>';
      return;
    }
    var pIndep = S.sampleSize.powerIndependent(d, have, alpha);
    var pPaired = S.sampleSize.powerPaired(d, have, alpha);
    var detIndep = S.sampleSize.detectableIndependent(have, alpha, power);
    var detPaired = S.sampleSize.detectablePaired(have, alpha, power);

    PST.renderStats(pbox, [
      { label: 'Power, two groups', value: PST.pct(pIndep, 0), key: pIndep < 0.8,
        note: 'with ' + have + ' per group at d = ' + PST.fixed(d, 2) },
      { label: 'Power, one group pre/post', value: PST.pct(pPaired, 0), key: pPaired < 0.8,
        note: 'with ' + have + ' students at d = ' + PST.fixed(d, 2) },
      { label: 'Smallest detectable d, two groups', value: PST.fixed(detIndep, 2),
        note: S.effect.labelD(detIndep) + ' effect or larger' },
      { label: 'Smallest detectable d, pre/post', value: PST.fixed(detPaired, 2),
        note: S.effect.labelD(detPaired) + ' effect or larger' }
    ]);

    var note = document.getElementById('powerNote');
    if (pPaired < 0.5) {
      note.className = 'callout is-danger';
      note.innerHTML = '<span class="callout-title">Under-powered</span>With ' + have +
        ' students the study has less than a 50% chance of detecting an effect of d = ' +
        PST.fixed(d, 2) + ' even if it is real. A non-significant result would tell you almost ' +
        'nothing. Either plan for a larger effect, add measurement points, pool cohorts, or ' +
        'shift the argument onto effect sizes and qualitative evidence — see ' +
        '<a href="small-samples.html">Working with 5–7 students</a>.';
    } else if (pPaired < 0.8) {
      note.className = 'callout is-warn';
      note.innerHTML = '<span class="callout-title">Below the conventional 80%</span>The paired ' +
        'design reaches ' + PST.pct(pPaired, 0) + ' power at this sample size. Usable, but ' +
        'report the limitation explicitly and lead with the effect size.';
    } else {
      note.className = 'callout is-ok';
      note.innerHTML = '<span class="callout-title">Adequately powered</span>The paired design ' +
        'reaches ' + PST.pct(pPaired, 0) + ' power for an effect of d = ' + PST.fixed(d, 2) +
        ' at this sample size.';
    }
  }
})();
