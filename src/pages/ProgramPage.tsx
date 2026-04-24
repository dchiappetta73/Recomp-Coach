import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import { getProgramOverviewForAthlete, type ProgramWeekGroup } from "../services/programService";
import type { Athlete } from "../types/athlete";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  panel: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: "16px",
    padding: "20px",
  },
  heroTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "28px",
    fontWeight: 700,
    lineHeight: 1.15,
  },
  subtitle: {
    margin: "6px 0 0 0",
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  helperText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginTop: "16px",
  },
  metricCard: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(2, 6, 23, 0.35)",
    borderRadius: "14px",
    padding: "14px",
  },
  metricLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  metricValue: {
    margin: "8px 0 0 0",
    color: "#f8fafc",
    fontSize: "24px",
    fontWeight: 700,
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  buttonPrimary: {
    background: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  weekCard: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: "16px",
    padding: "20px",
  },
  weekHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  weekTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "24px",
    fontWeight: 700,
  },
  weekBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(79, 70, 229, 0.18)",
    color: "#c7d2fe",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  dayStack: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "16px",
  },
  dayCard: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(2, 6, 23, 0.35)",
    borderRadius: "14px",
    padding: "16px",
  },
  dayTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: 700,
  },
  sessionStack: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "14px",
  },
  sessionCard: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: "12px",
    padding: "14px",
  },
  sessionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  sessionTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "17px",
    fontWeight: 700,
  },
  sessionMeta: {
    margin: "4px 0 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  sessionBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#1e293b",
    color: "#e2e8f0",
    fontSize: "12px",
    fontWeight: 700,
  },
  exerciseList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "12px",
  },
  exerciseRow: {
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "10px 12px",
  },
  exerciseName: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: 700,
  },
  exerciseMeta: {
    margin: "4px 0 0 0",
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  stateText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "15px",
  },
};

function formatExercisePrescription(exercise: {
  prescribed_sets?: number | null;
  prescribed_reps?: string | null;
  prescribed_rpe?: number | null;
}) {
  const setText =
    exercise.prescribed_sets != null && exercise.prescribed_reps
      ? `${exercise.prescribed_sets} x ${exercise.prescribed_reps}`
      : exercise.prescribed_sets != null
      ? `${exercise.prescribed_sets} sets`
      : exercise.prescribed_reps ?? "No prescription";

  if (exercise.prescribed_rpe != null) {
    return `${setText} • RPE ${exercise.prescribed_rpe}`;
  }

  return setText;
}

function getPlannedSessionKey(session: {
  week_no: number;
  day_no: number;
  session_name: string;
  exercises: Array<{ id: string }>;
}): string {
  return [
    session.week_no,
    session.day_no,
    session.session_name,
    session.exercises[0]?.id ?? "",
  ].join("__");
}

function getSelectedWorkoutStorageKey(athleteId: string): string {
  return `recompCoach:selectedWorkoutKey:${athleteId}`;
}

function storeSelectedWorkoutKey(athleteId: string, workoutKey: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getSelectedWorkoutStorageKey(athleteId), workoutKey);
  } catch {
    // Ignore storage failures so navigation still works.
  }
}

export default function ProgramPage() {
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [programWeeks, setProgramWeeks] = useState<ProgramWeekGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgramPage() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);

        if (!currentAthlete) {
          setProgramWeeks([]);
          return;
        }

        const weeks = await getProgramOverviewForAthlete(currentAthlete.id);
        setProgramWeeks(weeks);
      } catch (error) {
        console.error("Failed to load program page:", error);
        setErrorMessage("Program data could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProgramPage();
  }, []);

  const totalWeeks = useMemo(() => programWeeks.length, [programWeeks]);

  const totalSessions = useMemo(() => {
    return programWeeks.reduce((weekTotal, week) => {
      return (
        weekTotal +
        week.days.reduce((dayTotal, day) => dayTotal + day.sessions.length, 0)
      );
    }, 0);
  }, [programWeeks]);

  const totalExercises = useMemo(() => {
    return programWeeks.reduce((weekTotal, week) => {
      return (
        weekTotal +
        week.days.reduce(
          (dayTotal, day) =>
            dayTotal +
            day.sessions.reduce(
              (sessionTotal, session) => sessionTotal + session.exercises.length,
              0
            ),
          0
        )
      );
    }, 0);
  }, [programWeeks]);

  const nextSession = useMemo(() => {
    return programWeeks[0]?.days[0]?.sessions[0] ?? null;
  }, [programWeeks]);

  function openWorkout(session: NonNullable<typeof nextSession>) {
    if (athlete) {
      storeSelectedWorkoutKey(athlete.id, getPlannedSessionKey(session));
    }

    navigate("/workout");
  }

  return (
    <PageSection title="Program">
      {isLoading ? (
        <p style={styles.stateText}>Loading program data...</p>
      ) : errorMessage ? (
        <p style={styles.stateText}>{errorMessage}</p>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : programWeeks.length === 0 ? (
        <p style={styles.stateText}>No program rows found yet.</p>
      ) : (
        <div style={styles.stack}>
          <div style={styles.panel}>
            <p style={styles.heroTitle}>Program Overview</p>
            <p style={styles.subtitle}>
              Planned training structure grouped by week, day, and session. This
              page is the clear preview layer before workout execution.
            </p>

            <div style={styles.metricGrid}>
              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Weeks</p>
                <p style={styles.metricValue}>{totalWeeks}</p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Sessions</p>
                <p style={styles.metricValue}>{totalSessions}</p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Exercises</p>
                <p style={styles.metricValue}>{totalExercises}</p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Next Session</p>
                <p style={styles.metricValue}>
                  {nextSession ? nextSession.session_name : "—"}
                </p>
              </div>
            </div>

            {nextSession ? (
              <div style={styles.actionRow}>
                <button
                  type="button"
                  onClick={() => openWorkout(nextSession)}
                  style={styles.buttonPrimary}
                >
                  Open Next Workout
                </button>
              </div>
            ) : null}
          </div>

          {programWeeks.map((week) => (
            <div key={`${week.weekNo}-${week.block}`} style={styles.weekCard}>
              <div style={styles.weekHeader}>
                <div>
                  <p style={styles.weekTitle}>Week {week.weekNo}</p>
                  <p style={styles.subtitle}>
                    {week.block} block • {week.days.length} training day
                    {week.days.length === 1 ? "" : "s"}
                  </p>
                </div>

                <span style={styles.weekBadge}>{week.block}</span>
              </div>

              <div style={styles.dayStack}>
                {week.days.map((day) => (
                  <div key={`week-${week.weekNo}-day-${day.dayNo}`} style={styles.dayCard}>
                    <p style={styles.dayTitle}>Day {day.dayNo}</p>

                    <div style={styles.sessionStack}>
                      {day.sessions.map((session) => (
                        <div
                          key={`${session.week_no}-${session.day_no}-${session.session_name}`}
                          style={styles.sessionCard}
                        >
                          <div style={styles.sessionHeader}>
                            <div>
                              <p style={styles.sessionTitle}>{session.session_name}</p>
                              <p style={styles.sessionMeta}>
                                {session.exercises.length} exercise
                                {session.exercises.length === 1 ? "" : "s"} planned
                              </p>
                            </div>

                            <span style={styles.sessionBadge}>Ready</span>
                          </div>

                          <div style={styles.exerciseList}>
                            {session.exercises.map((exercise) => (
                              <div key={exercise.id} style={styles.exerciseRow}>
                                <p style={styles.exerciseName}>
                                  {exercise.exercise_order != null
                                    ? `${exercise.exercise_order}. `
                                    : ""}
                                  {exercise.exercise_name}
                                </p>
                                <p style={styles.exerciseMeta}>
                                  {formatExercisePrescription(exercise)}
                                </p>
                                {exercise.prescribed_notes ? (
                                  <p style={styles.exerciseMeta}>
                                    {exercise.prescribed_notes}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>

                          <div style={styles.actionRow}>
                            <button
                              type="button"
                              onClick={() => openWorkout(session)}
                              style={styles.buttonPrimary}
                            >
                              Open Workout
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageSection>
  );
}
