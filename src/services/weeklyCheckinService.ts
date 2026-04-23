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
