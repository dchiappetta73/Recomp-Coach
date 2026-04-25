import type { GoalType } from "./goals";

export interface WeeklyVisualAssessment {
  id: string;
  athlete_id: string;
  week_number: number;
  assessment_date: string;
  goal_type_at_time?: GoalType | null;
  linea_alba_status?: string | null;
  upper_ab_status?: string | null;
  obliques_status?: string | null;
  midsection_front_status?: string | null;
  midsection_side_status?: string | null;
  chest_fullness_status?: string | null;
  quad_sweep_status?: string | null;
  vascularity_status?: string | null;
  vs_baseline_status?: string | null;
  photo_notes?: string | null;
  photos_taken?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}
