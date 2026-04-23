import { supabase } from "./supabaseClient";
import type { MonthlyRollup } from "../types/monthlyRollup";
import type { MeasurementLog } from "../types/measurementLog";

export async function getMonthlyRollupsForAthlete(
  athleteId: string
): Promise<MonthlyRollup[]> {
  const { data, error } = await supabase
    .from("monthly_rollups")
    .select(
      [
        "id",
        "athlete_id",
        "month_key",
        "goal_type_at_time",
        "avg_weight_lb",
        "avg_sleep_minutes",
        "avg_resting_hr",
        "avg_steps",
        "avg_protein_g",
        "training_sessions_logged",
        "rhr_slope",
        "weight_slope",
        "summary_text",
        "focus_priorities_json",
        "created_at",
      ].join(",")
    )
    .eq("athlete_id", athleteId)
    .order("month_key", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as MonthlyRollup[];
}

export async function getMeasurementLogsForAthlete(
  athleteId: string
): Promise<MeasurementLog[]> {
  const { data, error } = await supabase
    .from("measurement_logs")
    .select(
      [
        "id",
        "athlete_id",
        "measurement_date",
        "week_number",
        "goal_type_at_time",
        "navel_in",
        "lower_ab_in",
        "chest_in",
        "hips_in",
        "left_arm_in",
        "right_arm_in",
        "left_thigh_in",
        "right_thigh_in",
        "notes",
        "created_at",
      ].join(",")
    )
    .eq("athlete_id", athleteId)
    .order("measurement_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as MeasurementLog[];
}
