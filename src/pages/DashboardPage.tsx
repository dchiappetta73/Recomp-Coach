import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import { getDailyMetricsForRange } from "../services/dailyMetricsService";
import type { Athlete } from "../types/athlete";
import type { DailyMetric } from "../types/dailyMetrics";
import type { CSSProperties } from "react";

function formatGoal(goal?: string | null) {
  if (!goal) return "—";

  return goal
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatWeight(weight?: number | null) {
  if (weight == null) return "—";
  return `${weight.toFixed(1)} lb`;
}

function formatHoursFromMinutes(minutes?: number | null) {
  if (minutes == null) return "—";
  return `${(minutes / 60).toFixed(1)} hrs`;
}

function formatNumber(value?: number | null, suffix = "") {
  if (value == null) return "—";
  return `${value.toFixed(0)}${suffix}`;
}

function formatMetricDate(dateString?: string | null) {
  if (!dateString) return "—";

  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAverage(values: Array<number | null | undefined>) {
  const validValues = values.filter((value): value is number => value != null);

  if (validValues.length === 0) return null;

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function getDateStringDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
};

const styles: Record<string, CSSProperties> = {
  pageStack: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  banner: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: "16px",
    padding: "20px",
  },
  bannerText: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  gridFour: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  lowerGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
    gap: "16px",
    alignItems: "start",
  },
  panel: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: "16px",
    padding: "20px",
  },
  panelHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  panelTitle: {
    color: "#f8fafc",
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
  },
  panelSubtle: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },
  card: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: "16px",
    padding: "18px",
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: 0,
  },
  cardValue: {
    color: "#f8fafc",
    fontSize: "30px",
    fontWeight: 700,
    lineHeight: 1.15,
    margin: "10px 0 0 0",
  },
  cardHelper: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "8px 0 0 0",
  },
  listStack: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  metricRow: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(2, 6, 23, 0.35)",
    borderRadius: "12px",
    padding: "16px",
  },
  metricTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  metricDate: {
    color: "#f8fafc",
    fontSize: "16px",
    fontWeight: 600,
    margin: 0,
  },
  metricGoal: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "6px 0 0 0",
  },
  metricMiniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(90px, 1fr))",
    gap: "12px 20px",
  },
  metricMiniLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    margin: 0,
  },
  metricMiniValue: {
    color: "#f8fafc",
    fontSize: "15px",
    fontWeight: 600,
    margin: "4px 0 0 0",
  },
  note: {
    color: "#cbd5e1",
    fontSize: "14px",
    margin: "14px 0 0 0",
  },
  snapshotStack: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "16px",
  },
  snapshotLabel: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },
  snapshotValueLarge: {
    color: "#f8fafc",
    fontSize: "24px",
    fontWeight: 700,
    margin: "6px 0 0 0",
  },
  snapshotValue: {
    color: "#f8fafc",
    fontSize: "15px",
    margin: "6px 0 0 0",
    lineHeight: 1.5,
  },
  stateText: {
    color: "#cbd5e1",
    fontSize: "15px",
    margin: 0,
  },
};

function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={styles.cardValue}>{value}</p>
      {helper ? <p style={styles.cardHelper}>{helper}</p> : null}
    </div>
  );
}

export default function DashboardPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);

        if (!currentAthlete) {
          setDailyMetrics([]);
          return;
        }

        const startDate = getDateStringDaysAgo(6);
        const endDate = getDateStringDaysAgo(0);

        const metrics = await getDailyMetricsForRange(
          currentAthlete.id,
          startDate,
          endDate
        );

        setDailyMetrics(metrics);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setErrorMessage("Dashboard data could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const latestMetric = useMemo(() => {
    if (dailyMetrics.length === 0) return null;
    return dailyMetrics[dailyMetrics.length - 1];
  }, [dailyMetrics]);

  const averageSleepMinutes = useMemo(() => {
    return getAverage(dailyMetrics.map((metric) => metric.sleep_minutes));
  }, [dailyMetrics]);

  const averageSteps = useMemo(() => {
    return getAverage(dailyMetrics.map((metric) => metric.steps));
  }, [dailyMetrics]);

  const averageCalories = useMemo(() => {
    return getAverage(dailyMetrics.map((metric) => metric.calories));
  }, [dailyMetrics]);

  const averageProtein = useMemo(() => {
    return getAverage(dailyMetrics.map((metric) => metric.protein_g));
  }, [dailyMetrics]);

  const recentMetrics = useMemo(() => {
    return [...dailyMetrics].slice(-3).reverse();
  }, [dailyMetrics]);

  return (
    <PageSection title="Dashboard">
      {isLoading ? (
        <p style={styles.stateText}>Loading dashboard data...</p>
      ) : errorMessage ? (
        <p style={styles.stateText}>{errorMessage}</p>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : (
        <div style={styles.pageStack}>
          <div style={styles.banner}>
            <p style={styles.bannerText}>
              Read-only dashboard connection is active. This page is showing live
              athlete data plus the last 7 days of daily metrics.
            </p>
          </div>

          <div style={styles.gridFour}>
            <MetricCard
              label="Athlete"
              value={athlete.name}
              helper="Current profile loaded"
            />
            <MetricCard
              label="Current Goal"
              value={formatGoal(athlete.current_goal)}
              helper="Goal-aware platform structure"
            />
            <MetricCard
              label="Latest Metric Date"
              value={formatMetricDate(latestMetric?.metric_date)}
              helper="Most recent daily_metrics row"
            />
            <MetricCard
              label="Daily Metrics Found"
              value={String(dailyMetrics.length)}
              helper="Rows returned for the last 7 days"
            />
          </div>

          <div style={styles.gridFour}>
            <MetricCard
              label="Latest Bodyweight"
              value={formatWeight(latestMetric?.weight_lb)}
              helper="Most recent recorded weight"
            />
            <MetricCard
              label="Average Sleep"
              value={formatHoursFromMinutes(averageSleepMinutes)}
              helper="7-day average"
            />
            <MetricCard
              label="Average Steps"
              value={formatNumber(averageSteps)}
              helper="7-day average"
            />
            <MetricCard
              label="Average Calories"
              value={formatNumber(averageCalories)}
              helper="7-day average"
            />
          </div>

          <div style={styles.lowerGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeaderRow}>
                <p style={styles.panelTitle}>Recent Daily Metrics</p>
                <p style={styles.panelSubtle}>Last 3 entries</p>
              </div>

              {recentMetrics.length === 0 ? (
                <p style={styles.stateText}>No recent daily metrics found.</p>
              ) : (
                <div style={styles.listStack}>
                  {recentMetrics.map((metric) => (
                    <div key={metric.id} style={styles.metricRow}>
                      <div style={styles.metricTopRow}>
                        <div>
                          <p style={styles.metricDate}>
                            {formatMetricDate(metric.metric_date)}
                          </p>
                          <p style={styles.metricGoal}>
                            Goal at time: {formatGoal(metric.goal_type_at_time)}
                          </p>
                        </div>

                        <div style={styles.metricMiniGrid}>
                          <div>
                            <p style={styles.metricMiniLabel}>Weight</p>
                            <p style={styles.metricMiniValue}>
                              {formatWeight(metric.weight_lb)}
                            </p>
                          </div>
                          <div>
                            <p style={styles.metricMiniLabel}>Sleep</p>
                            <p style={styles.metricMiniValue}>
                              {formatHoursFromMinutes(metric.sleep_minutes)}
                            </p>
                          </div>
                          <div>
                            <p style={styles.metricMiniLabel}>Steps</p>
                            <p style={styles.metricMiniValue}>
                              {formatNumber(metric.steps)}
                            </p>
                          </div>
                          <div>
                            <p style={styles.metricMiniLabel}>Calories</p>
                            <p style={styles.metricMiniValue}>
                              {formatNumber(metric.calories)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {metric.manual_notes ? (
                        <p style={styles.note}>Note: {metric.manual_notes}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.panel}>
              <p style={styles.panelTitle}>Read-Only Snapshot</p>

              <div style={styles.snapshotStack}>
                <div>
                  <p style={styles.snapshotLabel}>Average Protein</p>
                  <p style={styles.snapshotValueLarge}>
                    {formatNumber(averageProtein, " g")}
                  </p>
                </div>

                <div>
                  <p style={styles.snapshotLabel}>Equipment Profile</p>
                  <p style={styles.snapshotValue}>
                    {athlete.equipment_profile ?? "—"}
                  </p>
                </div>

                <div>
                  <p style={styles.snapshotLabel}>Experience Level</p>
                  <p style={styles.snapshotValue}>
                    {athlete.experience_level ?? "—"}
                  </p>
                </div>

                <div>
                  <p style={styles.snapshotLabel}>Injury Notes</p>
                  <p style={styles.snapshotValue}>
                    {athlete.injury_notes ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageSection>
  );
}