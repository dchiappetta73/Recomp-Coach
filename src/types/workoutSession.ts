import type { GoalType } from "./goals";

export type WorkoutSessionStatus = "not_started" | "in_progress" | "completed";

export interface WorkoutSession {
  id: string;
  athlete_id: string;
  program_template_id?: string | null;
  session_date: string;
  week_number?: number | null;
  block_label?: string | null;
  day_number?: number | null;
  session_name?: string | null;
  status: string;
  goal_type_at_time?: GoalType | null;
  planned_exercise_count?: number | null;
  completed_exercise_count?: number | null;
  total_sets?: number | null;
  avg_rpe?: number | null;
  pain_flag?: boolean;
  energy_score?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PlannedWorkoutExercise {
  id: string;
  athlete_id?: string | null;
  week_no: number;
  block: string;
  day_no: number;
  session_name: string;
  exercise_name: string;
  exercise_order?: number | null;

  prescribed_sets?: number | null;
  prescribed_reps?: string | null;
  prescribed_rpe?: number | null;
  prescribed_notes?: string | null;

  sets?: string | null;
  reps?: string | null;
  target_rpe?: string | null;
  notes?: string | null;

  goal_type_at_time?: GoalType | null;
}

export interface PlannedWorkoutSession {
  athlete_id?: string | null;
  week_no: number;
  block: string;
  day_no: number;
  session_name: string;
  exercises: PlannedWorkoutExercise[];
}