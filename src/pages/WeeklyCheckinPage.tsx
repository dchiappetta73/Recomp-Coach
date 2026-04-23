import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import { getWeeklyCheckinsForAthlete } from "../services/weeklyCheckinService";
import type { Athlete } from "../types/athlete";
import type { WeeklyCheckin } from "../types/weeklyCheckin";

function formatGoal(goal?: string | null) {
  if (!goal) return "—";

  return goal
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "—";

  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "—";
  return `${formatDate(start)} to ${formatDate(end)}`;
}

function formatNumber(value?: number | null, suffix = "") {
  if (value == null) return "—";
  return `${value.toFixed(0)}${suffix}`;
}

function formatWeight(value?: number | null) {
  if (value == null) return "—";
  return `${value.toFixed(1)} lb`;
}

function formatHoursFromMinutes(minutes?: number | null) {
  if (minutes == null) return "—";
  return `${(minutes / 60).toFixed(1)} hrs`;
}

const styles = {
  stateText: {
    color: "#cbd5e1",
  },
  panel: {
    border: "1px solid #334155",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    padding: "20px",
  } as const,
  mutedText: {
    color: "#94a3b8",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
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
    fontSize: "22px",
    fontWeight: 600,
    color: "#f8fafc",
  },
  subheading: {
    margin: "32px 0 16px",
    fontSize: "18px",
    fontWeight: 700,
    color: "#f8fafc",
  },
  list: {
    display: "grid",
    gap: "16px",
  } as const,
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap" as const,
    marginBottom: "16px",
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
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
    marginTop: "16px",
  } as const,
  bodyText: {
    marginTop: "12px",
    color: "#cbd5e1",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap" as const,
  },
} as const;

export default function WeeklyCheckinPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [weeklyCheckins, setWeeklyCheckins] = useState<WeeklyCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeeklyCheckins() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);

        if (!currentAthlete) {
          setWeeklyCheckins([]);
          return;
        }

        const checkins = await getWeeklyCheckinsForAthlete(currentAthlete.id);
        setWeeklyCheckins(checkins);
      } catch (error) {
        console.error("Failed to load weekly check-ins:", error);
        setErrorMessage("Weekly check-in data could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadWeeklyCheckins();
  }, []);

  const latestCheckin = useMemo(() => weeklyCheckins[0] ?? null, [weeklyCheckins]);
  const recentCheckins = useMemo(() => weeklyCheckins.slice(1, 3), [weeklyCheckins]);

  return (
    <PageSection title="Weekly Check-In">
      {isLoading ? (
        <p style={styles.stateText}>Loading weekly check-ins...</p>
      ) : errorMessage ? (
        <p style={styles.stateText}>{errorMessage}</p>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : weeklyCheckins.length === 0 ? (
        <p style={styles.stateText}>No weekly check-ins found yet.</p>
      ) : (
        <div>
          <div style={styles.panel}>
            <div style={styles.cardHeader}>
              <div>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#f8fafc" }}>
                  Latest Weekly Check-In
                </p>
                <p style={{ ...styles.mutedText, marginTop: "6px" }}>
                  {athlete.name} • {formatDateRange(latestCheckin?.date_start, latestCheckin?.date_end)}
                </p>
              </div>
              <span style={styles.badge}>
                {latestCheckin?.overall_status ?? "No status"}
              </span>
            </div>

            <div style={styles.summaryGrid}>
              <div>
                <div style={styles.metricLabel}>Week</div>
                <div style={styles.metricValue}>
                  {formatNumber(latestCheckin?.week_number)}
                </div>
              </div>
              <div>
                <div style={styles.metricLabel}>Phase</div>
                <div style={styles.metricValue}>
                  {latestCheckin?.phase_label ?? "—"}
                </div>
              </div>
              <div>
                <div style={styles.metricLabel}>Goal</div>
                <div style={styles.metricValue}>
                  {formatGoal(latestCheckin?.goal_type_at_time)}
                </div>
              </div>
              <div>
                <div style={styles.metricLabel}>Avg Weight</div>
                <div style={styles.metricValue}>
                  {formatWeight(latestCheckin?.avg_weight_lb)}
                </div>
              </div>
              <div>
                <div style={styles.metricLabel}>Avg Calories</div>
                <div style={styles.metricValue}>
                  {formatNumber(latestCheckin?.avg_calories)}
                </div>
              </div>
              <div>
                <div style={styles.metricLabel}>Avg Protein</div>
                <div style={styles.metricValue}>
                  {formatNumber(latestCheckin?.avg_protein_g, " g")}
                </div>
              </div>
              <div>
                <div style={styles.metricLabel}>Avg Sleep</div>
                <div style={styles.metricValue}>
                  {formatHoursFromMinutes(latestCheckin?.avg_sleep_minutes)}
                </div>
              </div>
              <div>
                <div style={styles.metricLabel}>Avg Steps</div>
                <div style={styles.metricValue}>
                  {formatNumber(latestCheckin?.avg_steps)}
                </div>
              </div>
              <div>
                <div style={styles.metricLabel}>Training Sessions</div>
                <div style={styles.metricValue}>
                  {formatNumber(latestCheckin?.training_sessions_logged)}
                </div>
              </div>
            </div>

            {latestCheckin?.generated_summary ? (
              <p style={styles.bodyText}>{latestCheckin.generated_summary}</p>
            ) : null}

            {latestCheckin?.observations ? (
              <p style={styles.bodyText}>
                <strong style={{ color: "#f8fafc" }}>Observations:</strong> {latestCheckin.observations}
              </p>
            ) : null}

            {latestCheckin?.recommendations ? (
              <p style={styles.bodyText}>
                <strong style={{ color: "#f8fafc" }}>Recommendations:</strong> {latestCheckin.recommendations}
              </p>
            ) : null}
          </div>

          {recentCheckins.length > 0 ? (
            <>
              <h3 style={styles.subheading}>Recent Check-Ins</h3>
              <div style={styles.list}>
                {recentCheckins.map((checkin) => (
                  <div key={checkin.id} style={styles.panel}>
                    <div style={styles.cardHeader}>
                      <div>
                        <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#f8fafc" }}>
                          {formatDateRange(checkin.date_start, checkin.date_end)}
                        </p>
                        <p style={{ ...styles.mutedText, marginTop: "6px" }}>
                          Week {formatNumber(checkin.week_number)} • {checkin.phase_label ?? "No phase label"}
                        </p>
                      </div>
                      <span style={styles.badge}>{checkin.overall_status ?? "No status"}</span>
                    </div>

                    <div style={styles.detailGrid}>
                      <div>
                        <div style={styles.metricLabel}>Goal</div>
                        <div style={{ marginTop: "6px", color: "#f8fafc" }}>
                          {formatGoal(checkin.goal_type_at_time)}
                        </div>
                      </div>
                      <div>
                        <div style={styles.metricLabel}>Avg Weight</div>
                        <div style={{ marginTop: "6px", color: "#f8fafc" }}>
                          {formatWeight(checkin.avg_weight_lb)}
                        </div>
                      </div>
                      <div>
                        <div style={styles.metricLabel}>Avg Calories</div>
                        <div style={{ marginTop: "6px", color: "#f8fafc" }}>
                          {formatNumber(checkin.avg_calories)}
                        </div>
                      </div>
                      <div>
                        <div style={styles.metricLabel}>Avg Protein</div>
                        <div style={{ marginTop: "6px", color: "#f8fafc" }}>
                          {formatNumber(checkin.avg_protein_g, " g")}
                        </div>
                      </div>
                      <div>
                        <div style={styles.metricLabel}>Avg Sleep</div>
                        <div style={{ marginTop: "6px", color: "#f8fafc" }}>
                          {formatHoursFromMinutes(checkin.avg_sleep_minutes)}
                        </div>
                      </div>
                      <div>
                        <div style={styles.metricLabel}>Avg Steps</div>
                        <div style={{ marginTop: "6px", color: "#f8fafc" }}>
                          {formatNumber(checkin.avg_steps)}
                        </div>
                      </div>
                    </div>

                    {checkin.generated_summary ? (
                      <p style={styles.bodyText}>{checkin.generated_summary}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}
    </PageSection>
  );
}
