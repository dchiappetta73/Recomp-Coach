import { getExerciseMetadataByName } from "../data/exerciseMetadata";

type OrderedExercise = {
  name: string;
  metadataFound: boolean;
};

type SessionType = "upperA" | "lowerA" | "upperB" | "lowerB";

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

const CATEGORY_PRIORITY: Record<string, number> = {
  prehab: 1,
  core: 2,
  primary_compound: 3,
  secondary_compound: 4,
  large_accessory: 5,
  small_accessory: 6,
  finisher: 7,
};

const SKILL_PRIORITY: Record<string, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

const FATIGUE_PRIORITY: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const SESSION_EXERCISE_PRIORITY: Record<SessionType, string[]> = {
  upperA: [
  "Chest-Supported Row",
  "Dumbbell Floor Press",
  "Neutral Grip Lat Pulldown",
  "Tonal Fly",
  "Lateral Raise",
  "Cable Pushdown",
  "Hammer Curl",
  "Face Pull",
  ],
  lowerA: [
    "Core Tri-Set",
    "Goblet Squat",
    "Romanian Deadlift",
    "Leg Curl",
    "Leg Extension",
    "Calf Raises",
  ],
  upperB: [
  "McGill Curl Up",
  "Incline Press",
  "Seated Cable Row",
  "Neutral Grip Lat Pulldown",
  "Tonal Rear Delt Fly",
  "Face Pull",
  "Cross-Body Cable Tricep Extension",
  "Hammer Curl",
  ],
  lowerB: [
  "Bird Dog",
  "Side Plank",
  "Bulgarian Split Squat",
  "Leg Curl",
  "Step Ups",
  "Hip Thrust",
  "Calf Raises",
  ],
};

const SESSION_CANONICAL_OVERRIDES: Record<SessionType, Record<string, string>> = {
  upperA: {},
  lowerA: {},
  upperB: {},
  lowerB: {},
};

function getPainOverrideScore(exerciseName: string) {
  const metadata = getExerciseMetadataByName(exerciseName);

  if (!metadata) return 99;

  if (metadata.joint_risk_flag === "shoulder_sensitive") return 1;
  if (metadata.joint_risk_flag === "low_back_sensitive") return 2;

  return 3;
}

function getSessionPriorityScore(sessionType: SessionType | undefined, exerciseName: string) {
  if (!sessionType) return 999;

  const metadata = getExerciseMetadataByName(exerciseName);
  const priorityList = SESSION_EXERCISE_PRIORITY[sessionType];
  const overrides = SESSION_CANONICAL_OVERRIDES[sessionType];

  const exactIndex = priorityList.findIndex(
    (name) => normalizeName(name) === normalizeName(exerciseName)
  );
  if (exactIndex !== -1) return exactIndex;

  const canonicalName = metadata?.name ?? exerciseName;
  const overriddenCanonicalName =
    overrides[normalizeName(canonicalName)] ?? canonicalName;

  const canonicalIndex = priorityList.findIndex(
    (name) => normalizeName(name) === normalizeName(overriddenCanonicalName)
  );
  if (canonicalIndex !== -1) return canonicalIndex;

  return 999;
}

export function orderSessionExercises(
  exerciseNames: string[],
  sessionType?: SessionType
): OrderedExercise[] {
  return [...exerciseNames]
    .map((name, originalIndex) => {
      const metadata = getExerciseMetadataByName(name);

      return {
        name,
        metadata,
        metadataFound: !!metadata,
        originalIndex,
      };
    })
    .sort((a, b) => {
      const aSessionPriority = getSessionPriorityScore(sessionType, a.name);
      const bSessionPriority = getSessionPriorityScore(sessionType, b.name);
      if (aSessionPriority !== bSessionPriority) return aSessionPriority - bSessionPriority;

      if (aSessionPriority !== 999) {
        return a.originalIndex - b.originalIndex;
      }

      const aCategory = CATEGORY_PRIORITY[a.metadata?.category ?? "small_accessory"] ?? 99;
      const bCategory = CATEGORY_PRIORITY[b.metadata?.category ?? "small_accessory"] ?? 99;
      if (aCategory !== bCategory) return aCategory - bCategory;

      const aPain = getPainOverrideScore(a.name);
      const bPain = getPainOverrideScore(b.name);
      if (aPain !== bPain) return aPain - bPain;

      const aMain = a.metadata?.is_main_priority ? 0 : 1;
      const bMain = b.metadata?.is_main_priority ? 0 : 1;
      if (aMain !== bMain) return aMain - bMain;

      const aSkill = SKILL_PRIORITY[a.metadata?.skill_level ?? "low"] ?? 99;
      const bSkill = SKILL_PRIORITY[b.metadata?.skill_level ?? "low"] ?? 99;
      if (aSkill !== bSkill) return aSkill - bSkill;

      const aFatigue = FATIGUE_PRIORITY[a.metadata?.fatigue_cost ?? "low"] ?? 99;
      const bFatigue = FATIGUE_PRIORITY[b.metadata?.fatigue_cost ?? "low"] ?? 99;
      if (aFatigue !== bFatigue) return aFatigue - bFatigue;

      return a.name.localeCompare(b.name);
    })
    .map(({ name, metadataFound }) => ({
      name,
      metadataFound,
    }));
}