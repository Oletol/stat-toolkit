/* Verification harness: compares the engine against reference values. */
const S = require('../assets/js/stats.js');

let pass = 0, fail = 0;
function close(name, got, want, tol) {
  tol = tol === undefined ? 1e-6 : tol;
  const ok = Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (ok) { pass++; }
  else { fail++; console.log('FAIL', name, 'got', got, 'want', want); }
}
function eq(name, got, want) {
  if (got === want) pass++;
  else { fail++; console.log('FAIL', name, 'got', got, 'want', want); }
}

/* ---- distributions ---- */
close('normCdf(1.96)', S.normCdf(1.96), 0.9750021048517795, 1e-9);
close('normCdf(-2.5)', S.normCdf(-2.5), 0.006209665325776132, 1e-9);
close('normInv(0.975)', S.normInv(0.975), 1.959963984540054, 1e-8);
close('normInv(0.80)', S.normInv(0.80), 0.8416212335729143, 1e-8);
close('tCdf(2.086,20)', S.tCdf(2.086, 20), 0.9750018227712799, 1e-9);
close('tInv(0.975,10)', S.tInv(0.975, 10), 2.228138851986273, 1e-6);
close('chi2P(16.38,9)', 1 - S.chi2Cdf(16.38, 9), 0.05935791234052981, 1e-7);
close('fP(4.0,2,20)', 1 - S.fCdf(4.0, 2, 20), 0.03457161303360778, 1e-7);

/* ---- descriptive ---- */
const x = [12, 15, 11, 18, 14, 16, 13, 17, 15, 14];
close('mean', S.mean(x), 14.5, 1e-12);
close('sd', S.sd(x), 2.173067468400883, 1e-9);
close('median', S.median(x), 14.5, 1e-12);
close('skewness', S.skewness(x), 0.0, 1e-9);
close('kurtosis', S.kurtosis(x), -0.5356401384083047, 1e-6);

/* ---- sign test ---- */
let st = S.signTest([1,2,3,4,5,6], [3,4,5,6,7,8]);
eq('sign n', st.nEffective, 6);
close('sign p (all positive, n=6)', st.p, 0.03125, 1e-9);

/* ---- Wilcoxon ---- */
let pre = [10, 11, 12, 13, 14, 15, 16, 17];
let post = [11, 13, 16, 20, 25, 31, 38, 46];
let w = S.wilcoxon(pre, post);
eq('wilcoxon exact used', w.exact, true);
close('wilcoxon T', w.T, 0, 1e-12);
close('wilcoxon p (n=8, all positive)', w.p, 0.0078125, 1e-9);

let pre2 = [20, 22, 19, 25, 21, 23, 18, 26, 24, 20];
let post2 = [24, 23, 25, 26, 20, 28, 22, 27, 29, 25];
let w2 = S.wilcoxon(pre2, post2);
eq('wilcoxon2 uses approximation (ties present)', w2.exact, false);
close('wilcoxon2 p (normal approx, matches scipy)', w2.p, 0.011670411850967828, 1e-9);

/* ---- paired t ---- */
let pt = S.pairedT(pre2, post2);
close('pairedT t', pt.t, 4.122152526754808, 1e-8);
close('pairedT p', pt.p, 0.0025896133872878287, 1e-5);

/* ---- Mann-Whitney ---- */
let g1 = [18, 22, 25, 19, 24, 27, 21];
let g2 = [14, 16, 20, 13, 17, 15];
let mw = S.mannWhitney(g1, g2);
eq('mw exact used', mw.exact, true);
close('mw U', mw.U, 2, 1e-12);
close('mw p', mw.p, 0.004662004662004662, 1e-8);

/* ---- independent t ---- */
let it = S.independentT(g1, g2);
close('indT student t', it.student.t, 3.961878989367502, 1e-8);
close('indT student p', it.student.p, 0.00222687253434624, 1e-5);
close('indT welch df', it.welch.df, 10.89198036006547, 1e-8);
close('indT d', it.d, 2.20418598862586, 1e-9);

/* ---- Fisher phi ---- */
let fp = S.fisherPhi(10, 25, 12, 20);
close('phi1', fp.phi1, 1.3694384, 1e-6);
close('phi2', fp.phi2, 1.7721543, 1e-6);
close('phiEmp', fp.phiEmp, 1.3423861386022051, 1e-8);

let fp2 = S.fisherPhi(15, 27, 8, 25);
close('phiEmp2', fp2.phiEmp, 1.7279750013952946, 1e-8);

let fp3 = S.fisherPhi(46, 56, 35, 58);
close('phiEmp3', fp3.phiEmp, 2.614524343065856, 1e-8);

/* ---- chi square ---- */
let cs = S.chiSquare([[20, 30, 10], [35, 20, 5]], false);
close('chi2', cs.chi2, 7.757575757575757, 1e-9);
close('chi2 df', cs.df, 2, 1e-12);
close('chi2 p', cs.p, 0.0206758716615813, 1e-6);

let cs2 = S.chiSquare([[10, 15], [18, 7]], true);
close('chi2 yates', cs2.chi2, 3.9772727272727266, 1e-9);

/* ---- Fisher exact ---- */
let fe = S.fisherExact([[3, 7], [8, 2]]);
close('fisher exact p', fe.pTwoSided, 0.06977851869492736, 1e-9);
let fe2 = S.fisherExact([[5, 1], [1, 5]]);
close('fisher exact p2', fe2.pTwoSided, 0.08008658008658008, 1e-9);

/* ---- Hake ---- */
let hk = S.hakeGain([40, 50, 30], [70, 75, 60], 100);
close('hake class gain', hk.classGain, (68.333333 - 40) / 60, 1e-6);

/* ---- effect sizes ---- */
let es = S.effect.dIndependent(20, 75, 10, 20, 65, 10);
close('cohen d', es.d, 1.0, 1e-9);
close('hedges g', es.g, 1.0 * (1 - 3 / (4 * 40 - 9)), 1e-9);

/* ---- sample size ---- */
eq('n indep d=0.5', S.sampleSize.independent(0.5, 0.05, 0.8), 64);
eq('n paired d=0.5', S.sampleSize.paired(0.5, 0.05, 0.8), 34);
eq('n indep d=0.8', S.sampleSize.independent(0.8, 0.05, 0.8), 26);
eq('n paired d=0.8', S.sampleSize.paired(0.8, 0.05, 0.8), 15);
eq('n prop 40->70', S.sampleSize.proportions(0.4, 0.7, 0.05, 0.8), 42);
eq('n prop 50->80', S.sampleSize.proportions(0.5, 0.8, 0.05, 0.8), 38);
eq('n prop 30->70', S.sampleSize.proportions(0.3, 0.7, 0.05, 0.8), 24);
eq('n corr r=0.5', S.sampleSize.correlation(0.5, 0.05, 0.8), 30);

/* ---- exact distribution totals ---- */
let wd = S.wilcoxonDist(10);
close('wilcoxon dist total', wd.reduce((a, b) => a + b, 0), Math.pow(2, 10), 1e-9);
let md = S.mwuDist(7, 6);
close('mwu dist total', md.reduce((a, b) => a + b, 0), 1716, 1e-9);
let md2 = S.mwuDist(12, 11);
close('mwu dist total 12/11', md2.reduce((a, b) => a + b, 0), 1352078, 1e-9);

console.log('\npassed: ' + pass + ', failed: ' + fail);
process.exit(fail ? 1 : 0);
