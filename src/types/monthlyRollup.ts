import type { GoalType } from "./goals";

export interface MonthlyRollup {
  id: string;
  athlete_id: string;
  month_key?: string | null;
  goal_type_at_time?: GoalType | null;
  avg_weight_lb?: number | null;
  avg_sleep_minutes?: number | null;
  avg_resting_hr?: number | null;
  avg_steps?: number | null;
  avg_protein_g?: number | null;
  training_sessions_logged?: number | null;
  rhr_slope?: number | null;
  weight_slope?: number | null;
  summary_text?: string | null;
  focus_priorities_json?: string[] | null;
  created_at?: string;
}
