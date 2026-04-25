import type { GoalType } from "./goals";

export type SourceName = "manual" | "zepp" | "cronometer" | "upload";

export interface DailyMetric {
  id: string;
  athlete_id: string;
  metric_date: string;
  goal_type_at_time?: GoalType | null;
  weight_lb?: number | null;
  body_fat_pct?: number | null;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;
  sodium_mg?: number | null;
  water_ml?: number | null;
  sleep_minutes?: number | null;
  deep_sleep_minutes?: number | null;
  rem_sleep_minutes?: number | null;
  light_sleep_minutes?: number | null;
  bedtime_sd_hours?: number | null;
  resting_hr?: number | null;
  mean_hr?: number | null;
  max_hr?: number | null;
  hrv?: number | null;
  steps?: number | null;
  active_minutes?: number | null;
  distance_miles?: number | null;
  stress_score?: number | null;
  spo2_mean?: number | null;
  spo2_min?: number | null;
  pai_score?: number | null;
  energy_score?: number | null;
  manual_notes?: string | null;
  source_weight?: SourceName | null;
  source_nutrition?: SourceName | null;
  source_sleep?: SourceName | null;
  source_activity?: SourceName | null;
  source_hr?: SourceName | null;
  created_at?: string;
  updated_at?: string;
}
