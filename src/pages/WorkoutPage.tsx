import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import {
  createWorkoutSession,
  finishWorkoutSession,
  getLatestWorkoutSessionForWorkout,
  getPlannedWorkoutSessionsForAthlete,
} from "../services/workoutSessionService";
import {
  createLiftLogSetEntry,
  deleteLiftLogSetEntry,
  getLiftLogsForWorkoutSession,
  updateLiftLogSetEntry,
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
  buttonDanger: {
    background: "rgba(220, 38, 38, 0.18)",
    color: "#fecaca",
    border: "1px solid rgba(248, 113, 113, 0.35)",
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
  setLogActionRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  setLogText: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: "14px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginTop: "14px",
  },
  summaryItem: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(2, 6, 23, 0.35)",
    borderRadius: "12px",
    padding: "14px",
  },
  summaryLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  summaryValue: {
    margin: "6px 0 0 0",
    color: "#f8fafc",
    fontSize: "22px",
    fontWeight: 700,
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

function createDraftFromLog(log: WorkoutLiftLogEntry): SetDraft {
  return {
    reps: log.completed_reps == null ? "" : String(log.completed_reps),
    weight: log.completed_weight == null ? "" : String(log.completed_weight),
    rpe: log.rpe == null ? "" : String(log.rpe),
    notes: log.notes ?? "",
  };
}

function parseOptionalNumber(value: string, label: string): number | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) return null;

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a number.`);
  }

  return parsed;
}

function formatSummaryNumber(value: number | null, digits = 0): string {
  if (value === null) return "-";

  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function getNextSetNo(logs: WorkoutLiftLogEntry[]): number {
  const maxSetNo = logs.reduce((max, log) => {
    return typeof log.set_no === "number" && log.set_no > max ? log.set_no : max;
  }, 0);

  return maxSetNo + 1;
}

function getPlannedSessionKey(session: PlannedWorkoutSession): string {
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

function getStoredSelectedWorkoutKey(athleteId: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(getSelectedWorkoutStorageKey(athleteId));
  } catch {
    return null;
  }
}

function storeSelectedWorkoutKey(athleteId: string, workoutKey: string | null) {
  if (typeof window === "undefined") return;

  try {
    const storageKey = getSelectedWorkoutStorageKey(athleteId);

    if (workoutKey) {
      window.localStorage.setItem(storageKey, workoutKey);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    // Ignore storage failures so workout loading never crashes.
  }
}

export default function WorkoutPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [plannedSessions, setPlannedSessions] = useState<PlannedWorkoutSession[]>([]);
  const [selectedWorkoutKey, setSelectedWorkoutKey] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [liftLogs, setLiftLogs] = useState<WorkoutLiftLogEntry[]>([]);
  const [setDrafts, setSetDrafts] = useState<Record<string, SetDraft>>({});
  const [editDrafts, setEditDrafts] = useState<Record<string, SetDraft>>({});
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isFinishingSession, setIsFinishingSession] = useState(false);
  const [isSavingSetForExercise, setIsSavingSetForExercise] = useState<string | null>(null);
  const [isSavingEditForLog, setIsSavingEditForLog] = useState<string | null>(null);
  const [isDeletingLog, setIsDeletingLog] = useState<string | null>(null);
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
          setSelectedWorkoutKey(null);
          setActiveSession(null);
          setLiftLogs([]);
          return;
        }

        const planned = await getPlannedWorkoutSessionsForAthlete(currentAthlete.id);
        const storedSelectedWorkoutKey = getStoredSelectedWorkoutKey(currentAthlete.id);
        const selectedPlannedSession =
          (storedSelectedWorkoutKey
            ? planned.find((session) => getPlannedSessionKey(session) === storedSelectedWorkoutKey)
            : null) ??
          planned[0] ??
          null;
        const selectedPlannedSessionKey = selectedPlannedSession
          ? getPlannedSessionKey(selectedPlannedSession)
          : null;
        const existingSession = selectedPlannedSession
          ? await getLatestWorkoutSessionForWorkout({
              athleteId: currentAthlete.id,
              programTemplateId: selectedPlannedSession.exercises[0]?.id ?? null,
              sessionDate: getTodayDateString(),
              weekNumber: selectedPlannedSession.week_no,
              dayNumber: selectedPlannedSession.day_no,
              sessionName: selectedPlannedSession.session_name,
            })
          : null;

        setPlannedSessions(planned);
        setSelectedWorkoutKey(selectedPlannedSessionKey);
        storeSelectedWorkoutKey(currentAthlete.id, selectedPlannedSessionKey);
        setActiveSession(existingSession);

        if (existingSession) {
          const logs = await getLiftLogsForWorkoutSession(existingSession.id);
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
    if (selectedWorkoutKey) {
      return (
        plannedSessions.find((session) => getPlannedSessionKey(session) === selectedWorkoutKey) ??
        plannedSessions[0] ??
        null
      );
    }

    return plannedSessions[0] ?? null;
  }, [plannedSessions, selectedWorkoutKey]);

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

  const completedSummary = useMemo(() => {
    const totalReps = liftLogs.reduce((sum, log) => {
      return typeof log.completed_reps === "number" ? sum + log.completed_reps : sum;
    }, 0);

    const totalVolume = liftLogs.reduce((sum, log) => {
      if (
        typeof log.completed_reps !== "number" ||
        typeof log.completed_weight !== "number"
      ) {
        return sum;
      }

      return sum + log.completed_reps * log.completed_weight;
    }, 0);

    return {
      exercisesLogged: completedExerciseCount,
      savedSets: liftLogs.length,
      totalReps: liftLogs.some((log) => typeof log.completed_reps === "number")
        ? totalReps
        : null,
      totalVolume: liftLogs.some(
        (log) =>
          typeof log.completed_reps === "number" &&
          typeof log.completed_weight === "number"
      )
        ? totalVolume
        : null,
    };
  }, [completedExerciseCount, liftLogs]);

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

  function startEditingLog(log: WorkoutLiftLogEntry) {
    setEditDrafts((prev) => ({
      ...prev,
      [log.id]: createDraftFromLog(log),
    }));
  }

  function cancelEditingLog(logId: string) {
    setEditDrafts((prev) => {
      const next = { ...prev };
      delete next[logId];
      return next;
    });
  }

  function updateEditDraft(logId: string, field: keyof SetDraft, value: string) {
    setEditDrafts((prev) => ({
      ...prev,
      [logId]: {
        ...(prev[logId] ?? createEmptyDraft()),
        [field]: value,
      },
    }));
  }

  async function handleSelectWorkout(session: PlannedWorkoutSession) {
    if (!athlete) return;

    try {
      const workoutKey = getPlannedSessionKey(session);

      setSelectedWorkoutKey(workoutKey);
      storeSelectedWorkoutKey(athlete.id, workoutKey);
      setActiveSession(null);
      setLiftLogs([]);
      setSetDrafts({});
      setEditDrafts({});
      setSelectedExerciseName(null);
      setErrorMessage(null);

      const existingSession = await getLatestWorkoutSessionForWorkout({
        athleteId: athlete.id,
        programTemplateId: session.exercises[0]?.id ?? null,
        sessionDate: getTodayDateString(),
        weekNumber: session.week_no,
        dayNumber: session.day_no,
        sessionName: session.session_name,
      });

      setActiveSession(existingSession);

      if (existingSession) {
        const logs = await getLiftLogsForWorkoutSession(existingSession.id);
        setLiftLogs(logs);
      }
    } catch (error) {
      console.error("Failed to load selected workout:", error);
      setErrorMessage("Selected workout could not be loaded.");
    }
  }

  async function handleSaveEditedLog(log: WorkoutLiftLogEntry) {
    const draft = editDrafts[log.id];

    if (!draft) return;

    try {
      setIsSavingEditForLog(log.id);
      setErrorMessage(null);

      const completedReps = parseOptionalNumber(draft.reps, "Completed reps");
      const completedWeight = parseOptionalNumber(draft.weight, "Completed weight");
      const rpe = parseOptionalNumber(draft.rpe, "RPE");

      const updatedLog = await updateLiftLogSetEntry(log.id, {
        completedReps,
        completedWeight,
        rpe,
        notes: draft.notes.trim() || null,
      });

      setLiftLogs((prev) =>
        prev.map((existingLog) => (existingLog.id === updatedLog.id ? updatedLog : existingLog))
      );
      cancelEditingLog(log.id);
    } catch (error) {
      console.error("Failed to update workout set:", error);
      setErrorMessage(error instanceof Error ? error.message : "Set could not be updated.");
    } finally {
      setIsSavingEditForLog(null);
    }
  }

  async function handleDeleteLog(log: WorkoutLiftLogEntry) {
    const confirmed = window.confirm(`Delete set ${log.set_no ?? ""} for ${log.exercise_name}?`);

    if (!confirmed) return;

    try {
      setIsDeletingLog(log.id);
      setErrorMessage(null);

      await deleteLiftLogSetEntry(log.id);

      setLiftLogs((prev) => prev.filter((existingLog) => existingLog.id !== log.id));
      cancelEditingLog(log.id);
    } catch (error) {
      console.error("Failed to delete workout set:", error);
      setErrorMessage("Set could not be deleted.");
    } finally {
      setIsDeletingLog(null);
    }
  }

  async function handleStartWorkout() {
    if (!athlete || !plannedSession || plannedSession.exercises.length === 0) return;

    try {
      setIsStartingSession(true);
      setErrorMessage(null);

      const existingSession = await getLatestWorkoutSessionForWorkout({
        athleteId: athlete.id,
        programTemplateId: plannedSession.exercises[0]?.id ?? null,
        sessionDate: getTodayDateString(),
        weekNumber: plannedSession.week_no,
        dayNumber: plannedSession.day_no,
        sessionName: plannedSession.session_name,
      });

      if (existingSession) {
        setActiveSession(existingSession);
        const logs = await getLiftLogsForWorkoutSession(existingSession.id);
        setLiftLogs(logs);
        return;
      }

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
    const nextSetNo = getNextSetNo(existingLogs);

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
                  Selected workout: Week {plannedSession.week_no} Day {plannedSession.day_no}{" "}
                  {plannedSession.session_name}
                </p>
                <p style={styles.subtitle}>
                  Status: {getSessionStatusLabel(activeSession?.status ?? "not_started")}
                  {activeSession?.status === "in_progress"
                    ? ` • Current exercise: ${currentExerciseName ?? "—"}`
                    : ""}
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

              {!activeSession ? (
                <p style={styles.helperText}>
                  Start this selected workout to unlock set logging.
                </p>
              ) : activeSession.status === "in_progress" ? (
                <p style={styles.helperText}>
                  Open an exercise below to log sets for this in-progress workout.
                </p>
              ) : activeSession.status === "completed" ? (
                <p style={styles.helperText}>
                  This workout is completed. New set logging is locked for this session.
                </p>
              ) : null}
            </div>

            {plannedSessions.length > 1 ? (
              <div style={styles.actionRow}>
                {plannedSessions.map((session) => {
                  const sessionKey = getPlannedSessionKey(session);
                  const isSelectedWorkout = sessionKey === selectedWorkoutKey;

                  return (
                    <button
                      key={sessionKey}
                      type="button"
                      onClick={() => handleSelectWorkout(session)}
                      style={isSelectedWorkout ? styles.buttonPrimary : styles.buttonSecondary}
                    >
                      Week {session.week_no} Day {session.day_no}: {session.session_name}
                    </button>
                  );
                })}
              </div>
            ) : null}

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
                <p style={styles.helperText}>Workout completed. Review the summary below.</p>
              )}
            </div>
          </div>

          {activeSession?.status === "completed" ? (
            <div style={styles.panel}>
              <div style={styles.headerRow}>
                <div>
                  <p style={styles.title}>Completed Workout Summary</p>
                  <p style={styles.subtitle}>
                    {activeSession.session_name ?? plannedSession.session_name} -{" "}
                    {activeSession.session_date ?? "No session date"}
                  </p>
                </div>
              </div>

              <div style={styles.summaryGrid}>
                <div style={styles.summaryItem}>
                  <p style={styles.summaryLabel}>Exercises Logged</p>
                  <p style={styles.summaryValue}>{completedSummary.exercisesLogged}</p>
                </div>
                <div style={styles.summaryItem}>
                  <p style={styles.summaryLabel}>Saved Sets</p>
                  <p style={styles.summaryValue}>{completedSummary.savedSets}</p>
                </div>
                <div style={styles.summaryItem}>
                  <p style={styles.summaryLabel}>Total Reps</p>
                  <p style={styles.summaryValue}>
                    {formatSummaryNumber(completedSummary.totalReps)}
                  </p>
                </div>
                <div style={styles.summaryItem}>
                  <p style={styles.summaryLabel}>Total Volume</p>
                  <p style={styles.summaryValue}>
                    {formatSummaryNumber(completedSummary.totalVolume)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>
                  {activeSession?.status === "in_progress"
                    ? "Log Current Exercise"
                    : "Full Workout Preview"}
                </p>
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
                            <input value={String(getNextSetNo(logs))} readOnly style={styles.input} />
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
                        ) : activeSession?.status === "completed" ? (
                          <p style={{ ...styles.stateText, marginTop: "12px" }}>
                            This workout is completed. New set logging is locked for this session.
                          </p>
                        ) : (
                          <p style={{ ...styles.stateText, marginTop: "12px" }}>
                            Start the workout before logging sets.
                          </p>
                        )}

                        {logs.length > 0 ? (
                          <div style={styles.setLogList}>
                            {logs.map((log) => {
                              const editDraft = editDrafts[log.id];
                              const isEditing = Boolean(editDraft);
                              const isSavingEdit = isSavingEditForLog === log.id;
                              const isDeleting = isDeletingLog === log.id;
                              const canEditSavedSet = activeSession?.status === "in_progress";

                              return (
                                <div key={log.id} style={styles.setLogItem}>
                                  {isEditing && editDraft ? (
                                    <>
                                      <div style={styles.formGrid}>
                                        <div>
                                          <label style={styles.label}>Completed Reps</label>
                                          <input
                                            value={editDraft.reps}
                                            onChange={(event) =>
                                              updateEditDraft(log.id, "reps", event.target.value)
                                            }
                                            style={styles.input}
                                          />
                                        </div>

                                        <div>
                                          <label style={styles.label}>Completed Weight</label>
                                          <input
                                            value={editDraft.weight}
                                            onChange={(event) =>
                                              updateEditDraft(log.id, "weight", event.target.value)
                                            }
                                            style={styles.input}
                                          />
                                        </div>

                                        <div>
                                          <label style={styles.label}>RPE</label>
                                          <input
                                            value={editDraft.rpe}
                                            onChange={(event) =>
                                              updateEditDraft(log.id, "rpe", event.target.value)
                                            }
                                            style={styles.input}
                                          />
                                        </div>
                                      </div>

                                      <div style={{ marginTop: "12px" }}>
                                        <label style={styles.label}>Notes</label>
                                        <textarea
                                          value={editDraft.notes}
                                          onChange={(event) =>
                                            updateEditDraft(log.id, "notes", event.target.value)
                                          }
                                          style={styles.textArea}
                                        />
                                      </div>

                                      <div style={styles.setLogActionRow}>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveEditedLog(log)}
                                          disabled={isSavingEdit}
                                          style={{
                                            ...styles.buttonPrimary,
                                            ...(isSavingEdit ? styles.buttonDisabled : {}),
                                          }}
                                        >
                                          {isSavingEdit ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => cancelEditingLog(log.id)}
                                          disabled={isSavingEdit}
                                          style={{
                                            ...styles.buttonSecondary,
                                            ...(isSavingEdit ? styles.buttonDisabled : {}),
                                          }}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
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

                                      {canEditSavedSet ? (
                                        <div style={styles.setLogActionRow}>
                                          <button
                                            type="button"
                                            onClick={() => startEditingLog(log)}
                                            style={styles.buttonSecondary}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteLog(log)}
                                            disabled={isDeleting}
                                            style={{
                                              ...styles.buttonDanger,
                                              ...(isDeleting ? styles.buttonDisabled : {}),
                                            }}
                                          >
                                            {isDeleting ? "Deleting..." : "Delete"}
                                          </button>
                                        </div>
                                      ) : null}
                                    </>
                                  )}
                                </div>
                              );
                            })}
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
