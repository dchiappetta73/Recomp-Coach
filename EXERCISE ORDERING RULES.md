# RECOMP COACH — EXERCISE ORDERING RULESET

## Purpose

This ruleset defines the default logic for ordering exercises within a session.

It is intended to:
- create consistent, coach-driven exercise sequencing
- reflect broad best-practice programming principles
- account for shoulder and lower back sensitivity
- support future personalization by athlete profile
- avoid manual ordering whenever possible

This is a **default framework**, not a rigid rule set. It should be modifiable by athlete needs, injury history, equipment access, and session goal.

---

# 1. Global Ordering Rules

## Default order stack

1. **Prehab / activation**
2. **Core**
3. **Primary compound**
4. **Secondary compound**
5. **Larger accessory / unilateral work**
6. **Smaller accessory / isolation**
7. **Low-load finisher**

## Notes

- Prehab comes first when assigned.
- Core comes immediately after prehab by default.
- If no prehab is assigned, core can be the first block.
- Finishers must be low-risk and optional.
- The app should prioritize exercise quality, safety, and individual tolerance over rigid sequencing.

---

# 2. Exercise Categories

Each exercise should be assigned one primary category.

| Category | Description | Examples |
|---|---|---|
| `prehab` | low-fatigue prep intended to improve tolerance, positioning, or activation | band external rotation, scap activation, hip activation |
| `core` | trunk stiffness, anti-rotation, anti-extension, bracing | McGill work, Pallof press, plank series |
| `primary_compound` | main lift of the day, highest training priority | DB bench, landmine press, goblet squat, RDL |
| `secondary_compound` | large multi-joint movement supporting the main lift | cable row, pulldown, split squat |
| `large_accessory` | bigger accessory or unilateral movement | chest-supported row, leg curl, fly, step-up |
| `small_accessory` | smaller-muscle accessory or isolation | lateral raise, curls, pushdowns, calf raises |
| `finisher` | low-load, low-risk burnout, durability, or tissue-health work | prone Y, band face pull, glute finisher |

---

# 3. Global Override Rules

These rules can override the default order stack.

| Condition | Override |
|---|---|
| shoulder-sensitive athlete | allow row-first or landmine-first ordering |
| lower-back-sensitive athlete | keep core early and avoid unstable heavy squat substitutions |
| highly technical movement | move earlier within its category |
| exercise has higher pain risk but is still allowed | place earlier so it can be performed with fresher technique |
| early core reduces main-lift quality | move core to intraset or later accessory slot |
| exercise is a travel/hotel substitution | use only when home-gym default is unavailable |
| finisher causes irritation | remove or replace immediately |

---

# 4. Core Placement Rules

## Default

Core is placed **immediately after prehab**.

## Reasoning

This is the default because:
- it can improve trunk stiffness and bracing quality
- it may improve control on lower-body work
- it prevents core work from being neglected or performed sloppily when fatigued

## Exceptions

Move core to **intraset** or later in the session if:
- it clearly reduces main-lift performance
- it creates noticeable pre-fatigue before squats or hinges
- the athlete performs better with smaller distributed core doses

---

# 5. Intraset Core Rules

Intraset core is allowed when it does not interfere with the main work.

| Context | Allowed | Examples | Avoid if... |
|---|---|---|---|
| between upper-body sets | yes | Pallof press, dead bug, side plank | it reduces bracing or performance on the next main set |
| between lower-body accessory sets | yes | bird dog, plank, anti-rotation work | it reduces quality of later lower-body work |
| before main lower-body compounds | usually no, unless very low-fatigue | short brace drill only | it reduces squat or hinge performance |
| late in the session | yes | full core block if not already done | technique is sloppy from fatigue |

---

# 6. Finisher Rules

Finishers must follow all of these rules:

- low load or bodyweight only
- low skill demand
- low joint stress
- optional, not mandatory
- stopped immediately if pain increases or form degrades

Finishers should be used for:
- tissue health
- posture
- durability
- pump
- low-risk activation

---

# 7. Day-by-Day Default Ordering

## Day 1 — Upper Body A

### Default order
1. Cable Row
2. Dumbbell Bench Press
3. Lat Pulldown
4. Tonal Fly variation
5. Lateral Raise
6. Triceps Pushdowns
7. Incline Curls or BFR Curl variation
8. Shoulder finisher

### Notes
- Dumbbell Bench Press may be incline or decline based on tolerance.
- Tonal Fly is the home-gym default in place of machine press.
- Machine press can remain a hotel/commercial-gym substitution.
- Shoulder finisher should be no-load or very light:
  - prone Y
  - band face pull
  - similar low-risk movement

---

## Day 2 — Lower Body & Core A

### Default order
1. Core tri-set
2. Goblet Squat
3. RDL
4. Leg Curl
5. Leg Extension
6. Calf Raises

### Notes
- Core is intentionally early here to support bracing and trunk control.
- Calf raises may be seated or standing.
- If early core clearly hurts squat or hinge performance, reduce the core dose or move some core to intraset work.

---

## Day 4 — Upper Body B

### Default order
1. Landmine Press
2. Incline Press
3. Chest-Supported Row
4. Straight Arm Pulldown
5. Face Pull
6. Shoulder-friendly triceps option
7. Shoulder-friendly DB curls
8. Shoulder finisher

### Notes
- Landmine Press is prioritized as the main shoulder-friendly press.
- Overhead triceps work must have shoulder-friendly alternatives available.
- Shoulder finisher should be no-load.

### Shoulder-friendly triceps options
- cable pushdown
- cross-body cable extension
- rolling DB extension
- overhead extension only if tolerated

### Shoulder-friendly curl options
- supported DB curl
- incline curl if tolerated
- hammer curl
- BFR curl variation

---

## Day 5 — Lower Body & Core B

### Default order
1. Core superset
2. Leg Press replacement
3. Split Squats
4. Glute Ham / Back Extension
5. Calves
6. Glute / hip finisher

### Notes
- Barbell Back Squat is excluded as a default replacement.
- The glute / hip finisher should be low-load and no-risk.

### Approved Leg Press replacement pool
- Heel-elevated Goblet Squat
- Goblet Squat
- DB Hack Squat variant
- Tonal squat pattern
- Step-Up if appropriate

### Explicit exclusion rule
If Split Squats are already programmed in the session, the Leg Press replacement must **not** be Bulgarian Split Squats.

### Rule
- If `split_squat_variant` is present in Lower B:
  - exclude `bulgarian_split_squat` from the Leg Press replacement pool

---

# 8. Substitution Rules

## Upper body substitutions

| Planned movement | Condition | Substitute with |
|---|---|---|
| machine press | no machine access | Tonal Fly variation |
| DB bench | flat pressing irritates shoulder | incline DB press or tolerated decline variation |
| overhead extension | shoulder or elbow irritation | pushdown, cross-body cable extension, rolling DB extension |
| vertical pressing pattern | shoulder-sensitive athlete | landmine press first-line option |

## Lower body substitutions

| Planned movement | Condition | Substitute with |
|---|---|---|
| leg press | no leg press access | approved replacement pool |
| barbell back squat | lower-back-sensitive athlete | do not auto-use |
| heavy hinge | back fatigue elevated | reduce load, reduce ROM, or swap to safer posterior-chain option |

## Arm substitutions

| Planned movement | Condition | Substitute with |
|---|---|---|
| standard curls | shoulder discomfort | hammer curl, supported curl, BFR curl |
| incline curl | stretch position not tolerated | standing DB curl or hammer curl |

---

# 9. Decision Logic for Automated Ordering

When the app generates or re-orders a session, it should use the following logic.

## Step 1 — assign metadata to each exercise

Each exercise should have, at minimum:

- `category`
- `movement_pattern`
- `joint_risk_flag`
- `skill_level`
- `fatigue_cost`
- `equipment_type`
- `is_main_priority`
- `is_substitution`

## Suggested values

### `category`
- `prehab`
- `core`
- `primary_compound`
- `secondary_compound`
- `large_accessory`
- `small_accessory`
- `finisher`

### `movement_pattern`
- `horizontal_push`
- `horizontal_pull`
- `vertical_push`
- `vertical_pull`
- `squat`
- `hinge`
- `unilateral_lower`
- `arms`
- `calves`
- `core`
- `prehab`

### `joint_risk_flag`
- `none`
- `shoulder_sensitive`
- `low_back_sensitive`

### `skill_level`
- `low`
- `medium`
- `high`

### `fatigue_cost`
- `low`
- `medium`
- `high`

---

## Step 2 — sort by priority

Default sorting priority:

1. `category_priority`
2. `pain_or_tolerance_override`
3. `is_main_priority`
4. `skill_level`
5. `fatigue_cost`

---

# 10. Category Priority Map

Use this default priority map:

| Category | Priority |
|---|---|
| `prehab` | 1 |
| `core` | 2 |
| `primary_compound` | 3 |
| `secondary_compound` | 4 |
| `large_accessory` | 5 |
| `small_accessory` | 6 |
| `finisher` | 7 |

---

# 11. Compact Session Templates

## Upper A
Prehab if assigned → Core if assigned → Cable Row → DB Bench → Lat Pulldown → Tonal Fly → Lateral Raise → Pushdowns → Shoulder-friendly Curls → Shoulder finisher

## Lower A
Prehab if assigned → Core tri-set → Goblet Squat → RDL → Leg Curl → Leg Extension → Calves

## Upper B
Prehab if assigned → Core if assigned → Landmine Press → Incline Press → Chest-Supported Row → Straight Arm Pulldown → Face Pull → Shoulder-friendly Triceps → Shoulder-friendly DB Curls → Shoulder finisher

## Lower B
Prehab if assigned → Core superset → Leg Press replacement → Split Squats → Glute Ham / Back Extension → Calves → Glute / hip finisher

---

# 12. Final Principle

This ruleset should produce a strong default order automatically.

It is intended to be:
- evidence-informed
- athlete-aware
- equipment-aware
- modifiable by profile
- stable enough for app logic
- flexible enough for coach override

Manual overrides should remain possible, but they should not be required for normal use.