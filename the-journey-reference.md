# The Journey · Data Reference

This document describes the health and wellness data pipeline feeding into this project. When reports are shared in conversation, use this reference to interpret the metrics, thresholds, and terminology consistently.

## Pipeline overview

Three tools generate the reports shared in this project:

1. **Zepp Analyzer** — ad-hoc reads of Zepp/Amazfit fitness tracker exports
2. **Weekly Review** — unified Sunday review across Zepp, Cronometer, strength, photos
3. **Monthly Rollup** — calendar-month aggregation of weekly snapshots

All tools produce Markdown reports. Reports may also be dropped in as pasted text or JSON.

## Data sources per report

### Zepp (Amazfit wearable)
- **Sleep**: total duration, deep/REM/light stage minutes, bedtime consistency (SD in hours)
- **Heart rate**: resting HR computed as 5th percentile of daily samples; mean and max
- **Activity**: daily step count, active minutes, distance
- **PAI score**: Zepp's cardio-load metric; 100+ is the HUNT-study target for cardiovascular benefit
- **Stress score**: Zepp proprietary scale, 0-100
- **SpO₂**: nightly mean and minimum

### Cronometer
- **Macros**: calories (kcal), protein (g), carbohydrates (g), fat (g), fiber (g), sodium (mg)
- **Hydration**: water intake (mL)
- **Biometrics**: daily weight (lb or kg), occasional others

### Strength training
- Captured as free-form text or image/PDF upload
- No structured fields enforced; contents may include session name, exercises, sets × reps × weight, RPE, notes
- Weekly reviews count presence/absence; monthly rollups track logging frequency

### Photos
- Up to 4 weekly progress photos (front, side, back, optional)
- Stored in-browser only; do not appear in pasted Markdown reports
- If relevant to analysis, they'll be described or attached separately

## Key metrics and thresholds

These are the thresholds the tools use to flag priorities. When interpreting reports, apply the same thresholds consistently across weeks and months.

### Sleep
- **Duration target**: ≥7 hours (420 min) nightly mean
- **Bedtime consistency** (standard deviation in hours):
  - < 0.5 h = excellent
  - 0.5–1.0 h = good
  - 1.0–1.5 h = variable
  - > 1.5 h = erratic
- **Deep sleep fraction**: flag if < 15% of total

### Resting HR
- **Drift flag**: +3 bpm or more across 7 days (week) or +0.3 bpm/week slope (month)
- **Direction matters more than absolute value** — personal baseline drift is the signal

### Protein
- **Target range**: 1.6–2.2 g/kg body weight for recomp at intermediate-to-advanced training age
- **Flagged low**: < 1.6 g/kg sustained
- **Optimal**: 1.8–2.0 g/kg
- Weight is converted kg→lb automatically (>200 is assumed lb)

### Fiber
- **Target**: ≥ 30 g/day
- **Flagged low**: < 25 g/day

### Hydration
- **Target**: ≥ 2.5 L/day
- Sodium flagged > 3500 mg/day

### Weight (recomp context)
- **Steady**: |Δ| < 0.5 lb/week — ideal for recomposition with rising training volume
- **Aggressive cut**: > 0.5 lb/week loss — risks lean mass loss
- **Aggressive gain**: > 0.5 lb/week gain — assess muscle vs surplus

### Activity
- **Steps target**: ≥ 8,500/day median
- **Flagged low**: < 7,000 median
- **PAI target**: ≥ 100 sustained

### Training (from strength log context)
- **Frequency target**: 4 sessions/week (floor for hypertrophy at intermediate-to-advanced level)
- **RPE sweet spot**: 7–9 in working sets; mean > 8.5 suggests running hot, < 7 suggests underload
- **Volume progression**: ~2% week-over-week is sustainable

## Personal constraints (baked into the protocols)

When recommending exercises or modifications, these are the user's established constraints:

**No:** barbell back squat, leg press, upright rows, behind-neck press, straight-bar overhead press

**Why:** Shoulder surgery history; lower back considerations

**Favorites that work well:** Romanian deadlift, incline dumbbell press, landmine press

**Substitutions known to work:**
- Leg press → heel-elevated goblet squat (lighter) or Bulgarian split squat with dumbbells (progressive)

**Training pattern:** 4 days/week, home gym, early mornings. Equipment: Tonal, dumbbells, barbells, squat rack with cable attachment, BFR cuffs.

**Non-negotiable:** McGill Big 3 before every session (lower back protection)

## Correlations referenced in weekly reports

Weekly reviews compute Pearson correlations across sources when 4+ days of overlap exist:

| Relationship | Meaning if strong (|r| > 0.35) |
|---|---|
| Sleep duration → next-day RHR | Recovery quality measurable |
| RHR ↔ stress score | Autonomic load aligned |
| Steps → same-night sleep | Activity-sleep coupling |
| Calories ↔ next-morning weight | Water/sodium retention visible |
| Sodium ↔ weight | Sodium dominance check |
| Protein → next-day RHR | Protein as recovery lever |
| Water ↔ sleep | Hydration effect |

Interpret `r` values cautiously at n=7 — directional hints, not proof. Real signal emerges over multi-week aggregations.

## Report structure

### Weekly review sections
1. The week in a paragraph (narrative)
2. Numbers (metric table)
3. Visual reference (photos if present)
4. Cross-source correlations
5. Top priorities (3–4)
6. Recommendations (nutrition, training, recovery)
7. Watch next week
8. Claude's deeper analysis (if run)

### Monthly rollup sections
1. Month in a paragraph
2. Headline metrics with vs-prior-month deltas
3. Trend charts by week (RHR, sleep, weight, protein)
4. Week-by-week table
5. Insights (pattern-based)
6. Focus for next month (4 priorities)
7. Claude's monthly analysis

## Context to remember across reports

- **Goal**: body recomposition at intermediate-to-advanced training age
- **Training split**: 4 days/week
- **Not medical advice**: reports flag things worth discussing with a physician but never diagnose
- **American English** throughout

## What to watch for across reports

When multiple reports are in context, prioritize identifying:

1. **RHR drift** lasting > 2 weeks — strongest under-recovery signal
2. **Sleep consistency degradation** even when duration is adequate
3. **Protein slippage** over multiple weeks — often the first thing to drop
4. **Weight-training volume decoupling** — weight dropping while volume falls = muscle loss risk
5. **Strength logging gaps** — loss of the most important recomp driver

Single-report findings should be held loosely; patterns across 3+ reports carry real weight.
