/*!
 * Pedagogical Statistics Toolkit — method catalogue
 * Single source of truth for the finder on the home page and for the
 * cross-links printed at the foot of every method page.
 */
(function (window) {
  'use strict';

  var METHODS = [
    {
      id: 'descriptives',
      name: 'Descriptive Statistics & Normality Screening',
      href: 'methods/descriptives.html',
      blurb: 'Means, medians, quartiles, standard deviations and 95% confidence intervals for one sample, plus a skewness–kurtosis check that tells you whether parametric tests are admissible.',
      design: ['single', 'paired', 'independent'],
      scale: ['ordinal', 'interval'],
      purpose: ['describe'],
      minN: 3,
      recN: 5,
      minNLabel: 'n ≥ 3',
      source: 'Starichenko, ch. 4 & 3.1.3'
    },
    {
      id: 'sign-test',
      name: 'Sign Test (G)',
      href: 'methods/sign-test.html',
      blurb: 'Asks whether scores shifted in one direction between two measurements of the same students. Counts only the direction of each change, so it works with ordinal data and with tiny groups.',
      design: ['paired'],
      scale: ['ordinal', 'interval'],
      purpose: ['significance'],
      minN: 5,
      recN: 10,
      minNLabel: 'n ≥ 5',
      source: 'Starichenko, 2.2.2'
    },
    {
      id: 'wilcoxon',
      name: 'Wilcoxon Signed-Rank Test (T)',
      href: 'methods/wilcoxon.html',
      blurb: 'The workhorse for pre-test / post-test designs without a control group. Uses both the direction and the magnitude of each change, and needs no assumption of normality.',
      design: ['paired'],
      scale: ['ordinal', 'interval'],
      purpose: ['significance'],
      minN: 5,
      recN: 15,
      minNLabel: 'n ≥ 5',
      source: 'Starichenko, 2.2.3'
    },
    {
      id: 'paired-t',
      name: 'Paired-Samples t-Test',
      href: 'methods/paired-t.html',
      blurb: 'Compares the mean pre-test and post-test scores of the same students. More powerful than rank tests when the differences are roughly normal — which the page checks for you.',
      design: ['paired'],
      scale: ['interval'],
      purpose: ['significance'],
      minN: 7,
      recN: 30,
      minNLabel: 'n ≥ 7',
      source: 'Starichenko, 3.2'
    },
    {
      id: 'mann-whitney',
      name: 'Mann–Whitney U Test',
      href: 'methods/mann-whitney.html',
      blurb: 'Compares an experimental group against a control group when the data are ordinal or the samples are small. No normality assumption, and unequal group sizes are fine.',
      design: ['independent'],
      scale: ['ordinal', 'interval'],
      purpose: ['significance'],
      minN: 4,
      recN: 15,
      minNLabel: 'n₁ = 3 with n₂ ≥ 5, or 4 + 4',
      source: 'Starichenko, 2.1.2'
    },
    {
      id: 'independent-t',
      name: 'Independent-Samples t-Test',
      href: 'methods/independent-t.html',
      blurb: 'Compares the mean scores of an experimental and a control group. Reports both the Student and the Welch version, and tests the equal-variance assumption for you.',
      design: ['independent'],
      scale: ['interval'],
      purpose: ['significance'],
      minN: 15,
      recN: 30,
      minNLabel: 'n ≥ 15 per group',
      source: 'Starichenko, 3.2'
    },
    {
      id: 'fisher-phi',
      name: "Fisher's Angular Transformation (φ*)",
      href: 'methods/fisher-phi.html',
      blurb: 'The correct way to compare two percentages. Converts each proportion into an angle and tests the difference — the only criterion in the textbook with no upper limit on sample size.',
      design: ['independent'],
      scale: ['nominal'],
      purpose: ['significance'],
      minN: 2,
      recN: 20,
      minNLabel: 'from n₁ = 2, n₂ ≥ 30',
      source: 'Starichenko, 2.4.2'
    },
    {
      id: 'chi-square',
      name: "Pearson's Chi-Square Test",
      href: 'methods/chi-square.html',
      blurb: 'Compares how students are distributed across categories or performance levels in two or more groups. Falls back to Fisher’s exact test automatically when the table is 2 × 2 and the counts are small.',
      design: ['independent'],
      scale: ['nominal', 'ordinal'],
      purpose: ['significance'],
      minN: 20,
      recN: 40,
      minNLabel: 'expected counts ≥ 5',
      source: 'Starichenko, 2.3.2'
    },
    {
      id: 'hake-gain',
      name: 'Hake Normalized Gain',
      href: 'methods/hake-gain.html',
      blurb: 'Measures how much of the available room for improvement the course actually captured. Independent of sample size, so it is meaningful even with five students.',
      design: ['paired'],
      scale: ['interval'],
      purpose: ['effect', 'describe'],
      minN: 1,
      recN: 5,
      minNLabel: 'any n',
      source: 'Standard in education research'
    },
    {
      id: 'effect-size',
      name: 'Effect Size Calculator',
      href: 'methods/effect-size.html',
      blurb: "Cohen's d, Hedges' g, rank-biserial r, Cohen's h, Cramér's V and the odds ratio, each with a 95% confidence interval. Report one of these with every significance test.",
      design: ['paired', 'independent'],
      scale: ['nominal', 'ordinal', 'interval'],
      purpose: ['effect'],
      minN: 3,
      recN: 3,
      minNLabel: 'any n',
      source: 'Cohen (1988); Hedges & Olkin (1985)'
    }
  ];

  var FACETS = {
    design: {
      label: 'What are you comparing?',
      options: [
        { id: 'paired',      label: 'Before and after, same students' },
        { id: 'independent', label: 'Experimental vs control group' },
        { id: 'single',      label: 'One group, description only' }
      ]
    },
    scale: {
      label: 'Measurement scale',
      options: [
        { id: 'interval', label: 'Scores (test marks, time)' },
        { id: 'ordinal',  label: 'Levels or ranks (low / medium / high)' },
        { id: 'nominal',  label: 'Pass / fail, yes / no' }
      ]
    },
    groupSize: {
      label: 'Students per group',
      exclusive: true,
      options: [
        { id: 'tiny',   label: '5 – 7' },
        { id: 'small',  label: '8 – 19' },
        { id: 'normal', label: '20 or more' }
      ]
    },
    purpose: {
      label: 'What do you need?',
      options: [
        { id: 'significance', label: 'A significance test' },
        { id: 'effect',       label: 'An effect size' },
        { id: 'describe',     label: 'Descriptive summary' }
      ]
    }
  };

  var SIZE_CEILING = { tiny: 7, small: 19, normal: Infinity };

  var LABELS = {
    paired: 'Pre / post, one group',
    independent: 'Two independent groups',
    single: 'Single sample',
    interval: 'Interval scale',
    ordinal: 'Ordinal scale',
    nominal: 'Nominal scale',
    significance: 'Significance test',
    effect: 'Effect size',
    describe: 'Description'
  };

  window.PSTCatalog = {
    methods: METHODS,
    facets: FACETS,
    sizeCeiling: SIZE_CEILING,
    labels: LABELS,
    byId: function (id) {
      for (var i = 0; i < METHODS.length; i++) if (METHODS[i].id === id) return METHODS[i];
      return null;
    }
  };
})(window);
