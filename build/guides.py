# -*- coding: utf-8 -*-
"""The four guide pages."""

DESIGN_ROWS = [
    ("Final measurement only", "1",
     "That the group reached a benchmark fixed in advance (one-sample comparison against a norm).",
     "That the level reached was produced by <em>your</em> methodology. The group may simply have been strong to begin with.",
     "Not sufficient. Admissible only as a supporting argument, and only when the benchmark is independently justified.",
     "is-danger"),
    ("Pre-test and post-test, one group", "2",
     "That the level rose significantly over the course, and by how much.",
     "That the rise was caused by the methodology rather than by time, parallel courses, maturation, motivation or the test–retest effect.",
     "The mandatory minimum for any evidential claim. Must be accompanied by an effect size and, ideally, qualitative evidence.",
     "is-ok"),
    ("Pre-test, interim and final measurements, one group", "3 – 4",
     "That growth is sustained and happens during the course rather than in one unexplained jump; the direction of the trend.",
     "Same limitation: without a control group the effect still cannot be attributed to the methodology with certainty.",
     "The recommended design when no control group is possible. Use the course's own interim assessments as measurement points.",
     ""),
    ("Pre-test, post-test and a delayed measurement 1–3 months later", "3 – 4",
     "That the result survives the end of the course — retention rather than short-term recall.",
     "—",
     "Substantially strengthens the work. Strongly recommended for a master's thesis or dissertation.",
     ""),
    ("Experimental and control groups, pre-test and post-test", "2 × 2 groups",
     "That the effect is attributable to the methodology; the size of its advantage over conventional teaching.",
     "—",
     "The most evidential design available. When a control group cannot be recruited, see <a href=\"small-samples.html\">Working with 5–7 students</a>.",
     "is-ok"),
]

DESIGN_NOTES = [
    "The course's own assessments are your measurement points — you do not need to organise extra testing. Their content and marking scheme do, however, have to be planned in advance and be comparable with one another.",
    "The pre-test and post-test must be equivalent in difficulty, structure and number of items. Using the identical test twice creates a memory effect; using tests of different difficulty makes the comparison meaningless.",
    "Leave at least two weeks between consecutive measurements, otherwise you are measuring short-term recall rather than learning.",
    "Record data per student, under a code rather than a name. Without that link the measurements cannot be paired, and the more powerful tests become unavailable.",
    "Decide in advance how to count students who do not finish: all enrolled, or only those who completed. With attrition above 20% this choice changes the result materially and must be stated in the text.",
    "A student who misses one measurement drops out of a paired analysis entirely. Plan reserve dates for the assessments.",
]

SMALL_WORKS = [
    ("Wilcoxon signed-rank test", "n ≥ 6 two-sided (5 one-sided); significance is attainable only if every student moves in the same direction",
     "The primary test for a pre/post design on a micro-cohort", "wilcoxon.html"),
    ("Sign test", "n ≥ 6 two-sided (5 one-sided); zero changes are excluded",
     "The simplest check of a shift when magnitude cannot be measured", "sign-test.html"),
    ("Fisher's exact test (2 × 2)", "4 students per group",
     "Comparison of proportions at small counts — the replacement for chi-square", "chi-square.html"),
    ("Fisher's φ* criterion", "n₁ = 4 with n₂ ≥ 5, or both ≥ 5",
     "Comparison of two percentages with an exact admissibility rule", "fisher-phi.html"),
    ("Mann–Whitney U test", "n₁ = 3 with n₂ ≥ 5, or 4 and 4",
     "Comparison of two micro-groups when a control group does exist", "mann-whitney.html"),
    ("Normalized gain ⟨g⟩", "any n",
     "A measure of course effectiveness that does not depend on sample size", "hake-gain.html"),
    ("Descriptive statistics with confidence intervals", "n ≥ 3",
     "An honest description of the result, showing the degree of uncertainty", "descriptives.html"),
    ("Effect sizes (Hedges' g) with confidence intervals", "n ≥ 3",
     "The magnitude of change — the main quantitative argument at this sample size", "effect-size.html"),
]

SMALL_FAILS = [
    ("Pearson's chi-square", "Requires expected counts of at least 5 in every cell; with 5–7 students that condition always fails. The statistic can still be computed, and it will still be wrong."),
    ("Independent-samples t-test", "Normality cannot be checked at this size and power is close to zero: it can only detect effects of about d ≥ 1.5."),
    ("Analysis of variance", "Needs at least 15 students per group; below that the variance estimates are unstable."),
    ("Pearson correlation", "At n &lt; 20 a single atypical student changes the coefficient completely."),
    ("Kolmogorov–Smirnov λ criterion", "Requires at least 50 students per group."),
    ("Any normality test", "Below n = 8 these tests reject nothing. The absence of a detected departure is not evidence of normality."),
    ("Regression analysis", "The number of observations is comparable to the number of model parameters, so the model describes noise."),
]

SMALL_BOOST = [
    ("Add measurement points, not students",
     "Run four to six assessments instead of two and analyse each student's trajectory.",
     "Five students × six measurements = thirty observations instead of ten, and the direction of the trend becomes testable."),
    ("Change the unit of analysis",
     "Analyse tasks, operations or error types rather than students: the share of correctly performed operations of each type, before and after.",
     "Five students × twenty tasks = one hundred observations. The choice of unit must be argued explicitly in the text."),
    ("Single-case design with a baseline",
     "Take several measurements before the intervention begins (a baseline), then during and after it. AB, ABA and multiple-baseline schemes.",
     "An accepted method of demonstration on small groups in education and special education. Each student acts as their own control."),
    ("Accumulate the sample across cohorts",
     "Pool data from successive runs of the course, provided the methodology and the instruments did not change; treat cohort as a factor.",
     "After three or four runs the sample reaches a size that supports conventional statistics."),
    ("Mixed design: quantitative plus qualitative",
     "Semi-structured interviews, analysis of student work products, reflective essays, per-student case studies, observation.",
     "For micro-cohorts the qualitative strand becomes the primary evidence and the quantitative strand becomes illustrative."),
    ("Compare against historical data",
     "Use the results of earlier cohorts taught by the conventional method as a quasi-control group.",
     "A substitute for a control group; requires an explicit caveat about non-equivalence across time."),
]

SMALL_WORDING = [
    ("The effectiveness of the methodology has been proven.",
     "Preliminary evidence indicates a positive effect of the methodology; confirmation requires a study on a larger sample."),
    ("The level of competence rose by 40%.",
     "The mean score rose from 12.4 to 17.6 (normalized gain g = 0.52; Hedges' g = 1.1, 95% CI [0.2, 2.0]); with n = 6 the change is significant by the Wilcoxon test (T = 0, p = 0.031)."),
    ("No difference was found between the groups, so the methods are equivalent.",
     "The difference did not reach significance at this sample size (n = 7); the study has power to detect only effects larger than about d = 1.3."),
    ("The results confirm the hypothesis.",
     "The results are consistent with the hypothesis; the small sample and the absence of a control group are limitations of this study."),
]

CHECKLIST = [
    ("Design intent", [
        ("A hypothesis is stated in testable form: what should change, and by how much",
         "An untestable hypothesis (\"the methodology improves the quality of learning\") cannot be confirmed by any criterion."),
        ("One to three effectiveness indicators are defined, each with a stated way of measuring it",
         "More than three indicators require a correction for multiple comparisons and blur the conclusion."),
        ("The measurement scale is recorded for each indicator (nominal / ordinal / interval)",
         "The scale determines which criteria are admissible; an error here invalidates the whole analysis."),
        ("For dichotomous indicators, the threshold for \"effect present\" is fixed in advance",
         "Choosing the threshold after seeing the data is fitting the result."),
    ]),
    ("Design", [
        ("A decision on the control group has been taken; if there is none, the compensating scheme is justified",
         "Without a control group the effect of the methodology cannot be separated from the effect of time and other factors."),
        ("If there is a control group, the method of forming the groups is defined (randomisation, matching, intact groups)",
         "How the groups were formed determines how strong a conclusion is admissible."),
        ("A pre-test is planned to check the initial equivalence of the groups",
         "Without a pre-test, differences at the end may reflect differences that existed at the start."),
        ("The number of measurements is fixed: minimum 2 (pre and post), 3–4 recommended",
         "See the study design guide."),
        ("The possibility of a delayed measurement 1–3 months later has been considered",
         "Retention of the result is a strong argument at the defence."),
        ("The course's assessments are agreed as measurement points and are comparable in content",
         "Otherwise the trend will reflect differences in task difficulty rather than growth in attainment."),
    ]),
    ("Sample", [
        ("The required sample size for the expected effect has been calculated",
         "See the sample size guide."),
        ("A margin for attrition is built in (with 30% expected attrition, recruit 1.4× the calculated number)",
         "Attrition on online courses runs at 30–60%."),
        ("A decision has been taken on how to count non-completers: all enrolled, or only those who finished",
         "With attrition above 20% this choice changes the result materially and must be agreed in advance."),
        ("If the group is smaller than eight, compensating techniques are built into the design",
         "See the guide on working with 5–7 students."),
    ]),
    ("Instruments", [
        ("The pre-test and post-test are equivalent in difficulty, structure and number of items",
         "Non-equivalent tests make the comparison meaningless."),
        ("The test or questionnaire has been piloted and its reliability computed (Cronbach's α ≥ 0.7)",
         "An unreliable instrument will not detect a real effect."),
        ("If experts do the marking, criterion rubrics exist and inter-rater agreement has been checked",
         "Disagreement between markers introduces noise larger than the effect under study."),
        ("A benchmark or target value for the indicator is defined and its source justified",
         "Required for designs with a single final measurement."),
    ]),
    ("Data collection", [
        ("Data are recorded per student, under a code rather than a name",
         "Without that link, tests for related samples cannot be used."),
        ("A data table is prepared: one row per student, one column per indicator and measurement",
         "Reformatting data after the fact is a reliable source of errors."),
        ("Raw scores are recorded, not only percentages and levels",
         "Any derived indicator can be computed from raw scores; the reverse is not true."),
        ("Background data are collected: prior attainment, year, programme, attendance",
         "Needed as covariates and to describe the sample."),
    ]),
    ("Analysis", [
        ("The statistical method is chosen and recorded BEFORE data collection",
         "Selecting the criterion to fit the result is detectable at the defence."),
        ("The significance level and the direction of the hypothesis (one- or two-sided) are fixed",
         "A one-sided hypothesis gives more power but must be declared in advance."),
        ("With several indicators, a correction for multiple comparisons is planned",
         "Five criteria at p ≤ 0.05 give a 23% chance of a false positive somewhere."),
        ("Effect sizes with confidence intervals are planned",
         "A mandatory element of a modern report, and critical at small sample sizes."),
        ("The computational tool is chosen and learned (this site, Excel, Jamovi or JASP)",
         "Learning the software while processing the data is a source of errors and delay."),
    ]),
    ("Ethics", [
        ("Informed consent has been obtained and the data are anonymised",
         "A requirement of research ethics, and mandatory for publication."),
    ]),
]


def build(write, chrome, results_block, crumbs):
    out = []

    # ---------------------------------------------------------- study design
    rows = "\n".join(f"""            <tr class="{cls}">
              <th>{scheme}</th>
              <td class="num">{n}</td>
              <td>{can}</td>
              <td>{cannot}</td>
              <td>{status}</td>
            </tr>""" for scheme, n, can, cannot, status, cls in DESIGN_ROWS)
    notes = "\n".join(f"          <li>{n}</li>" for n in DESIGN_NOTES)
    body = f"""
<div class="page-head">
  <div class="wrap">
    {crumbs([("../index.html", "Method finder"), (None, "Study design & measurements")])}
    <span class="eyebrow">Guide · Read before launching</span>
    <h1>Study design &amp; measurements</h1>
    <p class="lede">How many measurement points a defensible claim needs, and what each
    design does and does not allow you to conclude.</p>
  </div>
</div>

<div class="wrap wrap-narrow">
  <section class="section">
    <p>Measurement points are the course's own assessments — entrance and exit testing,
    interim tests, project defences. You do not need to organise additional testing; you do
    need to plan the assessments so that they are comparable with one another, and to decide
    how many of them will serve as data.</p>

    <div class="callout">
      <span class="callout-title">The short answer</span>
      Two measurements — a pre-test and a post-test on the same students — are the
      mandatory minimum for any evidential claim. Three or four, using the interim
      assessments you already run, are what a supervisor will expect when there is no
      control group.
    </div>
  </section>

  <section class="section">
    <h2>What each design supports</h2>
    <div class="table-scroll">
      <table class="data">
        <thead>
          <tr>
            <th>Design</th><th class="num">Measurements</th>
            <th>What it can demonstrate</th>
            <th>What it cannot demonstrate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
{rows}
        </tbody>
      </table>
    </div>
    <p class="small muted">Rows shaded red are insufficient on their own; rows shaded green
    are the minimum acceptable and the most evidential design respectively.</p>
  </section>

  <section class="section">
    <h2>Requirements for organising the measurements</h2>
    <ol class="step-list">
{notes}
    </ol>
  </section>

  <section class="section">
    <h2>Where to go next</h2>
    <div class="grid-2" style="margin-top:18px">
      <a class="method-card" href="sample-size.html">
        <h3>Sample size &amp; power</h3>
        <p>How many students the design you have just chosen actually requires.</p>
      </a>
      <a class="method-card" href="checklist.html">
        <h3>Pre-launch checklist</h3>
        <p>Twenty-eight items to close before the first student enrols.</p>
      </a>
    </div>
  </section>
</div>
"""
    out.append(write("guides/study-design.html", chrome.render(
        "guides/study-design.html", "Study design &amp; measurements",
        "How many measurement points a course-evaluation study needs, and what each design "
        "can and cannot demonstrate.",
        body, active="guides/study-design.html")))

    # ---------------------------------------------------------- sample size
    body = f"""
<div class="page-head">
  <div class="wrap">
    {crumbs([("../index.html", "Method finder"), (None, "Sample size & power")])}
    <span class="eyebrow">Guide · Interactive</span>
    <h1>Sample size &amp; power</h1>
    <p class="lede">How many students you need to detect an effect of a given size — and
    what to do when that number is out of reach, which it usually is.</p>
  </div>
</div>

<div class="wrap wrap-narrow">
  <section class="section">
    <p>The figures below assume a significance level of 0.05 with a two-sided hypothesis and
    statistical power of 0.80 — that is, an 80% chance of detecting an effect that is really
    there. The expected effect size comes from published studies of comparable methodologies,
    from a pilot study, or from a judgement about the smallest change that would matter
    in practice.</p>

    <div class="callout is-warn">
      <span class="callout-title">Read this before the table</span>
      These are minimum sizes for <em>detecting</em> an effect, not targets for a
      "good-looking" result. Below them, a non-significant finding says nothing about your
      course — only that the study lacked the power to see anything.
    </div>
  </section>

  <section class="card">
    <div class="card-head"><h2 style="margin:0">Calculator</h2></div>
    <p class="small muted">Enter the effect you expect and the attrition you anticipate.</p>
    <div class="field-row">
      <div class="field">
        <label for="d">Expected effect size (Cohen's d)</label>
        <input type="number" id="d" value="0.5" step="0.05" min="0.05" max="4">
        <div class="hint">0.2 small · 0.5 medium · 0.8 large</div>
      </div>
      <div class="field">
        <label for="alpha">Significance level α</label>
        <select id="alpha">
          <option value="0.05" selected>0.05</option>
          <option value="0.01">0.01</option>
          <option value="0.1">0.10</option>
        </select>
      </div>
      <div class="field">
        <label for="power">Power</label>
        <select id="power">
          <option value="0.8" selected>0.80</option>
          <option value="0.9">0.90</option>
          <option value="0.7">0.70</option>
        </select>
      </div>
      <div class="field">
        <label for="attrition">Expected attrition</label>
        <input type="number" id="attrition" value="0.3" step="0.05" min="0" max="0.9">
        <div class="hint">0.3 = 30% of students do not finish</div>
      </div>
    </div>
    <div id="ssResults" style="margin-top:20px"></div>

    <h3>Or work backwards from the group you have</h3>
    <div class="field-row">
      <div class="field">
        <label for="haveN">Students available per group</label>
        <input type="number" id="haveN" value="12" step="1" min="3">
      </div>
    </div>
    <div id="powerResults" style="margin-top:16px"></div>
    <div id="powerNote"></div>
  </section>

  <section class="section">
    <h2>Reference tables</h2>
    <h3>Numeric scores</h3>
    <div class="table-scroll">
      <table class="data">
        <thead><tr><th>Effect size d</th><th>Label</th>
          <th class="num">Per group, two independent groups</th>
          <th class="num">Total, one group pre/post</th></tr></thead>
        <tbody>
          <tr><td>0.3</td><td>Small</td><td class="num">176</td><td class="num">90</td></tr>
          <tr><td>0.5</td><td>Medium</td><td class="num">64</td><td class="num">34</td></tr>
          <tr><td>0.8</td><td>Large</td><td class="num">26</td><td class="num">15</td></tr>
          <tr><td>1.0</td><td>Very large</td><td class="num">17</td><td class="num">10</td></tr>
          <tr><td>1.2</td><td>Very large</td><td class="num">12</td><td class="num">8</td></tr>
          <tr><td>1.5</td><td>Exceptional</td><td class="num">9</td><td class="num">6</td></tr>
        </tbody>
      </table>
    </div>

    <h3>Proportions of students passing</h3>
    <div class="table-scroll">
      <table class="data">
        <thead><tr><th>Change in the pass rate</th><th class="num">Effect size h</th>
          <th class="num">Per group</th></tr></thead>
        <tbody>
          <tr><td>40% → 60%</td><td class="num">0.40</td><td class="num">97</td></tr>
          <tr><td>40% → 70%</td><td class="num">0.61</td><td class="num">42</td></tr>
          <tr><td>50% → 80%</td><td class="num">0.64</td><td class="num">38</td></tr>
          <tr><td>30% → 70%</td><td class="num">0.82</td><td class="num">24</td></tr>
          <tr><td>20% → 60%</td><td class="num">0.84</td><td class="num">22</td></tr>
          <tr><td>50% → 90%</td><td class="num">0.93</td><td class="num">19</td></tr>
        </tbody>
      </table>
    </div>

    <h3>Correlations</h3>
    <div class="table-scroll">
      <table class="data">
        <thead><tr><th>Correlation to detect</th><th class="num">n required</th></tr></thead>
        <tbody>
          <tr><td>r = 0.3</td><td class="num">85</td></tr>
          <tr><td>r = 0.5</td><td class="num">30</td></tr>
          <tr><td>r = 0.7</td><td class="num">14</td></tr>
        </tbody>
      </table>
    </div>
    <p class="small muted">Rank-based tests (Wilcoxon, Mann–Whitney) need roughly 10–15%
    more students than the figures above.</p>
  </section>

  <section class="section">
    <h2>When the required number is out of reach</h2>
    <ul>
      <li>Build in a margin for attrition: with 30% expected attrition, recruit 1.4 times the
      calculated number.</li>
      <li>Pool the sample across successive runs of the course — legitimate, and often the
      only route to an adequate size, provided the methodology and the instruments do not
      change between runs.</li>
      <li>Prefer the paired design: measuring the same students twice needs roughly half the
      sample of a two-group comparison for the same effect.</li>
      <li>If the number is genuinely unattainable, that is not a reason to abandon the study
      — it is a reason to state the power limitation explicitly and to rest the argument on
      effect sizes and qualitative evidence. See
      <a href="small-samples.html">Working with 5–7 students</a>.</li>
    </ul>
  </section>
</div>
"""
    out.append(write("guides/sample-size.html", chrome.render(
        "guides/sample-size.html", "Sample size &amp; power",
        "How many students are needed to detect an effect of a given size, with an "
        "interactive power calculator for course-evaluation studies.",
        body, scripts=["assets/js/pages/sample-size.js"], active="guides/sample-size.html")))

    # ---------------------------------------------------------- small samples
    works = "\n".join(f"""            <tr>
              <th><a href="../methods/{href}">{name}</a></th>
              <td>{cond}</td><td>{gives}</td>
            </tr>""" for name, cond, gives, href in SMALL_WORKS)
    fails = "\n".join(f"""            <tr><th>{name}</th><td>{why}</td></tr>"""
                      for name, why in SMALL_FAILS)
    boost = "\n".join(f"""            <tr><th>{name}</th><td>{what}</td><td>{gives}</td></tr>"""
                      for name, what, gives in SMALL_BOOST)
    wording = "\n".join(f"""            <tr>
              <td style="background:var(--danger-bg)">{bad}</td>
              <td style="background:var(--ok-bg)">{good}</td>
            </tr>""" for bad, good in SMALL_WORDING)

    body = f"""
<div class="page-head">
  <div class="wrap">
    {crumbs([("../index.html", "Method finder"), (None, "Working with 5–7 students")])}
    <span class="eyebrow">Guide · Micro-cohorts</span>
    <h1>Working with 5–7 students</h1>
    <p class="lede">At this size most statistical methods are formally inapplicable — but
    the study is still possible. What changes is the set of instruments and, above all, the
    wording of the conclusions.</p>
  </div>
</div>

<div class="wrap">
  <section class="section">
    <div class="callout">
      <span class="callout-title">The principle</span>
      With five students you cannot buy statistical power, so buy observations instead:
      more measurement points per student, a finer unit of analysis, several cohorts pooled,
      and a qualitative strand that carries the argument the numbers cannot.
    </div>
  </section>

  <section class="section">
    <h2>A. What still works at n = 5–7</h2>
    <div class="table-scroll">
      <table class="data">
        <thead><tr><th>Method</th><th>Minimum conditions</th><th>What it gives you</th></tr></thead>
        <tbody>
{works}
        </tbody>
      </table>
    </div>
  </section>

  <section class="section">
    <h2>B. What does not work, and why</h2>
    <div class="table-scroll">
      <table class="data">
        <thead><tr><th>Method</th><th>Why it fails at this size</th></tr></thead>
        <tbody>
{fails}
        </tbody>
      </table>
    </div>
  </section>

  <section class="section">
    <h2>C. How to strengthen the evidence without recruiting anyone</h2>
    <div class="table-scroll">
      <table class="data">
        <thead><tr><th>Technique</th><th>What it involves</th><th>What it gains you</th></tr></thead>
        <tbody>
{boost}
        </tbody>
      </table>
    </div>
  </section>

  <section class="section">
    <h2>D. How to word the conclusions</h2>
    <div class="table-scroll">
      <table class="data">
        <thead><tr><th style="width:38%">Do not write this</th><th>Write this instead</th></tr></thead>
        <tbody>
{wording}
        </tbody>
      </table>
    </div>
    <p class="small muted">A conclusion that overstates what a sample of six can support is
    the fastest way to lose an examiner's confidence in everything else in the work.</p>
  </section>
</div>
"""
    out.append(write("guides/small-samples.html", chrome.render(
        "guides/small-samples.html", "Working with 5–7 students",
        "Which statistical methods still work with five to seven students, which do not, and "
        "how to strengthen the evidence without recruiting more participants.",
        body, active="guides/small-samples.html")))

    # ---------------------------------------------------------- checklist
    items = []
    idx = 0
    for section, entries in CHECKLIST:
        items.append(f'<li class="ck-section-row" data-section="1">{section}</li>')
        for title, why in entries:
            idx += 1
            items.append(
                f'<li data-id="ck{idx}">'
                f'<input type="checkbox" id="ck{idx}" aria-label="Mark item {idx} as done">'
                f'<div class="ck-body"><label class="ck-title" for="ck{idx}">{title}</label>'
                f'<div class="ck-why">{why}</div></div></li>')
    items_html = "\n        ".join(items)

    body = f"""
<div class="page-head">
  <div class="wrap">
    {crumbs([("../index.html", "Method finder"), (None, "Pre-launch checklist")])}
    <span class="eyebrow">Guide · Interactive</span>
    <h1>Pre-launch checklist</h1>
    <p class="lede">An item left open at the planning stage costs a week of work. The same
    item discovered after the data are in usually means repeating the study.</p>
  </div>
</div>

<div class="wrap wrap-narrow">
  <section class="card" style="margin-top:26px">
    <div class="card-head">
      <h2 style="margin:0">Progress</h2>
      <div class="btn-row">
        <button class="btn btn-ghost btn-sm" type="button" id="resetCk">Reset</button>
        <button class="btn btn-ghost btn-sm" type="button" id="printCk">Print</button>
      </div>
    </div>
    <div class="progress-bar"><i id="ckBar"></i></div>
    <p class="small muted" id="ckCount" style="margin:6px 0 0">0 of {idx} items complete</p>
    <p class="small muted" style="margin-top:10px">Your ticks are stored in this browser
    only. Nothing is uploaded, and clearing your browser data clears them.</p>
  </section>

  <section class="section">
    <ul class="checklist" id="checklist">
        {items_html}
    </ul>
  </section>
</div>
"""
    out.append(write("guides/checklist.html", chrome.render(
        "guides/checklist.html", "Pre-launch checklist",
        "Twenty-eight methodological and organisational requirements to settle before "
        "launching a course whose effectiveness you intend to evaluate.",
        body, scripts=["assets/js/pages/checklist.js"], active="guides/checklist.html")))

    return out
