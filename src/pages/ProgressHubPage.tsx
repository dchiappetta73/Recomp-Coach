import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import {
  getMeasurementLogsForAthlete,
  getMonthlyRollupsForAthlete,
} from "../services/progressHubService";
import type { Athlete } from "../types/athlete";
import type { MeasurementLog } from "../types/measurementLog";
import type { MonthlyRollup } from "../types/monthlyRollup";

function formatGoal(goal?: string | null) {
  if (!goal) return "-";

  return goal
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthKey(monthKey?: string | null) {
  if (!monthKey) return "-";

  const normalized = monthKey.length === 7 ? `${monthKey}-01` : monthKey;
  const date = new Date(`${normalized}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return monthKey;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatNumber(value?: number | null, suffix = "") {
  if (value == null) return "-";
  return `${value.toFixed(0)}${suffix}`;
}

function formatDecimal(value?: number | null, suffix = "") {
  if (value == null) return "-";
  return `${value.toFixed(1)}${suffix}`;
}

function formatWeight(value?: number | null) {
  if (value == null) return "-";
  return `${value.toFixed(1)} lb`;
}

function formatHoursFromMinutes(minutes?: number | null) {
  if (minutes == null) return "-";
  return `${(minutes / 60).toFixed(1)} hrs`;
}

function formatSlope(value?: number | null, suffix = "") {
  if (value == null) return "-";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}${suffix}`;
}

const styles = {
  stateText: {
    color: "#cbd5e1",
  },
  sectionStack: {
    display: "grid",
    gap: "20px",
  } as const,
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  } as const,
  panel: {
    border: "1px solid #334155",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    padding: "20px",
  } as const,
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap" as const,
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 700,
    color: "#f8fafc",
  },
  subtitle: {
    marginTop: "6px",
    color: "#94a3b8",
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#1e293b",
    color: "#e2e8f0",
    fontSize: "12px",
    fontWeight: 600,
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "14px",
    marginTop: "20px",
  } as const,
  metricLabel: {
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#94a3b8",
  },
  metricValue: {
    marginTop: "6px",
    fontSize: "20px",
    fontWeight: 600,
    color: "#f8fafc",
  },
  bodyText: {
    marginTop: "14px",
    color: "#cbd5e1",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap" as const,
  },
  subheading: {
    margin: "12px 0 0",
    fontSize: "18px",
    fontWeight: 700,
    color: "#f8fafc",
  },
  list: {
    display: "grid",
    gap: "16px",
  } as const,
  focusList: {
    margin: "14px 0 0",
    paddingLeft: "18px",
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
} as const;

export default function ProgressHubPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [monthlyRollups, setMonthlyRollups] = useState<MonthlyRollup[]>([]);
  const [measurementLogs, setMeasurementLogs] = useState<MeasurementLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgressHub() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);

        if (!currentAthlete) {
          setMonthlyRollups([]);
          setMeasurementLogs([]);
          return;
        }

        const [rollups, measurements] = await Promise.all([
          getMonthlyRollupsForAthlete(currentAthlete.id),
          getMeasurementLogsForAthlete(currentAthlete.id),
        ]);

        setMonthlyRollups(rollups);
        setMeasurementLogs(measurements);
      } catch (error) {
        console.error("Failed to load progress hub:", error);
        setErrorMessage("Progress Hub data could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProgressHub();
  }, []);

  const latestRollup = useMemo(() => monthlyRollups[0] ?? null, [monthlyRollups]);
  const recentRollups = useMemo(() => monthlyRollups.slice(1, 3), [monthlyRollups]);
  const latestMeasurement = useMemo(() => measurementLogs[0] ?? null, [measurementLogs]);
  const earlierMeasurement = useMemo(() => measurementLogs[1] ?? null, [measurementLogs]);

  const hasAnyData = monthlyRollups.length > 0 || measurementLogs.length > 0;

  return (
    <PageSection title="Progress Hub">
      {isLoading ? (
        <p style={styles.stateText}>Loading progress data...</p>
      ) : errorMessage ? (
        <p style={styles.stateText}>{errorMessage}</p>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : !hasAnyData ? (
        <p style={styles.stateText}>No monthly rollups or measurement logs found yet.</p>
      ) : (
        <div style={styles.sectionStack}>
          <div style={styles.twoColumn}>
            {latestRollup ? (
              <div style={styles.panel}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.title}>Latest Monthly Rollup</p>
                    <p style={styles.subtitle}>
                      {athlete.name} | {formatMonthKey(latestRollup.month_key)}
                    </p>
                  </div>
                  <span style={styles.badge}>
                    {formatGoal(latestRollup.goal_type_at_time)}
                  </span>
                </div>

                <div style={styles.metricGrid}>
                  <div>
                    <div style={styles.metricLabel}>Avg Weight</div>
                    <div style={styles.metricValue}>
                      {formatWeight(latestRollup.avg_weight_lb)}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Avg Sleep</div>
                    <div style={styles.metricValue}>
                      {formatHoursFromMinutes(latestRollup.avg_sleep_minutes)}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Avg Resting HR</div>
                    <div style={styles.metricValue}>
                      {formatNumber(latestRollup.avg_resting_hr, " bpm")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Avg Steps</div>
                    <div style={styles.metricValue}>
                      {formatNumber(latestRollup.avg_steps)}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Avg Protein</div>
                    <div style={styles.metricValue}>
                      {formatNumber(latestRollup.avg_protein_g, " g")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Training Sessions</div>
                    <div style={styles.metricValue}>
                      {formatNumber(latestRollup.training_sessions_logged)}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Weight Slope</div>
                    <div style={styles.metricValue}>
                      {formatSlope(latestRollup.weight_slope)}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>RHR Slope</div>
                    <div style={styles.metricValue}>
                      {formatSlope(latestRollup.rhr_slope)}
                    </div>
                  </div>
                </div>

                {latestRollup.summary_text ? (
                  <p style={styles.bodyText}>{latestRollup.summary_text}</p>
                ) : null}

                {latestRollup.focus_priorities_json &&
                latestRollup.focus_priorities_json.length > 0 ? (
                  <>
                    <p style={styles.subheading}>Focus Priorities</p>
                    <ul style={styles.focusList}>
                      {latestRollup.focus_priorities_json.slice(0, 4).map((priority) => (
                        <li key={priority}>{priority}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            ) : null}

            {latestMeasurement ? (
              <div style={styles.panel}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.title}>Latest Measurement Set</p>
                    <p style={styles.subtitle}>
                      {formatDate(latestMeasurement.measurement_date)}
                    </p>
                  </div>
                  <span style={styles.badge}>
                    Week {formatNumber(latestMeasurement.week_number)}
                  </span>
                </div>

                <div style={styles.metricGrid}>
                  <div>
                    <div style={styles.metricLabel}>Goal</div>
                    <div style={styles.metricValue}>
                      {formatGoal(latestMeasurement.goal_type_at_time)}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Navel</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(latestMeasurement.navel_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Lower Ab</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(latestMeasurement.lower_ab_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Chest</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(latestMeasurement.chest_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Hips</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(latestMeasurement.hips_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Left Arm</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(latestMeasurement.left_arm_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Right Arm</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(latestMeasurement.right_arm_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Left Thigh</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(latestMeasurement.left_thigh_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Right Thigh</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(latestMeasurement.right_thigh_in, " in")}
                    </div>
                  </div>
                </div>

                {latestMeasurement.notes ? (
                  <p style={styles.bodyText}>{latestMeasurement.notes}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {recentRollups.length > 0 ? (
            <div>
              <h3 style={styles.subheading}>Recent Monthly Rollups</h3>
              <div style={styles.list}>
                {recentRollups.map((rollup) => (
                  <div key={rollup.id} style={styles.panel}>
                    <div style={styles.cardHeader}>
                      <div>
                        <p style={{ ...styles.title, fontSize: "18px" }}>
                          {formatMonthKey(rollup.month_key)}
                        </p>
                        <p style={styles.subtitle}>{formatGoal(rollup.goal_type_at_time)}</p>
                      </div>
                    </div>

                    <div style={styles.metricGrid}>
                      <div>
                        <div style={styles.metricLabel}>Avg Weight</div>
                        <div style={styles.metricValue}>
                          {formatWeight(rollup.avg_weight_lb)}
                        </div>
                      </div>
                      <div>
                        <div style={styles.metricLabel}>Avg Sleep</div>
                        <div style={styles.metricValue}>
                          {formatHoursFromMinutes(rollup.avg_sleep_minutes)}
                        </div>
                      </div>
                      <div>
                        <div style={styles.metricLabel}>Avg Steps</div>
                        <div style={styles.metricValue}>
                          {formatNumber(rollup.avg_steps)}
                        </div>
                      </div>
                      <div>
                        <div style={styles.metricLabel}>Avg Protein</div>
                        <div style={styles.metricValue}>
                          {formatNumber(rollup.avg_protein_g, " g")}
                        </div>
                      </div>
                    </div>

                    {rollup.summary_text ? (
                      <p style={styles.bodyText}>{rollup.summary_text}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {earlierMeasurement ? (
            <div>
              <h3 style={styles.subheading}>Earlier Measurement Entry</h3>
              <div style={styles.panel}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={{ ...styles.title, fontSize: "18px" }}>
                      {formatDate(earlierMeasurement.measurement_date)}
                    </p>
                    <p style={styles.subtitle}>
                      Week {formatNumber(earlierMeasurement.week_number)} | {formatGoal(earlierMeasurement.goal_type_at_time)}
                    </p>
                  </div>
                </div>

                <div style={styles.metricGrid}>
                  <div>
                    <div style={styles.metricLabel}>Navel</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(earlierMeasurement.navel_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Lower Ab</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(earlierMeasurement.lower_ab_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Chest</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(earlierMeasurement.chest_in, " in")}
                    </div>
                  </div>
                  <div>
                    <div style={styles.metricLabel}>Hips</div>
                    <div style={styles.metricValue}>
                      {formatDecimal(earlierMeasurement.hips_in, " in")}
                    </div>
                  </div>
                </div>

                {earlierMeasurement.notes ? (
                  <p style={styles.bodyText}>{earlierMeasurement.notes}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </PageSection>
  );
}
