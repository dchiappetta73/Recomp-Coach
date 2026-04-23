import { supabase } from "./supabaseClient";

export interface WorkoutLiftLogEntry {
  id: string;
  athlete_id?: string | null;
  entry_date: string;
  week_no?: number | null;
  block?: string | null;
  day_no?: number | null;
  session_name?: string | null;
  exercise_name: string;
  rpe?: number | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  set_no?: number | null;
  planned_sets?: number | null;
  planned_reps?: string | null;
  workout_session_id?: string | null;
  completed_sets?: number | null;
  completed_reps?: number | null;
  completed_weight?: number | null;
  exercise_variant_used?: string | null;
  substitution_flag?: boolean;
}

export async function getLiftLogsForWorkoutSession(
  workoutSessionId: string
): Promise<WorkoutLiftLogEntry[]> {
  const { data, error } = await supabase
    .from("lift_logs")
    .select(
      [
        "id",
        "athlete_id",
        "entry_date",
        "week_no",
        "block",
        "day_no",
        "session_name",
        "exercise_name",
        "rpe",
        "notes",
        "created_at",
        "updated_at",
        "set_no",
        "planned_sets",
        "planned_reps",
        "workout_session_id",
        "completed_sets",
        "completed_reps",
        "completed_weight",
        "exercise_variant_used",
        "substitution_flag",
      ].join(",")
    )
    .eq("workout_session_id", workoutSessionId)
    .order("exercise_name", { ascending: true })
    .order("set_no", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as WorkoutLiftLogEntry[];
}

export async function createLiftLogSetEntry(params: {
  athleteId: string;
  entryDate: string;
  weekNo: number;
  block: string;
  dayNo: number;
  sessionName: string;
  exerciseName: string;
  setNo: number;
  plannedSets?: number | null;
  plannedReps?: string | null;
  completedReps?: number | null;
  completedWeight?: number | null;
  rpe?: number | null;
  notes?: string | null;
  workoutSessionId: string;
  exerciseVariantUsed?: string | null;
  substitutionFlag?: boolean;
}): Promise<WorkoutLiftLogEntry> {
  const payload = {
    athlete_id: params.athleteId,
    entry_date: params.entryDate,
    week_no: params.weekNo,
    block: params.block,
    day_no: params.dayNo,
    session_name: params.sessionName,
    exercise_name: params.exerciseName,
    set_no: params.setNo,
    planned_sets: params.plannedSets ?? null,
    planned_reps: params.plannedReps ?? null,
    completed_sets: 1,
    completed_reps: params.completedReps ?? null,
    completed_weight: params.completedWeight ?? null,
    rpe: params.rpe ?? null,
    notes: params.notes ?? null,
    workout_session_id: params.workoutSessionId,
    exercise_variant_used: params.exerciseVariantUsed ?? null,
    substitution_flag: params.substitutionFlag ?? false,
  };

  const { data, error } = await supabase
    .from("lift_logs")
    .insert([payload])
    .select(
      [
        "id",
        "athlete_id",
        "entry_date",
        "week_no",
        "block",
        "day_no",
        "session_name",
        "exercise_name",
        "rpe",
        "notes",
        "created_at",
        "updated_at",
        "set_no",
        "planned_sets",
        "planned_reps",
        "workout_session_id",
        "completed_sets",
        "completed_reps",
        "completed_weight",
        "exercise_variant_used",
        "substitution_flag",
      ].join(",")
    )
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as WorkoutLiftLogEntry;
}
