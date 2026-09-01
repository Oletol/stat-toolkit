# -*- coding: utf-8 -*-
"""Shared HTML chrome for every page of the site."""

SITE = "Pedagogical Statistics Toolkit"

NAV = [
    ("index.html", "Method finder"),
    ("guides/study-design.html", "Study design"),
    ("guides/sample-size.html", "Sample size"),
    ("guides/small-samples.html", "Small samples"),
    ("guides/checklist.html", "Checklist"),
]

BRAND_SVG = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" '
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    '<path d="M3 20h18"/><path d="M6 20V11"/><path d="M11 20V5"/><path d="M16 20v-6"/>'
    '<path d="M21 20V8"/></svg>'
)


def head(title, description, prefix, extra_css=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · {SITE}</title>
<meta name="description" content="{description}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%232e5c8a'/%3E%3Cg stroke='%23fff' stroke-width='2.6' stroke-linecap='round'%3E%3Cpath d='M7 24h18'/%3E%3Cpath d='M10 24v-7'/%3E%3Cpath d='M16 24V9'/%3E%3Cpath d='M22 24v-11'/%3E%3C/g%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=JetBrains+Mono:wght@400;500;600&display=swap">
<link rel="stylesheet" href="{prefix}assets/css/style.css">{extra_css}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
"""


def header(prefix, active):
    links = []
    for href, label in NAV:
        cur = ' aria-current="page"' if href == active else ""
        links.append(f'<a href="{prefix}{href}"{cur}>{label}</a>')
    nav = "\n      ".join(links)
    return f"""<header class="site-header">
  <div class="wrap">
    <a class="brand" href="{prefix}index.html">
      <span class="brand-mark">{BRAND_SVG}</span>
      <span class="brand-text">
        <span class="brand-name">Pedagogical Statistics</span>
        <span class="brand-sub">Toolkit</span>
      </span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mainnav" aria-label="Open menu">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
    <nav class="nav" id="mainnav">
      {nav}
    </nav>
    <button class="theme-toggle" type="button" aria-label="Switch theme"></button>
  </div>
</header>
<main id="main">
"""


FOOTER_METHODS = [
    ("methods/descriptives.html", "Descriptive statistics"),
    ("methods/sign-test.html", "Sign test"),
    ("methods/wilcoxon.html", "Wilcoxon signed-rank"),
    ("methods/paired-t.html", "Paired t-test"),
    ("methods/mann-whitney.html", "Mann–Whitney U"),
    ("methods/independent-t.html", "Independent t-test"),
    ("methods/fisher-phi.html", "Fisher's φ*"),
    ("methods/chi-square.html", "Chi-square"),
    ("methods/hake-gain.html", "Normalized gain"),
    ("methods/effect-size.html", "Effect sizes"),
]

FOOTER_GUIDES = [
    ("guides/study-design.html", "Study design &amp; measurements"),
    ("guides/sample-size.html", "Sample size &amp; power"),
    ("guides/small-samples.html", "Working with 5–7 students"),
    ("guides/checklist.html", "Pre-launch checklist"),
]


def footer(prefix, scripts):
    m = "\n        ".join(
        f'<li><a href="{prefix}{h}">{t}</a></li>' for h, t in FOOTER_METHODS)
    g = "\n        ".join(
        f'<li><a href="{prefix}{h}">{t}</a></li>' for h, t in FOOTER_GUIDES)
    tags = "\n".join(f'<script src="{prefix}{s}"></script>' for s in scripts)
    return f"""</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <h4>About this toolkit</h4>
        <p>A set of calculators for the statistical methods most often needed when a
        master's student has to demonstrate that a newly designed course actually works.
        Every calculation runs in your browser — no data is uploaded anywhere.</p>
        <p>The methodological base is B. E. Starichenko, <em>Processing and Presenting
        Data from Pedagogical Research with a Computer</em> (Ural State Pedagogical
        University, 2004), extended with effect sizes and exact small-sample tests.</p>
      </div>
      <div>
        <h4>Methods</h4>
        <ul>
        {m}
        </ul>
      </div>
      <div>
        <h4>Guides</h4>
        <ul>
        {g}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>Pedagogical Statistics Toolkit · open source, MIT licensed</span>
      <span>Results are a computational aid, not a substitute for methodological judgement.</span>
    </div>
  </div>
</footer>
{tags}
</body>
</html>
"""


def render(path, title, description, body, scripts=(), active="", extra_css=""):
    depth = path.count("/")
    prefix = "../" * depth
    js = ["assets/js/stats.js", "assets/js/ui.js"] + list(scripts)
    return (head(title, description, prefix, extra_css)
            + header(prefix, active)
            + body
            + footer(prefix, js))
