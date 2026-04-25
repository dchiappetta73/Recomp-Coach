import { supabase } from "./supabaseClient";
import type { WeeklyVisualAssessment } from "../types/weeklyVisualAssessment";

const weeklyVisualAssessmentSelectFields = [
  "id",
  "athlete_id",
  "week_number",
  "assessment_date",
  "goal_type_at_time",
  "linea_alba_status",
  "upper_ab_status",
  "obliques_status",
  "midsection_front_status",
  "midsection_side_status",
  "chest_fullness_status",
  "quad_sweep_status",
  "vascularity_status",
  "vs_baseline_status",
  "photo_notes",
  "photos_taken",
  "created_at",
  "updated_at",
].join(",");

export async function getWeeklyVisualAssessmentsForAthlete(
  athleteId: string
): Promise<WeeklyVisualAssessment[]> {
  const { data, error } = await supabase
    .from("weekly_visual_assessments")
    .select(weeklyVisualAssessmentSelectFields)
    .eq("athlete_id", athleteId)
    .order("week_number", { ascending: false, nullsFirst: false })
    .order("assessment_date", { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as WeeklyVisualAssessment[];
}

export async function getWeeklyVisualAssessmentByWeek(
  athleteId: string,
  weekNumber: number
): Promise<WeeklyVisualAssessment | null> {
  const { data, error } = await supabase
    .from("weekly_visual_assessments")
    .select(weeklyVisualAssessmentSelectFields)
    .eq("athlete_id", athleteId)
    .eq("week_number", weekNumber)
    .order("assessment_date", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as unknown as WeeklyVisualAssessment | null) ?? null;
}

export async function getWeeklyVisualAssessmentByDate(
  athleteId: string,
  assessmentDate: string
): Promise<WeeklyVisualAssessment | null> {
  const { data, error } = await supabase
    .from("weekly_visual_assessments")
    .select(weeklyVisualAssessmentSelectFields)
    .eq("athlete_id", athleteId)
    .eq("assessment_date", assessmentDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as unknown as WeeklyVisualAssessment | null) ?? null;
}
