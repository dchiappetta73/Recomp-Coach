import { supabase } from "./supabaseClient";
import type { WeeklyCheckin } from "../types/weeklyCheckin";

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
