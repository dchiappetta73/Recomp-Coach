import type { GoalType } from "./goals";

export interface MeasurementLog {
  id: string;
  athlete_id: string;
  measurement_date?: string | null;
  week_number?: number | null;
  goal_type_at_time?: GoalType | null;
  navel_in?: number | null;
  lower_ab_in?: number | null;
  chest_in?: number | null;
  hips_in?: number | null;
  left_arm_in?: number | null;
  right_arm_in?: number | null;
  left_thigh_in?: number | null;
  right_thigh_in?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
}
