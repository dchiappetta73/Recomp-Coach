export type ExerciseStatus = "yes" | "sub" | "no";

export type ExerciseCategory =
  | "prehab"
  | "core"
  | "primary_compound"
  | "secondary_compound"
  | "large_accessory"
  | "small_accessory"
  | "finisher";

export type MovementPattern =
  | "horizontal_push"
  | "horizontal_pull"
  | "vertical_push"
  | "vertical_pull"
  | "squat"
  | "hinge"
  | "unilateral_lower"
  | "knee_flexion"
  | "knee_extension"
  | "hip_extension"
  | "arms_biceps"
  | "arms_triceps"
  | "calves"
  | "core"
  | "prehab"
  | "shoulder_health"
  | "glute_hip";

export type JointRiskFlag =
  | "none"
  | "shoulder_sensitive"
  | "low_back_sensitive";

export type SkillLevel = "low" | "medium" | "high";
export type FatigueCost = "low" | "medium" | "high";

export type EquipmentType =
  | "bodyweight"
  | "dumbbell"
  | "barbell"
  | "tonal"
  | "cable"
  | "mixed";

export type ExerciseMetadata = {
  name: string;
  aliases?: string[];
  status: ExerciseStatus;
  category: ExerciseCategory;
  movement_pattern: MovementPattern;
  joint_risk_flag: JointRiskFlag;
  skill_level: SkillLevel;
  fatigue_cost: FatigueCost;
  equipment_type: EquipmentType;
  is_main_priority?: boolean;
  is_substitution?: boolean;
  home_gym_default?: boolean;
  travel_gym_option?: boolean;
  notes?: string;
};

export const EXERCISE_METADATA: ExerciseMetadata[] = [
  {
    name: "Cable Row",
    aliases: ["Seated Row", "Seated Cable Row"],
    status: "yes",
    category: "secondary_compound",
    movement_pattern: "horizontal_pull",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "tonal",
    is_main_priority: true,
    home_gym_default: true,
    notes: "Good row-first option for shoulder positioning and scapular set.",
  },
  {
    name: "Dumbbell Bench Press",
    aliases: ["Decline Press", "Floor Dumbbell Press"],
    status: "yes",
    category: "primary_compound",
    movement_pattern: "horizontal_push",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "dumbbell",
    is_main_priority: true,
    home_gym_default: true,
    notes: "Default main press. Incline or decline variations may be preferred based on tolerance.",
  },
  {
    name: "Lat Pulldown",
    aliases: ["Lat Pulldown (bar)", "Lat Pulldown (neutral)", "Neutral Grip Lat Pulldown", "Single Arm Pulldown"],
    status: "yes",
    category: "secondary_compound",
    movement_pattern: "vertical_pull",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "tonal",
    home_gym_default: true,
    notes: "Neutral grip usually preferred for shoulder comfort.",
  },
  {
    name: "Tonal Fly",
    aliases: ["Cable Fly", "Dumbbell Fly"],
    status: "yes",
    category: "large_accessory",
    movement_pattern: "horizontal_push",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "tonal",
    is_substitution: true,
    home_gym_default: true,
    notes: "Home-gym default in place of machine chest press.",
  },
  {
    name: "Lateral Raise",
    aliases: ["Lateral Raise (DB)", "Lateral Raise (cable)"],
    status: "yes",
    category: "small_accessory",
    movement_pattern: "vertical_push",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    home_gym_default: true,
  },
  {
    name: "Triceps Pushdowns",
    aliases: ["Tricep Pushdown (cable)", "Cable Pushdown"],
    status: "yes",
    category: "small_accessory",
    movement_pattern: "arms_triceps",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "tonal",
    home_gym_default: true,
    notes: "Preferred triceps option.",
  },
  {
    name: "Incline Curls",
    aliases: ["Incline Dumbbell Curl"],
    status: "yes",
    category: "small_accessory",
    movement_pattern: "arms_biceps",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "dumbbell",
    home_gym_default: true,
    notes: "Use only if stretch position is tolerated.",
  },
  {
    name: "BFR Curls",
    aliases: ["BFR Bicep Curls"],
    status: "yes",
    category: "small_accessory",
    movement_pattern: "arms_biceps",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    is_substitution: true,
    home_gym_default: true,
    notes: "Shoulder-friendly metabolic option.",
  },
  {
    name: "Shoulder Finisher",
    aliases: ["Prone Y", "Face Pull (cable)", "Banded Face Pull", "Rear Delt Fly (DB)", "Rear Delt Fly (Cable)"],
    status: "yes",
    category: "finisher",
    movement_pattern: "shoulder_health",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    home_gym_default: true,
    notes: "Low-load, low-risk shoulder health finisher only.",
  },
  {
    name: "Core Tri-Set",
    aliases: ["McGill Big 3", "Pallof Press", "Dead Bug", "Bird Dog", "Side Plank", "Modified Curl-Up", "McGill Curl Up", "McGill Side Plank", "McGill Bird Dog"],
    status: "yes",
    category: "core",
    movement_pattern: "core",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    is_main_priority: true,
    home_gym_default: true,
    notes: "Default early-session core for Lower A.",
  },
  {
    name: "Goblet Squat",
    aliases: ["Heel-Elevated Goblet Squat"],
    status: "yes",
    category: "primary_compound",
    movement_pattern: "squat",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "dumbbell",
    is_main_priority: true,
    home_gym_default: true,
    notes: "Preferred Phase 1 squat pattern.",
  },
  {
    name: "Romanian Deadlift",
    aliases: ["RDL"],
    status: "yes",
    category: "primary_compound",
    movement_pattern: "hinge",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "medium",
    fatigue_cost: "high",
    equipment_type: "mixed",
    is_main_priority: true,
    home_gym_default: true,
    notes: "Favorite movement; prioritize but monitor delayed back irritation.",
  },
  {
    name: "Leg Curl",
    aliases: ["Leg Curl (lying)", "Leg Curl (seated)", "BFR Leg Curls (Tonal)"],
    status: "yes",
    category: "large_accessory",
    movement_pattern: "knee_flexion",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    home_gym_default: true,
  },
  {
    name: "Leg Extension",
    aliases: ["Sissy Squat (assisted)"],
    status: "yes",
    category: "large_accessory",
    movement_pattern: "knee_extension",
    joint_risk_flag: "none",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    home_gym_default: true,
  },
  {
    name: "Calf Raises",
    aliases: ["Standing Calf Raise", "Seated Calf Raise", "BFR Calf Raises"],
    status: "yes",
    category: "small_accessory",
    movement_pattern: "calves",
    joint_risk_flag: "none",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    home_gym_default: true,
  },
  {
    name: "Landmine Press",
    status: "yes",
    category: "primary_compound",
    movement_pattern: "vertical_push",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "barbell",
    is_main_priority: true,
    home_gym_default: true,
    notes: "Excellent shoulder-friendly press; default first press on Upper B.",
  },
  {
    name: "Incline Press",
    aliases: ["Incline Dumbbell Press", "Incline Barbell Press"],
    status: "yes",
    category: "primary_compound",
    movement_pattern: "horizontal_push",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "mixed",
    is_main_priority: true,
    home_gym_default: true,
    notes: "Preferred shoulder-health pressing pattern.",
  },
  {
    name: "Chest-Supported Row",
    aliases: ["Chest Supported Row"],
    status: "yes",
    category: "secondary_compound",
    movement_pattern: "horizontal_pull",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "mixed",
    is_main_priority: true,
    home_gym_default: true,
    notes: "Good back-safe row option.",
  },
  {
    name: "Straight Arm Pulldown",
    status: "yes",
    category: "large_accessory",
    movement_pattern: "vertical_pull",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "tonal",
    home_gym_default: true,
  },
  {
    name: "Face Pull",
    aliases: ["Face Pull (cable)", "Banded Face Pull"],
    status: "yes",
    category: "large_accessory",
    movement_pattern: "shoulder_health",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    home_gym_default: true,
    notes: "Core to shoulder health protocol.",
  },
  {
    name: "Shoulder-Friendly Triceps Option",
    aliases: ["Tricep Pushdown (cable)", "Overhead Tricep Ext (cable)", "Rolling DB Extension", "Cross-Body Cable Extension"],
    status: "yes",
    category: "small_accessory",
    movement_pattern: "arms_triceps",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    home_gym_default: true,
    notes: "Default to pushdowns first if overhead position is irritated.",
  },
  {
    name: "Shoulder-Friendly DB Curls",
    aliases: ["Dumbbell Curl", "Hammer Curl", "Supported DB Curl"],
    status: "yes",
    category: "small_accessory",
    movement_pattern: "arms_biceps",
    joint_risk_flag: "shoulder_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "dumbbell",
    home_gym_default: true,
  },
  {
    name: "Core Superset",
    aliases: ["Pallof Press", "Dead Bug", "Side Plank", "McGill Side Plank", "McGill Bird Dog", "McGill Curl Up"],
    status: "yes",
    category: "core",
    movement_pattern: "core",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    is_main_priority: true,
    home_gym_default: true,
    notes: "Default early-session core for Lower B.",
  },
  {
    name: "Leg Press Replacement",
    aliases: ["Heel-Elevated Goblet Squat", "Goblet Squat", "DB Hack Squat", "Tonal Squat Pattern", "Step-Up"],
    status: "yes",
    category: "primary_compound",
    movement_pattern: "squat",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "mixed",
    is_main_priority: true,
    is_substitution: true,
    home_gym_default: true,
    notes: "Must not resolve to Bulgarian Split Squat if Split Squats are already in the session.",
  },
  {
    name: "Split Squats",
    aliases: ["Bulgarian Split Squat", "Dumbbell Bulgarian Split Squat", "Lunges (barbell/DB)"],
    status: "yes",
    category: "secondary_compound",
    movement_pattern: "unilateral_lower",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "mixed",
    home_gym_default: true,
    notes: "If this is present in Lower B, exclude Bulgarian Split Squat from leg press replacement options.",
  },
  {
    name: "Glute Ham / Back Extension",
    aliases: ["Nordic Curl", "Good Morning", "Cable Pull Through", "Hip Thrust (barbell)", "Glute Bridge"],
    status: "yes",
    category: "large_accessory",
    movement_pattern: "hip_extension",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "medium",
    fatigue_cost: "medium",
    equipment_type: "mixed",
    home_gym_default: true,
    notes: "Posterior-chain accessory bucket; actual choice should depend on fatigue and back tolerance.",
  },
  {
    name: "Glute / Hip Finisher",
    aliases: ["Bodyweight Glute Bridge", "Banded Glute Work"],
    status: "yes",
    category: "finisher",
    movement_pattern: "glute_hip",
    joint_risk_flag: "low_back_sensitive",
    skill_level: "low",
    fatigue_cost: "low",
    equipment_type: "mixed",
    home_gym_default: true,
    notes: "Low-load only.",
  },
];

export function getExerciseMetadataByName(exerciseName: string) {
  const normalized = exerciseName.trim().toLowerCase();

  return EXERCISE_METADATA.find((exercise) => {
    if (exercise.name.toLowerCase() === normalized) return true;

    return (exercise.aliases ?? []).some(
      (alias: string) => alias.trim().toLowerCase() === normalized
    );
  });
}