import { supabase } from "./supabaseClient";
import type { WeeklyCheckin } from "../types/weeklyCheckin";

function getWeekDateRange(weekNumber: number) {
  const year = new Date().getFullYear();
  const janFirst = new Date(Date.UTC(year, 0, 1));
  const start = new Date(janFirst);
  start.setUTCDate(janFirst.getUTCDate() + (weekNumber - 1) * 7);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return {
    dateStart: start.toISOString().slice(0, 10),
    dateEnd: end.toISOString().slice(0, 10),
  };
}

export async function getWeeklyCheckinsForAthlete(
  athleteId: string
): Promise<WeeklyCheckin[]> {
  const { data, error } = await supabase
    .from("weekly_checkins")
    .select(
      [
        "id",
        "athlete_id",
        "week_number",
        "date_start",
        "date_end",
        "phase_label",
        "goal_type_at_time",
        "avg_weight_lb",
        "avg_calories",
        "avg_protein_g",
        "avg_sleep_minutes",
        "avg_steps",
        "training_sessions_logged",
        "went_well",
        "difficult",
        "schedule_issues",
        "pain_injury_changes",
        "requested_adjustments",
        "readiness_score",
        "overall_status",
        "observations",
        "recommendations",
        "generated_summary",
        "created_at",
        "updated_at",
      ].join(",")
    )
    .eq("athlete_id", athleteId)
    .order("date_end", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as WeeklyCheckin[];
}

export async function getWeeklyCheckinByWeekNumber(
  athleteId: string,
  weekNumber: number
): Promise<WeeklyCheckin | null> {
  const { data, error } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("week_number", weekNumber)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as unknown as WeeklyCheckin | null) ?? null;
}

export async function updateWeeklyCheckinMvpFields(
  id: string,
  patch: {
    wentWell?: string | null;
    difficult?: string | null;
    scheduleIssues?: string | null;
    painInjuryChanges?: string | null;
    requestedAdjustments?: string | null;
    readinessScore?: number | null;
  }
): Promise<WeeklyCheckin> {
  const payload: Record<string, string | number | null> = {};

  if ("wentWell" in patch) {
    payload.went_well = patch.wentWell ?? null;
  }

  if ("difficult" in patch) {
    payload.difficult = patch.difficult ?? null;
  }

  if ("scheduleIssues" in patch) {
    payload.schedule_issues = patch.scheduleIssues ?? null;
  }

  if ("painInjuryChanges" in patch) {
    payload.pain_injury_changes = patch.painInjuryChanges ?? null;
  }

  if ("requestedAdjustments" in patch) {
    payload.requested_adjustments = patch.requestedAdjustments ?? null;
  }

  if ("readinessScore" in patch) {
    payload.readiness_score = patch.readinessScore ?? null;
  }

  const { data, error } = await supabase
    .from("weekly_checkins")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as WeeklyCheckin;
}

export async function upsertWeeklyCheckinMvpFields(params: {
  athleteId: string;
  weekNumber: number;
  wentWell?: string | null;
  difficult?: string | null;
  scheduleIssues?: string | null;
  painInjuryChanges?: string | null;
  requestedAdjustments?: string | null;
  readinessScore?: number | null;
}): Promise<WeeklyCheckin> {
  const existing = await getWeeklyCheckinByWeekNumber(
    params.athleteId,
    params.weekNumber
  );

  const patch = {
    wentWell: params.wentWell ?? null,
    difficult: params.difficult ?? null,
    scheduleIssues: params.scheduleIssues ?? null,
    painInjuryChanges: params.painInjuryChanges ?? null,
    requestedAdjustments: params.requestedAdjustments ?? null,
    readinessScore: params.readinessScore ?? null,
  };

  if (existing) {
    return updateWeeklyCheckinMvpFields(existing.id, patch);
  }

  const { dateStart, dateEnd } = getWeekDateRange(params.weekNumber);
  const { data, error } = await supabase
    .from("weekly_checkins")
    .insert([
      {
        athlete_id: params.athleteId,
        week_number: params.weekNumber,
        date_start: dateStart,
        date_end: dateEnd,
        went_well: patch.wentWell,
        difficult: patch.difficult,
        schedule_issues: patch.scheduleIssues,
        pain_injury_changes: patch.painInjuryChanges,
        requested_adjustments: patch.requestedAdjustments,
        readiness_score: patch.readinessScore,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as WeeklyCheckin;
}
