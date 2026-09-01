# -*- coding: utf-8 -*-
"""Reusable HTML fragments for method pages."""


def results_block(title="Results"):
    return f"""
      <section class="results" id="results" hidden>
        <div class="card">
          <div class="card-head">
            <h2>{title}</h2>
            <div class="btn-row">
              <button class="btn btn-ghost btn-sm" type="button" id="copyBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
                Copy
              </button>
              <button class="btn btn-ghost btn-sm" type="button" id="saveBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/></svg>
                Save .txt
              </button>
            </div>
          </div>
          <div id="verdict"></div>
          <div id="statGrid"></div>
          <div class="warnings" id="warnBox"></div>
          <div id="chartBox"></div>
          <div id="detailBox"></div>
          <div class="interpretation" id="interpBox"></div>
        </div>
      </section>
"""


PASTE_NOTE = (
    '<p class="paste-note"><b>Pasting from a spreadsheet works.</b> Copy a column in '
    'Excel, Google&nbsp;Sheets or a CSV file and paste it straight in — line breaks, '
    'commas, semicolons, tabs and spaces are all accepted as separators, and a comma '
    'decimal mark (<code>7,5</code>) is read as <code>7.5</code>.</p>'
)


def paired_inputs(label_a="Pre-test scores", label_b="Post-test scores",
                  hint_a="One value per student, in the same order as the post-test column.",
                  hint_b="One value per student, in the same order as the pre-test column."):
    return f"""
        <div class="data-grid">
          <div class="field">
            <label for="pre">{label_a}</label>
            <textarea id="pre" spellcheck="false" placeholder="12&#10;15&#10;11&#10;18&#10;14"></textarea>
            <div class="hint">{hint_a}</div>
            <span class="count-pill" id="preCount">0 values</span>
          </div>
          <div class="field">
            <label for="post">{label_b}</label>
            <textarea id="post" spellcheck="false" placeholder="16&#10;18&#10;15&#10;21&#10;17"></textarea>
            <div class="hint">{hint_b}</div>
            <span class="count-pill" id="postCount">0 values</span>
          </div>
        </div>
        {PASTE_NOTE}
"""


def group_inputs(label_a="Experimental group", label_b="Control group"):
    return f"""
        <div class="data-grid">
          <div class="field">
            <label for="g1">{label_a}</label>
            <textarea id="g1" spellcheck="false" placeholder="18&#10;22&#10;25&#10;19&#10;24"></textarea>
            <div class="hint">One value per student. The two groups may differ in size.</div>
            <span class="count-pill" id="g1Count">0 values</span>
          </div>
          <div class="field">
            <label for="g2">{label_b}</label>
            <textarea id="g2" spellcheck="false" placeholder="14&#10;16&#10;20&#10;13&#10;17"></textarea>
            <div class="hint">Students taught by the conventional method.</div>
            <span class="count-pill" id="g2Count">0 values</span>
          </div>
        </div>
        {PASTE_NOTE}
"""


def options_row(alternative=True, alpha=True, extra=""):
    parts = []
    if alpha:
        parts.append("""
          <div class="field">
            <label for="alpha">Significance level α</label>
            <select id="alpha">
              <option value="0.05" selected>0.05 — the usual choice</option>
              <option value="0.01">0.01 — stricter</option>
              <option value="0.1">0.10 — exploratory work only</option>
            </select>
          </div>""")
    if alternative:
        parts.append("""
          <div class="field">
            <label for="alternative">Hypothesis</label>
            <select id="alternative">
              <option value="two-sided" selected>Two-sided — any change counts</option>
              <option value="greater">One-sided — scores should rise</option>
              <option value="less">One-sided — scores should fall</option>
            </select>
          </div>""")
    parts.append(extra)
    return '<div class="field-row">' + "".join(parts) + "</div>"


def toolbar(calc_label="Calculate"):
    return f"""
        <div class="data-toolbar">
          <button class="btn btn-primary" type="button" id="calcBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            {calc_label}
          </button>
          <button class="btn btn-secondary" type="button" id="exampleBtn">Load example data</button>
          <button class="btn btn-ghost" type="button" id="clearBtn">Clear</button>
        </div>
"""


def spec_box(items):
    rows = "\n".join(
        f"          <div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in items)
    return f"""
      <aside>
        <div class="spec-box">
          <h3>At a glance</h3>
          <dl class="spec-list">
{rows}
          </dl>
        </div>
      </aside>
"""


def crumbs(items):
    parts = []
    for i, (href, label) in enumerate(items):
        if href:
            parts.append(f'<a href="{href}">{label}</a>')
        else:
            parts.append(f"<span>{label}</span>")
        if i < len(items) - 1:
            parts.append('<span class="sep">›</span>')
    return '<nav class="crumbs" aria-label="Breadcrumb">' + "".join(parts) + "</nav>"
