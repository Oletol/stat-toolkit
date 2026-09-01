/* Interactive pre-launch checklist */
(function () {
  'use strict';
  var PST = window.PST;
  var KEY = 'pst-checklist';

  PST.ready(function () {
    var list = document.getElementById('checklist');
    if (!list) return;
    var boxes = PST.$$('input[type="checkbox"]', list);
    var saved = {};
    try { saved = JSON.parse(PST.store.get(KEY) || '{}') || {}; } catch (e) { saved = {}; }

    boxes.forEach(function (box) {
      box.checked = !!saved[box.id];
      syncRow(box);
      box.addEventListener('change', function () {
        syncRow(box);
        persist(boxes);
        updateProgress(boxes);
      });
    });
    updateProgress(boxes);

    document.getElementById('resetCk').addEventListener('click', function () {
      boxes.forEach(function (b) { b.checked = false; syncRow(b); });
      persist(boxes);
      updateProgress(boxes);
      PST.toast('Checklist cleared');
    });
    document.getElementById('printCk').addEventListener('click', function () { window.print(); });
  });

  function syncRow(box) {
    var li = box.closest ? box.closest('li') : box.parentNode;
    if (li) li.classList.toggle('is-done', box.checked);
  }

  function persist(boxes) {
    var state = {};
    boxes.forEach(function (b) { if (b.checked) state[b.id] = 1; });
    PST.store.set(KEY, JSON.stringify(state));
  }

  function updateProgress(boxes) {
    var done = boxes.filter(function (b) { return b.checked; }).length;
    var total = boxes.length;
    var pct = total ? done / total * 100 : 0;
    document.getElementById('ckBar').style.width = pct + '%';
    var msg = done + ' of ' + total + ' items complete';
    if (done === total) msg += ' — ready to launch';
    else if (done === 0) msg += '';
    else msg += ' (' + Math.round(pct) + '%)';
    document.getElementById('ckCount').textContent = msg;
  }
})();
