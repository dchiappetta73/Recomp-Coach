import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import {
  createWorkoutSession,
  finishWorkoutSession,
  getInProgressWorkoutSession,
  getPlannedWorkoutSessionsForAthlete,
} from "../services/workoutSessionService";
import {
  createLiftLogSetEntry,
  getLiftLogsForWorkoutSession,
  type WorkoutLiftLogEntry,
} from "../services/workoutLiftLogService";
import type {
  PlannedWorkoutExercise,
  PlannedWorkoutSession,
  WorkoutSession,
} from "../types/workoutSession";
import type { Athlete } from "../types/athlete";
import type { CSSProperties } from "react";

type SetDraft = {
  reps: string;
  weight: string;
  rpe: string;
  notes: string;
};

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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
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
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#1e293b",
    color: "#e2e8f0",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  stickyFooter: {
    position: "sticky",
    bottom: "16px",
    zIndex: 20,
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "4px",
  },
  stickyFooterInner: {
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(15, 23, 42, 0.94)",
    backdropFilter: "blur(8px)",
    borderRadius: "14px",
    padding: "12px",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
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
  buttonSecondary: {
    background: "rgba(255, 255, 255, 0.06)",
    color: "#e2e8f0",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  helperText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  previewList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  exerciseCard: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(2, 6, 23, 0.35)",
    borderRadius: "14px",
    padding: "16px",
  },
  exerciseTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  exerciseName: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: 700,
  },
  metaText: {
    margin: "4px 0 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  smallBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "rgba(79, 70, 229, 0.18)",
    color: "#c7d2fe",
    fontSize: "12px",
    fontWeight: 700,
  },
  exerciseNotes: {
    margin: "10px 0 0 0",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginTop: "14px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "14px",
  },
  textArea: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "14px",
    minHeight: "76px",
    resize: "vertical",
  },
  setLogList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "14px",
  },
  setLogItem: {
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "10px 12px",
  },
  setLogText: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: "14px",
  },
  stateText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "15px",
  },
};

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getSessionStatusLabel(status?: string | null) {
  if (!status) return "Not Started";
  if (status === "in_progress") return "In Progress";
  if (status === "completed") return "Completed";
  return status.replaceAll("_", " ");
}

function createEmptyDraft(): SetDraft {
  return {
    reps: "",
    weight: "",
    rpe: "",
    notes: "",
  };
}

export default function WorkoutPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [plannedSessions, setPlannedSessions] = useState<PlannedWorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [liftLogs, setLiftLogs] = useState<WorkoutLiftLogEntry[]>([]);
  const [setDrafts, setSetDrafts] = useState<Record<string, SetDraft>>({});
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isFinishingSession, setIsFinishingSession] = useState(false);
  const [isSavingSetForExercise, setIsSavingSetForExercise] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkoutPage() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);

        if (!currentAthlete) {
          setPlannedSessions([]);
          setActiveSession(null);
          setLiftLogs([]);
          return;
        }

        const [planned, inProgress] = await Promise.all([
          getPlannedWorkoutSessionsForAthlete(currentAthlete.id),
          getInProgressWorkoutSession(currentAthlete.id),
        ]);

        setPlannedSessions(planned);
        setActiveSession(inProgress);

        if (inProgress) {
          const logs = await getLiftLogsForWorkoutSession(inProgress.id);
          setLiftLogs(logs);
        } else {
          setLiftLogs([]);
        }
      } catch (error) {
        console.error("Failed to load workout page:", error);
        setErrorMessage("Workout data could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadWorkoutPage();
  }, []);

  const plannedSession = useMemo(() => {
    if (activeSession) {
      return (
        plannedSessions.find(
          (session) =>
            session.week_no === activeSession.week_number &&
            session.day_no === activeSession.day_number &&
            session.session_name === activeSession.session_name
        ) ?? null
      );
    }

    return plannedSessions[0] ?? null;
  }, [plannedSessions, activeSession]);

  const exerciseLogsByName = useMemo(() => {
    const map = new Map<string, WorkoutLiftLogEntry[]>();

    for (const log of liftLogs) {
      const current = map.get(log.exercise_name) ?? [];
      current.push(log);
      map.set(log.exercise_name, current);
    }

    return map;
  }, [liftLogs]);

  const completedExerciseCount = useMemo(() => {
    if (!plannedSession) return 0;

    return plannedSession.exercises.filter((exercise) => {
      const logs = exerciseLogsByName.get(exercise.exercise_name) ?? [];
      return logs.length > 0;
    }).length;
  }, [plannedSession, exerciseLogsByName]);

  const averageRpe = useMemo(() => {
    const validRpes = liftLogs
      .map((log) => log.rpe)
      .filter((value): value is number => value != null);

    if (validRpes.length === 0) return null;

    return validRpes.reduce((sum, value) => sum + value, 0) / validRpes.length;
  }, [liftLogs]);

  const sessionNotes = useMemo(() => {
    const noteLines = liftLogs
      .filter((log) => log.notes && log.notes.trim().length > 0)
      .map((log) => `${log.exercise_name} S${log.set_no}: ${log.notes?.trim()}`);

    return noteLines.join("\n");
  }, [liftLogs]);

  const currentExerciseName = useMemo(() => {
    if (!plannedSession) return null;

    return (
      plannedSession.exercises.find((exercise) => {
        const logs = exerciseLogsByName.get(exercise.exercise_name) ?? [];
        const plannedSets = exercise.prescribed_sets ?? 0;
        return logs.length < plannedSets || plannedSets === 0;
      })?.exercise_name ??
      plannedSession.exercises[plannedSession.exercises.length - 1]?.exercise_name ??
      null
    );
  }, [plannedSession, exerciseLogsByName]);

  const upcomingExercises = useMemo(() => {
    if (!plannedSession || !currentExerciseName) return [];

    const currentIndex = plannedSession.exercises.findIndex(
      (exercise) => exercise.exercise_name === currentExerciseName
    );

    if (currentIndex < 0) return plannedSession.exercises.slice(0, 3);

    return plannedSession.exercises.slice(currentIndex + 1, currentIndex + 4);
  }, [plannedSession, currentExerciseName]);

  useEffect(() => {
    if (selectedExerciseName) return;
    if (!plannedSession) return;
    if (plannedSession.exercises.length === 0) return;

    setSelectedExerciseName(currentExerciseName ?? plannedSession.exercises[0].exercise_name);
  }, [plannedSession, currentExerciseName, selectedExerciseName]);

  function getDraftForExercise(exerciseName: string): SetDraft {
    return setDrafts[exerciseName] ?? createEmptyDraft();
  }

  function updateDraft(exerciseName: string, field: keyof SetDraft, value: string) {
    setSetDrafts((prev) => ({
      ...prev,
      [exerciseName]: {
        ...(prev[exerciseName] ?? createEmptyDraft()),
        [field]: value,
      },
    }));
  }

  async function handleStartWorkout() {
    if (!athlete || !plannedSession || plannedSession.exercises.length === 0) return;

    try {
      setIsStartingSession(true);
      setErrorMessage(null);

      const createdSession = await createWorkoutSession({
        athleteId: athlete.id,
        programTemplateId: plannedSession.exercises[0]?.id ?? null,
        sessionDate: getTodayDateString(),
        weekNumber: plannedSession.week_no,
        blockLabel: plannedSession.block,
        dayNumber: plannedSession.day_no,
        sessionName: plannedSession.session_name,
        goalTypeAtTime: athlete.current_goal ?? null,
        plannedExerciseCount: plannedSession.exercises.length,
      });

      setActiveSession(createdSession);
      setLiftLogs([]);
    } catch (error) {
      console.error("Failed to start workout session:", error);
      setErrorMessage("Workout session could not be started.");
    } finally {
      setIsStartingSession(false);
    }
  }

  async function handleSaveSet(exercise: PlannedWorkoutExercise) {
    if (!athlete || !activeSession || !plannedSession) return;

    const draft = getDraftForExercise(exercise.exercise_name);
    const existingLogs = exerciseLogsByName.get(exercise.exercise_name) ?? [];
    const nextSetNo = existingLogs.length + 1;

    const repsValue = draft.reps.trim().length > 0 ? Number(draft.reps.trim()) : null;
    const weightValue = draft.weight.trim().length > 0 ? Number(draft.weight.trim()) : null;
    const rpeValue = draft.rpe.trim().length > 0 ? Number(draft.rpe.trim()) : null;

    if (repsValue == null || Number.isNaN(repsValue)) {
      setErrorMessage(`Enter reps for ${exercise.exercise_name} before saving.`);
      return;
    }

    try {
      setIsSavingSetForExercise(exercise.exercise_name);
      setErrorMessage(null);

      const savedLog = await createLiftLogSetEntry({
        athleteId: athlete.id,
        entryDate: getTodayDateString(),
        weekNo: plannedSession.week_no,
        block: plannedSession.block,
        dayNo: plannedSession.day_no,
        sessionName: plannedSession.session_name,
        exerciseName: exercise.exercise_name,
        setNo: nextSetNo,
        plannedSets: exercise.prescribed_sets ?? null,
        plannedReps: exercise.prescribed_reps ?? null,
        completedReps: repsValue,
        completedWeight:
          weightValue != null && !Number.isNaN(weightValue) ? weightValue : null,
        rpe: rpeValue != null && !Number.isNaN(rpeValue) ? rpeValue : null,
        notes: draft.notes.trim() || null,
        workoutSessionId: activeSession.id,
      });

      setLiftLogs((prev) => [...prev, savedLog]);
      setSetDrafts((prev) => ({
        ...prev,
        [exercise.exercise_name]: createEmptyDraft(),
      }));
    } catch (error) {
      console.error("Failed to save workout set:", error);
      setErrorMessage(`Set could not be saved for ${exercise.exercise_name}.`);
    } finally {
      setIsSavingSetForExercise(null);
    }
  }

  async function handleFinishWorkout() {
    if (!activeSession) return;

    try {
      setIsFinishingSession(true);
      setErrorMessage(null);

      const completedSession = await finishWorkoutSession({
        workoutSessionId: activeSession.id,
        completedExerciseCount,
        totalSets: liftLogs.length,
        avgRpe: averageRpe,
        notes: sessionNotes || null,
      });

      setActiveSession(completedSession);
    } catch (error) {
      console.error("Failed to finish workout session:", error);
      setErrorMessage("Workout session could not be finished.");
    } finally {
      setIsFinishingSession(false);
    }
  }

  return (
    <PageSection title="Workout">
      {isLoading ? (
        <p style={styles.stateText}>Loading workout data...</p>
      ) : errorMessage ? (
        <div style={styles.stack}>
          <p style={styles.stateText}>{errorMessage}</p>
          {!plannedSession ? <p style={styles.stateText}>No planned workout found yet.</p> : null}
        </div>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : !plannedSession ? (
        <p style={styles.stateText}>No planned workout found yet.</p>
      ) : (
        <div style={styles.stack}>
          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>{plannedSession.session_name}</p>
                <p style={styles.subtitle}>
                  Week {plannedSession.week_no} • {plannedSession.block} • Day {plannedSession.day_no}
                </p>
                <p style={styles.subtitle}>
                  Current exercise: {currentExerciseName ?? "—"}
                </p>
              </div>

              <span style={styles.statusBadge}>
                {getSessionStatusLabel(activeSession?.status ?? "not_started")}
              </span>
            </div>

            <div style={styles.stack}>
              <p style={styles.helperText}>
                Full workout visibility is active in this v1 slice. You can see the whole
                workout, log sets for any exercise, and move between exercises without losing
                session context.
              </p>

              <p style={styles.helperText}>
                Progress: {completedExerciseCount} / {plannedSession.exercises.length} exercises
                touched • {liftLogs.length} sets logged
              </p>

              {upcomingExercises.length > 0 ? (
                <p style={styles.helperText}>
                  Coming up: {upcomingExercises.map((exercise) => exercise.exercise_name).join(", ")}
                </p>
              ) : null}
            </div>

            <div style={styles.actionRow}>
              {!activeSession ? (
                <button
                  type="button"
                  onClick={handleStartWorkout}
                  disabled={isStartingSession}
                  style={{
                    ...styles.buttonPrimary,
                    ...(isStartingSession ? styles.buttonDisabled : {}),
                  }}
                >
                  {isStartingSession ? "Starting..." : "Start Workout"}
                </button>
              ) : activeSession.status === "in_progress" ? (
                <>
                  <button type="button" style={styles.buttonPrimary}>
                    Resume Workout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  style={{ ...styles.buttonSecondary, ...styles.buttonDisabled }}
                >
                  Workout Completed
                </button>
              )}
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>Full Workout Preview</p>
                <p style={styles.subtitle}>
                  Entire workout visible for planning, pacing, and multi-exercise logging.
                </p>
              </div>
            </div>

            <div style={styles.previewList}>
              {plannedSession.exercises.map((exercise) => {
                const logs = exerciseLogsByName.get(exercise.exercise_name) ?? [];
                const draft = getDraftForExercise(exercise.exercise_name);
                const isSelected = selectedExerciseName === exercise.exercise_name;

                return (
                  <div key={exercise.id} style={styles.exerciseCard}>
                    <div style={styles.exerciseTop}>
                      <div>
                        <p style={styles.exerciseName}>{exercise.exercise_name}</p>
                        <p style={styles.metaText}>
                          Order {exercise.exercise_order ?? "—"} • Planned:{" "}
                          {exercise.prescribed_sets ?? "—"} x{" "}
                          {exercise.prescribed_reps ?? "—"}
                          {exercise.prescribed_rpe != null
                            ? ` • RPE ${exercise.prescribed_rpe}`
                            : ""}
                        </p>
                      </div>

                      <span style={styles.smallBadge}>
                        {logs.length > 0
                          ? `${logs.length} set${logs.length === 1 ? "" : "s"} logged`
                          : "Not started"}
                      </span>
                    </div>

                    {exercise.prescribed_notes ? (
                      <p style={styles.exerciseNotes}>{exercise.prescribed_notes}</p>
                    ) : null}

                    <div style={styles.actionRow}>
                      <button
                        type="button"
                        onClick={() => setSelectedExerciseName(exercise.exercise_name)}
                        style={styles.buttonSecondary}
                      >
                        {isSelected ? "Selected" : "Open Exercise"}
                      </button>
                    </div>

                    {isSelected ? (
                      <>
                        <div style={styles.formGrid}>
                          <div>
                            <label style={styles.label}>Set No.</label>
                            <input value={String(logs.length + 1)} readOnly style={styles.input} />
                          </div>

                          <div>
                            <label style={styles.label}>Completed Reps</label>
                            <input
                              value={draft.reps}
                              onChange={(event) =>
                                updateDraft(exercise.exercise_name, "reps", event.target.value)
                              }
                              style={styles.input}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>Completed Weight</label>
                            <input
                              value={draft.weight}
                              onChange={(event) =>
                                updateDraft(exercise.exercise_name, "weight", event.target.value)
                              }
                              style={styles.input}
                            />
                          </div>

                          <div>
                            <label style={styles.label}>RPE</label>
                            <input
                              value={draft.rpe}
                              onChange={(event) =>
                                updateDraft(exercise.exercise_name, "rpe", event.target.value)
                              }
                              style={styles.input}
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: "12px" }}>
                          <label style={styles.label}>Notes</label>
                          <textarea
                            value={draft.notes}
                            onChange={(event) =>
                              updateDraft(exercise.exercise_name, "notes", event.target.value)
                            }
                            style={styles.textArea}
                          />
                        </div>

                        {activeSession?.status === "in_progress" ? (
                          <div style={styles.actionRow}>
                            <button
                              type="button"
                              onClick={() => handleSaveSet(exercise)}
                              disabled={isSavingSetForExercise === exercise.exercise_name}
                              style={{
                                ...styles.buttonPrimary,
                                ...(isSavingSetForExercise === exercise.exercise_name
                                  ? styles.buttonDisabled
                                  : {}),
                              }}
                            >
                              {isSavingSetForExercise === exercise.exercise_name
                                ? "Saving..."
                                : "Log Set"}
                            </button>
                          </div>
                        ) : (
                          <p style={{ ...styles.stateText, marginTop: "12px" }}>
                            Start the workout before logging sets.
                          </p>
                        )}

                        {logs.length > 0 ? (
                          <div style={styles.setLogList}>
                            {logs.map((log) => (
                              <div key={log.id} style={styles.setLogItem}>
                                <p style={styles.setLogText}>
                                  Set {log.set_no}: {log.completed_reps ?? "—"} reps @{" "}
                                  {log.completed_weight ?? "—"} • RPE {log.rpe ?? "—"}
                                </p>
                                {log.notes ? (
                                  <p
                                    style={{
                                      ...styles.setLogText,
                                      color: "#94a3b8",
                                      marginTop: "4px",
                                    }}
                                  >
                                    {log.notes}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {activeSession?.status === "in_progress" ? (
            <div style={styles.stickyFooter}>
              <div style={styles.stickyFooterInner}>
                <button
                  type="button"
                  onClick={handleFinishWorkout}
                  disabled={isFinishingSession}
                  style={{
                    ...styles.buttonSecondary,
                    ...(isFinishingSession ? styles.buttonDisabled : {}),
                  }}
                >
                  {isFinishingSession ? "Finishing..." : "Finish Workout"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </PageSection>
  );
}