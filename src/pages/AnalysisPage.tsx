import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/shared/PageSection";
import {
  type AnalysisPageData,
  type AnalysisRecord,
  fetchAnalysisPageData,
} from "../services/analysisService";

function getNumber(row: AnalysisRecord | undefined, key: string): number | null {
  if (!row) return null;

  const value = row[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getString(row: AnalysisRecord | undefined, keys: string[]): string | null {
  if (!row) return null;

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

function formatNumber(value: number | null, digits = 0): string {
  if (value === null) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPounds(value: number | null): string {
  if (value === null) return "—";
  return `${formatNumber(value, 1)} lb`;
}

function formatMinutesAsHours(value: number | null): string {
  if (value === null) return "—";

  const hours = value / 60;
  return `${formatNumber(hours, 1)} hr`;
}

function formatMonthLabel(row: AnalysisRecord | undefined): string {
  const raw = getString(row, ["month_start", "rollup_month", "month", "period_start", "created_at"]);

  if (!raw) return "—";

  const monthOnlyMatch = raw.match(/^(\d{4})-(\d{2})$/);

  if (monthOnlyMatch) {
    const year = Number(monthOnlyMatch[1]);
    const monthIndex = Number(monthOnlyMatch[2]) - 1;
    return new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  }

  const parsed = Date.parse(raw);

  if (Number.isNaN(parsed)) {
    return raw;
  }

  return new Date(parsed).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function average(rows: AnalysisRecord[], key: string): number | null {
  const values = rows
    .map((row) => getNumber(row, key))
    .filter((value): value is number => value !== null);

  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatDelta(value: number | null, suffix = ""): string {
  if (value === null) return "—";

  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, 1)}${suffix}`;
}

function formatJsonList(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "number") return String(item);
        if (typeof item === "object" && item !== null) return JSON.stringify(item);
        return null;
      })
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([key, item]) => {
      if (typeof item === "string" || typeof item === "number") {
        return `${key}: ${item}`;
      }

      return `${key}: ${JSON.stringify(item)}`;
    });
  }

  return [];
}

function AnalysisCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-1 text-sm text-slate-400">{helper}</p> : null}
    </div>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-5 text-sm text-slate-400">
      {children}
    </div>
  );
}

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalysis() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const result = await fetchAnalysisPageData();

        if (isMounted) {
          setData(result);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load analysis.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      isMounted = false;
    };
  }, []);

  const latestMonthly = data?.monthlyRollups[0];
  const previousMonthly = data?.monthlyRollups[1];
  const recentSevenDays = data?.dailyMetrics.slice(0, 7) || [];

  const summary = useMemo(() => {
    const latestWeight = getNumber(latestMonthly, "avg_weight_lb");
    const previousWeight = getNumber(previousMonthly, "avg_weight_lb");
    const weightDelta =
      latestWeight !== null && previousWeight !== null ? latestWeight - previousWeight : null;

    const latestSteps = getNumber(latestMonthly, "avg_steps");
    const previousSteps = getNumber(previousMonthly, "avg_steps");
    const stepsDelta =
      latestSteps !== null && previousSteps !== null ? latestSteps - previousSteps : null;

    const latestProtein = getNumber(latestMonthly, "avg_protein_g");
    const previousProtein = getNumber(previousMonthly, "avg_protein_g");
    const proteinDelta =
      latestProtein !== null && previousProtein !== null ? latestProtein - previousProtein : null;

    const latestSleep = getNumber(latestMonthly, "avg_sleep_minutes");
    const previousSleep = getNumber(previousMonthly, "avg_sleep_minutes");
    const sleepDelta =
      latestSleep !== null && previousSleep !== null ? latestSleep - previousSleep : null;

    return {
      latestWeight,
      weightDelta,
      latestSteps,
      stepsDelta,
      latestProtein,
      proteinDelta,
      latestSleep,
      sleepDelta,
      trainingSessions: getNumber(latestMonthly, "training_sessions_logged"),
      recentCalories: average(recentSevenDays, "calories"),
      recentProtein: average(recentSevenDays, "protein_g"),
      recentSteps: average(recentSevenDays, "steps"),
      recentSleep: average(recentSevenDays, "sleep_minutes"),
    };
  }, [latestMonthly, previousMonthly, recentSevenDays]);

  return (
    <PageSection title="Analysis">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/50 p-5">
          <p className="text-sm text-slate-300">
            Read-only analysis from monthly rollups, recent daily metrics, and weekly snapshots.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Current stage: useful summaries only. No coach automation, no live integrations, no
            speculative recommendations.
          </p>
        </div>

        {isLoading ? (
          <EmptyState>Loading analysis...</EmptyState>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-900/70 bg-red-950/40 p-5 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : !data?.athlete ? (
          <EmptyState>No athlete profile was found, so analysis cannot be loaded yet.</EmptyState>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <AnalysisCard
                label="Monthly avg weight"
                value={formatPounds(summary.latestWeight)}
                helper={`Change vs prior month: ${formatDelta(summary.weightDelta, " lb")}`}
              />
              <AnalysisCard
                label="Monthly avg steps"
                value={formatNumber(summary.latestSteps)}
                helper={`Change vs prior month: ${formatDelta(summary.stepsDelta)}`}
              />
              <AnalysisCard
                label="Monthly avg protein"
                value={
                  summary.latestProtein === null
                    ? "—"
                    : `${formatNumber(summary.latestProtein)} g`
                }
                helper={`Change vs prior month: ${formatDelta(summary.proteinDelta, " g")}`}
              />
              <AnalysisCard
                label="Monthly avg sleep"
                value={formatMinutesAsHours(summary.latestSleep)}
                helper={`Change vs prior month: ${formatDelta(
                  summary.sleepDelta === null ? null : summary.sleepDelta / 60,
                  " hr"
                )}`}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <AnalysisCard
                label="Training sessions"
                value={formatNumber(summary.trainingSessions)}
                helper={`Latest rollup: ${formatMonthLabel(latestMonthly)}`}
              />
              <AnalysisCard
                label="Recent avg calories"
                value={formatNumber(summary.recentCalories)}
                helper={`Based on ${recentSevenDays.length} recent daily metric rows`}
              />
              <AnalysisCard
                label="Recent avg protein"
                value={
                  summary.recentProtein === null ? "—" : `${formatNumber(summary.recentProtein)} g`
                }
                helper="Recent daily metrics"
              />
              <AnalysisCard
                label="Recent avg sleep"
                value={formatMinutesAsHours(summary.recentSleep)}
                helper="Recent daily metrics"
              />
            </div>

            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold" style={{ color: "#ffffff" }}>
                  Monthly rollup history
                  </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Uses the rollup rows already available in Supabase.
                </p>
              </div>

              {data.monthlyRollups.length === 0 ? (
                <EmptyState>No monthly rollup rows found yet.</EmptyState>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="py-3 pr-4 font-medium">Month</th>
                        <th className="py-3 pr-4 font-medium">Goal</th>
                        <th className="py-3 pr-4 font-medium">Avg Weight</th>
                        <th className="py-3 pr-4 font-medium">Avg Steps</th>
                        <th className="py-3 pr-4 font-medium">Avg Protein</th>
                        <th className="py-3 pr-4 font-medium">Avg Sleep</th>
                        <th className="py-3 pr-4 font-medium">Sessions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {data.monthlyRollups.map((row, index) => (
                        <tr key={`${formatMonthLabel(row)}-${index}`}>
                          <td className="py-3 pr-4">{formatMonthLabel(row)}</td>
                          <td className="py-3 pr-4">
                            {getString(row, ["goal_type_at_time", "goal_type"]) || "—"}
                          </td>
                          <td className="py-3 pr-4">{formatPounds(getNumber(row, "avg_weight_lb"))}</td>
                          <td className="py-3 pr-4">{formatNumber(getNumber(row, "avg_steps"))}</td>
                          <td className="py-3 pr-4">
                            {getNumber(row, "avg_protein_g") === null
                              ? "—"
                              : `${formatNumber(getNumber(row, "avg_protein_g"))} g`}
                          </td>
                          <td className="py-3 pr-4">
                            {formatMinutesAsHours(getNumber(row, "avg_sleep_minutes"))}
                          </td>
                          <td className="py-3 pr-4">
                            {formatNumber(getNumber(row, "training_sessions_logged"))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold" style={{ color: "#ffffff" }}>
                  Weekly snapshots
                  </h2>
                <p className="mt-1 text-sm text-slate-400">
                  This section is ready for generated weekly analysis rows when they exist.
                </p>
              </div>

              {data.weeklySnapshots.length === 0 ? (
                <EmptyState>
                  No weekly analysis snapshots yet. That is expected at this stage because the
                  table currently has no rows.
                </EmptyState>
              ) : (
                <div className="space-y-4">
                  {data.weeklySnapshots.map((snapshot, index) => {
                    const priorities = formatJsonList(snapshot.top_priorities_json);
                    const watchItems = formatJsonList(snapshot.watch_next_week_json);
                    const riskFlags = formatJsonList(snapshot.risk_flags_json);

                    return (
                      <div
                        key={`${getString(snapshot, ["id", "created_at"]) || "snapshot"}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-white">
                            Week {getString(snapshot, ["week_number"]) || "—"}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {getString(snapshot, ["goal_type_at_time"]) || "No goal recorded"}
                          </p>
                        </div>

                        {typeof snapshot.summary_text === "string" &&
                        snapshot.summary_text.trim().length > 0 ? (
                          <p className="mt-3 text-sm text-slate-300">{snapshot.summary_text}</p>
                        ) : null}

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Top priorities
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
                              {priorities.length > 0 ? (
                                priorities.map((item) => <li key={item}>{item}</li>)
                              ) : (
                                <li>No priorities recorded.</li>
                              )}
                            </ul>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Watch next week
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
                              {watchItems.length > 0 ? (
                                watchItems.map((item) => <li key={item}>{item}</li>)
                              ) : (
                                <li>No watch items recorded.</li>
                              )}
                            </ul>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Risk flags
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
                              {riskFlags.length > 0 ? (
                                riskFlags.map((item) => <li key={item}>{item}</li>)
                              ) : (
                                <li>No risk flags recorded.</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageSection>
  );
}