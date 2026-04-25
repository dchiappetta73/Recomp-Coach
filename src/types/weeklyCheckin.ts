import type { GoalType } from "./goals";

export interface WeeklyCheckin {
  id: string;
  athlete_id: string;
  week_number?: number | null;
  date_start?: string | null;
  date_end?: string | null;
  phase_label?: string | null;
  goal_type_at_time?: GoalType | null;
  avg_weight_lb?: number | null;
  avg_calories?: number | null;
  avg_protein_g?: number | null;
  avg_sleep_minutes?: number | null;
  avg_steps?: number | null;
  training_sessions_logged?: number | null;
  went_well?: string | null;
  difficult?: string | null;
  schedule_issues?: string | null;
  pain_injury_changes?: string | null;
  requested_adjustments?: string | null;
  readiness_score?: number | null;
  overall_status?: string | null;
  observations?: string | null;
  recommendations?: string | null;
  generated_summary?: string | null;
  created_at?: string;
  updated_at?: string;
}
