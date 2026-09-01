/*!
 * Pedagogical Statistics Toolkit — shared user-interface layer
 * Navigation, data parsing, result rendering, SVG charts, export helpers.
 */
(function (window, document) {
  'use strict';

  var PST = {};
  var S = window.PSTStats;

  /* ------------------------------------------------------------------ *
   * Tiny DOM helpers
   * ------------------------------------------------------------------ */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  PST.$ = $;
  PST.$$ = $$;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] !== null && attrs[k] !== undefined) {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  PST.el = el;

  PST.ready = function (fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  /* ------------------------------------------------------------------ *
   * Storage (always guarded — may throw in private mode)
   * ------------------------------------------------------------------ */

  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  PST.store = store;

  /* ------------------------------------------------------------------ *
   * Theme
   * ------------------------------------------------------------------ */

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function currentTheme() {
    var saved = store.get('pst-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btn = $('.theme-toggle');
    if (btn) {
      btn.innerHTML = t === 'dark' ? SUN : MOON;
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  function initChrome() {
    applyTheme(currentTheme());
    var btn = $('.theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        store.set('pst-theme', next);
        applyTheme(next);
      });
    }
    var toggle = $('.nav-toggle'), nav = $('.nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * Number formatting
   * ------------------------------------------------------------------ */

  function fmt(x, dp) {
    if (x === null || x === undefined || (typeof x === 'number' && !isFinite(x))) return '—';
    dp = dp === undefined ? 3 : dp;
    var v = Number(x);
    if (Math.abs(v) >= 1e6 || (v !== 0 && Math.abs(v) < 1e-4)) return v.toExponential(2);
    return v.toFixed(dp).replace(/\.?0+$/, function (m) { return m.indexOf('.') === 0 ? '' : m; });
  }
  PST.fmt = fmt;

  PST.fixed = function (x, dp) {
    if (x === null || x === undefined || !isFinite(x)) return '—';
    return Number(x).toFixed(dp === undefined ? 2 : dp);
  };
  PST.pct = function (x, dp) {
    if (!isFinite(x)) return '—';
    return (x * 100).toFixed(dp === undefined ? 1 : dp) + '%';
  };
  PST.formatP = function (p) { return S.formatP(p); };

  /* ------------------------------------------------------------------ *
   * Data parsing
   * ------------------------------------------------------------------ */

  /**
   * Parses free-form numeric input: newlines, commas, semicolons, tabs
   * and spaces all work as separators, so pasting a column straight out
   * of Excel or a CSV both behave.
   */
  function parseNumbers(text) {
    var raw = String(text || '')
      .replace(/ /g, ' ')
      .split(/[\s,;]+/)
      .filter(function (s) { return s.length > 0; });
    var values = [], invalid = [];
    raw.forEach(function (tok) {
      var t = tok.replace(',', '.');
      var v = Number(t);
      if (t === '' || isNaN(v)) invalid.push(tok); else values.push(v);
    });
    return { values: values, invalid: invalid, count: values.length };
  }
  PST.parseNumbers = parseNumbers;

  /** Reads a textarea and shows a live count pill next to it. */
  PST.bindCounter = function (textareaId, pillId) {
    var ta = document.getElementById(textareaId);
    var pill = document.getElementById(pillId);
    if (!ta || !pill) return;
    function update() {
      var r = parseNumbers(ta.value);
      pill.textContent = r.count + (r.count === 1 ? ' value' : ' values') +
        (r.invalid.length ? ' · ' + r.invalid.length + ' unreadable' : '');
      pill.style.color = r.invalid.length ? 'var(--danger)' : '';
    }
    ta.addEventListener('input', update);
    update();
  };

  /** Validates two samples that must be paired. */
  PST.validatePaired = function (a, b) {
    var errors = [];
    if (a.invalid.length) errors.push('Pre-test column contains values that are not numbers: ' + a.invalid.slice(0, 5).join(', '));
    if (b.invalid.length) errors.push('Post-test column contains values that are not numbers: ' + b.invalid.slice(0, 5).join(', '));
    if (a.count === 0 || b.count === 0) errors.push('Enter both the pre-test and the post-test scores.');
    else if (a.count !== b.count) {
      errors.push('The two columns must have the same length — one row per student. ' +
        'Pre-test has ' + a.count + ' values, post-test has ' + b.count + '.');
    }
    return errors;
  };

  /** Validates two independent samples. */
  PST.validateGroups = function (a, b, minEach) {
    minEach = minEach || 2;
    var errors = [];
    if (a.invalid.length) errors.push('Group 1 contains values that are not numbers: ' + a.invalid.slice(0, 5).join(', '));
    if (b.invalid.length) errors.push('Group 2 contains values that are not numbers: ' + b.invalid.slice(0, 5).join(', '));
    if (a.count < minEach || b.count < minEach) {
      errors.push('Each group needs at least ' + minEach + ' observations. ' +
        'Group 1 has ' + a.count + ', group 2 has ' + b.count + '.');
    }
    return errors;
  };

  /* ------------------------------------------------------------------ *
   * Result rendering
   * ------------------------------------------------------------------ */

  /** Renders a row of headline statistics. */
  PST.renderStats = function (target, items) {
    var box = typeof target === 'string' ? document.getElementById(target) : target;
    box.innerHTML = '';
    box.className = 'stat-grid';
    items.forEach(function (it) {
      box.appendChild(el('div', { class: 'stat' + (it.key ? ' is-key' : '') }, [
        el('div', { class: 'k', text: it.label }),
        el('div', { class: 'v' + (it.small ? ' small' : ''), html: it.value }),
        it.note ? el('div', { class: 's', html: it.note }) : null
      ]));
    });
  };

  /**
   * Renders the headline verdict.
   * tone: 'ok' | 'warn' | 'none' | 'info'
   */
  PST.renderVerdict = function (target, tone, title, paragraphs) {
    var box = typeof target === 'string' ? document.getElementById(target) : target;
    var icons = { ok: '✓', warn: '!', none: '×', info: 'i' };
    box.className = 'verdict is-' + tone;
    box.innerHTML = '';
    box.appendChild(el('div', { class: 'verdict-icon', text: icons[tone] || 'i' }));
    var body = el('div', {}, [el('h3', { text: title })]);
    (Array.isArray(paragraphs) ? paragraphs : [paragraphs]).forEach(function (p) {
      if (p) body.appendChild(el('p', { html: p }));
    });
    box.appendChild(body);
  };

  /** Renders a list of caveats. Each item: {tone, text}. */
  PST.renderWarnings = function (target, items) {
    var box = typeof target === 'string' ? document.getElementById(target) : target;
    box.innerHTML = '';
    (items || []).forEach(function (w) {
      box.appendChild(el('div', { class: 'warn-item' + (w.tone ? ' is-' + w.tone : '') }, [
        el('span', { class: 'badge-dot' }),
        el('span', { html: w.text })
      ]));
    });
  };

  /** Renders the plain-language interpretation block. */
  PST.renderInterpretation = function (target, html) {
    var box = typeof target === 'string' ? document.getElementById(target) : target;
    box.innerHTML = '<h4>How to report this</h4>' + html;
  };

  /** Builds a simple two-column table. */
  PST.table = function (headers, rows, opts) {
    opts = opts || {};
    var thead = el('thead', {}, [el('tr', {}, headers.map(function (h, i) {
      return el('th', { class: (opts.numCols || []).indexOf(i) >= 0 ? 'num' : '', text: h });
    }))]);
    var tbody = el('tbody', {}, rows.map(function (r) {
      return el('tr', { class: r.groupRow ? 'group-row' : '' }, (r.cells || r).map(function (c, i) {
        return el('td', { class: (opts.numCols || []).indexOf(i) >= 0 ? 'num' : '', html: String(c) });
      }));
    }));
    return el('div', { class: 'table-scroll' }, [el('table', { class: 'data' }, [thead, tbody])]);
  };

  /* ------------------------------------------------------------------ *
   * SVG charts — small, dependency-free, theme-aware
   * ------------------------------------------------------------------ */

  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function niceScale(min, max) {
    if (min === max) { min -= 1; max += 1; }
    var pad = (max - min) * 0.1;
    return { lo: min - pad, hi: max + pad };
  }

  function axisFrame(svg, W, H, M, lo, hi, ticks, xLabels) {
    var i;
    var n = ticks || 5;
    for (i = 0; i <= n; i++) {
      var v = lo + (hi - lo) * i / n;
      var y = H - M.b - (v - lo) / (hi - lo) * (H - M.t - M.b);
      svg.appendChild(svgEl('line', {
        x1: M.l, x2: W - M.r, y1: y, y2: y,
        stroke: 'var(--line)', 'stroke-width': 1
      }));
      var t = svgEl('text', {
        x: M.l - 8, y: y + 4, 'text-anchor': 'end',
        fill: 'var(--muted)', 'font-size': 11, 'font-family': 'var(--mono)'
      });
      t.textContent = (Math.abs(hi - lo) < 10 ? v.toFixed(1) : Math.round(v));
      svg.appendChild(t);
    }
    (xLabels || []).forEach(function (lab) {
      var t = svgEl('text', {
        x: lab.x, y: H - M.b + 20, 'text-anchor': 'middle',
        fill: 'var(--muted)', 'font-size': 12, 'font-family': 'var(--sans)'
      });
      t.textContent = lab.text;
      svg.appendChild(t);
    });
  }

  var charts = {};

  /** Slope chart: one line per student from pre to post. */
  charts.slope = function (pre, post, opts) {
    opts = opts || {};
    var W = 640, H = 300, M = { t: 16, r: 26, b: 34, l: 44 };
    var all = pre.concat(post);
    var sc = niceScale(Math.min.apply(null, all), Math.max.apply(null, all));
    var xA = M.l + 70, xB = W - M.r - 70;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    svg.setAttribute('aria-label', 'Individual pre-test to post-test change for each participant');
    axisFrame(svg, W, H, M, sc.lo, sc.hi, 5,
      [{ x: xA, text: opts.labelA || 'Pre-test' }, { x: xB, text: opts.labelB || 'Post-test' }]);
    function y(v) { return H - M.b - (v - sc.lo) / (sc.hi - sc.lo) * (H - M.t - M.b); }

    for (var i = 0; i < pre.length; i++) {
      var up = post[i] > pre[i], flat = post[i] === pre[i];
      var col = flat ? 'var(--muted-2)' : (up ? 'var(--ok)' : 'var(--danger)');
      svg.appendChild(svgEl('line', {
        x1: xA, y1: y(pre[i]), x2: xB, y2: y(post[i]),
        stroke: col, 'stroke-width': 1.7, 'stroke-opacity': .62, 'stroke-linecap': 'round'
      }));
      svg.appendChild(svgEl('circle', { cx: xA, cy: y(pre[i]), r: 3.4, fill: col, 'fill-opacity': .8 }));
      svg.appendChild(svgEl('circle', { cx: xB, cy: y(post[i]), r: 3.4, fill: col, 'fill-opacity': .8 }));
    }
    // group means
    var mA = S.mean(pre), mB = S.mean(post);
    svg.appendChild(svgEl('line', {
      x1: xA, y1: y(mA), x2: xB, y2: y(mB),
      stroke: 'var(--blue)', 'stroke-width': 3.2, 'stroke-linecap': 'round'
    }));
    [[xA, mA], [xB, mB]].forEach(function (p) {
      svg.appendChild(svgEl('circle', {
        cx: p[0], cy: y(p[1]), r: 5.6, fill: 'var(--blue)',
        stroke: 'var(--surface)', 'stroke-width': 2
      }));
      var t = svgEl('text', {
        x: p[0], y: y(p[1]) - 12, 'text-anchor': 'middle',
        fill: 'var(--blue)', 'font-size': 12, 'font-weight': 600, 'font-family': 'var(--mono)'
      });
      t.textContent = p[1].toFixed(1);
      svg.appendChild(t);
    });
    return svg;
  };

  /** Strip plot: individual values for two or more groups, with means. */
  charts.strip = function (groups, labels) {
    var W = 640, H = 300, M = { t: 16, r: 26, b: 34, l: 44 };
    var all = [];
    groups.forEach(function (g) { all = all.concat(g); });
    var sc = niceScale(Math.min.apply(null, all), Math.max.apply(null, all));
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    svg.setAttribute('aria-label', 'Distribution of individual scores in each group');
    var band = (W - M.l - M.r) / groups.length;
    var xs = groups.map(function (g, i) { return M.l + band * (i + 0.5); });
    axisFrame(svg, W, H, M, sc.lo, sc.hi, 5, xs.map(function (x, i) {
      return { x: x, text: labels[i] };
    }));
    function y(v) { return H - M.b - (v - sc.lo) / (sc.hi - sc.lo) * (H - M.t - M.b); }
    var palette = ['var(--blue)', 'var(--ok)', 'var(--warn)', 'var(--danger)'];

    groups.forEach(function (g, gi) {
      var col = palette[gi % palette.length];
      var seen = {};
      g.forEach(function (v) {
        seen[v] = (seen[v] || 0) + 1;
        var offset = (seen[v] - 1) * 9 - ((countOf(g, v) - 1) * 9) / 2;
        svg.appendChild(svgEl('circle', {
          cx: xs[gi] + offset, cy: y(v), r: 4.2,
          fill: col, 'fill-opacity': .5, stroke: col, 'stroke-width': 1.2
        }));
      });
      var m = S.mean(g);
      svg.appendChild(svgEl('line', {
        x1: xs[gi] - 34, x2: xs[gi] + 34, y1: y(m), y2: y(m),
        stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round'
      }));
      var t = svgEl('text', {
        x: xs[gi] + 40, y: y(m) + 4, fill: col,
        'font-size': 12, 'font-weight': 600, 'font-family': 'var(--mono)'
      });
      t.textContent = m.toFixed(1);
      svg.appendChild(t);
    });
    function countOf(arr, v) {
      return arr.filter(function (x) { return x === v; }).length;
    }
    return svg;
  };

  /** Horizontal proportion bars. */
  charts.proportions = function (items) {
    var W = 640, rowH = 62, H = items.length * rowH + 18;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    svg.setAttribute('aria-label', 'Proportion of participants showing the effect in each group');
    var x0 = 150, barW = W - x0 - 70;
    items.forEach(function (it, i) {
      var y = 14 + i * rowH;
      var lab = svgEl('text', {
        x: x0 - 12, y: y + 21, 'text-anchor': 'end',
        fill: 'var(--ink-2)', 'font-size': 13, 'font-family': 'var(--sans)', 'font-weight': 500
      });
      lab.textContent = it.label;
      svg.appendChild(lab);
      svg.appendChild(svgEl('rect', {
        x: x0, y: y, width: barW, height: 30, rx: 5,
        fill: 'var(--surface-2)', stroke: 'var(--line)'
      }));
      svg.appendChild(svgEl('rect', {
        x: x0, y: y, width: Math.max(2, barW * it.value), height: 30, rx: 5,
        fill: it.color || 'var(--blue)', 'fill-opacity': .85
      }));
      var val = svgEl('text', {
        x: x0 + barW + 12, y: y + 21,
        fill: 'var(--ink)', 'font-size': 13, 'font-weight': 600, 'font-family': 'var(--mono)'
      });
      val.textContent = (it.value * 100).toFixed(1) + '%';
      svg.appendChild(val);
      if (it.sub) {
        var sub = svgEl('text', {
          x: x0, y: y + 46, fill: 'var(--muted)', 'font-size': 11.5, 'font-family': 'var(--sans)'
        });
        sub.textContent = it.sub;
        svg.appendChild(sub);
      }
    });
    return svg;
  };

  /** Histogram of a numeric vector. */
  charts.histogram = function (values, opts) {
    opts = opts || {};
    var W = 640, H = 260, M = { t: 14, r: 20, b: 38, l: 44 };
    var lo = Math.min.apply(null, values), hi = Math.max.apply(null, values);
    if (lo === hi) { lo -= 0.5; hi += 0.5; }
    var k = opts.bins || Math.max(4, Math.min(12, Math.ceil(Math.sqrt(values.length))));
    var w = (hi - lo) / k;
    var counts = new Array(k).fill(0);
    values.forEach(function (v) {
      var i = Math.min(k - 1, Math.floor((v - lo) / w));
      counts[i]++;
    });
    var maxC = Math.max.apply(null, counts);
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    svg.setAttribute('aria-label', opts.label || 'Distribution of values');
    var plotW = W - M.l - M.r, plotH = H - M.t - M.b;
    for (var t = 0; t <= maxC; t += Math.max(1, Math.ceil(maxC / 4))) {
      var y = H - M.b - t / maxC * plotH;
      svg.appendChild(svgEl('line', { x1: M.l, x2: W - M.r, y1: y, y2: y, stroke: 'var(--line)' }));
      var lt = svgEl('text', { x: M.l - 8, y: y + 4, 'text-anchor': 'end',
        fill: 'var(--muted)', 'font-size': 11, 'font-family': 'var(--mono)' });
      lt.textContent = t;
      svg.appendChild(lt);
    }
    counts.forEach(function (c, i) {
      var bw = plotW / k;
      var h = maxC ? c / maxC * plotH : 0;
      svg.appendChild(svgEl('rect', {
        x: M.l + i * bw + 2, y: H - M.b - h, width: bw - 4, height: h, rx: 3,
        fill: opts.color || 'var(--blue)', 'fill-opacity': .75
      }));
    });
    [0, k / 2, k].forEach(function (i) {
      var v = lo + w * i;
      var lt = svgEl('text', {
        x: M.l + (plotW / k) * i, y: H - M.b + 20, 'text-anchor': 'middle',
        fill: 'var(--muted)', 'font-size': 11, 'font-family': 'var(--mono)'
      });
      lt.textContent = v.toFixed(Math.abs(hi - lo) < 5 ? 2 : 1);
      svg.appendChild(lt);
    });
    return svg;
  };

  /** Means with confidence-interval whiskers. */
  charts.meansCi = function (items) {
    var W = 640, H = 260, M = { t: 20, r: 30, b: 38, l: 48 };
    var lows = items.map(function (i) { return i.low; });
    var highs = items.map(function (i) { return i.high; });
    var sc = niceScale(Math.min.apply(null, lows), Math.max.apply(null, highs));
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    svg.setAttribute('aria-label', 'Group means with 95% confidence intervals');
    var band = (W - M.l - M.r) / items.length;
    var xs = items.map(function (it, i) { return M.l + band * (i + 0.5); });
    axisFrame(svg, W, H, M, sc.lo, sc.hi, 5, xs.map(function (x, i) {
      return { x: x, text: items[i].label };
    }));
    function y(v) { return H - M.b - (v - sc.lo) / (sc.hi - sc.lo) * (H - M.t - M.b); }
    items.forEach(function (it, i) {
      var col = it.color || 'var(--blue)';
      svg.appendChild(svgEl('line', {
        x1: xs[i], x2: xs[i], y1: y(it.low), y2: y(it.high),
        stroke: col, 'stroke-width': 2
      }));
      [it.low, it.high].forEach(function (v) {
        svg.appendChild(svgEl('line', {
          x1: xs[i] - 10, x2: xs[i] + 10, y1: y(v), y2: y(v), stroke: col, 'stroke-width': 2
        }));
      });
      svg.appendChild(svgEl('circle', {
        cx: xs[i], cy: y(it.mean), r: 6, fill: col,
        stroke: 'var(--surface)', 'stroke-width': 2
      }));
      var t = svgEl('text', {
        x: xs[i] + 16, y: y(it.mean) + 4, fill: col,
        'font-size': 12.5, 'font-weight': 600, 'font-family': 'var(--mono)'
      });
      t.textContent = it.mean.toFixed(2);
      svg.appendChild(t);
    });
    return svg;
  };

  PST.chart = charts;

  /** Places a chart inside a titled box. */
  PST.renderChart = function (target, title, svgNode, legend) {
    var box = typeof target === 'string' ? document.getElementById(target) : target;
    box.innerHTML = '';
    box.className = 'chart-box';
    box.appendChild(el('h4', { text: title }));
    box.appendChild(svgNode);
    if (legend && legend.length) {
      box.appendChild(el('div', { class: 'chart-legend' }, legend.map(function (l) {
        return el('span', {}, [el('i', { style: 'background:' + l.color }), document.createTextNode(l.text)]);
      })));
    }
  };

  /* ------------------------------------------------------------------ *
   * Export helpers
   * ------------------------------------------------------------------ */

  var toastTimer = null;
  PST.toast = function (msg) {
    var t = $('.toast');
    if (!t) { t = el('div', { class: 'toast' }); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2200);
  };

  /** Turns the visible results block into plain text. */
  function resultsToText(container, title) {
    var lines = [title, new Array(title.length + 1).join('='), ''];
    $$('.verdict', container).forEach(function (v) {
      var h = $('h3', v);
      if (h) lines.push(h.textContent.toUpperCase());
      $$('p', v).forEach(function (p) { lines.push(p.textContent); });
      lines.push('');
    });
    $$('.stat', container).forEach(function (s) {
      var k = $('.k', s), v = $('.v', s), n = $('.s', s);
      lines.push('  ' + k.textContent + ': ' + v.textContent + (n ? '  (' + n.textContent + ')' : ''));
    });
    lines.push('');
    $$('.warn-item', container).forEach(function (w) { lines.push('! ' + w.textContent.trim()); });
    var interp = $('.interpretation', container);
    if (interp) {
      lines.push('', 'HOW TO REPORT THIS');
      $$('p', interp).forEach(function (p) { lines.push(p.textContent); });
    }
    lines.push('', '— Computed with the Pedagogical Statistics Toolkit, ' +
      new Date().toISOString().slice(0, 10));
    return lines.join('\n');
  }
  PST.resultsToText = resultsToText;

  PST.bindExport = function (opts) {
    var container = document.getElementById(opts.container);
    var copyBtn = document.getElementById(opts.copyBtn);
    var saveBtn = document.getElementById(opts.saveBtn);
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var text = resultsToText(container, opts.title);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          PST.toast('Results copied to the clipboard');
        }, function () { PST.toast('Copying was blocked by the browser'); });
      } else {
        var ta = el('textarea', {}); ta.value = text;
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); PST.toast('Results copied to the clipboard'); }
        catch (e) { PST.toast('Copying is not supported here'); }
        document.body.removeChild(ta);
      }
    });
    if (saveBtn) saveBtn.addEventListener('click', function () {
      var text = resultsToText(container, opts.title);
      var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = el('a', { href: url, download: (opts.filename || 'results') + '.txt' });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      PST.toast('Saved as ' + (opts.filename || 'results') + '.txt');
    });
  };

  /** Wires the "Load example data" button. */
  PST.bindExample = function (buttonId, fields) {
    var btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      Object.keys(fields).forEach(function (id) {
        var node = document.getElementById(id);
        if (!node) return;
        node.value = fields[id];
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });
      PST.toast('Example data loaded');
    });
  };

  /** Wires the "Clear" button. */
  PST.bindClear = function (buttonId, ids, resultsId) {
    var btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      ids.forEach(function (id) {
        var node = document.getElementById(id);
        if (node) { node.value = ''; node.dispatchEvent(new Event('input', { bubbles: true })); }
      });
      var res = document.getElementById(resultsId);
      if (res) res.hidden = true;
    });
  };

  /** Shows a blocking validation message inside the results area. */
  PST.showErrors = function (resultsId, verdictId, errors) {
    var res = document.getElementById(resultsId);
    ['statGrid', 'chartBox', 'detailBox', 'warnBox', 'interpBox'].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) n.innerHTML = '';
    });
    PST.renderVerdict(verdictId, 'none', 'The data could not be read',
      errors.map(function (e) { return e; }));
    res.hidden = false;
    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Common alpha / alternative reading. */
  PST.readOptions = function () {
    var alphaEl = document.getElementById('alpha');
    var altEl = document.getElementById('alternative');
    return {
      alpha: alphaEl ? Number(alphaEl.value) : 0.05,
      alternative: altEl ? altEl.value : 'two-sided'
    };
  };

  /* ------------------------------------------------------------------ *
   * Shared interpretation language
   * ------------------------------------------------------------------ */

  /**
   * Builds the standard "is the methodology effective?" verdict, taking the
   * study design into account. `ctx` carries:
   *   significant, p, alpha, direction ('improved' | 'declined' | 'none'),
   *   effect {value, label, name}, design ('single-group' | 'two-group'),
   *   n, extra (array of strings)
   */
  PST.effectivenessVerdict = function (ctx) {
    var tone, title, paras = [];
    var pTxt = '<b>p = ' + S.formatP(ctx.p) + '</b>';
    var aTxt = 'α = ' + ctx.alpha;

    if (ctx.significant && ctx.direction === 'improved') {
      tone = 'ok';
      title = 'Statistically significant improvement';
      paras.push('The change is statistically significant (' + pTxt + ', ' + aTxt +
        '). The improvement observed after the course is unlikely to be the product of chance alone.');
    } else if (ctx.significant && ctx.direction === 'declined') {
      tone = 'none';
      title = 'Statistically significant decline';
      paras.push('The change is statistically significant (' + pTxt + ', ' + aTxt +
        '), but it goes in the wrong direction: scores fell after the course. Check for scoring errors, ' +
        'a harder post-test, or a mismatch between the material taught and the material tested.');
    } else if (ctx.significant) {
      tone = 'ok';
      title = 'Statistically significant difference';
      paras.push('The difference is statistically significant (' + pTxt + ', ' + aTxt + ').');
    } else {
      tone = 'warn';
      title = 'No statistically significant difference';
      paras.push('The difference did not reach the significance threshold (' + pTxt + ', ' + aTxt +
        '). This is <em>not</em> evidence that the methodology has no effect — with n = ' + ctx.n +
        ' the study can only detect fairly large effects. Report it as "the difference did not reach ' +
        'significance at this sample size", never as "there is no difference".');
    }

    if (ctx.effect) {
      paras.push('Effect size: <b>' + ctx.effect.name + ' = ' + ctx.effect.value + '</b> (' +
        ctx.effect.label + '). The effect size is independent of sample size and must be reported ' +
        'alongside the p-value.');
    }

    if (ctx.design === 'single-group') {
      paras.push('<b>Design caveat.</b> With a single group and no control, the change cannot be ' +
        'attributed to the methodology alone: maturation, parallel courses, motivation and the ' +
        'test–retest effect are all still in play. State this as a limitation, and support the ' +
        'claim with qualitative evidence or a comparison against previous cohorts.');
    }

    (ctx.extra || []).forEach(function (t) { paras.push(t); });
    return { tone: tone, title: title, paragraphs: paras };
  };

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  PST.ready(initChrome);
  window.PST = PST;
})(window, document);
