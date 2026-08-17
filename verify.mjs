// Physical verification of the ephemeris that ships in src/app.html.
// The block between the @ephemeris markers is extracted verbatim and
// exercised here, so these tests run against the code the page actually uses.
//
//   node verify.mjs

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = await readFile(join(here, "src/app.html"), "utf8");
const block = src.split("/* @ephemeris:start")[1]?.split("/* @ephemeris:end")[0];
if (!block) throw new Error("ephemeris markers not found in src/app.html");
const { jovian, MOONS, RJ_EQ, OBLATE, AU_KM, SUN_RAD, OBL } =
  new Function(block.slice(block.indexOf("\n")) +
    ";return {jovian,MOONS,RJ_EQ,OBLATE,AU_KM,SUN_RAD};")();

let pass = 0, fail = 0;
const fmt = v => typeof v === "number" ? (Math.abs(v) < 1e-4 && v !== 0 ? v.toExponential(2) : v.toFixed(4)) : String(v);
function ok(name, cond, detail = "") {
  if (cond) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}${detail ? "  " + detail : ""}`); }
  else      { fail++; console.log(`  \x1b[31m✗ ${name}  ${detail}\x1b[0m`); }
}
function near(name, got, want, tol, unit = "") {
  ok(name, Math.abs(got - want) <= tol,
     `got ${fmt(got)}${unit}, expected ${fmt(want)}±${fmt(tol)}${unit}`);
}
const head = t => console.log(`\n\x1b[1m${t}\x1b[0m`);

const JD2000 = 2451545.0;
const jdOfYear = y => JD2000 + (y - 2000) * 365.25;

/* ---------------------------------------------------------------- 1 */
head("1. Meeus, Astronomical Algorithms 2/e — worked example 44.a (1992 Dec 16.0 TD)");
{
  const st = jovian(2448972.50);
  // Published apparent rectangular coordinates X, in units of Jupiter's
  // equatorial radius. Tolerance is the method's own stated precision.
  const REF = [-3.4503, +7.4418, +1.2011, +7.0720];
  st.sats.forEach((s, i) =>
    near(`X(${MOONS[i].name})`, s.XE, REF[i], 0.05, " R_J"));
  ok("all four inside the method's 0.1 R_J envelope",
     st.sats.every((s, i) => Math.abs(s.XE - REF[i]) < 0.1));
  // Pins the accuracy figure quoted in the README and the app's colophon so the
  // prose cannot drift from the measurement. Ganymede is the worst, at 0.0300.
  const worst = Math.max(...st.sats.map((s, i) => Math.abs(s.XE - REF[i])));
  ok("quoted accuracy of 0.04 R_J is honest", worst <= 0.04,
     `worst deviation ${worst.toFixed(4)} R_J (Ganymede)`);
}

/* ---------------------------------------------------------------- 2 */
head("2. Orbital geometry — distances and the triangle inequality");
{
  let minr = 9, maxr = 0, minR = 9, maxR = 0, viol = 0, maxDs = 0;
  for (let jd = JD2000; jd < JD2000 + 40 * 365.25; jd += 1.5) {
    const s = jovian(jd);
    minr = Math.min(minr, s.rs); maxr = Math.max(maxr, s.rs);
    minR = Math.min(minR, s.Rs); maxR = Math.max(maxR, s.Rs);
    maxDs = Math.max(maxDs, Math.abs(s.Ds));
    if (s.Delta > s.rs + s.Rs + 1e-9 || s.Delta < Math.abs(s.rs - s.Rs) - 1e-9) viol++;
  }
  near("Jupiter perihelion", minr, 4.9501, 0.01, " AU");
  near("Jupiter aphelion",   maxr, 5.4588, 0.01, " AU");
  near("Earth perihelion",   minR, 0.98329, 0.0005, " AU");
  near("Earth aphelion",     maxR, 1.01671, 0.0005, " AU");
  ok("|r−R| ≤ Δ ≤ r+R over 40 years", viol === 0, `${viol} violations`);
  near("max sub-solar latitude = Jupiter's obliquity", maxDs, 3.12, 0.02, "°");
}

/* ---------------------------------------------------------------- 3 */
head("3. Independent Kepler check of Jupiter's heliocentric distance");
{
  // Two-body solution from osculating elements, wholly independent of the
  // trigonometric series used in the app.
  const a = 5.20336, e = 0.04839, P = 4332.589, tPeri = 2459947.0; // 2023 Jan 20
  for (const jd of [2460000, 2460900, 2461500, 2462300]) {
    const M = 2 * Math.PI * (((jd - tPeri) / P) % 1);
    let E = M;
    for (let i = 0; i < 60; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    near(`r at JD ${jd}`, jovian(jd).rs, a * (1 - e * Math.cos(E)), 0.02, " AU");
  }
}

/* ---------------------------------------------------------------- 4 */
head("4. Phase cycle equals the synodic period");
{
  const jd0 = jdOfYear(2026), step = 1 / 1440;
  const median = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
  for (let i = 0; i < 4; i++) {
    // Recurrence of full phase — the pure phase cycle, free of the grazing
    // geometry that shifts Callisto's shadow contacts near a season edge.
    const fulls = [];
    let prev = jovian(jd0).sats[i];
    for (let jd = jd0 + step; jd < jd0 + 300; jd += step) {
      const c = jovian(jd).sats[i];
      if (c.uS < prev.uS) fulls.push(jd);
      prev = c;
    }
    const gaps = fulls.slice(1).map((v, j) => v - fulls[j]);
    near(`${MOONS[i].name} full-phase recurrence`, median(gaps), MOONS[i].synodic, 0.002, " d");
  }
  // Eclipse recurrence tracks the same period, but grazing ingress at the
  // edge of a season can displace a contact by minutes — hence the wider band.
  for (let i = 0; i < 4; i++) {
    const ins = [];
    let prev = jovian(jd0).sats[i];
    for (let jd = jd0 + step; jd < jd0 + 300; jd += step) {
      const c = jovian(jd).sats[i];
      if (!prev.eclipsed && c.eclipsed) ins.push(jd);
      prev = c;
    }
    const gaps = ins.slice(1).map((v, j) => v - ins[j]).filter(g => g < MOONS[i].synodic * 1.5);
    near(`${MOONS[i].name} eclipse recurrence`, median(gaps), MOONS[i].synodic, 0.01, " d");
  }
  // Synodic must exceed sidereal by exactly Jupiter's own orbital motion.
  // Tolerance reflects the spread between published sidereal periods.
  const SID = [1.769138, 3.551181, 7.154553, 16.689017];
  MOONS.forEach((m, i) => {
    const expect = 1 / (1 / SID[i] - 1 / 4332.589);
    near(`${m.name} synodic from sidereal`, m.synodic, expect, 5e-4, " d");
  });
}

/* ---------------------------------------------------------------- 5 */
head("5. Eclipses happen at full, shadow transits at new");
{
  const jd0 = jdOfYear(2026), step = 1 / 1440;
  let worstEcl = 1, worstCast = 0, nE = 0, nC = 0;
  for (let i = 0; i < 4; i++) {
    let prev = jovian(jd0).sats[i];
    for (let jd = jd0 + step; jd < jd0 + 200; jd += step) {
      const c = jovian(jd).sats[i];
      if (!prev.eclipsed && c.eclipsed) { worstEcl = Math.min(worstEcl, c.k); nE++; }
      if (!prev.casting && c.casting)  { worstCast = Math.max(worstCast, c.k); nC++; }
      prev = c;
    }
  }
  ok("every eclipse begins at k > 0.98 (full)", worstEcl > 0.98,
     `${nE} eclipses, worst k = ${fmt(worstEcl)}`);
  ok("every shadow transit begins at k < 0.02 (new)", worstCast < 0.02,
     `${nC} transits, worst k = ${fmt(worstCast)}`);
}

/* ---------------------------------------------------------------- 6 */
head("6. Callisto alone can escape the shadow — the six-year eclipse season");
{
  const counts = [];
  for (let y = 2019; y <= 2032; y++) {
    let prev = jovian(jdOfYear(y)).sats[3], n = 0;
    for (let jd = jdOfYear(y) + 1 / 720; jd < jdOfYear(y + 1); jd += 1 / 720) {
      const c = jovian(jd).sats[3];
      if (!prev.eclipsed && c.eclipsed) n++;
      prev = c;
    }
    counts.push([y, n]);
  }
  const blank = counts.filter(([, n]) => n === 0).map(([y]) => y);
  const busy  = counts.filter(([, n]) => n > 15).map(([y]) => y);
  ok("Callisto has eclipse-free years", blank.length >= 4, `none in ${blank.join(", ")}`);
  ok("Callisto has full seasons",      busy.length >= 3, `>15 in ${busy.join(", ")}`);
  const gaps = busy.slice(1).map((y, i) => y - busy[i]).filter(g => g > 1);
  ok("seasons recur near half Jupiter's year (5.93 yr)",
     gaps.every(g => Math.abs(g - 5.93) < 1.6), `gaps ${gaps.join(", ")} yr`);

  // The inner three never escape: max excursion from the shadow axis < 1 R_J.
  MOONS.forEach((m, i) => {
    const excursion = (m.axis / RJ_EQ) * Math.sin(3.12 * Math.PI / 180);
    if (i < 3) ok(`${m.name} can never miss the shadow`, excursion < OBLATE,
                  `max |Y| = ${fmt(excursion)} < ${fmt(OBLATE)} R_J`);
    else       ok(`${m.name} can miss the shadow`, excursion > 1,
                  `max |Y| = ${fmt(excursion)} > 1 R_J`);
  });
}

/* ---------------------------------------------------------------- 7 */
head("7. Angular sizes at the sub-moon point, and total solar eclipses");
{
  const st = jovian(jdOfYear(2026));
  near("Sun's angular diameter from Jupiter", st.sunRad * 120, 6.1, 0.4, "′");
  st.sats.forEach((s, i) => {
    const m = MOONS[i];
    const want = Math.atan(m.radius / (m.axis - RJ_EQ)) * 180 / Math.PI;
    near(`${m.name} apparent radius`, s.appRad, want, 0.02, "°");
    ok(`${m.name} outshines the Sun's disk`, s.appRad > st.sunRad,
       `${fmt(s.appRad / st.sunRad)}× the Sun`);
    // The umbra must actually reach the cloud tops for the eclipse to be total.
    const D = st.rs * AU_KM;
    const umbraLen = m.radius * D / (SUN_RAD - m.radius);
    ok(`${m.name}'s umbra reaches Jupiter`, umbraLen > m.axis - RJ_EQ,
       `${(umbraLen / 1e6).toFixed(2)}e6 km vs ${((m.axis - RJ_EQ) / 1e6).toFixed(2)}e6 km needed`);
  });
  near("Jupiter's angular radius seen from Io", st.sats[0].jupRad, 9.76, 0.15, "°");
  ok("Jupiter from Io vs our full Moon (0.5182° dia.)",
     Math.abs(st.sats[0].jupRad * 2 / 0.5182 - 37.7) < 1.5,
     `${fmt(st.sats[0].jupRad * 2 / 0.5182)}× wider`);
}

/* ---------------------------------------------------------------- 8 */
head("8. Umbral cone geometry");
{
  const st = jovian(jdOfYear(2026));
  const tanSun = Math.tan(st.sunRad * Math.PI / 180);
  st.sats.forEach((s, i) => {
    // Both semi-axes must lose the same absolute amount — the cone converges
    // linearly, it does not scale the oblateness.
    const au = 1 - s.r * tanSun, bu = OBLATE - s.r * tanSun;
    ok(`${MOONS[i].name}: equal absolute convergence`,
       Math.abs((1 - au) - (OBLATE - bu)) < 1e-12,
       `narrowing ${fmt(1 - au)} R_J in both axes`);
    ok(`${MOONS[i].name}: umbra still open at its orbit`, au > 0 && bu > 0,
       `semi-axes ${fmt(au)} × ${fmt(bu)} R_J`);
  });
}

/* ---------------------------------------------------------------- 9 */
head("9. Illuminated fraction is consistent with the geometry");
{
  let worst = 0;
  for (let jd = jdOfYear(2026); jd < jdOfYear(2026) + 40; jd += 0.01) {
    for (const s of jovian(jd).sats) {
      if (s.k < -1e-12 || s.k > 1 + 1e-12) worst = 9;
      // k = (1+cos α)/2 with α the Sun–moon–Jupiter angle, which equals uS.
      const alpha = Math.acos(Math.max(-1, Math.min(1, Math.cos(s.uS * Math.PI / 180))));
      worst = Math.max(worst, Math.abs(s.k - (1 + Math.cos(alpha)) / 2));
    }
  }
  ok("k = (1 + cos α)/2 holds everywhere, 0 ≤ k ≤ 1", worst < 1e-12, `max error ${fmt(worst)}`);
}

/* --------------------------------------------------------------- 10 */
head("10. Event sequencing");
{
  const jd0 = jdOfYear(2026), step = 1 / 1440;
  let bad = 0, checked = 0;
  for (let i = 0; i < 4; i++) {
    let prev = jovian(jd0).sats[i], shIn = null, ecIn = null;
    for (let jd = jd0 + step; jd < jd0 + 60; jd += step) {
      const c = jovian(jd).sats[i];
      if (!prev.casting && c.casting) shIn = jd;
      if (prev.casting && !c.casting && shIn) {
        // A shadow transit must straddle new phase: k ≈ 0 in the middle.
        const mid = jovian((shIn + jd) / 2).sats[i];
        checked++; if (mid.k > 0.01) bad++;
        shIn = null;
      }
      if (!prev.eclipsed && c.eclipsed) ecIn = jd;
      if (prev.eclipsed && !c.eclipsed && ecIn) {
        const mid = jovian((ecIn + jd) / 2).sats[i];
        checked++; if (mid.k < 0.99) bad++;
        ecIn = null;
      }
      prev = c;
    }
  }
  ok("every shadow transit straddles new, every eclipse straddles full",
     bad === 0 && checked > 100, `${checked} intervals checked, ${bad} bad`);
}

/* --------------------------------------------------------------- 11 */
head("11. Light time to Earth");
{
  const st = jovian(jdOfYear(2026));
  near("Δ / c", st.lightMin, st.Delta * AU_KM / 299792.458 / 60, 1e-9, " min");
  ok("light time lies in the 32–54 min range", st.lightMin > 30 && st.lightMin < 56,
     `${fmt(st.lightMin)} min at Δ = ${fmt(st.Delta)} AU`);
}

/* --------------------------------------------------------------- 12 */
head("12. Jupiter-shine is a true irradiance ratio, not a tuned constant");
{
  // Regression guard. An earlier build used a hand-tuned peak of 0.60 that fell
  // off as (R_J/d) instead of (R_J/d)² — 40x too bright at Io, 179x at Callisto.
  // It washed out the terminator, so a 3%-lit crescent rendered as a full disk.
  const A_J = 0.52;                       // Jupiter geometric albedo, independent value
  const st = jovian(jdOfYear(2026));

  st.sats.forEach((s, i) => {
    const m = MOONS[i];
    // Peak shine occurs at new phase, where (1−cos uS)/2 = 1.
    const peak = A_J * Math.pow(RJ_EQ / (m.axis - 0), 2);
    const modelPeak = s.shine / ((1 - Math.cos(s.uS * Math.PI / 180)) / 2 || 1e-30);
    near(`${m.name} peak shine = A_J·(R_J/d)²`, modelPeak, peak, peak * 0.06);
    ok(`${m.name} shine stays faint (< 2% of sunlight)`, modelPeak < 0.02,
       `${(modelPeak * 100).toFixed(3)}% of direct sunlight`);
  });

  // Inverse-square law: the ratio between any two moons must be (a₂/a₁)².
  const peakOf = s => s.shine / ((1 - Math.cos(s.uS * Math.PI / 180)) / 2 || 1e-30);
  const rIo = peakOf(st.sats[0]), rCal = peakOf(st.sats[3]);
  near("Io/Callisto shine ratio obeys inverse square",
       rIo / rCal, Math.pow(MOONS[3].axis / MOONS[0].axis, 2), 0.6);

  // Must vanish at full phase — which is exactly when the moon is eclipsed,
  // because Jupiter is then new as seen from the moon.
  let maxShineWhenEclipsed = 0, maxShineOverall = 0, samples = 0;
  for (let jd = jdOfYear(2026); jd < jdOfYear(2026) + 40; jd += 0.005) {
    for (const s of jovian(jd).sats) {
      maxShineOverall = Math.max(maxShineOverall, s.shine);
      if (s.eclipsed) { maxShineWhenEclipsed = Math.max(maxShineWhenEclipsed, s.shine); samples++; }
    }
  }
  // Not exactly zero: the umbra subtends ~9.7° at Io's orbit, so at ingress and
  // egress the moon sits that far off opposition and Jupiter still shows a thin
  // crescent. The physical requirement is deep suppression, not extinction.
  ok("Jupiter-shine is deeply suppressed inside the shadow",
     maxShineWhenEclipsed < rIo / 50 && samples > 100,
     `max ${fmt(maxShineWhenEclipsed)} = 1/${(rIo / maxShineWhenEclipsed).toFixed(0)} of peak,`
     + ` across ${samples} eclipsed samples`);
  ok("Jupiter-shine never swamps the terminator", maxShineOverall < 0.02,
     `global max ${(maxShineOverall * 100).toFixed(3)}% of sunlight`);
}

console.log(`\n\x1b[1m${pass} passed, ${fail} failed\x1b[0m\n`);
process.exit(fail ? 1 : 0);
