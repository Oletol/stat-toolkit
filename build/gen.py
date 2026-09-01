# -*- coding: utf-8 -*-
"""Generates every HTML page of the site."""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.dirname(HERE)

import chrome
from blocks import results_block, spec_box, crumbs
from methods import PAGES
import guides


def write(path, html):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as fh:
        fh.write(html)
    return path


# ---------------------------------------------------------------- index
FACET_NOTE = """
        <div class="callout">
          <span class="callout-title">How to use this page</span>
          Tick the constraints of your study on the left. The list narrows to the methods
          that are actually admissible for that combination — including the lower limits on
          group size, which are what usually rules a method out. Nothing is hidden behind a
          wizard: every method stays one click away.
        </div>
"""


def build_index():
    body = f"""
<section class="hero">
  <div class="wrap">
    <span class="eyebrow" style="color:rgba(255,255,255,.62)">For course designers and their supervisors</span>
    <h1>Prove your course works — with the right statistical method</h1>
    <p>Ten calculators for the statistical criteria used to evaluate a newly designed
    course, together with the design guidance that has to be settled <em>before</em> the
    first student enrols. Everything runs in your browser; no data leaves your computer.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#finder">Find my method</a>
      <a class="btn btn-on-dark" href="guides/study-design.html">Plan the study first</a>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><div class="n">10</div><div class="l">Calculators</div></div>
      <div class="hero-stat"><div class="n">4</div><div class="l">Design guides</div></div>
      <div class="hero-stat"><div class="n">n ≥ 5</div><div class="l">Works with tiny cohorts</div></div>
      <div class="hero-stat"><div class="n">0</div><div class="l">Data sent anywhere</div></div>
    </div>
  </div>
</section>

<div class="wrap">
  <section class="section" id="finder">
    <h2 style="margin-top:2rem">Method finder</h2>
    <p class="lede" style="max-width:70ch">Choose a method by the constraints of your study
    rather than by name. Most authored courses run with one group and no control, and with
    fewer than twenty students — the filters below make the consequences of that visible
    straight away.</p>
    {FACET_NOTE}
    <div class="finder" style="margin-top:26px">
      <form class="filter-panel" id="filterPanel" onsubmit="return false">
        <h2>Filters</h2>
        <p class="small muted" style="margin:0">Leave everything unticked to see all methods.</p>
        <button class="btn btn-ghost btn-sm" type="button" id="resetFilters"
                style="width:100%;margin-top:14px" hidden>Clear all filters</button>
      </form>
      <div>
        <div class="result-count" id="resultCount"></div>
        <div class="method-list" id="methodList"></div>
      </div>
    </div>
  </section>

  <section class="section">
    <h2>Settle these before you launch</h2>
    <div class="grid-3" style="margin-top:20px">
      <a class="method-card" href="guides/study-design.html">
        <h3>Study design &amp; measurements</h3>
        <p>How many measurement points a defensible claim needs, what one, two, three or
        four measurements each let you conclude, and how to use the course's own assessments
        as measurement points.</p>
        <div class="meta"><span class="tag is-design">Read first</span></div>
      </a>
      <a class="method-card" href="guides/sample-size.html">
        <h3>Sample size &amp; power</h3>
        <p>How many students you need to detect an effect of a given size, with an
        interactive calculator and the reality check for when that number is out of reach.</p>
        <div class="meta"><span class="tag is-n">Interactive</span></div>
      </a>
      <a class="method-card" href="guides/small-samples.html">
        <h3>Working with 5–7 students</h3>
        <p>Which tests still function at that size, which cannot, six ways to strengthen the
        evidence without recruiting anyone, and the wording that keeps your conclusions
        defensible.</p>
        <div class="meta"><span class="tag is-scale">Micro-cohorts</span></div>
      </a>
    </div>
  </section>

  <section class="section">
    <h2>Three rules that decide whether the analysis stands</h2>
    <div class="grid-3" style="margin-top:18px">
      <div class="card">
        <h3 style="margin-top:0">Percentages are not data</h3>
        <p class="small">Statistical tests run on counts of students. Percentages are for the
        write-up. To compare two percentages properly, use
        <a href="methods/fisher-phi.html">Fisher's φ* criterion</a>, which was designed for
        exactly that job.</p>
      </div>
      <div class="card">
        <h3 style="margin-top:0">The method is chosen first</h3>
        <p class="small">Fix the criterion, the significance level and the hypothesis
        direction in your research programme before any data arrive. Selecting the test that
        gives the smallest p-value afterwards is detectable, and reviewers do detect it.</p>
      </div>
      <div class="card">
        <h3 style="margin-top:0">Significance is not size</h3>
        <p class="small">Always report an <a href="methods/effect-size.html">effect size</a>
        with a confidence interval. A non-significant result at n = 6 is a statement about
        your power, not about your course.</p>
      </div>
    </div>
  </section>
</div>
"""
    html = chrome.render("index.html", "Method finder",
                         "Choose and run the right statistical criterion to evaluate a newly "
                         "designed course: ten browser-based calculators plus study design guidance.",
                         body,
                         scripts=["assets/js/catalog.js", "assets/js/finder.js"],
                         active="index.html")
    return write("index.html", html)


# ---------------------------------------------------------------- method pages
RELATED = {
    "descriptives": ["wilcoxon", "paired-t", "mann-whitney"],
    "sign-test": ["wilcoxon", "hake-gain", "descriptives"],
    "wilcoxon": ["sign-test", "paired-t", "hake-gain"],
    "paired-t": ["wilcoxon", "descriptives", "effect-size"],
    "mann-whitney": ["independent-t", "chi-square", "effect-size"],
    "independent-t": ["mann-whitney", "descriptives", "effect-size"],
    "fisher-phi": ["chi-square", "effect-size", "mann-whitney"],
    "chi-square": ["fisher-phi", "effect-size", "mann-whitney"],
    "hake-gain": ["wilcoxon", "paired-t", "effect-size"],
    "effect-size": ["wilcoxon", "independent-t", "chi-square"],
}

BY_ID = {p["id"]: p for p in PAGES}


def related_block(page_id):
    ids = RELATED.get(page_id, [])
    cards = []
    for i in ids:
        p = BY_ID[i]
        cards.append(f"""      <a class="method-card" href="{os.path.basename(p['file'])}">
        <h3>{p['title']}</h3>
        <p>{p['lede'][:150]}…</p>
      </a>""")
    return ('<section class="section"><h2>Related methods</h2>'
            '<div class="grid-3" style="margin-top:18px">\n'
            + "\n".join(cards) + "\n</div></section>")


def build_method(p):
    cr = crumbs([("../index.html", "Method finder"), (None, p["title"])])
    body = f"""
<div class="page-head">
  <div class="wrap">
    {cr}
    <span class="eyebrow">{p['eyebrow']}</span>
    <h1>{p['title']}</h1>
    <p class="lede">{p['lede']}</p>
  </div>
</div>

<div class="wrap">
  <div class="method-layout" style="margin-top:30px">
    <div>
      <section class="card">
        <div class="card-head"><h2 style="margin:0">What this test does</h2></div>
        {p['about']}
      </section>

      <section class="card" style="margin-top:22px">
        <div class="card-head">
          <h2 style="margin:0">Your data</h2>
          <span class="small muted">Computed in your browser — nothing is uploaded</span>
        </div>
        {p['form']}
      </section>
{results_block()}
      <section class="section">
        {p['notes']}
      </section>

      {related_block(p['id'])}
    </div>
{spec_box(p['spec'])}
  </div>
</div>
"""
    html = chrome.render(p["file"], p["title"].replace("&amp;", "&"), p["meta"], body,
                         scripts=[p["script"]], active="index.html")
    return write(p["file"], html)


def main():
    written = [build_index()]
    for p in PAGES:
        written.append(build_method(p))
    written += guides.build(write, chrome, results_block, crumbs)
    for w in written:
        print("wrote", w)
    print("\n%d pages" % len(written))


if __name__ == "__main__":
    main()
