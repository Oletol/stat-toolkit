/*!
 * Pedagogical Statistics Toolkit — statistics engine
 * Pure ES5-compatible JavaScript, no dependencies.
 *
 * Everything runs in the browser: no data ever leaves the user's machine.
 */
(function (root) {
  'use strict';

  var S = {};

  /* ------------------------------------------------------------------ *
   * 1. Special functions
   * ------------------------------------------------------------------ */

  var LANCZOS = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7
  ];

  /** Natural logarithm of the gamma function (Lanczos approximation). */
  function logGamma(x) {
    if (x < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
    }
    x -= 1;
    var a = 0.99999999999980993;
    var t = x + 7.5;
    for (var i = 0; i < 8; i++) a += LANCZOS[i] / (x + i + 1);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  S.logGamma = logGamma;

  /** log of the binomial coefficient C(n, k). */
  function logChoose(n, k) {
    return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
  }
  S.logChoose = logChoose;

  /** Regularised lower incomplete gamma P(a, x). */
  function gammaP(a, x) {
    if (x < 0 || a <= 0) return NaN;
    if (x === 0) return 0;
    if (x < a + 1) {
      // series representation
      var ap = a, sum = 1 / a, del = sum;
      for (var n = 1; n < 500; n++) {
        ap += 1;
        del *= x / ap;
        sum += del;
        if (Math.abs(del) < Math.abs(sum) * 1e-15) break;
      }
      return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
    }
    // continued fraction for Q(a, x)
    var FPMIN = 1e-300;
    var b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
    for (var i = 1; i < 500; i++) {
      var an = -i * (i - a);
      b += 2;
      d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      var delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1) < 1e-15) break;
    }
    var q = Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
    return 1 - q;
  }
  S.gammaP = gammaP;

  /** Continued fraction used by the incomplete beta function. */
  function betaCF(a, b, x) {
    var FPMIN = 1e-300, qab = a + b, qap = a + 1, qam = a - 1;
    var c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    var h = d;
    for (var m = 1; m <= 300; m++) {
      var m2 = 2 * m;
      var aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      var del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  }

  /** Regularised incomplete beta function I_x(a, b). */
  function betaI(a, b, x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) +
      a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betaCF(a, b, x) / a;
    return 1 - bt * betaCF(b, a, 1 - x) / b;
  }
  S.betaI = betaI;

  /* ------------------------------------------------------------------ *
   * 2. Distributions
   * ------------------------------------------------------------------ */

  /** Standard normal CDF. */
  function normCdf(z) {
    return 0.5 * (1 + erf(z / Math.SQRT2));
  }
  function erf(x) {
    // Abramowitz & Stegun 7.1.26 refined via gammaP for accuracy
    var s = x < 0 ? -1 : 1;
    var ax = Math.abs(x);
    return s * gammaP(0.5, ax * ax);
  }
  S.normCdf = normCdf;
  S.erf = erf;

  /** Standard normal PDF. */
  function normPdf(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); }
  S.normPdf = normPdf;

  /** Inverse standard normal CDF (Acklam's algorithm, refined by Halley step). */
  function normInv(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
             1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
             6.680131188771972e+01, -1.328068155288572e+01];
    var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
             -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
             3.754408661907416e+00];
    var pl = 0.02425, q, r, x;
    if (p < pl) {
      q = Math.sqrt(-2 * Math.log(p));
      x = (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
          ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
    } else if (p <= 1 - pl) {
      q = p - 0.5; r = q * q;
      x = (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
          (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
    }
    // one Halley refinement step
    var e = normCdf(x) - p;
    var u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }
  S.normInv = normInv;

  /** Student's t CDF. */
  function tCdf(t, df) {
    if (!isFinite(t)) return t > 0 ? 1 : 0;
    var x = df / (df + t * t);
    var p = 0.5 * betaI(df / 2, 0.5, x);
    return t > 0 ? 1 - p : p;
  }
  S.tCdf = tCdf;

  /** Two-sided p-value for Student's t. */
  function tTwoSided(t, df) { return 2 * (1 - tCdf(Math.abs(t), df)); }
  S.tTwoSided = tTwoSided;

  /** Inverse Student's t CDF (bisection — fast enough and robust). */
  function tInv(p, df) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    var lo = -1e3, hi = 1e3;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2;
      if (tCdf(mid, df) < p) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  S.tInv = tInv;

  /** Chi-square CDF. */
  function chi2Cdf(x, k) { return x <= 0 ? 0 : gammaP(k / 2, x / 2); }
  S.chi2Cdf = chi2Cdf;
  S.chi2P = function (x, k) { return 1 - chi2Cdf(x, k); };

  /** F distribution CDF. */
  function fCdf(f, d1, d2) {
    if (f <= 0) return 0;
    return betaI(d1 / 2, d2 / 2, d1 * f / (d1 * f + d2));
  }
  S.fCdf = fCdf;
  S.fP = function (f, d1, d2) { return 1 - fCdf(f, d1, d2); };

  /* ------------------------------------------------------------------ *
   * 3. Descriptive statistics
   * ------------------------------------------------------------------ */

  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function mean(a) { return sum(a) / a.length; }
  S.sum = sum;
  S.mean = mean;

  /** Sample variance (n − 1 denominator). */
  function variance(a) {
    var n = a.length; if (n < 2) return NaN;
    var m = mean(a), s = 0;
    for (var i = 0; i < n; i++) s += (a[i] - m) * (a[i] - m);
    return s / (n - 1);
  }
  S.variance = variance;
  S.sd = function (a) { return Math.sqrt(variance(a)); };

  function quantile(sorted, q) {
    var n = sorted.length;
    if (n === 0) return NaN;
    if (n === 1) return sorted[0];
    var pos = (n - 1) * q, base = Math.floor(pos), rest = pos - base;
    if (base + 1 < n) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    return sorted[base];
  }
  S.quantile = function (a, q) {
    return quantile(a.slice().sort(function (x, y) { return x - y; }), q);
  };
  S.median = function (a) { return S.quantile(a, 0.5); };

  /** Sample skewness (G1, the bias-corrected form used in the textbook). */
  function skewness(a) {
    var n = a.length; if (n < 3) return NaN;
    var m = mean(a), s = Math.sqrt(variance(a));
    if (s === 0) return NaN;
    var acc = 0;
    for (var i = 0; i < n; i++) acc += Math.pow((a[i] - m) / s, 3);
    return n / ((n - 1) * (n - 2)) * acc;
  }
  /** Sample excess kurtosis (G2). */
  function kurtosis(a) {
    var n = a.length; if (n < 4) return NaN;
    var m = mean(a), s = Math.sqrt(variance(a));
    if (s === 0) return NaN;
    var acc = 0;
    for (var i = 0; i < n; i++) acc += Math.pow((a[i] - m) / s, 4);
    var g2 = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * acc -
             3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3));
    return g2;
  }
  S.skewness = skewness;
  S.kurtosis = kurtosis;

  /** Standard errors of skewness and kurtosis (representativeness errors). */
  S.seSkewness = function (n) {
    return Math.sqrt(6 * n * (n - 1) / ((n - 2) * (n + 1) * (n + 3)));
  };
  S.seKurtosis = function (n) {
    var ses = S.seSkewness(n);
    return 2 * ses * Math.sqrt((n * n - 1) / ((n - 3) * (n + 5)));
  };

  /** Full descriptive summary of one numeric sample. */
  S.describe = function (a) {
    var n = a.length;
    var sorted = a.slice().sort(function (x, y) { return x - y; });
    var m = mean(a), v = variance(a), sd = Math.sqrt(v);
    var se = sd / Math.sqrt(n);
    var tc = tInv(0.975, n - 1);
    return {
      n: n,
      mean: m,
      sd: sd,
      variance: v,
      se: se,
      ciLow: m - tc * se,
      ciHigh: m + tc * se,
      min: sorted[0],
      q1: quantile(sorted, 0.25),
      median: quantile(sorted, 0.5),
      q3: quantile(sorted, 0.75),
      max: sorted[n - 1],
      range: sorted[n - 1] - sorted[0],
      iqr: quantile(sorted, 0.75) - quantile(sorted, 0.25),
      skewness: skewness(a),
      kurtosis: kurtosis(a),
      seSkewness: n > 2 ? S.seSkewness(n) : NaN,
      seKurtosis: n > 3 ? S.seKurtosis(n) : NaN,
      cv: m !== 0 ? sd / Math.abs(m) : NaN,
      sorted: sorted
    };
  };

  /* ------------------------------------------------------------------ *
   * 4. Ranking with tie handling
   * ------------------------------------------------------------------ */

  /**
   * Mid-ranks of the values in `a`.
   * Returns { ranks: [...], tieGroups: [g1, g2, ...], tieCorrection: sum(t^3 - t) }
   */
  function rank(a) {
    var n = a.length;
    var idx = [];
    for (var i = 0; i < n; i++) idx.push(i);
    idx.sort(function (x, y) { return a[x] - a[y]; });
    var ranks = new Array(n);
    var groups = [], tc = 0;
    var i2 = 0;
    while (i2 < n) {
      var j = i2;
      while (j + 1 < n && a[idx[j + 1]] === a[idx[i2]]) j++;
      var t = j - i2 + 1;
      var avg = (i2 + j) / 2 + 1;
      for (var k = i2; k <= j; k++) ranks[idx[k]] = avg;
      if (t > 1) { groups.push(t); tc += t * t * t - t; }
      i2 = j + 1;
    }
    return { ranks: ranks, tieGroups: groups, tieCorrection: tc, hasTies: groups.length > 0 };
  }
  S.rank = rank;

  /* ------------------------------------------------------------------ *
   * 5. Exact discrete distributions
   * ------------------------------------------------------------------ */

  /** Exact two-sided binomial test for a proportion of 0.5. */
  function binomTest(k, n, p0, alternative) {
    p0 = p0 === undefined ? 0.5 : p0;
    alternative = alternative || 'two-sided';
    function pmf(i) { return Math.exp(logChoose(n, i) + i * Math.log(p0) + (n - i) * Math.log(1 - p0)); }
    var i, p;
    if (alternative === 'less') {
      p = 0; for (i = 0; i <= k; i++) p += pmf(i);
      return Math.min(1, p);
    }
    if (alternative === 'greater') {
      p = 0; for (i = k; i <= n; i++) p += pmf(i);
      return Math.min(1, p);
    }
    // two-sided: sum of all outcomes no more likely than the observed one
    var obs = pmf(k), tot = 0, rel = 1 + 1e-7;
    for (i = 0; i <= n; i++) { var pi = pmf(i); if (pi <= obs * rel) tot += pi; }
    return Math.min(1, tot);
  }
  S.binomTest = binomTest;

  /**
   * Exact null distribution of the Wilcoxon signed-rank statistic W+ for n pairs.
   * Returns counts[w] for w = 0 .. n(n+1)/2 (total = 2^n).
   */
  function wilcoxonDist(n) {
    var maxW = n * (n + 1) / 2;
    var counts = new Float64Array(maxW + 1);
    counts[0] = 1;
    for (var i = 1; i <= n; i++) {
      for (var w = maxW; w >= i; w--) counts[w] += counts[w - i];
    }
    return counts;
  }
  S.wilcoxonDist = wilcoxonDist;

  /**
   * Exact null distribution of the Mann–Whitney U statistic, via the classic
   * recurrence  c(a, b, u) = c(a−1, b, u−b) + c(a, b−1, u).
   * Returns counts[u] for u = 0 .. n1·n2 (total = C(n1+n2, n1)).
   * Exact in double precision for n1, n2 ≤ 20.
   */
  function mwuDist(n1, n2) {
    var maxU = n1 * n2, a, b, u;
    // cur[a] = distribution for (a, b−1); next[a] = distribution for (a, b)
    var cur = [];
    for (a = 0; a <= n1; a++) {
      cur.push(new Float64Array(maxU + 1));
      cur[a][0] = 1;                 // b = 0  ->  U = 0 with certainty
    }
    for (b = 1; b <= n2; b++) {
      var next = [];
      for (a = 0; a <= n1; a++) next.push(new Float64Array(maxU + 1));
      next[0][0] = 1;                // a = 0  ->  U = 0 with certainty
      for (a = 1; a <= n1; a++) {
        for (u = 0; u <= maxU; u++) {
          var val = cur[a][u];                       // c(a, b−1, u)
          if (u - b >= 0) val += next[a - 1][u - b]; // c(a−1, b, u−b)
          next[a][u] = val;
        }
      }
      cur = next;
    }
    return cur[n1];
  }
  S.mwuDist = mwuDist;

  /* ------------------------------------------------------------------ *
   * 6. Tests — paired designs
   * ------------------------------------------------------------------ */

  /** Sign test on paired data (pre, post). */
  S.signTest = function (pre, post, alternative) {
    alternative = alternative || 'two-sided';
    var pos = 0, neg = 0, zero = 0, diffs = [];
    for (var i = 0; i < pre.length; i++) {
      var d = post[i] - pre[i];
      diffs.push(d);
      if (d > 0) pos++; else if (d < 0) neg++; else zero++;
    }
    var n = pos + neg;
    var p;
    if (n === 0) {
      p = 1;
    } else if (alternative === 'two-sided') {
      p = binomTest(Math.min(pos, neg), n, 0.5, 'two-sided');
    } else if (alternative === 'greater') {       // post > pre
      p = binomTest(pos, n, 0.5, 'greater');
    } else {
      p = binomTest(neg, n, 0.5, 'greater');
    }
    // G statistic of the textbook: the number of the rarer sign
    var G = Math.min(pos, neg);
    var prop = n > 0 ? pos / n : NaN;
    return {
      nPairs: pre.length, nEffective: n, positive: pos, negative: neg, zeros: zero,
      G: G, p: p, proportionImproved: prop,
      propCi: n > 0 ? S.wilsonCi(pos, n) : null,
      diffs: diffs
    };
  };

  /** Wilcoxon signed-rank test on paired data. */
  S.wilcoxon = function (pre, post, alternative) {
    alternative = alternative || 'two-sided';
    var diffs = [], i;
    for (i = 0; i < pre.length; i++) diffs.push(post[i] - pre[i]);
    var nonZero = diffs.filter(function (d) { return d !== 0; });
    var zeros = diffs.length - nonZero.length;
    var n = nonZero.length;
    if (n === 0) return { error: 'All differences are zero — the test cannot be computed.' };

    var absVals = nonZero.map(Math.abs);
    var rk = rank(absVals);
    var wPlus = 0, wMinus = 0;
    for (i = 0; i < n; i++) {
      if (nonZero[i] > 0) wPlus += rk.ranks[i]; else wMinus += rk.ranks[i];
    }
    var T = Math.min(wPlus, wMinus);   // textbook statistic
    var exact = !rk.hasTies && zeros === 0 && n <= 25;
    var p, z, method;

    if (exact) {
      var counts = wilcoxonDist(n);
      var total = Math.pow(2, n);
      var cum = 0, w;
      for (w = 0; w <= T; w++) cum += counts[w];
      var pLower = cum / total;
      if (alternative === 'two-sided') {
        p = Math.min(1, 2 * pLower);
      } else {
        // one-sided in the hypothesised direction
        var stat = (alternative === 'greater') ? wMinus : wPlus;
        var c2 = 0;
        for (w = 0; w <= stat; w++) c2 += counts[w];
        p = c2 / total;
      }
      method = 'Exact distribution (n = ' + n + ', no ties)';
      z = null;
    } else {
      var meanW = n * (n + 1) / 4;
      var sdW = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24 - rk.tieCorrection / 48);
      var stat2 = wPlus;
      var num = stat2 - meanW;
      var corr = num > 0 ? -0.5 : 0.5;
      z = sdW > 0 ? (num + corr) / sdW : 0;
      if (alternative === 'two-sided') p = 2 * (1 - normCdf(Math.abs(z)));
      else if (alternative === 'greater') p = 1 - normCdf(z);
      else p = normCdf(z);
      method = 'Normal approximation with continuity and tie correction';
    }

    var zEff = z !== null ? z : (function () {
      var meanW = n * (n + 1) / 4;
      var sdW = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24);
      return sdW > 0 ? (wPlus - meanW) / sdW : 0;
    })();

    return {
      nPairs: pre.length, nEffective: n, zeros: zeros,
      wPlus: wPlus, wMinus: wMinus, T: T,
      p: Math.min(1, p), z: zEff, exact: exact, method: method,
      hasTies: rk.hasTies,
      r: Math.abs(zEff) / Math.sqrt(n),
      diffs: diffs,
      medianDiff: S.median(diffs)
    };
  };

  /** Paired t-test. */
  S.pairedT = function (pre, post, alternative, conf) {
    alternative = alternative || 'two-sided';
    conf = conf || 0.95;
    var d = [], i;
    for (i = 0; i < pre.length; i++) d.push(post[i] - pre[i]);
    var n = d.length;
    var md = mean(d), sdd = Math.sqrt(variance(d));
    var se = sdd / Math.sqrt(n);
    var t = se > 0 ? md / se : (md === 0 ? 0 : Infinity);
    var df = n - 1;
    var p;
    if (alternative === 'two-sided') p = tTwoSided(t, df);
    else if (alternative === 'greater') p = 1 - tCdf(t, df);
    else p = tCdf(t, df);
    var tc = tInv(1 - (1 - conf) / 2, df);
    var dz = sdd > 0 ? md / sdd : NaN;                    // Cohen's d for paired data
    var g = dz * (1 - 3 / (4 * df - 1));                  // Hedges' correction
    return {
      n: n, df: df, meanPre: mean(pre), meanPost: mean(post),
      meanDiff: md, sdDiff: sdd, se: se, t: t, p: Math.min(1, p),
      ciLow: md - tc * se, ciHigh: md + tc * se, conf: conf,
      d: dz, g: g, diffs: d,
      skewDiff: skewness(d), kurtDiff: kurtosis(d)
    };
  };

  /* ------------------------------------------------------------------ *
   * 7. Tests — independent groups
   * ------------------------------------------------------------------ */

  /** Mann–Whitney U test for two independent samples. */
  S.mannWhitney = function (g1, g2, alternative) {
    alternative = alternative || 'two-sided';
    var n1 = g1.length, n2 = g2.length;
    var all = g1.concat(g2);
    var rk = rank(all);
    var r1 = 0, i;
    for (i = 0; i < n1; i++) r1 += rk.ranks[i];
    var r2 = 0;
    for (i = n1; i < n1 + n2; i++) r2 += rk.ranks[i];
    var u1 = r1 - n1 * (n1 + 1) / 2;
    var u2 = n1 * n2 - u1;
    var U = Math.min(u1, u2);                  // textbook statistic
    var exact = !rk.hasTies && n1 <= 20 && n2 <= 20;
    var p, z, method;

    if (exact) {
      var counts = mwuDist(n1, n2);
      var total = Math.exp(logChoose(n1 + n2, n1));
      var cum = 0, u;
      for (u = 0; u <= U; u++) cum += counts[u];
      var pLow = cum / total;
      if (alternative === 'two-sided') {
        p = Math.min(1, 2 * pLow);
      } else {
        var stat = (alternative === 'greater') ? u2 : u1;   // group 1 > group 2 -> small u2
        var c2 = 0;
        for (u = 0; u <= stat; u++) c2 += counts[u];
        p = c2 / total;
      }
      method = 'Exact distribution (n₁ = ' + n1 + ', n₂ = ' + n2 + ', no ties)';
      z = null;
    } else {
      var meanU = n1 * n2 / 2;
      var N = n1 + n2;
      var sdU = Math.sqrt(n1 * n2 / 12 * ((N + 1) - rk.tieCorrection / (N * (N - 1))));
      var num = u1 - meanU;
      var corr = num > 0 ? -0.5 : 0.5;
      z = sdU > 0 ? (num + corr) / sdU : 0;
      if (alternative === 'two-sided') p = 2 * (1 - normCdf(Math.abs(z)));
      else if (alternative === 'greater') p = 1 - normCdf(z);
      else p = normCdf(z);
      method = 'Normal approximation with continuity and tie correction';
    }

    var meanU2 = n1 * n2 / 2;
    var N2 = n1 + n2;
    var sdU2 = Math.sqrt(n1 * n2 * (N2 + 1) / 12);
    var zEff = z !== null ? z : (sdU2 > 0 ? (u1 - meanU2) / sdU2 : 0);

    return {
      n1: n1, n2: n2, u1: u1, u2: u2, U: U, r1: r1, r2: r2,
      meanRank1: r1 / n1, meanRank2: r2 / n2,
      median1: S.median(g1), median2: S.median(g2),
      p: Math.min(1, p), z: zEff, exact: exact, method: method,
      hasTies: rk.hasTies,
      r: Math.abs(zEff) / Math.sqrt(N2),
      rbc: 1 - 2 * U / (n1 * n2)
    };
  };

  /** Independent-samples t-test (Student and Welch). */
  S.independentT = function (g1, g2, alternative, conf) {
    alternative = alternative || 'two-sided';
    conf = conf || 0.95;
    var n1 = g1.length, n2 = g2.length;
    var m1 = mean(g1), m2 = mean(g2);
    var v1 = variance(g1), v2 = variance(g2);
    var diff = m1 - m2;

    // Student (pooled)
    var dfP = n1 + n2 - 2;
    var sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / dfP;
    var seP = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    var tP = seP > 0 ? diff / seP : 0;

    // Welch
    var seW = Math.sqrt(v1 / n1 + v2 / n2);
    var tW = seW > 0 ? diff / seW : 0;
    var dfW = seW > 0
      ? Math.pow(v1 / n1 + v2 / n2, 2) /
        (Math.pow(v1 / n1, 2) / (n1 - 1) + Math.pow(v2 / n2, 2) / (n2 - 1))
      : dfP;

    function pv(t, df) {
      if (alternative === 'two-sided') return tTwoSided(t, df);
      if (alternative === 'greater') return 1 - tCdf(t, df);
      return tCdf(t, df);
    }

    // Levene's test (Brown–Forsythe variant, median-centred)
    var lev = leveneTest([g1, g2]);

    var sPooled = Math.sqrt(sp2);
    var d = sPooled > 0 ? diff / sPooled : NaN;
    var J = 1 - 3 / (4 * (n1 + n2) - 9);
    var g = d * J;
    var seD = Math.sqrt((n1 + n2) / (n1 * n2) + d * d / (2 * (n1 + n2)));

    var tcP = tInv(1 - (1 - conf) / 2, dfP);
    var tcW = tInv(1 - (1 - conf) / 2, dfW);
    var zc = normInv(1 - (1 - conf) / 2);

    return {
      n1: n1, n2: n2, mean1: m1, mean2: m2, sd1: Math.sqrt(v1), sd2: Math.sqrt(v2),
      diff: diff,
      student: { t: tP, df: dfP, p: Math.min(1, pv(tP, dfP)), se: seP,
                 ciLow: diff - tcP * seP, ciHigh: diff + tcP * seP },
      welch:   { t: tW, df: dfW, p: Math.min(1, pv(tW, dfW)), se: seW,
                 ciLow: diff - tcW * seW, ciHigh: diff + tcW * seW },
      levene: lev,
      d: d, g: g, dCiLow: d - zc * seD, dCiHigh: d + zc * seD,
      conf: conf
    };
  };

  /** Levene / Brown–Forsythe test of equal variances (median-centred). */
  function leveneTest(groups) {
    var k = groups.length, i, j;
    var z = [], all = [];
    for (i = 0; i < k; i++) {
      var med = S.median(groups[i]);
      var zi = groups[i].map(function (x) { return Math.abs(x - med); });
      z.push(zi);
      all = all.concat(zi);
    }
    var N = all.length, grand = mean(all);
    var num = 0, den = 0;
    for (i = 0; i < k; i++) {
      var mi = mean(z[i]);
      num += z[i].length * Math.pow(mi - grand, 2);
      for (j = 0; j < z[i].length; j++) den += Math.pow(z[i][j] - mi, 2);
    }
    var df1 = k - 1, df2 = N - k;
    var F = den > 0 ? (num / df1) / (den / df2) : 0;
    return { F: F, df1: df1, df2: df2, p: 1 - fCdf(F, df1, df2) };
  }
  S.leveneTest = leveneTest;

  /* ------------------------------------------------------------------ *
   * 8. Tests — proportions and frequencies
   * ------------------------------------------------------------------ */

  /** Wilson score interval for a proportion. */
  S.wilsonCi = function (k, n, conf) {
    conf = conf || 0.95;
    var z = normInv(1 - (1 - conf) / 2);
    var p = k / n;
    var den = 1 + z * z / n;
    var centre = (p + z * z / (2 * n)) / den;
    var half = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den;
    return { low: Math.max(0, centre - half), high: Math.min(1, centre + half) };
  };

  /**
   * Fisher's angular transformation (φ*) test, as presented in the textbook.
   * φ = 2·arcsin(√P);  φ_emp = |φ₁ − φ₂|·√(n₁n₂/(n₁+n₂))
   */
  S.fisherPhi = function (k1, n1, k2, n2) {
    var p1 = k1 / n1, p2 = k2 / n2;
    var f1 = 2 * Math.asin(Math.sqrt(p1));
    var f2 = 2 * Math.asin(Math.sqrt(p2));
    var phi = Math.abs(f1 - f2) * Math.sqrt(n1 * n2 / (n1 + n2));
    var pOne = 1 - normCdf(phi);
    var pTwo = 2 * pOne;
    // Applicability per the textbook (Starichenko, 2.4.2)
    var lo = Math.min(n1, n2), hi = Math.max(n1, n2), ok = true, note = '';
    if (p1 === 0 && p2 === 0) { ok = false; note = 'Both proportions are 0 — the criterion cannot be applied.'; }
    else if (lo >= 5) { ok = true; note = 'Both samples have n ≥ 5: any comparison is admissible.'; }
    else if (lo === 4 && hi >= 5) { ok = true; note = 'n₁ = 4 with n₂ ≥ 5 — admissible.'; }
    else if (lo === 3 && hi >= 7) { ok = true; note = 'n₁ = 3 with n₂ ≥ 7 — admissible.'; }
    else if (lo === 2 && hi >= 30) { ok = true; note = 'n₁ = 2 with n₂ ≥ 30 — admissible.'; }
    else { ok = false; note = 'Sample sizes fall below the admissible bounds for this criterion.'; }

    var h = Math.abs(f1 - f2);   // Cohen's h
    var diff = p1 - p2;
    var seDiff = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
    var z95 = normInv(0.975);
    return {
      p1: p1, p2: p2, k1: k1, k2: k2, n1: n1, n2: n2,
      phi1: f1, phi2: f2, phiEmp: phi,
      pOneSided: Math.min(1, pOne), pTwoSided: Math.min(1, pTwo),
      crit05: 1.64, crit01: 2.31,
      applicable: ok, applicabilityNote: note,
      h: h, diff: diff,
      diffCiLow: diff - z95 * seDiff, diffCiHigh: diff + z95 * seDiff,
      ci1: S.wilsonCi(k1, n1), ci2: S.wilsonCi(k2, n2)
    };
  };

  /** Pearson chi-square test on an r × c contingency table of counts. */
  S.chiSquare = function (table, yates) {
    var r = table.length, c = table[0].length, i, j;
    var rowSums = [], colSums = new Array(c), N = 0;
    for (j = 0; j < c; j++) colSums[j] = 0;
    for (i = 0; i < r; i++) {
      var rs = 0;
      for (j = 0; j < c; j++) { rs += table[i][j]; colSums[j] += table[i][j]; }
      rowSums.push(rs); N += rs;
    }
    var expected = [], chi2 = 0, minExp = Infinity, lowCells = 0, cells = r * c;
    var is2x2 = (r === 2 && c === 2);
    var useYates = yates === undefined ? is2x2 : yates;
    for (i = 0; i < r; i++) {
      expected.push([]);
      for (j = 0; j < c; j++) {
        var e = rowSums[i] * colSums[j] / N;
        expected[i].push(e);
        if (e < minExp) minExp = e;
        if (e < 5) lowCells++;
        var dev = Math.abs(table[i][j] - e);
        if (useYates && is2x2) dev = Math.max(0, dev - 0.5);
        if (e > 0) chi2 += dev * dev / e;
      }
    }
    var df = (r - 1) * (c - 1);
    var p = 1 - chi2Cdf(chi2, df);
    var v = Math.sqrt(chi2 / (N * Math.min(r - 1, c - 1)));
    return {
      table: table, expected: expected, rowSums: rowSums, colSums: colSums, N: N,
      chi2: chi2, df: df, p: p, cramersV: v, phi: is2x2 ? Math.sqrt(chi2 / N) : null,
      minExpected: minExp, lowCells: lowCells, cells: cells,
      lowShare: lowCells / cells, yatesApplied: useYates && is2x2, is2x2: is2x2,
      contingencyC: Math.sqrt(chi2 / (chi2 + N))
    };
  };

  /** Fisher's exact test for a 2 × 2 table [[a,b],[c,d]]. */
  S.fisherExact = function (t) {
    var a = t[0][0], b = t[0][1], c = t[1][0], d = t[1][1];
    var r1 = a + b, r2 = c + d, c1 = a + c, c2 = b + d, N = r1 + r2;
    function pHyper(x) {
      return Math.exp(logChoose(r1, x) + logChoose(r2, c1 - x) - logChoose(N, c1));
    }
    var lo = Math.max(0, c1 - r2), hi = Math.min(r1, c1);
    var obs = pHyper(a), two = 0, less = 0, greater = 0, x;
    for (x = lo; x <= hi; x++) {
      var px = pHyper(x);
      if (px <= obs * (1 + 1e-7)) two += px;
      if (x <= a) less += px;
      if (x >= a) greater += px;
    }
    var or = (b * c) !== 0 ? (a * d) / (b * c) : NaN;
    // Haldane–Anscombe correction for the CI when a zero cell is present
    var a2 = a + 0.5, b2 = b + 0.5, c2c = c + 0.5, d2 = d + 0.5;
    var lnOr = Math.log((a2 * d2) / (b2 * c2c));
    var seLn = Math.sqrt(1 / a2 + 1 / b2 + 1 / c2c + 1 / d2);
    var z = normInv(0.975);
    return {
      pTwoSided: Math.min(1, two), pLess: Math.min(1, less), pGreater: Math.min(1, greater),
      oddsRatio: or,
      orCiLow: Math.exp(lnOr - z * seLn), orCiHigh: Math.exp(lnOr + z * seLn)
    };
  };

  /* ------------------------------------------------------------------ *
   * 9. Hake normalized gain
   * ------------------------------------------------------------------ */

  /**
   * Normalized gain g = (post − pre) / (max − pre), with scores expressed
   * on the same scale. Returns class-average gain and individual gains.
   */
  S.hakeGain = function (pre, post, maxScore) {
    var indiv = [], i, valid = [], ceilingCount = 0;
    for (i = 0; i < pre.length; i++) {
      var denom = maxScore - pre[i];
      if (denom <= 0) { indiv.push(null); ceilingCount++; continue; }
      var g = (post[i] - pre[i]) / denom;
      indiv.push(g); valid.push(g);
    }
    var mPre = mean(pre), mPost = mean(post);
    var classGain = (maxScore - mPre) !== 0 ? (mPost - mPre) / (maxScore - mPre) : NaN;
    var avgIndiv = valid.length ? mean(valid) : NaN;
    function band(g) {
      if (!isFinite(g)) return 'undefined';
      if (g < 0) return 'negative';
      if (g < 0.3) return 'low';
      if (g <= 0.7) return 'medium';
      return 'high';
    }
    var counts = { negative: 0, low: 0, medium: 0, high: 0 };
    valid.forEach(function (g) { counts[band(g)]++; });
    return {
      n: pre.length, maxScore: maxScore,
      meanPre: mPre, meanPost: mPost,
      prePct: mPre / maxScore * 100, postPct: mPost / maxScore * 100,
      classGain: classGain, avgIndividualGain: avgIndiv,
      classBand: band(classGain), avgBand: band(avgIndiv),
      individual: indiv, valid: valid, ceilingCount: ceilingCount,
      counts: counts,
      sdIndividual: valid.length > 1 ? Math.sqrt(variance(valid)) : NaN
    };
  };

  /* ------------------------------------------------------------------ *
   * 10. Effect sizes
   * ------------------------------------------------------------------ */

  S.effect = {
    /** Cohen's d from two independent samples (pooled SD). */
    dIndependent: function (n1, m1, s1, n2, m2, s2, conf) {
      conf = conf || 0.95;
      var df = n1 + n2 - 2;
      var sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / df);
      var d = (m1 - m2) / sp;
      var J = 1 - 3 / (4 * (n1 + n2) - 9);
      var g = d * J;
      var se = Math.sqrt((n1 + n2) / (n1 * n2) + d * d / (2 * (n1 + n2)));
      var z = normInv(1 - (1 - conf) / 2);
      return { d: d, g: g, sPooled: sp, se: se, ciLow: d - z * se, ciHigh: d + z * se,
               gCiLow: (d - z * se) * J, gCiHigh: (d + z * se) * J };
    },
    /** Cohen's d for paired data (d_z). */
    dPaired: function (n, meanDiff, sdDiff, conf) {
      conf = conf || 0.95;
      var d = meanDiff / sdDiff;
      var J = 1 - 3 / (4 * (n - 1) - 1);
      var g = d * J;
      var se = Math.sqrt(1 / n + d * d / (2 * n));
      var z = normInv(1 - (1 - conf) / 2);
      return { d: d, g: g, se: se, ciLow: d - z * se, ciHigh: d + z * se,
               gCiLow: (d - z * se) * J, gCiHigh: (d + z * se) * J };
    },
    /** r from a z statistic and total N (non-parametric tests). */
    rFromZ: function (z, N) { return Math.abs(z) / Math.sqrt(N); },
    /** Cohen's h for two proportions. */
    h: function (p1, p2) {
      return Math.abs(2 * Math.asin(Math.sqrt(p1)) - 2 * Math.asin(Math.sqrt(p2)));
    },
    /** Cramér's V from chi-square. */
    cramersV: function (chi2, N, r, c) {
      return Math.sqrt(chi2 / (N * Math.min(r - 1, c - 1)));
    },
    /** Odds ratio with 95% CI (Haldane–Anscombe corrected). */
    oddsRatio: function (a, b, c, d) {
      var a2 = a + 0.5, b2 = b + 0.5, c2 = c + 0.5, d2 = d + 0.5;
      var or = (a * d) / (b * c);
      var lnOr = Math.log((a2 * d2) / (b2 * c2));
      var se = Math.sqrt(1 / a2 + 1 / b2 + 1 / c2 + 1 / d2);
      var z = normInv(0.975);
      return { or: or, ciLow: Math.exp(lnOr - z * se), ciHigh: Math.exp(lnOr + z * se) };
    },
    /** Verbal label for |d| / |g|. */
    labelD: function (d) {
      var a = Math.abs(d);
      if (a < 0.2) return 'negligible';
      if (a < 0.5) return 'small';
      if (a < 0.8) return 'medium';
      if (a < 1.2) return 'large';
      return 'very large';
    },
    /** Verbal label for |r| and Cramér's V. */
    labelR: function (r) {
      var a = Math.abs(r);
      if (a < 0.1) return 'negligible';
      if (a < 0.3) return 'small';
      if (a < 0.5) return 'medium';
      return 'large';
    }
  };

  /* ------------------------------------------------------------------ *
   * 11. Sample size
   * ------------------------------------------------------------------ */

  S.sampleSize = {
    /** Per-group n for two independent groups. */
    independent: function (d, alpha, power) {
      var z = normInv(1 - alpha / 2) + normInv(power);
      return Math.ceil(2 * z * z / (d * d) + 1);
    },
    /** Total n for a paired (pre–post) design. */
    paired: function (d, alpha, power) {
      var z = normInv(1 - alpha / 2) + normInv(power);
      return Math.ceil(z * z / (d * d) + 2);
    },
    /** Per-group n for comparing two proportions. */
    proportions: function (p1, p2, alpha, power) {
      var h = Math.abs(2 * Math.asin(Math.sqrt(p1)) - 2 * Math.asin(Math.sqrt(p2)));
      if (h === 0) return Infinity;
      var z = normInv(1 - alpha / 2) + normInv(power);
      return Math.ceil(2 * z * z / (h * h));
    },
    /** n for detecting a correlation of size r. */
    correlation: function (r, alpha, power) {
      var zr = 0.5 * Math.log((1 + r) / (1 - r));
      var z = normInv(1 - alpha / 2) + normInv(power);
      return Math.ceil(z * z / (zr * zr) + 3);
    },
    /** Achieved power for a two-group design. */
    powerIndependent: function (d, n, alpha) {
      var ncp = d * Math.sqrt(n / 2);
      var zc = normInv(1 - alpha / 2);
      return 1 - normCdf(zc - ncp) + normCdf(-zc - ncp);
    },
    /** Achieved power for a paired design. */
    powerPaired: function (d, n, alpha) {
      var ncp = d * Math.sqrt(n);
      var zc = normInv(1 - alpha / 2);
      return 1 - normCdf(zc - ncp) + normCdf(-zc - ncp);
    },
    /** Smallest effect detectable with the given n and power. */
    detectableIndependent: function (n, alpha, power) {
      var z = normInv(1 - alpha / 2) + normInv(power);
      return z * Math.sqrt(2 / n);
    },
    detectablePaired: function (n, alpha, power) {
      var z = normInv(1 - alpha / 2) + normInv(power);
      return z / Math.sqrt(n);
    }
  };

  /* ------------------------------------------------------------------ *
   * 12. Normality screening (Pustylnik criterion, Starichenko 3.1.3)
   * ------------------------------------------------------------------ */

  var PUSTYLNIK = {
    4:[2.15,1.75],5:[2.12,2.50],6:[2.07,2.98],7:[2.01,3.31],8:[1.95,3.53],
    9:[1.90,3.67],10:[1.84,3.77],11:[1.79,3.84],12:[1.75,3.88],13:[1.70,3.90],
    14:[1.66,3.91],15:[1.62,3.90],16:[1.58,3.89],17:[1.55,3.88],18:[1.52,3.86],
    19:[1.49,3.83],20:[1.46,3.81],21:[1.43,3.78],22:[1.40,3.75],23:[1.38,3.72],
    24:[1.36,3.69],25:[1.33,3.66],26:[1.31,3.62],27:[1.29,3.59],28:[1.27,3.56],
    29:[1.25,3.53],30:[1.24,3.50],35:[1.16,3.36],40:[1.09,3.22],45:[1.04,3.10],
    50:[0.99,2.99],60:[0.91,2.79],70:[0.85,2.63],80:[0.80,2.50],90:[0.75,2.38],
    100:[0.72,2.27]
  };

  /**
   * Screens a sample for normality using standardised skewness and kurtosis
   * against the critical values tabulated by E. I. Pustylnik.
   */
  S.normalityScreen = function (data) {
    var n = data.length;
    if (n < 4) return { verdict: 'insufficient', n: n,
      message: 'At least 4 observations are needed to screen for normality.' };
    var keys = Object.keys(PUSTYLNIK).map(Number).sort(function (a, b) { return a - b; });
    var key = keys[0];
    for (var i = 0; i < keys.length; i++) if (keys[i] <= n) key = keys[i];
    var crit = PUSTYLNIK[key];
    var A = skewness(data), E = kurtosis(data);
    var seA = S.seSkewness(n), seE = S.seKurtosis(n);
    var ratioA = Math.abs(A) / seA, ratioE = Math.abs(E) / seE;
    var okA = ratioA <= crit[0], okE = ratioE <= crit[1];
    var verdict = (okA && okE) ? 'consistent' : 'departure';
    return {
      n: n, tableN: key, A: A, E: E, seA: seA, seE: seE,
      ratioA: ratioA, ratioE: ratioE, critA: crit[0], critE: crit[1],
      okA: okA, okE: okE, verdict: verdict,
      weak: n < 8,
      message: verdict === 'consistent'
        ? 'Skewness and kurtosis stay within the critical bounds: the data are consistent with a normal distribution.'
        : 'Skewness and/or kurtosis exceed the critical bounds: the data depart from normality — prefer a rank-based test.'
    };
  };

  /* ------------------------------------------------------------------ *
   * 13. Helpers
   * ------------------------------------------------------------------ */

  /** Formats a p-value the way journals expect. */
  S.formatP = function (p) {
    if (!isFinite(p)) return '—';
    if (p < 0.001) return '< 0.001';
    return p.toFixed(p < 0.01 ? 4 : 3);
  };

  root.PSTStats = S;
})(typeof window !== 'undefined' ? window : globalThis);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = (typeof window !== 'undefined' ? window : globalThis).PSTStats;
}
