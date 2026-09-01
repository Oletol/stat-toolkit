/* Pearson's chi-square page, with an automatic Fisher exact fallback for 2x2 */
(function () {
  'use strict';
  var PST = window.PST, S = window.PSTStats;

  var rowLabels = ['Experimental group', 'Control group'];
  var colLabels = ['Low', 'Medium', 'High'];
  var data = [[4, 9, 12], [11, 8, 5]];

  PST.ready(function () {
    render();
    document.getElementById('addRow').addEventListener('click', function () {
      read(); rowLabels.push('Group ' + (rowLabels.length + 1));
      data.push(new Array(colLabels.length).fill(0)); render();
    });
    document.getElementById('delRow').addEventListener('click', function () {
      if (rowLabels.length <= 2) return PST.toast('At least two groups are needed');
      read(); rowLabels.pop(); data.pop(); render();
    });
    document.getElementById('addCol').addEventListener('click', function () {
      read(); colLabels.push('Category ' + (colLabels.length + 1));
      data.forEach(function (r) { r.push(0); }); render();
    });
    document.getElementById('delCol').addEventListener('click', function () {
      if (colLabels.length <= 2) return PST.toast('At least two categories are needed');
      read(); colLabels.pop(); data.forEach(function (r) { r.pop(); }); render();
    });
    document.getElementById('exampleBtn').addEventListener('click', function () {
      rowLabels = ['Experimental group', 'Control group'];
      colLabels = ['Low', 'Medium', 'High'];
      data = [[4, 9, 12], [11, 8, 5]];
      render(); PST.toast('Example data loaded');
    });
    document.getElementById('clearBtn').addEventListener('click', function () {
      data = data.map(function (r) { return r.map(function () { return 0; }); });
      render();
      document.getElementById('results').hidden = true;
    });
    PST.bindExport({
      container: 'results', copyBtn: 'copyBtn', saveBtn: 'saveBtn',
      title: 'Chi-square test of independence', filename: 'chi-square-results'
    });
    document.getElementById('calcBtn').addEventListener('click', run);
  });

  function render() {
    var t = document.getElementById('matrix');
    var html = '<thead><tr><th class="row-head">Group ╲ Category</th>';
    colLabels.forEach(function (c, j) {
      html += '<th><input class="label-input" data-col="' + j + '" value="' +
        esc(c) + '" aria-label="Category ' + (j + 1) + ' name"></th>';
    });
    html += '</tr></thead><tbody>';
    rowLabels.forEach(function (r, i) {
      html += '<tr><th class="row-head"><input class="label-input" data-row="' + i +
        '" value="' + esc(r) + '" aria-label="Group ' + (i + 1) + ' name"></th>';
      colLabels.forEach(function (c, j) {
        html += '<td><input type="number" min="0" step="1" data-i="' + i + '" data-j="' + j +
          '" value="' + data[i][j] + '" aria-label="Count for ' + esc(r) + ', ' + esc(c) + '"></td>';
      });
      html += '</tr>';
    });
    t.innerHTML = html + '</tbody>';
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function read() {
    PST.$$('#matrix input[data-i]').forEach(function (inp) {
      var i = +inp.dataset.i, j = +inp.dataset.j;
      var v = Number(inp.value);
      data[i][j] = (isNaN(v) || v < 0) ? 0 : Math.round(v);
    });
    PST.$$('#matrix input[data-row]').forEach(function (inp) {
      rowLabels[+inp.dataset.row] = inp.value || 'Group';
    });
    PST.$$('#matrix input[data-col]').forEach(function (inp) {
      colLabels[+inp.dataset.col] = inp.value || 'Category';
    });
  }

  function run() {
    read();
    var alpha = Number(document.getElementById('alpha').value);
    var yates = document.getElementById('yates').value === 'auto';

    var total = 0;
    data.forEach(function (r) { r.forEach(function (v) { total += v; }); });
    if (total === 0) {
      return PST.showErrors('results', 'verdict',
        ['The table is empty. Enter the number of students in each cell.']);
    }
    var emptyRow = data.some(function (r) {
      return r.reduce(function (a, b) { return a + b; }, 0) === 0;
    });
    var colSums = colLabels.map(function (_, j) {
      return data.reduce(function (a, r) { return a + r[j]; }, 0);
    });
    if (emptyRow || colSums.some(function (s) { return s === 0; })) {
      return PST.showErrors('results', 'verdict',
        ['Every group and every category must contain at least one student. ' +
         'Remove the empty row or column, or merge it with a neighbouring one.']);
    }

    var res = S.chiSquare(data, yates);
    var sig = res.p <= alpha;
    var vLabel = S.effect.labelR(res.cramersV);
    var exact = res.is2x2 ? S.fisherExact(data) : null;
    var useExact = exact && res.minExpected < 5;
    var headlineP = useExact ? exact.pTwoSided : res.p;
    var headlineSig = headlineP <= alpha;

    var extra = [];
    if (res.lowShare > 0.2) {
      extra.push('<b>The chi-square approximation is not valid here.</b> ' + res.lowCells +
        ' of ' + res.cells + ' cells have an expected count below 5 (the smallest is ' +
        PST.fixed(res.minExpected, 2) + '), which exceeds the 20% that the criterion tolerates. ' +
        (res.is2x2
          ? "Fisher's exact test is reported instead and is the figure to quote."
          : 'Merge adjacent categories until every expected count reaches 5, or collapse the ' +
            'table to 2 × 2 and use the ' +
            '<a href="fisher-phi.html">φ* criterion</a>.'));
    }
    if (useExact) {
      extra.push("Because the table is 2 × 2 with small expected counts, the headline p-value " +
        "above comes from <b>Fisher's exact test</b> (p = " + S.formatP(exact.pTwoSided) +
        '), which is valid at any frequency. The chi-square value is shown for completeness only.');
    }

    var tone = headlineSig ? 'ok' : 'warn';
    var title = headlineSig
      ? 'The groups are distributed differently'
      : 'No significant difference between the distributions';
    var paras = [];
    paras.push(headlineSig
      ? 'Students are distributed across the categories significantly differently in the ' +
        'groups compared (p = ' + S.formatP(headlineP) + ', α = ' + alpha + '). The pattern you ' +
        'see in the table is unlikely to be chance variation.'
      : 'The distributions did not differ significantly (p = ' + S.formatP(headlineP) + ', α = ' +
        alpha + '). With ' + total + ' students in total, only fairly large differences in ' +
        'distribution would have been detectable — report this as a limit on power, not as ' +
        'evidence that the groups are the same.');
    paras.push("Effect size: <b>Cramér's V = " + PST.fixed(res.cramersV, 3) + '</b> (' + vLabel +
      '). V runs from 0 (no association) to 1 (perfect association); 0.1 is small, 0.3 medium and 0.5 large.');
    extra.forEach(function (t) { paras.push(t); });
    PST.renderVerdict('verdict', tone, title, paras);

    var stats = [
      { label: 'χ² statistic', value: PST.fixed(res.chi2, 3), key: true,
        note: 'df = ' + res.df + (res.yatesApplied ? ", Yates' correction applied" : '') },
      { label: 'p-value', value: S.formatP(headlineP), key: true,
        note: useExact ? "Fisher's exact" : 'from χ²' },
      { label: "Cramér's V", value: PST.fixed(res.cramersV, 3), note: vLabel + ' association' },
      { label: 'Total students', value: String(res.N),
        note: res.table.length + ' groups × ' + res.table[0].length + ' categories' },
      { label: 'Smallest expected count', value: PST.fixed(res.minExpected, 2),
        note: res.minExpected >= 5 ? 'condition satisfied' : 'below the required 5' }
    ];
    if (exact) {
      stats.push({ label: "Fisher's exact p", value: S.formatP(exact.pTwoSided), small: true,
        note: 'valid at any frequency' });
      stats.push({ label: 'Odds ratio', value: PST.fixed(exact.oddsRatio, 2), small: true,
        note: '95% CI ' + PST.fixed(exact.orCiLow, 2) + ' – ' + PST.fixed(exact.orCiHigh, 2) });
    }
    PST.renderStats('statGrid', stats);

    var warns = [];
    warns.push({
      tone: res.minExpected >= 5 ? 'info' : (res.lowShare > 0.2 ? 'danger' : 'warn'),
      text: '<b>Expected-count condition.</b> ' + res.lowCells + ' of ' + res.cells +
        ' cells have an expected count below 5 (' + PST.pct(res.lowShare, 0) + ' of cells; ' +
        'up to 20% is tolerated). Smallest expected count: ' + PST.fixed(res.minExpected, 2) + '.'
    });
    warns.push({ tone: 'warn', text: '<b>Counts, never percentages.</b> The cells above must ' +
      'contain numbers of students. Entering percentages produces a statistic that looks ' +
      'plausible and means nothing — this is the most common error in student dissertations.' });
    if (res.is2x2) {
      warns.push({ tone: 'info', text: '<b>Three valid options for a 2 × 2 table.</b> ' +
        "Fisher's exact test (always valid), chi-square with Yates' correction, and the " +
        '<a href="fisher-phi.html">φ* criterion</a>, which the textbook recommends for comparing ' +
        'two proportions. Choose one in advance and report that one.' });
    }
    warns.push({ tone: 'info', text: '<b>Categories are fixed in advance.</b> Regrouping the ' +
      'levels after seeing the data until the test turns significant invalidates the result.' });
    PST.renderWarnings('warnBox', warns);

    // observed / expected table
    var box = document.getElementById('detailBox');
    box.innerHTML = '<h3>Observed and expected counts</h3>';
    var headers = ['Group'].concat(colLabels).concat(['Row total']);
    var rows = [];
    data.forEach(function (r, i) {
      var cells = [rowLabels[i]];
      r.forEach(function (v, j) {
        var e = res.expected[i][j];
        cells.push('<b>' + v + '</b> <span class="muted small">(exp. ' + PST.fixed(e, 1) + ')</span>');
      });
      cells.push('<b>' + res.rowSums[i] + '</b>');
      rows.push(cells);
    });
    var totalRow = ['<b>Column total</b>'];
    res.colSums.forEach(function (s) { totalRow.push('<b>' + s + '</b>'); });
    totalRow.push('<b>' + res.N + '</b>');
    rows.push(totalRow);
    box.appendChild(PST.table(headers, rows,
      { numCols: colLabels.map(function (_, j) { return j + 1; }).concat([colLabels.length + 1]) }));

    var pctRows = data.map(function (r, i) {
      var cells = [rowLabels[i]];
      r.forEach(function (v) { cells.push(PST.pct(v / res.rowSums[i], 1)); });
      cells.push('100%');
      return cells;
    });
    box.appendChild(PST.el('h3', { text: 'Row percentages (for the write-up only)' }));
    box.appendChild(PST.table(headers, pctRows,
      { numCols: colLabels.map(function (_, j) { return j + 1; }).concat([colLabels.length + 1]) }));

    PST.renderInterpretation('interpBox',
      '<p>A sentence you can paste into your thesis:</p>' +
      '<p><em>"The distribution of students across the ' + colLabels.length +
      ' categories was compared between ' + rowLabels.length + ' groups (N = ' + res.N + '). ' +
      (useExact
        ? "Fisher's exact test " + (headlineSig ? 'showed a significant difference' : 'showed no significant difference') +
          ' (p = ' + S.formatP(exact.pTwoSided) + ')'
        : 'χ²(' + res.df + ') = ' + PST.fixed(res.chi2, 2) + ', p ' +
          (res.p < 0.001 ? '< 0.001' : '= ' + S.formatP(res.p))) +
      ", Cramér's V = " + PST.fixed(res.cramersV, 2) + '."</em></p>' +
      '<p>Give the raw counts in the text or in an appendix; percentages alone are not ' +
      'reproducible, and an examiner cannot re-check your arithmetic without them.</p>');

    var results = document.getElementById('results');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
