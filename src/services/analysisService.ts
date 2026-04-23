import { supabase } from "./supabaseClient";

export type AnalysisRecord = Record<string, unknown>;

export type AnalysisAthlete = {
  id: string;
  name: string | null;
  current_goal: string | null;
};

export type AnalysisPageData = {
  athlete: AnalysisAthlete | null;
  monthlyRollups: AnalysisRecord[];
  dailyMetrics: AnalysisRecord[];
  weeklySnapshots: AnalysisRecord[];
};

function getStringValue(row: AnalysisRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function getDateTimeValue(row: AnalysisRecord, keys: string[]): number {
  const rawValue = getStringValue(row, keys);

  if (!rawValue) return 0;

  const parsed = Date.parse(rawValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortByDateDesc(rows: AnalysisRecord[], keys: string[]): AnalysisRecord[] {
  return [...rows].sort((a, b) => getDateTimeValue(b, keys) - getDateTimeValue(a, keys));
}

export async function fetchAnalysisPageData(): Promise<AnalysisPageData> {
  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id, name, current_goal")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (athleteError) {
    throw new Error(`Unable to load athlete for analysis: ${athleteError.message}`);
  }

  if (!athlete?.id) {
    return {
      athlete: null,
      monthlyRollups: [],
      dailyMetrics: [],
      weeklySnapshots: [],
    };
  }

  const [monthlyResult, dailyResult, weeklyResult] = await Promise.all([
    supabase.from("monthly_rollups").select("*").eq("athlete_id", athlete.id),
    supabase.from("daily_metrics").select("*").eq("athlete_id", athlete.id),
    supabase.from("weekly_analysis_snapshots").select("*").eq("athlete_id", athlete.id),
  ]);

  if (monthlyResult.error) {
    throw new Error(`Unable to load monthly analysis: ${monthlyResult.error.message}`);
  }

  if (dailyResult.error) {
    throw new Error(`Unable to load daily metrics analysis: ${dailyResult.error.message}`);
  }

  if (weeklyResult.error) {
    throw new Error(`Unable to load weekly analysis snapshots: ${weeklyResult.error.message}`);
  }

  const monthlyRollups = sortByDateDesc((monthlyResult.data || []) as unknown as AnalysisRecord[], [
    "month_start",
    "rollup_month",
    "month",
    "period_start",
    "created_at",
  ]).slice(0, 6);

  const dailyMetrics = sortByDateDesc((dailyResult.data || []) as unknown as AnalysisRecord[], [
    "entry_date",
    "metric_date",
    "date",
    "created_at",
  ]).slice(0, 14);

  const weeklySnapshots = sortByDateDesc((weeklyResult.data || []) as unknown as AnalysisRecord[], [
    "created_at",
  ]).slice(0, 4);

  return {
    athlete: {
      id: athlete.id,
      name: athlete.name ?? null,
      current_goal: athlete.current_goal ?? null,
    },
    monthlyRollups,
    dailyMetrics,
    weeklySnapshots,
  };
}
