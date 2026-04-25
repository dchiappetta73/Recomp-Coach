import { supabase } from "./supabaseClient";
import type { LiftLog, LiftLogExerciseStatus } from "../types/liftLog";

export type WorkoutLiftLogEntry = LiftLog;

const liftLogSelectFields = [
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
  "set_number",
  "set_no",
  "planned_sets",
  "planned_reps",
  "workout_session_id",
  "completed_sets",
  "completed_reps",
  "completed_weight",
  "unit",
  "pain_score",
  "energy_score",
  "exercise_status",
  "skip_reason",
  "added_reason",
  "exercise_variant_used",
  "substitution_flag",
].join(",");

export async function getLiftLogsForWorkoutSession(
  workoutSessionId: string
): Promise<WorkoutLiftLogEntry[]> {
  const { data, error } = await supabase
    .from("lift_logs")
    .select(liftLogSelectFields)
    .eq("workout_session_id", workoutSessionId)
    .order("exercise_name", { ascending: true })
    .order("set_number", { ascending: true, nullsFirst: false })
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
  setNumber?: number | null;
  setNo: number;
  plannedSets?: number | null;
  plannedReps?: string | null;
  completedReps?: number | null;
  completedWeight?: number | null;
  rpe?: number | null;
  painScore?: number | null;
  energyScore?: number | null;
  notes?: string | null;
  exerciseStatus?: LiftLogExerciseStatus | null;
  skipReason?: string | null;
  addedReason?: string | null;
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
    set_number: params.setNumber ?? params.setNo,
    set_no: params.setNo,
    planned_sets: params.plannedSets ?? null,
    planned_reps: params.plannedReps ?? null,
    completed_sets: 1,
    completed_reps: params.completedReps ?? null,
    completed_weight: params.completedWeight ?? null,
    unit: "lb",
    rpe: params.rpe ?? null,
    pain_score: params.painScore ?? null,
    energy_score: params.energyScore ?? null,
    notes: params.notes ?? null,
    exercise_status: params.exerciseStatus ?? "completed",
    skip_reason: params.skipReason ?? null,
    added_reason: params.addedReason ?? null,
    workout_session_id: params.workoutSessionId,
    exercise_variant_used: params.exerciseVariantUsed ?? null,
    substitution_flag: params.substitutionFlag ?? false,
  };

  const { data, error } = await supabase
    .from("lift_logs")
    .insert([payload])
    .select(liftLogSelectFields)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as WorkoutLiftLogEntry;
}

export async function updateLiftLogSetEntry(
  id: string,
  patch: {
    completedReps?: number | null;
    completedWeight?: number | null;
    rpe?: number | null;
    painScore?: number | null;
    energyScore?: number | null;
    notes?: string | null;
    exerciseStatus?: LiftLogExerciseStatus | null;
    skipReason?: string | null;
    addedReason?: string | null;
  }
): Promise<WorkoutLiftLogEntry> {
  const payload: Record<string, string | number | null> = {};

  if ("completedReps" in patch) {
    payload.completed_reps = patch.completedReps ?? null;
  }

  if ("completedWeight" in patch) {
    payload.completed_weight = patch.completedWeight ?? null;
  }

  if ("rpe" in patch) {
    payload.rpe = patch.rpe ?? null;
  }

  if ("painScore" in patch) {
    payload.pain_score = patch.painScore ?? null;
  }

  if ("energyScore" in patch) {
    payload.energy_score = patch.energyScore ?? null;
  }

  if ("notes" in patch) {
    payload.notes = patch.notes ?? null;
  }

  if ("exerciseStatus" in patch) {
    payload.exercise_status = patch.exerciseStatus ?? null;
  }

  if ("skipReason" in patch) {
    payload.skip_reason = patch.skipReason ?? null;
  }

  if ("addedReason" in patch) {
    payload.added_reason = patch.addedReason ?? null;
  }

  const { data, error } = await supabase
    .from("lift_logs")
    .update(payload)
    .eq("id", id)
    .select(liftLogSelectFields)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as WorkoutLiftLogEntry;
}

export async function deleteLiftLogSetEntry(id: string): Promise<void> {
  const { error } = await supabase.from("lift_logs").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
