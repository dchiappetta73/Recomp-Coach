import { supabase } from "./supabaseClient";
import { orderSessionExercises } from "../utils/orderSessionExercises";
import type {
  PlannedWorkoutExercise,
  PlannedWorkoutSession,
  PrehabCompletedStatus,
  WorkoutSession,
} from "../types/workoutSession";

type SessionType = "upperA" | "lowerA" | "upperB" | "lowerB";

function buildSessionKey(row: {
  week_no: number;
  block: string;
  day_no: number;
  session_name: string;
}) {
  return `${row.week_no}__${row.block}__${row.day_no}__${row.session_name}`;
}

function getSessionTypeFromSessionName(sessionName: string): SessionType | undefined {
  const normalized = sessionName.trim().toLowerCase();

  if (normalized === "upper a") return "upperA";
  if (normalized === "lower a") return "lowerA";
  if (normalized === "upper b") return "upperB";
  if (normalized === "lower b") return "lowerB";

  return undefined;
}

function normalizePlannedExercise(
  row: PlannedWorkoutExercise,
  fallbackOrder: number
): PlannedWorkoutExercise {
  let normalizedRpe: number | null = row.prescribed_rpe ?? null;

  if (normalizedRpe == null && row.target_rpe) {
    const firstNumericMatch = row.target_rpe.match(/\d+(\.\d+)?/);
    normalizedRpe = firstNumericMatch ? Number(firstNumericMatch[0]) : null;
  }

  return {
    ...row,
    exercise_order: row.exercise_order ?? fallbackOrder,
    prescribed_sets:
      row.prescribed_sets ??
      (row.sets != null && row.sets !== "" ? Number(row.sets) : null),
    prescribed_reps: row.prescribed_reps ?? row.reps ?? null,
    prescribed_rpe: normalizedRpe,
    prescribed_notes: row.prescribed_notes ?? row.notes ?? null,
  };
}

function applyFallbackOrdering(
  exercises: PlannedWorkoutExercise[],
  sessionType?: SessionType
): PlannedWorkoutExercise[] {
  const allHaveExplicitOrder = exercises.every(
    (exercise) => exercise.exercise_order != null
  );

  if (allHaveExplicitOrder) {
    return [...exercises].sort(
      (a, b) => (a.exercise_order ?? 999) - (b.exercise_order ?? 999)
    );
  }

  const orderedNames = orderSessionExercises(
    exercises.map((exercise) => exercise.exercise_name),
    sessionType
  ).map((exercise) => exercise.name);

  const usedIndexes = new Set<number>();

  return orderedNames
    .map((orderedName, orderedIndex) => {
      const matchIndex = exercises.findIndex((exercise, index) => {
        if (usedIndexes.has(index)) return false;
        return exercise.exercise_name === orderedName;
      });

      if (matchIndex === -1) return null;

      usedIndexes.add(matchIndex);

      return normalizePlannedExercise(exercises[matchIndex], orderedIndex + 1);
    })
    .filter((exercise): exercise is PlannedWorkoutExercise => exercise != null);
}

export async function getPlannedWorkoutSessionsForAthlete(
  athleteId: string
): Promise<PlannedWorkoutSession[]> {
  const { data, error } = await supabase
    .from("program_templates")
    .select(
      [
        "id",
        "athlete_id",
        "week_no",
        "block",
        "day_no",
        "session_name",
        "exercise_name",
        "exercise_order",
        "prescribed_sets",
        "prescribed_reps",
        "prescribed_rpe",
        "prescribed_notes",
        "sets",
        "reps",
        "target_rpe",
        "notes",
        "goal_type_at_time",
      ].join(",")
    )
    .eq("athlete_id", athleteId)
    .order("week_no", { ascending: true })
    .order("day_no", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = ((data ?? []) as unknown as PlannedWorkoutExercise[]).filter(
    (row) => row.week_no != null && row.day_no != null && row.session_name
  );

  const sessionMap = new Map<string, PlannedWorkoutSession>();

  for (const row of rows) {
    const key = buildSessionKey(row);

    if (!sessionMap.has(key)) {
      sessionMap.set(key, {
        athlete_id: row.athlete_id,
        week_no: row.week_no,
        block: row.block,
        day_no: row.day_no,
        session_name: row.session_name,
        exercises: [],
      });
    }

    sessionMap.get(key)?.exercises.push(row);
  }

  return Array.from(sessionMap.values()).map((session) => {
    const sessionType = getSessionTypeFromSessionName(session.session_name);

    return {
      ...session,
      exercises: applyFallbackOrdering(session.exercises, sessionType),
    };
  });
}

export async function getInProgressWorkoutSession(
  athleteId: string
): Promise<WorkoutSession | null> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as unknown as WorkoutSession | null) ?? null;
}

export async function getLatestWorkoutSessionForWorkout(params: {
  athleteId: string;
  programTemplateId?: string | null;
  sessionDate: string;
  weekNumber: number;
  dayNumber: number;
  sessionName: string;
}): Promise<WorkoutSession | null> {
  let query = supabase
    .from("workout_sessions")
    .select("*")
    .eq("athlete_id", params.athleteId)
    .eq("session_date", params.sessionDate)
    .eq("week_number", params.weekNumber)
    .eq("day_number", params.dayNumber)
    .eq("session_name", params.sessionName)
    .in("status", ["in_progress", "completed"]);

  if (params.programTemplateId) {
    query = query.eq("program_template_id", params.programTemplateId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as unknown as WorkoutSession | null) ?? null;
}

export async function createWorkoutSession(params: {
  athleteId: string;
  programTemplateId?: string | null;
  sessionDate: string;
  weekNumber: number;
  blockLabel: string;
  dayNumber: number;
  sessionName: string;
  goalTypeAtTime?: string | null;
  plannedExerciseCount: number;
}): Promise<WorkoutSession> {
  const payload = {
    athlete_id: params.athleteId,
    program_template_id: params.programTemplateId ?? null,
    session_date: params.sessionDate,
    week_number: params.weekNumber,
    block_label: params.blockLabel,
    day_number: params.dayNumber,
    session_name: params.sessionName,
    status: "in_progress",
    goal_type_at_time: params.goalTypeAtTime ?? null,
    planned_exercise_count: params.plannedExerciseCount,
    completed_exercise_count: 0,
    total_sets: 0,
    avg_rpe: null,
    pain_flag: false,
    energy_score: null,
    notes: null,
  };

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as WorkoutSession;
}

export async function finishWorkoutSession(params: {
  workoutSessionId: string;
  completedExerciseCount: number;
  totalSets: number;
  avgRpe: number | null;
  durationMin?: number | null;
  painScore?: number | null;
  painLocation?: string | null;
  painDescription?: string | null;
  aggravatedMovements?: string | null;
  feltGoodMovements?: string | null;
  prehabCompleted?: PrehabCompletedStatus | null;
  notes?: string | null;
}): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .update({
      status: "completed",
      completed_exercise_count: params.completedExerciseCount,
      total_sets: params.totalSets,
      avg_rpe: params.avgRpe,
      duration_min: params.durationMin ?? null,
      pain_score: params.painScore ?? null,
      pain_location: params.painLocation ?? null,
      pain_description: params.painDescription ?? null,
      aggravated_movements: params.aggravatedMovements ?? null,
      felt_good_movements: params.feltGoodMovements ?? null,
      prehab_completed: params.prehabCompleted ?? null,
      notes: params.notes ?? null,
    })
    .eq("id", params.workoutSessionId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as WorkoutSession;
}
