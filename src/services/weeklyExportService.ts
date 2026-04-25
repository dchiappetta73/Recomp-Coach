import { supabase } from "./supabaseClient";
import type { DailyMetric } from "../types/dailyMetrics";
import type { LiftLog } from "../types/liftLog";
import type { WeeklyCheckin } from "../types/weeklyCheckin";
import type { WeeklyVisualAssessment } from "../types/weeklyVisualAssessment";
import type { WorkoutSession } from "../types/workoutSession";

interface GenerateWeeklyExportParams {
  athleteId: string;
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
}

function textValue(value: string | number | null | undefined, fallback = "not logged") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function numberValue(value: number | null | undefined, fallback = "not logged") {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback;
  return String(value);
}

function average(values: Array<number | null | undefined>): number | null {
  const loggedValues = values.filter(
    (value): value is number => value !== null && value !== undefined && !Number.isNaN(value)
  );

  if (loggedValues.length === 0) return null;

  return loggedValues.reduce((sum, value) => sum + value, 0) / loggedValues.length;
}

function roundedAverage(values: Array<number | null | undefined>, digits = 0): string {
  const avg = average(values);
  if (avg === null) return "not logged";
  return avg.toFixed(digits);
}

function formatHoursFromMinutes(values: Array<number | null | undefined>): string {
  const avgMinutes = average(values);
  if (avgMinutes === null) return "not logged";
  return (avgMinutes / 60).toFixed(1);
}

function formatGeneratedDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatWeekday(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter((value) => value !== "")));
}

function formatJoinedValues(values: string[], fallback = "not logged") {
  const unique = uniqueValues(values);
  if (unique.length === 0) return fallback;
  if (unique.length === 1) return unique[0];
  return unique.join("/");
}

function formatRpe(values: Array<number | null | undefined>) {
  const loggedValues = values.filter(
    (value): value is number => value !== null && value !== undefined && !Number.isNaN(value)
  );

  if (loggedValues.length === 0) return "not logged";

  const unique = Array.from(new Set(loggedValues.map((value) => String(value))));
  if (unique.length === 1) return unique[0];

  return (loggedValues.reduce((sum, value) => sum + value, 0) / loggedValues.length).toFixed(1);
}

function getSetOrder(row: LiftLog) {
  return row.set_number ?? row.set_no ?? 999;
}

function sortLiftLogRows(rows: LiftLog[]) {
  return [...rows].sort((a, b) => getSetOrder(a) - getSetOrder(b));
}

function formatPainNotes(session: WorkoutSession) {
  const painLocation = session.pain_location?.trim();
  const painDescription = session.pain_description?.trim();

  if (painLocation && painDescription) {
    return `${painLocation} — ${painDescription}`;
  }

  if (painLocation) return painLocation;
  if (painDescription) return painDescription;

  return "none";
}

function groupByWorkoutSession(liftLogs: LiftLog[]) {
  const grouped = new Map<string, LiftLog[]>();

  for (const liftLog of liftLogs) {
    if (!liftLog.workout_session_id) continue;

    const existing = grouped.get(liftLog.workout_session_id) ?? [];
    existing.push(liftLog);
    grouped.set(liftLog.workout_session_id, existing);
  }

  return grouped;
}

function groupCompletedLiftsByExercise(liftLogs: LiftLog[]) {
  const grouped = new Map<string, LiftLog[]>();

  for (const liftLog of liftLogs) {
    const status = liftLog.exercise_status ?? "completed";
    if (status !== "completed") continue;

    const existing = grouped.get(liftLog.exercise_name) ?? [];
    existing.push(liftLog);
    grouped.set(liftLog.exercise_name, existing);
  }

  return Array.from(grouped.entries());
}

function formatCompletedExerciseLine(exerciseName: string, rows: LiftLog[]) {
  const sortedRows = sortLiftLogRows(rows);
  const sets = sortedRows.length;
  const reps = formatJoinedValues(
    sortedRows.map((row) =>
      row.completed_reps === null || row.completed_reps === undefined ? "" : String(row.completed_reps)
    )
  );
  const loads = formatJoinedValues(
    sortedRows.map((row) =>
      row.completed_weight === null || row.completed_weight === undefined
        ? ""
        : `${row.completed_weight}${row.unit ?? "lb"}`
    )
  );
  const rpe = formatRpe(sortedRows.map((row) => row.rpe));

  return `${exerciseName} — ${sets}×${reps} @ ${loads} · RPE ${rpe}`;
}

function formatSkippedAndAddedLines(liftLogs: LiftLog[]) {
  return liftLogs
    .filter((liftLog) => liftLog.exercise_status === "skipped" || liftLog.exercise_status === "added")
    .map((liftLog) => {
      if (liftLog.exercise_status === "skipped") {
        return `Skipped: ${liftLog.exercise_name} — ${textValue(liftLog.skip_reason, "none")}`;
      }

      return `Added: ${liftLog.exercise_name} — ${textValue(liftLog.added_reason, "none")}`;
    });
}

function formatDailyNotes(dailyMetrics: DailyMetric[]) {
  const notes = dailyMetrics
    .filter((metric) => metric.manual_notes && metric.manual_notes.trim() !== "")
    .map((metric) => `${metric.metric_date}: ${metric.manual_notes}`);

  if (notes.length === 0) return "none";

  return notes.join("; ");
}

function formatPhotosTaken(value: boolean | null | undefined) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "not logged";
}

function formatTrainingSection(sessions: WorkoutSession[], liftLogsBySessionId: Map<string, LiftLog[]>) {
  const completedCount = sessions.filter((session) => session.status === "completed").length;
  const lines = [
    "── TRAINING ──────────────────────────",
    `Sessions completed: ${completedCount} of ${sessions.length} planned`,
    "",
  ];

  if (sessions.length === 0) {
    lines.push("No workout sessions logged.");
    lines.push("");
    return lines;
  }

  for (const session of sessions) {
    const liftLogs = liftLogsBySessionId.get(session.id) ?? [];
    const completedGroups = groupCompletedLiftsByExercise(liftLogs);
    const skippedAndAddedLines = formatSkippedAndAddedLines(liftLogs);

    lines.push(`${formatWeekday(session.session_date)} · ${textValue(session.session_name)}`);
    lines.push(`Date: ${session.session_date} · Duration: ${numberValue(session.duration_min)} min`);
    lines.push(`Energy: ${numberValue(session.energy_score)} · Pain: ${numberValue(session.pain_score)}`);
    lines.push(`Pain notes: ${formatPainNotes(session)}`);
    lines.push(`Prehab completed: ${textValue(session.prehab_completed)}`);
    lines.push("");
    lines.push("Exercises:");

    if (completedGroups.length === 0 && skippedAndAddedLines.length === 0) {
      lines.push("none");
    }

    for (const [exerciseName, rows] of completedGroups) {
      lines.push(formatCompletedExerciseLine(exerciseName, rows));
    }

    for (const line of skippedAndAddedLines) {
      lines.push(line);
    }

    lines.push("");
    lines.push(`Session notes: ${textValue(session.notes, "none")}`);
    lines.push("");
  }

  return lines;
}

function formatDailyMetricsSection(dailyMetrics: DailyMetric[]) {
  return [
    "── DAILY METRICS (weekly averages) ───",
    `Avg weight: ${roundedAverage(dailyMetrics.map((metric) => metric.weight_lb), 1)} lbs`,
    `Avg calories: ${roundedAverage(dailyMetrics.map((metric) => metric.calories))} kcal`,
    `Avg protein: ${roundedAverage(dailyMetrics.map((metric) => metric.protein_g))}g`,
    `Avg carbs: ${roundedAverage(dailyMetrics.map((metric) => metric.carbs_g))}g`,
    `Avg fat: ${roundedAverage(dailyMetrics.map((metric) => metric.fat_g))}g`,
    `Avg sleep: ${formatHoursFromMinutes(dailyMetrics.map((metric) => metric.sleep_minutes))}h`,
    `Avg steps: ${roundedAverage(dailyMetrics.map((metric) => metric.steps))}`,
    `Daily notes: ${formatDailyNotes(dailyMetrics)}`,
    "",
  ];
}

function formatWeeklyCheckinSection(weeklyCheckin: WeeklyCheckin | null) {
  return [
    "── WEEKLY CHECK-IN ────────────────────",
    `What went well: ${textValue(weeklyCheckin?.went_well, "none")}`,
    `What was difficult: ${textValue(weeklyCheckin?.difficult, "none")}`,
    `Schedule issues: ${textValue(weeklyCheckin?.schedule_issues, "none")}`,
    `Pain/injury changes: ${textValue(weeklyCheckin?.pain_injury_changes, "none")}`,
    `Requested adjustments: ${textValue(weeklyCheckin?.requested_adjustments, "none")}`,
    `Readiness for next week: ${numberValue(weeklyCheckin?.readiness_score)}`,
    "",
  ];
}

function formatPhotosSection(visualAssessment: WeeklyVisualAssessment | null) {
  return [
    "── PHOTOS ─────────────────────────────",
    `Photos taken: ${formatPhotosTaken(visualAssessment?.photos_taken)} · Date: ${textValue(
      visualAssessment?.assessment_date
    )}`,
    `Notes: ${textValue(visualAssessment?.photo_notes, "none")}`,
    "",
  ];
}

export async function generateWeeklyExport(params: GenerateWeeklyExportParams): Promise<string> {
  const [sessionsResult, dailyMetricsResult, weeklyCheckinResult, visualAssessmentResult] =
    await Promise.all([
      supabase
        .from("workout_sessions")
        .select("*")
        .eq("athlete_id", params.athleteId)
        .gte("session_date", params.weekStartDate)
        .lte("session_date", params.weekEndDate)
        .order("session_date", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("daily_metrics")
        .select("*")
        .eq("athlete_id", params.athleteId)
        .gte("metric_date", params.weekStartDate)
        .lte("metric_date", params.weekEndDate)
        .order("metric_date", { ascending: true }),
      supabase
        .from("weekly_checkins")
        .select("*")
        .eq("athlete_id", params.athleteId)
        .eq("week_number", params.weekNumber)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("weekly_visual_assessments")
        .select("*")
        .eq("athlete_id", params.athleteId)
        .eq("week_number", params.weekNumber)
        .order("assessment_date", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (sessionsResult.error) throw sessionsResult.error;
  if (dailyMetricsResult.error) throw dailyMetricsResult.error;
  if (weeklyCheckinResult.error) throw weeklyCheckinResult.error;
  if (visualAssessmentResult.error) throw visualAssessmentResult.error;

  const sessions = (sessionsResult.data ?? []) as unknown as WorkoutSession[];
  const sessionIds = sessions.map((session) => session.id);

  let liftLogs: LiftLog[] = [];

  if (sessionIds.length > 0) {
    const { data, error } = await supabase
      .from("lift_logs")
      .select("*")
      .in("workout_session_id", sessionIds)
      .order("entry_date", { ascending: true })
      .order("exercise_name", { ascending: true })
      .order("set_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) throw error;

    liftLogs = (data ?? []) as unknown as LiftLog[];
  }

  const dailyMetrics = (dailyMetricsResult.data ?? []) as unknown as DailyMetric[];
  const weeklyCheckin = (weeklyCheckinResult.data as unknown as WeeklyCheckin | null) ?? null;
  const visualAssessment =
    (visualAssessmentResult.data as unknown as WeeklyVisualAssessment | null) ?? null;
  const liftLogsBySessionId = groupByWorkoutSession(liftLogs);

  return [
    `WEEK ${params.weekNumber} EXPORT — ${params.weekStartDate} to ${params.weekEndDate}`,
    `Generated: ${formatGeneratedDate()}`,
    "",
    ...formatTrainingSection(sessions, liftLogsBySessionId),
    ...formatDailyMetricsSection(dailyMetrics),
    ...formatWeeklyCheckinSection(weeklyCheckin),
    ...formatPhotosSection(visualAssessment),
    `── END WEEK ${params.weekNumber} EXPORT ────────────────`,
  ].join("\n");
}
