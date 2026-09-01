# -*- coding: utf-8 -*-
"""Content of the ten method pages."""

from blocks import (results_block, paired_inputs, group_inputs, options_row,
                    toolbar, spec_box, crumbs, PASTE_NOTE)

SRC = ('<p class="source-note"><b>Source.</b> {}</p>')

PAGES = []


def add(**kw):
    PAGES.append(kw)


# ---------------------------------------------------------------- 1. Descriptives
add(
    id="descriptives",
    file="methods/descriptives.html",
    title="Descriptive Statistics &amp; Normality Screening",
    meta="Means, medians, quartiles, confidence intervals and a skewness–kurtosis normality check for a single sample of pedagogical data.",
    eyebrow="Description · Any design",
    lede="Every report opens with descriptive statistics. This page also runs the "
         "skewness–kurtosis screening that decides whether a parametric test is admissible at all.",
    about="""
        <p>Before any significance test, describe what you actually measured. A reader
        needs the sample size, the centre of the distribution, its spread, and an honest
        statement of how precisely the centre is known — that last part is the confidence
        interval, and with a group of six students it will be uncomfortably wide. That is
        the point: it shows the reader exactly how much uncertainty the small sample carries.</p>
        <p>Which centre to report depends on the measurement scale. For interval data —
        test marks, times, counts of correct operations — report the mean with its standard
        deviation and confidence interval. For ordinal data — competence levels, rubric
        grades, ranks — report the median with the first and third quartiles, because the
        distance between "low" and "medium" is not the same quantity as the distance
        between "medium" and "high", and averaging them is not meaningful.</p>
        <p>The second job of this page is the normality screening described by
        Starichenko (§3.1.3), following the critical values tabulated by E. I. Pustylnik.
        Standardised skewness and kurtosis are compared against those bounds. If both stay
        inside, a parametric test (the t-test) is admissible; if either exceeds them, use a
        rank-based test instead. Below eight observations the screening has almost no power,
        so a "consistent with normality" verdict there means only that the data did not
        contradict normality — not that normality was demonstrated.</p>
    """,
    spec=[
        ("Measurement scale", "Interval for the mean; ordinal for the median and quartiles"),
        ("Study design", "Any — one sample at a time"),
        ("Measurements needed", "1"),
        ("Minimum n", "3 for the summary, 4 for the normality screening"),
        ("Recommended n", "≥ 5; the screening becomes informative from n ≈ 8"),
        ("What you get", "n, mean, SD, SE, 95% CI, median, quartiles, range, skewness, kurtosis, normality verdict"),
        ("Source", "Starichenko §4.2.1 (p. 157) and §3.1.3 (p. 103), Table 11 (p. 208)"),
    ],
    form="""
        <div class="field">
          <label for="data">Scores</label>
          <textarea id="data" spellcheck="false" placeholder="12&#10;15&#10;11&#10;18&#10;14&#10;16"></textarea>
          <div class="hint">One value per student. Paste a column straight from your spreadsheet.</div>
          <span class="count-pill" id="dataCount">0 values</span>
        </div>
        """ + PASTE_NOTE + """
        <div class="field-row">
          <div class="field">
            <label for="scaleType">Measurement scale</label>
            <select id="scaleType">
              <option value="interval" selected>Interval — scores, marks, time</option>
              <option value="ordinal">Ordinal — levels, ranks, rubric grades</option>
            </select>
          </div>
          <div class="field">
            <label for="conf">Confidence level</label>
            <select id="conf">
              <option value="0.95" selected>95%</option>
              <option value="0.99">99%</option>
              <option value="0.9">90%</option>
            </select>
          </div>
        </div>
        """ + toolbar("Summarise"),
    notes="""
        <h2>Reading the output</h2>
        <p>The <b>confidence interval</b> is the range that would contain the true group
        mean in 95 out of 100 replications of the study. A wide interval is not a mistake —
        it is the honest consequence of a small sample, and reporting it protects you from
        overstating a result.</p>
        <p>The <b>coefficient of variation</b> (SD ÷ mean) describes how heterogeneous the
        group is. Above roughly 33% the group is usually considered heterogeneous, which
        matters when you interpret a mean at all.</p>
        <p>The <b>normality verdict</b> is a gate, not a result. "Consistent with normal"
        opens the door to the paired or independent t-test. "Departs from normal" points you
        to the Wilcoxon signed-rank test or the Mann–Whitney U test, which make no such
        assumption and lose very little power in exchange.</p>
    """,
    script="assets/js/pages/descriptives.js",
)

# ---------------------------------------------------------------- 2. Sign test
add(
    id="sign-test",
    file="methods/sign-test.html",
    title="Sign Test (G)",
    meta="Exact sign test for pre-test / post-test data: does the score shift in one direction? Works from five students upwards.",
    eyebrow="Non-parametric · Pre / post, one group",
    lede="The simplest defensible test of a pre-test to post-test shift. It counts only "
         "the direction of each student's change, which makes it valid for ordinal data "
         "and usable with as few as five students.",
    about="""
        <p>The sign test asks one question: did more students move up than would be
        expected if the course had no effect at all? Under the null hypothesis each
        student is equally likely to improve or decline, so the number of improvements
        follows a binomial distribution with p = 0.5. This page computes the exact
        binomial probability — no approximation, no table lookup — which is what makes
        the test trustworthy at very small sample sizes.</p>
        <p>Because only the sign of each difference is used, the magnitude is discarded.
        A student who gains one point counts exactly as much as one who gains twenty.
        That is the test's strength when your outcome is ordinal (a competence level moved
        from "medium" to "high") and its weakness when your outcome is a numeric score:
        in that case the <a href="wilcoxon.html">Wilcoxon signed-rank test</a> uses the
        same data more efficiently and should be preferred.</p>
        <p>Students whose score did not change contribute nothing and are removed from the
        analysis, which reduces the effective sample size. With six usable pairs, a
        significant two-sided result requires <em>every</em> student to move in the same
        direction; with five, only a one-sided hypothesis stated in advance can reach
        significance.</p>
    """,
    spec=[
        ("Measurement scale", "Ordinal or interval"),
        ("Study design", "Two measurements of the same students — no control group needed"),
        ("Measurements needed", "2 (pre-test and post-test)"),
        ("Minimum n", "5 for a one-sided hypothesis, 6 for a two-sided one"),
        ("Recommended n", "≥ 10"),
        ("Assumptions", "Pairs are independent of one another; that is all"),
        ("Test statistic", "G — the count of the rarer sign; exact binomial p-value"),
        ("Source", "Starichenko §2.2.2 (p. 46), Table 3 (p. 200)"),
    ],
    form=paired_inputs() + options_row() + toolbar("Run the sign test"),
    notes="""
        <h2>When to choose this test</h2>
        <ul>
          <li>Your outcome is a level or a rank rather than a number.</li>
          <li>You can tell whether each student improved, but not by how much.</li>
          <li>The group is very small and you want an exact, assumption-free result.</li>
        </ul>
        <h2>What it cannot tell you</h2>
        <p>Because there is no control group in this design, a significant result shows
        that scores rose — not that <em>your methodology</em> made them rise. Maturation,
        parallel coursework, motivation and the test–retest effect are all still on the
        table. Say so explicitly in your write-up, and strengthen the claim with a
        delayed post-test, a comparison against previous cohorts, or qualitative evidence.</p>
    """,
    script="assets/js/pages/sign-test.js",
)

# ---------------------------------------------------------------- 3. Wilcoxon
add(
    id="wilcoxon",
    file="methods/wilcoxon.html",
    title="Wilcoxon Signed-Rank Test (T)",
    meta="Wilcoxon signed-rank test with exact small-sample p-values for pre-test / post-test course evaluation.",
    eyebrow="Non-parametric · Pre / post, one group",
    lede="The default test for a pre-test / post-test design without a control group. "
         "It uses both the direction and the size of each student's change, and assumes "
         "nothing about the shape of the distribution.",
    about="""
        <p>The Wilcoxon signed-rank test takes each student's change, ranks the changes by
        absolute size, and then sums the ranks that belong to improvements and the ranks
        that belong to declines. If the course did nothing, those two sums should be
        similar. The statistic <b>T</b> is the smaller of the two sums; the smaller it is,
        the more one-sided the pattern of change.</p>
        <p>This is more informative than the <a href="sign-test.html">sign test</a>,
        because a student who gained fifteen points now carries more weight than one who
        gained two, and it is safer than the <a href="paired-t.html">paired t-test</a>,
        because it makes no normality assumption and is barely affected by one atypical
        student. For most master's projects with a single group, this is the test to use.</p>
        <p>When the sample is small (n ≤ 25) and no two changes are tied in absolute size,
        this page enumerates the exact null distribution — all 2<sup>n</sup> sign patterns —
        and reports an exact p-value. When ties or zero differences are present, it falls
        back to the normal approximation with a continuity correction and a tie correction,
        and says so in the output.</p>
    """,
    spec=[
        ("Measurement scale", "Ordinal or interval"),
        ("Study design", "Two measurements of the same students — no control group needed"),
        ("Measurements needed", "2 (pre-test and post-test)"),
        ("Minimum n", "5 one-sided, 6 two-sided"),
        ("Recommended n", "≥ 15"),
        ("Assumptions", "Differences are symmetric about the median; pairs independent"),
        ("Test statistic", "T — the smaller sum of signed ranks; effect size r = |Z| ÷ √n"),
        ("Source", "Starichenko §2.2.3 (p. 49), Table 4 (p. 201)"),
    ],
    form=paired_inputs() + options_row() + toolbar("Run the Wilcoxon test"),
    notes="""
        <h2>Reporting the result</h2>
        <p>Report the statistic, the exact or approximate p-value, the sample size and the
        effect size together, for example: <em>"Scores rose significantly from pre-test to
        post-test (T = 3, n = 10, p = 0.014, r = 0.72)."</em> The effect size r is the
        standardised measure for rank tests: 0.1 is small, 0.3 medium and 0.5 large.</p>
        <h2>Ties and zero changes</h2>
        <p>Students whose score is identical before and after produce a difference of zero.
        The classical procedure drops them, which shrinks the effective sample. If many of
        your students show no change at all, that is itself a finding worth discussing —
        it usually means the test was too easy, too hard, or not aligned with what the
        course taught.</p>
    """,
    script="assets/js/pages/wilcoxon.js",
)

# ---------------------------------------------------------------- 4. Paired t
add(
    id="paired-t",
    file="methods/paired-t.html",
    title="Paired-Samples t-Test",
    meta="Paired t-test for pre-test / post-test course data, with an automatic normality screening of the differences and Cohen's d.",
    eyebrow="Parametric · Pre / post, one group",
    lede="Compares mean pre-test and post-test scores for the same students. More "
         "powerful than a rank test when the differences are approximately normal — "
         "which this page checks before it lets you rely on the result.",
    about="""
        <p>The paired t-test works on the differences, not on the raw scores. For each
        student it computes post minus pre, then asks whether the mean of those
        differences is far enough from zero to be implausible under chance. Because each
        student serves as their own control, individual differences in ability are removed
        from the comparison, which is why a paired design needs roughly half the sample of
        a two-group design to detect the same effect.</p>
        <p>The assumption that matters is that the <em>differences</em> are approximately
        normally distributed — not the pre-test scores, not the post-test scores. This page
        screens the differences with the skewness–kurtosis criterion and warns you when
        they depart from normality. If they do, or if the sample is under 30, the
        <a href="wilcoxon.html">Wilcoxon signed-rank test</a> is the safer choice and
        usually gives a similar answer.</p>
        <p>Alongside the test the page reports Cohen's d for paired data (the mean
        difference divided by the standard deviation of the differences), Hedges' g with
        the small-sample correction, and a confidence interval for the mean change. That
        interval is often the single most useful number in the output: it tells a reader
        the plausible range of the real improvement, in the units they already understand.</p>
    """,
    spec=[
        ("Measurement scale", "Interval only — do not use on levels or ranks"),
        ("Study design", "Two measurements of the same students"),
        ("Measurements needed", "2 (pre-test and post-test)"),
        ("Minimum n", "7 formally"),
        ("Recommended n", "≥ 30, or ≥ 15 with confirmed normality"),
        ("Assumptions", "Differences approximately normal; pairs independent"),
        ("Test statistic", "t with n − 1 degrees of freedom; effect size Cohen's d, Hedges' g"),
        ("Source", "Starichenko §3.2 (p. 107), Table 12 (p. 210)"),
    ],
    form=paired_inputs() + options_row() + toolbar("Run the paired t-test"),
    notes="""
        <h2>Choosing between the t-test and Wilcoxon</h2>
        <p>If the normality screening passes and n ≥ 15, use the t-test: it is slightly
        more powerful and its confidence interval is easy to interpret. If the screening
        fails, if there is a clear outlier, or if n &lt; 15, use the Wilcoxon signed-rank
        test. Running both and reporting whichever gives the smaller p-value is a
        methodological error that reviewers do notice — decide before you look at the data.</p>
        <h2>The design limitation, again</h2>
        <p>A significant t-test on a single group demonstrates that scores changed. It does
        not demonstrate that your methodology caused the change. Only a control group, or
        at minimum a comparison against a comparable earlier cohort, can support that
        stronger claim.</p>
    """,
    script="assets/js/pages/paired-t.js",
)

# ---------------------------------------------------------------- 5. Mann–Whitney
add(
    id="mann-whitney",
    file="methods/mann-whitney.html",
    title="Mann–Whitney U Test",
    meta="Mann–Whitney U test with exact small-sample p-values, comparing an experimental group against a control group.",
    eyebrow="Non-parametric · Two independent groups",
    lede="Compares an experimental group against a control group when the data are "
         "ordinal or the samples are small. No normality assumption, and the two groups "
         "need not be the same size.",
    about="""
        <p>The Mann–Whitney U test pools both groups, ranks every observation from lowest
        to highest, and then asks whether the ranks of one group sit systematically above
        those of the other. It is the rank-based counterpart of the independent t-test and
        the standard choice whenever the outcome is a level or a rank, or whenever the
        groups are too small for the normality assumption to be checkable.</p>
        <p>The statistic <b>U</b> counts how many pairwise comparisons the experimental
        group wins; the smaller of the two possible U values is reported, following the
        textbook convention. For small samples with no tied values, this page enumerates
        the exact null distribution and reports an exact p-value; otherwise it uses the
        normal approximation with continuity and tie corrections.</p>
        <p>The lower limits are worth knowing before you design the study. With three
        students in each group, no arrangement of the data can reach two-sided significance
        — the smallest attainable p-value is 0.10. Significance first becomes attainable at
        n₁ = 3 with n₂ ≥ 5, or with four students in each group. Below those sizes, the
        test cannot produce a positive result no matter how large the real difference is.</p>
    """,
    spec=[
        ("Measurement scale", "Ordinal or interval"),
        ("Study design", "Two independent groups — a control group is required"),
        ("Measurements needed", "1 (post-test); a pre-test is strongly recommended"),
        ("Minimum n", "n₁ = 3 with n₂ ≥ 5, or 4 in each group"),
        ("Recommended n", "≥ 15 per group"),
        ("Assumptions", "Independent observations; similarly shaped distributions"),
        ("Test statistic", "U; effect size r = |Z| ÷ √N and the rank-biserial correlation"),
        ("Source", "Starichenko §2.1.2 (p. 35), Table 1 (p. 194)"),
    ],
    form=group_inputs() + options_row() + toolbar("Run the Mann–Whitney test"),
    notes="""
        <h2>Before you compare the post-test</h2>
        <p>If the two groups were not formed at random, run this same test on the
        <em>pre-test</em> data first. A non-significant result there is what licenses the
        comparison of post-test scores; a significant one means the groups differed to
        begin with, and any difference at the end may simply be that difference persisting.</p>
        <h2>What the effect size means here</h2>
        <p>The rank-biserial correlation has a direct reading: it is the probability that
        a randomly chosen student from the experimental group outscores a randomly chosen
        student from the control group, rescaled to run from −1 to +1. A value of 0.6 means
        the experimental student wins about 80% of such comparisons.</p>
    """,
    script="assets/js/pages/mann-whitney.js",
)

# ---------------------------------------------------------------- 6. Independent t
add(
    id="independent-t",
    file="methods/independent-t.html",
    title="Independent-Samples t-Test",
    meta="Independent-samples t-test comparing experimental and control groups, with Welch's correction, Levene's test and Cohen's d.",
    eyebrow="Parametric · Two independent groups",
    lede="Compares the mean scores of an experimental and a control group. Reports both "
         "the Student and the Welch version, tests the equal-variance assumption, and "
         "gives you a confidence interval for the difference.",
    about="""
        <p>This is the classical comparison of two group means. It is the most powerful of
        the two-group tests when its assumptions hold, and the most misleading when they do
        not — which is why this page runs the checks rather than leaving them to you.</p>
        <p>Two versions are computed. <b>Student's t</b> pools the variances of the two
        groups and assumes they are equal in the population. <b>Welch's t</b> makes no such
        assumption and adjusts the degrees of freedom instead. Modern practice is to report
        Welch's version by default: it costs almost nothing when the variances really are
        equal and protects you when they are not. Levene's test, shown alongside, tells you
        whether the equal-variance assumption is tenable at all.</p>
        <p>The output also carries the difference between the means with its 95% confidence
        interval — the number most readers actually want — plus Cohen's d and Hedges' g. Use
        Hedges' g whenever a group has fewer than twenty students: Cohen's d is biased
        upwards at small sample sizes and will overstate your effect.</p>
    """,
    spec=[
        ("Measurement scale", "Interval only"),
        ("Study design", "Two independent groups — a control group is required"),
        ("Measurements needed", "1 (post-test); a pre-test is strongly recommended"),
        ("Minimum n", "15 per group"),
        ("Recommended n", "≥ 30 per group; 64 to detect a medium effect"),
        ("Assumptions", "Approximately normal within each group; independent observations"),
        ("Test statistic", "t (Student and Welch); effect size Cohen's d, Hedges' g"),
        ("Source", "Starichenko §3.2 (p. 107), Table 12 (p. 210)"),
    ],
    form=group_inputs() + options_row() + toolbar("Run the t-test"),
    notes="""
        <h2>Which p-value to quote</h2>
        <p>Quote Welch's unless you have a specific reason not to. If Levene's test comes
        back significant, Welch's is the only defensible choice; if it does not, the two
        versions will agree closely anyway. Decide before you see the data, and say in your
        methods section which one you planned to use.</p>
        <h2>Sample size reality check</h2>
        <p>To detect a medium effect (d = 0.5) at 80% power you need 64 students in each
        group. With 15 per group the test can only detect effects around d = 1.1 and larger.
        A non-significant result at that size tells you very little — report the effect
        size with its confidence interval and say so plainly. The
        <a href="../guides/sample-size.html">sample size guide</a> has the full table.</p>
    """,
    script="assets/js/pages/independent-t.js",
)

# ---------------------------------------------------------------- 7. Fisher phi
add(
    id="fisher-phi",
    file="methods/fisher-phi.html",
    title="Fisher's Angular Transformation (φ*)",
    meta="Fisher's phi criterion (angular transformation) for comparing two proportions or percentages in pedagogical research.",
    eyebrow="Non-parametric · Proportions",
    lede="The correct way to compare two percentages. Percentages cannot be fed into a "
         "statistical test directly — this criterion converts each proportion into an "
         "angle first, and has no upper limit on sample size.",
    about="""
        <p>Reporting that 40% of the control group and 70% of the experimental group passed
        is descriptive, not evidential. To test whether that gap is real you need a
        criterion built for proportions, and Fisher's angular transformation is the one the
        textbook recommends. Each proportion <i>P</i> is turned into an angle
        φ = 2·arcsin(√P), which stabilises the variance, and the two angles are then
        compared.</p>
        <p>The empirical value is φ* = |φ₁ − φ₂| · √(n₁n₂ ⁄ (n₁+n₂)). It is referred to the
        critical values 1.64 for p ≤ 0.05 and 2.31 for p ≤ 0.01 (Starichenko, Table 8).
        The criterion has no upper bound on sample size and unusually permissive lower
        bounds: comparisons are admissible from n₁ = 2 provided n₂ ≥ 30, from n₁ = 3 with
        n₂ ≥ 7, from n₁ = 4 with n₂ ≥ 5, and freely once both samples reach 5. This page
        checks those bounds for you and refuses to pretend a comparison is valid when it
        is not.</p>
        <p>The "effect" you count can be anything you can define in advance: passing a
        threshold, completing a task, reaching a competence level, making a particular type
        of error. What matters is that the threshold is fixed <em>before</em> you look at
        the data. Choosing the cut-off that maximises the difference after the fact is
        exactly the manoeuvre that invalidates the result.</p>
    """,
    spec=[
        ("Measurement scale", "Nominal — or any scale reduced to \"effect present / absent\""),
        ("Study design", "Two independent or two related samples"),
        ("Measurements needed", "1"),
        ("Minimum n", "n₁ = 2 with n₂ ≥ 30; 3 with ≥ 7; 4 with ≥ 5; free from 5 and 5"),
        ("Recommended n", "≥ 20 per group"),
        ("Upper limit", "None — the criterion has no upper bound"),
        ("Test statistic", "φ* compared with 1.64 (p ≤ 0.05) and 2.31 (p ≤ 0.01)"),
        ("Source", "Starichenko §2.4.2 (p. 74), Table 8 (p. 206)"),
    ],
    form="""
        <div class="data-grid">
          <div class="field">
            <label for="lab1">Group 1 name</label>
            <input type="text" id="lab1" value="Experimental group" spellcheck="false">
            <div class="field-row" style="margin-top:12px">
              <div class="field">
                <label for="k1">Students showing the effect</label>
                <input type="number" id="k1" min="0" step="1" value="">
              </div>
              <div class="field">
                <label for="n1">Group size</label>
                <input type="number" id="n1" min="1" step="1" value="">
              </div>
            </div>
          </div>
          <div class="field">
            <label for="lab2">Group 2 name</label>
            <input type="text" id="lab2" value="Control group" spellcheck="false">
            <div class="field-row" style="margin-top:12px">
              <div class="field">
                <label for="k2">Students showing the effect</label>
                <input type="number" id="k2" min="0" step="1" value="">
              </div>
              <div class="field">
                <label for="n2">Group size</label>
                <input type="number" id="n2" min="1" step="1" value="">
              </div>
            </div>
          </div>
        </div>
        <div class="field">
          <label for="effectName">How the effect is defined</label>
          <input type="text" id="effectName" value="passed the final test" spellcheck="false">
          <div class="hint">Used in the written interpretation. Fix this definition before collecting data.</div>
        </div>
        """ + options_row(alternative=False, extra="""
          <div class="field">
            <label for="tails">Hypothesis</label>
            <select id="tails">
              <option value="one" selected>One-sided — group 1 should be higher</option>
              <option value="two">Two-sided — either group may be higher</option>
            </select>
          </div>""") + toolbar("Compare the proportions"),
    notes="""
        <h2>Why not just use percentages?</h2>
        <p>Because a percentage discards the sample size, and the sample size is what
        decides whether a gap is meaningful. Ten out of twenty-five (40%) versus twelve out
        of twenty (60%) looks like a difference of half again — yet φ* = 1.34, below the
        critical 1.64, so the gap is not statistically reliable. The same two percentages
        based on 250 and 200 students would be decisive. Never run a test on percentages
        themselves; always work from the underlying counts.</p>
        <h2>Related samples</h2>
        <p>The criterion also compares two proportions measured on the same students before
        and after the course. Enter the pre-course count as group 1 and the post-course
        count as group 2, with the same group size in both.</p>
    """,
    script="assets/js/pages/fisher-phi.js",
)

# ---------------------------------------------------------------- 8. Chi-square
add(
    id="chi-square",
    file="methods/chi-square.html",
    title="Pearson's Chi-Square Test",
    meta="Chi-square test of independence for pedagogical research, with Yates' correction, Cramér's V and an automatic Fisher exact fallback.",
    eyebrow="Non-parametric · Frequencies",
    lede="Compares how students are distributed across categories or performance levels in "
         "two or more groups. Works on counts — never on percentages — and falls back to "
         "Fisher's exact test when a 2 × 2 table is too sparse.",
    about="""
        <p>The chi-square test compares the frequencies you observed with the frequencies
        you would expect if group membership and outcome were unrelated. It is the natural
        test when your outcome is a category — pass or fail, one of three competence
        levels, a type of error — and you want to know whether the experimental and control
        groups are distributed differently.</p>
        <p>Two rules decide whether the result can be trusted. First, the table must contain
        <b>counts of students, never percentages</b>: feeding percentages into chi-square is
        the single most common error in student dissertations, and it inflates or deflates
        the statistic arbitrarily. Second, every expected frequency should be at least 5;
        up to 20% of cells may fall between 1 and 5, but no lower. This page computes the
        expected frequencies, shows them to you, and warns when the condition fails.</p>
        <p>For 2 × 2 tables the page applies Yates' continuity correction and, in addition,
        always reports <b>Fisher's exact test</b>, which is valid at any frequency however
        small. When your table is 2 × 2 and the counts are modest — the usual situation with
        a class of fifteen — quote the exact test and treat chi-square as a secondary
        figure.</p>
    """,
    spec=[
        ("Measurement scale", "Nominal, or ordinal grouped into categories"),
        ("Study design", "Two or more independent groups"),
        ("Measurements needed", "1"),
        ("Minimum n", "All expected counts ≥ 5 — in practice ≥ 20 per group"),
        ("Recommended n", "≥ 40 per group"),
        ("Assumptions", "Independent observations; each student counted exactly once"),
        ("Test statistic", "χ² with (r−1)(c−1) df; effect size Cramér's V"),
        ("Source", "Starichenko §2.3.2 (p. 57), Table 6 (p. 203)"),
    ],
    form="""
        <div class="field">
          <label>Contingency table — enter counts of students</label>
          <div class="table-scroll">
            <table class="matrix-table" id="matrix"></table>
          </div>
          <div class="hint">Rows are groups, columns are outcome categories. Edit the header
          cells to rename them.</div>
        </div>
        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-ghost btn-sm" type="button" id="addRow">+ Add group</button>
          <button class="btn btn-ghost btn-sm" type="button" id="delRow">− Remove group</button>
          <button class="btn btn-ghost btn-sm" type="button" id="addCol">+ Add category</button>
          <button class="btn btn-ghost btn-sm" type="button" id="delCol">− Remove category</button>
        </div>
        """ + options_row(alternative=False, extra="""
          <div class="field">
            <label for="yates">Yates' correction (2 × 2 tables)</label>
            <select id="yates">
              <option value="auto" selected>Apply automatically to 2 × 2</option>
              <option value="off">Do not apply</option>
            </select>
          </div>""") + toolbar("Run the chi-square test"),
    notes="""
        <h2>Percentages belong in the write-up, not in the test</h2>
        <p>Report percentages when you describe the result — they are what a reader
        understands. Compute the statistic from the raw counts. If your source data only
        exists as percentages, you must recover the counts before any test is possible.</p>
        <h2>When the table is 2 × 2</h2>
        <p>With two groups and two outcomes you have three usable options: Fisher's exact
        test (always valid, preferred when counts are small), chi-square with Yates'
        correction, and the <a href="fisher-phi.html">φ* criterion</a>, which is the
        textbook's own recommendation for comparing two proportions. All three are shown
        or linked here; choose one in advance and report that one.</p>
    """,
    script="assets/js/pages/chi-square.js",
)

# ---------------------------------------------------------------- 9. Hake gain
add(
    id="hake-gain",
    file="methods/hake-gain.html",
    title="Hake Normalized Gain",
    meta="Normalized gain <g> for pre-test / post-test course evaluation — an effect measure that does not depend on sample size.",
    eyebrow="Effect measure · Pre / post, one group",
    lede="Measures how much of the room for improvement the course actually captured. "
         "Because it is a descriptive measure rather than a significance test, it stays "
         "meaningful with five students.",
    about="""
        <p>A raw gain of ten points means something quite different for a student who
        started at 20% than for one who started at 85% — the second had only fifteen points
        of room left. The normalized gain corrects for this: it divides the improvement
        actually achieved by the improvement that was available.</p>
        <div class="formula">g = (post-test % − pre-test %) ÷ (100% − pre-test %)</div>
        <p>A value of 0.5 means the course closed half the gap between where students
        started and a perfect score. The conventional bands, established by Richard Hake
        across thousands of physics students, are: <b>low</b> below 0.3, <b>medium</b>
        between 0.3 and 0.7, and <b>high</b> above 0.7. Those bands make results comparable
        across courses with different entry levels, and across your own successive cohorts.</p>
        <p>The measure carries no p-value and makes no claim of statistical significance —
        which is precisely why it is valuable when your group is too small for a test to
        have any power. Report it alongside the Wilcoxon signed-rank test, not instead of
        it, and quote both the class-average gain (computed from the group means) and the
        average of the individual gains, since the two can differ noticeably when the group
        is heterogeneous.</p>
    """,
    spec=[
        ("Measurement scale", "Interval, expressed on a bounded scale with a known maximum"),
        ("Study design", "Two measurements of the same students"),
        ("Measurements needed", "2 (pre-test and post-test)"),
        ("Minimum n", "1 — it is a descriptive measure"),
        ("Recommended n", "≥ 5 for a stable class average"),
        ("Interpretation", "g &lt; 0.3 low · 0.3–0.7 medium · &gt; 0.7 high"),
        ("Caveat", "Students already at the maximum cannot be scored and are excluded"),
        ("Source", "R. R. Hake, <em>Am. J. Phys.</em> 66 (1998) 64–74"),
    ],
    form=paired_inputs(
        hint_a="Raw scores, in the same order as the post-test column.",
        hint_b="Raw scores on the same scale as the pre-test.") + """
        <div class="field-row">
          <div class="field">
            <label for="maxScore">Maximum possible score</label>
            <input type="number" id="maxScore" min="1" step="any" value="100">
            <div class="hint">Use 100 if you entered percentages.</div>
          </div>
        </div>
        """ + toolbar("Compute the normalized gain"),
    notes="""
        <h2>Reading the two averages</h2>
        <p>The <b>class-average gain</b> is computed from the group's mean pre-test and mean
        post-test scores; it is the figure Hake used and the one to quote when comparing
        against published results. The <b>average individual gain</b> is the mean of each
        student's own g; it gives equal weight to every student and is the more informative
        of the two when your group is small and varied. Report both, and note when they
        diverge.</p>
        <h2>The ceiling problem</h2>
        <p>A student who already scored the maximum on the pre-test has no room to gain, and
        their normalized gain is undefined. Such students are excluded from the individual
        average and counted separately in the output. If several students hit the ceiling on
        the pre-test, your instrument was too easy to measure the effect of the course.</p>
    """,
    script="assets/js/pages/hake-gain.js",
)

# ---------------------------------------------------------------- 10. Effect size
add(
    id="effect-size",
    file="methods/effect-size.html",
    title="Effect Size Calculator",
    meta="Cohen's d, Hedges' g, rank-biserial r, Cohen's h, Cramér's V and the odds ratio with confidence intervals.",
    eyebrow="Effect measure · Any design",
    lede="Every significance test must be reported with an effect size. This calculator "
         "produces the right one for your design, with a 95% confidence interval and a "
         "plain-language reading.",
    about="""
        <p>A p-value answers only whether an effect is distinguishable from chance at your
        sample size. It says nothing about how large the effect is. With 200 students a gain
        of one point becomes significant; with six students a doubling of scores may not.
        The effect size fixes this: it expresses the size of the difference on a standard
        scale that does not depend on how many students you had.</p>
        <p>Which measure to use follows from the design. Two groups with numeric scores call
        for Cohen's d — or Hedges' g, its small-sample correction, whenever a group has
        fewer than twenty students, because d is biased upwards there. Pre/post data on one
        group call for the paired form. Rank tests report r = |Z| ÷ √N. Proportions call for
        Cohen's h or the odds ratio, and contingency tables for Cramér's V.</p>
        <p>Always report the confidence interval alongside the point estimate. With a small
        sample it will be wide — an interval running from 0.2 to 2.0 says the effect could
        be anywhere from barely noticeable to enormous, and a reader deserves to know that.
        An interval that includes zero is the same information a non-significant p-value
        carries, expressed more usefully.</p>
    """,
    spec=[
        ("Measurement scale", "Any — pick the mode that matches your data"),
        ("Study design", "Any"),
        ("Minimum n", "3"),
        ("Cohen's d / Hedges' g", "0.2 small · 0.5 medium · 0.8 large"),
        ("r and Cramér's V", "0.1 small · 0.3 medium · 0.5 large"),
        ("Cohen's h", "0.2 small · 0.5 medium · 0.8 large"),
        ("Odds ratio", "1.5 small · 2.5 medium · 4.0 large"),
        ("Source", "Cohen (1988); Hedges &amp; Olkin (1985)"),
    ],
    form="""
        <div class="field">
          <label for="mode">What do you have?</label>
          <select id="mode">
            <option value="groups" selected>Raw scores for two independent groups</option>
            <option value="summary">Means, SDs and sizes for two groups</option>
            <option value="paired">Raw pre-test and post-test scores for one group</option>
            <option value="proportions">Two proportions (counts of students)</option>
            <option value="chi">A chi-square value from a contingency table</option>
            <option value="z">A Z statistic from a rank test</option>
          </select>
        </div>
        <div id="modeFields"></div>
        """ + toolbar("Compute the effect size"),
    notes="""
        <h2>Reporting convention</h2>
        <p>Give the effect size to two decimal places with its confidence interval, next to
        the test result: <em>"d = 0.68, 95% CI [0.11, 1.25]"</em>. State which measure you
        used and, when the sample is small, that you used Hedges' g rather than Cohen's d.</p>
        <h2>Where the benchmarks come from</h2>
        <p>Cohen's small / medium / large labels were proposed for behavioural research in
        general, not for your subject specifically. If published studies of comparable
        teaching interventions routinely report d ≈ 0.4, then 0.4 is the benchmark that
        matters for your work, whatever the generic label says. Cite the comparison when
        you can.</p>
    """,
    script="assets/js/pages/effect-size.js",
)
