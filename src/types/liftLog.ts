export type LiftLogExerciseStatus = "completed" | "skipped" | "added";

export interface LiftLog {
  id: string;
  athlete_id: string;
  workout_session_id?: string | null;
  entry_date: string;
  week_no?: number | null;
  block?: string | null;
  day_no?: number | null;
  session_name?: string | null;
  exercise_name: string;
  set_number?: number | null;
  planned_reps?: string | null;
  completed_reps?: number | null;
  completed_weight?: number | null;
  unit?: string | null;
  rpe?: number | null;
  pain_score?: number | null;
  energy_score?: number | null;
  notes?: string | null;
  exercise_status?: LiftLogExerciseStatus | null;
  skip_reason?: string | null;
  added_reason?: string | null;
  exercise_variant_used?: string | null;
  substitution_flag?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  set_no?: number | null;
  planned_sets?: number | null;
  completed_sets?: number | null;
}
