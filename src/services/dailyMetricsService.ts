import { supabase } from "./supabaseClient";
import type { DailyMetric } from "../types/dailyMetrics";

export async function getDailyMetricsForRange(
  athleteId: string,
  startDate: string,
  endDate: string
): Promise<DailyMetric[]> {
  const { data, error } = await supabase
    .from("daily_metrics")
    .select("*")
    .eq("athlete_id", athleteId)
    .gte("metric_date", startDate)
    .lte("metric_date", endDate)
    .order("metric_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as DailyMetric[];
}

export async function getDailyMetricByDate(
  athleteId: string,
  metricDate: string
): Promise<DailyMetric | null> {
  const { data, error } = await supabase
    .from("daily_metrics")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("metric_date", metricDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as DailyMetric | null) ?? null;
}

export async function upsertDailyMetricEntry(params: {
  athleteId: string;
  metricDate: string;
  goalTypeAtTime?: string | null;
  calories?: number | null;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  sleepMinutes?: number | null;
  steps?: number | null;
  energyScore?: number | null;
  manualNotes?: string | null;
}): Promise<DailyMetric> {
  const existing = await getDailyMetricByDate(params.athleteId, params.metricDate);

  const payload = {
    athlete_id: params.athleteId,
    metric_date: params.metricDate,
    goal_type_at_time: params.goalTypeAtTime ?? null,
    calories: params.calories ?? null,
    protein_g: params.proteinG ?? null,
    carbs_g: params.carbsG ?? null,
    fat_g: params.fatG ?? null,
    sleep_minutes: params.sleepMinutes ?? null,
    steps: params.steps ?? null,
    energy_score: params.energyScore ?? null,
    manual_notes: params.manualNotes ?? null,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("daily_metrics")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as DailyMetric;
  }

  const { data, error } = await supabase
    .from("daily_metrics")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as DailyMetric;
}