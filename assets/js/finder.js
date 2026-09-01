/*!
 * Pedagogical Statistics Toolkit — method finder (home page)
 * Live-filtering catalogue: tick the constraints of your study, the list of
 * admissible methods narrows as you go.
 */
(function (window, document) {
  'use strict';

  var PST = window.PST, C = window.PSTCatalog;

  PST.ready(function () {
    var panel = document.getElementById('filterPanel');
    var list = document.getElementById('methodList');
    var countEl = document.getElementById('resultCount');
    var resetBtn = document.getElementById('resetFilters');
    if (!panel || !list) return;

    var state = { design: [], scale: [], groupSize: [], purpose: [] };

    /* ---------------- build the panel ---------------- */
    Object.keys(C.facets).forEach(function (key) {
      var facet = C.facets[key];
      var group = PST.el('div', { class: 'filter-group' }, [
        PST.el('div', { class: 'label', text: facet.label })
      ]);
      facet.options.forEach(function (opt) {
        var input = PST.el('input', {
          type: 'checkbox', value: opt.id,
          'data-facet': key, id: 'f-' + key + '-' + opt.id
        });
        input.addEventListener('change', function () {
          if (facet.exclusive && input.checked) {
            PST.$$('input[data-facet="' + key + '"]', panel).forEach(function (other) {
              if (other !== input) other.checked = false;
            });
          }
          collect();
          render();
        });
        group.appendChild(PST.el('label', { class: 'check', for: input.id }, [
          input, PST.el('span', { text: opt.label })
        ]));
      });
      panel.appendChild(group);
    });

    function collect() {
      Object.keys(state).forEach(function (k) {
        state[k] = PST.$$('input[data-facet="' + k + '"]:checked', panel)
          .map(function (i) { return i.value; });
      });
    }

    /* ---------------- filtering ---------------- */
    function matches(m) {
      if (state.design.length && !state.design.some(function (d) { return m.design.indexOf(d) >= 0; })) return false;
      if (state.scale.length && !state.scale.some(function (s) { return m.scale.indexOf(s) >= 0; })) return false;
      if (state.purpose.length && !state.purpose.some(function (p) { return m.purpose.indexOf(p) >= 0; })) return false;
      if (state.groupSize.length) {
        var ceiling = C.sizeCeiling[state.groupSize[0]];
        if (m.minN > ceiling) return false;
      }
      return true;
    }

    function sizeTag(m) {
      var chosen = state.groupSize[0];
      if (!chosen) return null;
      var ceiling = C.sizeCeiling[chosen];
      if (m.recN > ceiling) {
        return { cls: 'is-n', text: 'usable but under-powered here' };
      }
      return { cls: 'is-design', text: 'well suited to this group size' };
    }

    function card(m) {
      var tags = [];
      if (m.design.length >= 3) {
        tags.push({ cls: 'is-design', text: 'Any design' });
      } else {
        m.design.forEach(function (d) {
          tags.push({ cls: 'is-design', text: C.labels[d] });
        });
      }
      m.scale.forEach(function (s) { tags.push({ cls: 'is-scale', text: C.labels[s] }); });
      tags.push({ cls: '', text: m.minNLabel });
      var st = sizeTag(m);
      if (st) tags.push(st);

      return PST.el('a', { class: 'method-card', href: m.href }, [
        PST.el('h3', { text: m.name }),
        PST.el('p', { text: m.blurb }),
        PST.el('div', { class: 'meta' }, tags.map(function (t) {
          return PST.el('span', { class: 'tag ' + t.cls, text: t.text });
        }))
      ]);
    }

    function render() {
      var shown = C.methods.filter(matches);
      list.innerHTML = '';
      if (!shown.length) {
        list.appendChild(PST.el('div', { class: 'empty-state' }, [
          PST.el('h3', { text: 'No method matches every constraint' }),
          PST.el('p', {
            html: 'That combination cannot be tested with the calculators on this site. ' +
              'Loosen one filter — most often the measurement scale — or read ' +
              '<a href="guides/small-samples.html">Working with 5–7 students</a> ' +
              'for what to do when no test applies.'
          })
        ]));
      } else {
        shown.forEach(function (m) { list.appendChild(card(m)); });
      }
      var active = Object.keys(state).reduce(function (a, k) { return a + state[k].length; }, 0);
      countEl.innerHTML = '<b>' + shown.length + '</b> of ' + C.methods.length + ' methods shown' +
        (active ? ' · ' + active + ' filter' + (active === 1 ? '' : 's') + ' active' : ' · no filters applied');
      resetBtn.hidden = active === 0;
    }

    resetBtn.addEventListener('click', function () {
      PST.$$('input[type="checkbox"]', panel).forEach(function (i) { i.checked = false; });
      collect();
      render();
    });

    render();
  });
})(window, document);
