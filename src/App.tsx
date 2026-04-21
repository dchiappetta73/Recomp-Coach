import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { orderSessionExercises } from "./utils/orderSessionExercises";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Athlete = {
  id: string;
  name: string;
  athlete_code: string;
};

type NutritionTarget = {
  training_day_calories: number;
  rest_day_calories: number;
  protein_g: number;
  fat_g: number;
  training_day_carbs_g: number;
  rest_day_carbs_g: number;
};

type LiftLog = {
  id?: string;
  athlete_id: string;
  entry_date: string;
  week_no?: number | null;
  block?: string | null;
  day_no?: number | null;
  session_name?: string | null;
  exercise_name: string;
  set_no?: number | null;
  planned_sets?: number | null;
  planned_reps?: string | null;
  sets?: number | null;
  reps?: string | null;
  weight?: number | null;
  unit?: string | null;
  rpe?: number | null;
  pain_score?: number | null;
  energy_score?: number | null;
  notes?: string | null;
  };

type DietLog = {
  id?: string;
  athlete_id: string;
  entry_date: string;
  day_type: "Training" | "Rest";
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  sleep_hours?: number | null;
  sleep_quality?: number | null;
  steps?: number | null;
  bodyweight_lb?: number | null;
  hunger_score?: number | null;
  energy_score?: number | null;
  notes?: string | null;
};

type ProgramTemplateRow = {
  id?: string;
  athlete_id: string;
  week_no: number;
  block: string;
  day_no: number;
  session_name: string;
  exercise_name: string;
  sets?: string | null;
  reps?: string | null;
  target_rpe?: string | null;
  starting_load?: string | null;
  progression_rule?: string | null;
  notes?: string | null;
};

type LiftSetDraft = {
  reps?: string | null;
  weight?: number | null;
  rpe?: number | null;
  pain_score?: number | null;
  energy_score?: number | null;
  notes?: string | null;
};

const EXERCISE_SUBSTITUTIONS: Record<string, string[]> = {
  "Goblet Squat": ["Bulgarian Split Squat", "Step Up", "DB Hack Squat"],
  "Romanian Deadlift": ["Hip Thrust", "Leg Curl", "Cable Pull Through"],
  "Dumbbell Floor Press": ["Landmine Press", "Cable Fly"],
  "Incline Press": ["Landmine Press", "Cable Fly"],
  "Chest-Supported Row": ["Seated Row", "Single Arm Row"],
  "Neutral Grip Lat Pulldown": ["Single Arm Pulldown", "Straight Arm Pulldown"],
};

const getProgramPlannedSets = (row: ProgramTemplateRow) => {
  const plannedSets = Number(row.sets);
  return Number.isFinite(plannedSets) && plannedSets > 0 ? Math.floor(plannedSets) : 1;
};

const getProgramRowKey = (row: ProgramTemplateRow, rowIndex: number) =>
  row.id ?? `${row.exercise_name}-${row.week_no}-${row.day_no}-${rowIndex}`;

const getLiftSetKey = (row: ProgramTemplateRow, rowIndex: number, setNo: number) =>
  `${getProgramRowKey(row, rowIndex)}-${setNo}`;

const getLiftLogLookupKey = ({
  entry_date,
  week_no,
  day_no,
  session_name,
  exercise_name,
  set_no,
}: {
  entry_date: string;
  week_no?: number | null;
  day_no?: number | null;
  session_name?: string | null;
  exercise_name: string;
  set_no: number;
}) =>
  `${entry_date}__${week_no ?? ""}__${day_no ?? ""}__${session_name ?? ""}__${exercise_name.trim().toLowerCase()}__${set_no}`;

export default function RecompCoachSupabaseApp() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [nutrition, setNutrition] = useState<NutritionTarget | null>(null);
  const [liftLogs, setLiftLogs] = useState<LiftLog[]>([]);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
    const [programRows, setProgramRows] = useState<ProgramTemplateRow[]>([]);
  const [tab, setTab] = useState<"program" | "workout" | "diet" | "progress">("program");
  const [saving, setSaving] = useState(false);
  const [selectedProgramKey, setSelectedProgramKey] = useState<string | null>(null);
  const [liftForm, setLiftForm] = useState<LiftLog>({

    athlete_id: "",
    entry_date: new Date().toISOString().slice(0, 10),
    exercise_name: "",
    set_no: 1,
    planned_sets: 3,
    planned_reps: "8",
    sets: null,
    reps: "",
    weight: null,
    unit: "lb",
    rpe: null,
    pain_score: 0,
    energy_score: null,
    notes: "",
  });
  const [liftSetDrafts, setLiftSetDrafts] = useState<Record<string, LiftSetDraft>>({});
  const [sessionExerciseOverrides, setSessionExerciseOverrides] = useState<Record<string, string>>({});
  const [sessionExtraSets, setSessionExtraSets] = useState<Record<string, number>>({});

  const [dietForm, setDietForm] = useState<DietLog>({
    athlete_id: "",
    entry_date: new Date().toISOString().slice(0, 10),
    day_type: "Training",
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
    sleep_hours: null,
    sleep_quality: null,
    steps: null,
    bodyweight_lb: null,
    hunger_score: null,
    energy_score: null,
    notes: "",
  });

  const loadAll = async (athleteId: string) => {
    const [
      { data: lifts, error: liftsErr },
      { data: diets, error: dietsErr },
      { data: nt, error: ntErr },
      { data: program, error: programErr },
    ] = await Promise.all([
      supabase
        .from("lift_logs")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("entry_date", { ascending: false })
        .limit(100),
      supabase
        .from("diet_recovery_logs")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("entry_date", { ascending: false })
        .limit(100),
      supabase
        .from("nutrition_targets")
        .select("*")
        .eq("athlete_id", athleteId)
        .maybeSingle(),
      supabase
        .from("program_templates")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("week_no", { ascending: true })
        .order("day_no", { ascending: true })
        .order("exercise_name", { ascending: true }),
    ]);

    if (liftsErr) throw liftsErr;
    if (dietsErr) throw dietsErr;
    if (ntErr) throw ntErr;
    if (programErr) throw programErr;

    setLiftLogs(lifts || []);
    setDietLogs(diets || []);
    setNutrition(nt || null);
    setProgramRows(program || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const { data, error } = await supabase
        .from("athletes")
        .select("id,name,athlete_code")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      setAthlete(data);
      setLiftForm((f) => ({ ...f, athlete_id: data.id }));
      setDietForm((f) => ({ ...f, athlete_id: data.id }));
      await loadAll(data.id);
    };

    bootstrap().catch(console.error);
  }, []);

  useEffect(() => {
    if (!athlete?.id) return;

    const refresh = async () => {
      await loadAll(athlete.id);
    };

    const liftChannel = supabase
      .channel("lift-log-stream")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lift_logs",
          filter: `athlete_id=eq.${athlete.id}`,
        },
        refresh
      )
      .subscribe();

    const dietChannel = supabase
      .channel("diet-log-stream")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "diet_recovery_logs",
          filter: `athlete_id=eq.${athlete.id}`,
        },
        refresh
      )
      .subscribe();

    const nutritionChannel = supabase
      .channel("nutrition-stream")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "nutrition_targets",
          filter: `athlete_id=eq.${athlete.id}`,
        },
        refresh
      )
      .subscribe();

    const programChannel = supabase
      .channel("program-stream")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "program_templates",
          filter: `athlete_id=eq.${athlete.id}`,
        },
        refresh
      )
      .subscribe();

    return () => {
      supabase.removeChannel(liftChannel);
      supabase.removeChannel(dietChannel);
      supabase.removeChannel(nutritionChannel);
      supabase.removeChannel(programChannel);
    };
  }, [athlete?.id]);

  const updateLiftSetDraft = (key: string, patch: LiftSetDraft) => {
    setLiftSetDrafts((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...patch,
      },
    }));
  };

  const getSessionExerciseName = (row: ProgramTemplateRow, rowIndex: number) =>
    sessionExerciseOverrides[getProgramRowKey(row, rowIndex)] ?? row.exercise_name;

  const saveLift = async (row: ProgramTemplateRow, rowIndex: number, setNo: number) => {
    const effectiveExerciseName = getSessionExerciseName(row, rowIndex);
    if (!athlete?.id || !effectiveExerciseName.trim()) return;

    const key = getLiftSetKey(row, rowIndex, setNo);
    const draft = liftSetDrafts[key] ?? {};

    setSaving(true);
    try {
      const payload: LiftLog = {
        athlete_id: athlete.id,
        entry_date: liftForm.entry_date,
        week_no: row.week_no ?? null,
        block: row.block ?? null,
        day_no: row.day_no ?? null,
        session_name: row.session_name ?? null,
        exercise_name: effectiveExerciseName.trim(),
        set_no: setNo,
        sets: null,
        planned_sets: getProgramPlannedSets(row),
        planned_reps: row.reps ?? null,
        reps: draft.reps ?? "",
        weight: draft.weight ?? null,
        unit: liftForm.unit ?? "lb",
        rpe: draft.rpe ?? null,
        pain_score: draft.pain_score ?? 0,
        energy_score: draft.energy_score ?? null,
        notes: draft.notes ?? "",
};

      const { error } = await supabase.from("lift_logs").insert([payload]);
      if (error) throw error;

      setLiftLogs((prev) => [payload, ...prev]);

      setLiftForm((prev) => ({
        ...prev,
        athlete_id: athlete.id,
        entry_date: prev.entry_date,
        week_no: row.week_no ?? null,
        block: row.block ?? null,
        day_no: row.day_no ?? null,
        session_name: row.session_name ?? null,
        exercise_name: effectiveExerciseName,
        set_no: setNo + 1,
        planned_sets: getProgramPlannedSets(row),
        planned_reps: row.reps ?? null,
        reps: "",
        weight: null,
        rpe: null,
        pain_score: 0,
        energy_score: prev.energy_score ?? null,
        notes: "",
      })); 
      setLiftSetDrafts((prev) => ({
        ...prev,
        [key]: {
          reps: payload.reps ?? "",
          weight: payload.weight ?? null,
          rpe: payload.rpe ?? null,
          pain_score: payload.pain_score ?? 0,
          energy_score: payload.energy_score ?? null,
          notes: payload.notes ?? "",
        },
      }));
    } catch (err) {
      console.error("saveLift error:", err);
      alert(`Failed to save workout log: ${JSON.stringify(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const saveDiet = async () => {
    if (!athlete?.id) return;

    setSaving(true);
    try {
      const payload = {
        ...dietForm,
        athlete_id: athlete.id,
      };

      const { error } = await supabase.from("diet_recovery_logs").insert([payload]);
      if (error) throw error;

      setDietForm({
        athlete_id: athlete.id,
        entry_date: new Date().toISOString().slice(0, 10),
        day_type: "Training",
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        sleep_hours: null,
        sleep_quality: null,
        steps: null,
        bodyweight_lb: null,
        hunger_score: null,
        energy_score: null,
        notes: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save diet log. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

    const avgSleep = useMemo(() => {
    const values = dietLogs
      .map((d) => Number(d.sleep_hours || 0))
      .filter((v) => !Number.isNaN(v) && v > 0);

    if (!values.length) return "—";
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  }, [dietLogs]);

  const getSessionTypeFromRows = (rows: ProgramTemplateRow[]) => {
  const dayNo = rows[0]?.day_no;

  if (dayNo === 1) return "upperA" as const;
  if (dayNo === 2) return "lowerA" as const;
  if (dayNo === 4) return "upperB" as const;
  if (dayNo === 5) return "lowerB" as const;

  return undefined;
};

const sortProgramRowsForSession = (rows: ProgramTemplateRow[]) => {
  const sessionType = getSessionTypeFromRows(rows);
  const orderedNames = orderSessionExercises(
    rows.map((row) => row.exercise_name),
    sessionType
  ).map((item) => item.name);

  return [...rows].sort((a, b) => {
    const aIndex = orderedNames.indexOf(a.exercise_name);
    const bIndex = orderedNames.indexOf(b.exercise_name);

    if (aIndex === -1 && bIndex === -1) {
      return a.exercise_name.localeCompare(b.exercise_name);
    }

    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
};

const groupedProgramRows = Object.entries(
  programRows.reduce((acc, row) => {
    const key = `Week ${row.week_no} - Day ${row.day_no} - ${row.session_name}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {} as Record<string, ProgramTemplateRow[]>)
).map(([groupName, rows]) => [groupName, sortProgramRowsForSession(rows)] as const);

const selectedProgramRows =
  selectedProgramKey
    ? groupedProgramRows.find(([groupName]) => groupName === selectedProgramKey)?.[1] ?? []
    : [];

const savedLiftLogsBySet = useMemo(() => {
  const lookup = new Map<string, LiftLog>();

  for (const row of liftLogs) {
    if (!row.entry_date || !row.exercise_name || row.set_no == null) continue;

    const key = getLiftLogLookupKey({
      entry_date: row.entry_date,
      week_no: row.week_no ?? null,
      day_no: row.day_no ?? null,
      session_name: row.session_name ?? null,
      exercise_name: row.exercise_name,
      set_no: row.set_no,
    });

    if (!lookup.has(key)) {
      lookup.set(key, row);
    }
  }

  return lookup;
}, [liftLogs]);

const getSavedLogForSessionRow = (row: ProgramTemplateRow, rowIndex: number, setNo: number) => {
  const effectiveExerciseName = getSessionExerciseName(row, rowIndex);

  const savedWithEffectiveName = savedLiftLogsBySet.get(
    getLiftLogLookupKey({
      entry_date: liftForm.entry_date,
      week_no: row.week_no ?? null,
      day_no: row.day_no ?? null,
      session_name: row.session_name ?? null,
      exercise_name: effectiveExerciseName,
      set_no: setNo,
    })
  );

  if (savedWithEffectiveName) return savedWithEffectiveName;

  if (effectiveExerciseName !== row.exercise_name) {
    return savedLiftLogsBySet.get(
      getLiftLogLookupKey({
        entry_date: liftForm.entry_date,
        week_no: row.week_no ?? null,
        day_no: row.day_no ?? null,
        session_name: row.session_name ?? null,
        exercise_name: row.exercise_name,
        set_no: setNo,
      })
    );
  }

  return undefined;
};

const todaysSessionLogs = useMemo(() => {
  if (!selectedProgramRows.length) return [];

  const sessionExerciseNames = new Set(
    selectedProgramRows.flatMap((programRow, rowIndex) => {
      const effectiveExerciseName = getSessionExerciseName(programRow, rowIndex).trim().toLowerCase();
      const originalExerciseName = programRow.exercise_name.trim().toLowerCase();

      return effectiveExerciseName === originalExerciseName
        ? [originalExerciseName]
        : [originalExerciseName, effectiveExerciseName];
    })
  );

  return liftLogs.filter((row) => {
    if (row.entry_date !== liftForm.entry_date) return false;
    if (row.week_no !== (selectedProgramRows[0]?.week_no ?? null)) return false;
    if (row.day_no !== (selectedProgramRows[0]?.day_no ?? null)) return false;
    if ((row.session_name ?? null) !== (selectedProgramRows[0]?.session_name ?? null)) return false;

    return sessionExerciseNames.has(row.exercise_name.trim().toLowerCase());
  });
}, [liftForm.entry_date, liftLogs, selectedProgramRows, sessionExerciseOverrides]);

const todaysSavedSetCount = todaysSessionLogs.length;
const todaysPlannedSetCount = selectedProgramRows.reduce(
  (total, row) => total + getProgramPlannedSets(row),
  0
);
  
const selectProgramSession = (groupName: string, rows: ProgramTemplateRow[]) => {
  if (selectedProgramKey === groupName) {
    setTab("workout");
    return;
  }

  const firstRow = rows[0];
  setSelectedProgramKey(groupName);
  setLiftSetDrafts({});
  setSessionExerciseOverrides({});
  setSessionExtraSets({});
  setTab("workout");
  setLiftForm((prev) => ({
    ...prev,
    athlete_id: athlete?.id ?? prev.athlete_id,
    week_no: firstRow?.week_no ?? null,
    block: firstRow?.block ?? null,
    day_no: firstRow?.day_no ?? null,
    session_name: firstRow?.session_name ?? null,
    exercise_name: firstRow?.exercise_name ?? "",
    set_no: 1,
    planned_sets: firstRow?.sets ? Number(firstRow.sets) || null : null,
    planned_reps: firstRow?.reps ?? null,
    sets: null,
    reps: "",
    notes: firstRow?.notes ?? "",
  }));
};

  const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: 16,
  color: "#111827",
};

  const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#ffffff",
  color: "#111827",
  boxSizing: "border-box",
};

  const compactWorkoutInputStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 40,
  padding: "8px 10px",
  fontSize: 15,
};

  const workoutMetaPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "4px 8px",
  border: "1px solid #d1d5db",
  borderRadius: 999,
  background: "#ffffff",
  color: "#374151",
  fontSize: 12,
  fontWeight: 600,
};

    return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 24,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 12 }}>Recomp Coach</h1>
      <p style={{ textAlign: "center", marginBottom: 6 }}>
        Connected to Supabase. Data persists across refreshes, browsers, and devices.
      </p>
      <p style={{ textAlign: "center", marginTop: 0, marginBottom: 20 }}>
        <strong>Athlete:</strong> {athlete?.name || "Not loaded"}
      </p>

      {nutrition && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Metric title="Training cals" value={`${Math.round(nutrition.training_day_calories)} kcal`} />
          <Metric title="Rest cals" value={`${Math.round(nutrition.rest_day_calories)} kcal`} />
          <Metric title="Protein" value={`${Math.round(nutrition.protein_g)} g`} />
          <Metric title="Fat" value={`${Math.round(nutrition.fat_g)} g`} />
          <Metric title="Train carbs" value={`${Math.round(nutrition.training_day_carbs_g)} g`} />
          <Metric title="Rest carbs" value={`${Math.round(nutrition.rest_day_carbs_g)} g`} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["program", "workout", "diet", "progress"].map((name) => (
          <button
            key={name}
            onClick={() => setTab(name as "program" | "workout" | "diet" | "progress")}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: tab === name ? "#059669" : "#ffffff",
              color: tab === name ? "#ffffff" : "#111827",
              cursor: "pointer",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === "program" && (
        <div>
          <h2 style={{ marginBottom: 16, color: "#f8fafc" }}>Program</h2>
          {programRows.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No program rows found.</p>
          ) : (
            groupedProgramRows.map(([groupName, rows]) => (
              <button
                key={groupName}
                type="button"
                onClick={() => selectProgramSession(groupName, rows)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  border: selectedProgramKey === groupName ? "2px solid #059669" : "1px solid #d1d5db",
                  background: selectedProgramKey === groupName ? "#ecfdf5" : "#ffffff",
                  color: "#111827",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  cursor: "pointer",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12, color: "#111827" }}>{groupName}</h3>
                <SimpleTable
                  columns={["Exercise", "Sets", "Reps", "Target RPE", "Starting Load"]}
                  rows={rows.map((row) => [
                    row.exercise_name,
                    row.sets ?? "",
                    row.reps ?? "",
                    row.target_rpe ?? "",
                    row.starting_load ?? "",
  ])}
/>
              </button>
            ))
          )}
        </div>
      )}

      {tab === "workout" && (
        <div style={{ display: "grid", gap: 14 }}>
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: 14,
              color: "#111827",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#047857", marginBottom: 4 }}>
                  Selected Program Session
                </div>
                <h2 style={{ margin: 0, color: "#111827" }}>{selectedProgramKey ?? "Log Workout"}</h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  minWidth: 220,
                }}
              >
                <div
                  style={{
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    background: "#f0fdf4",
                    padding: 10,
                    color: "#166534",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Today's Log</div>
                  <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
                    {todaysSavedSetCount} / {todaysPlannedSetCount || 0} sets saved
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4, color: "#15803d" }}>
                    {selectedProgramRows.length > 0
                      ? `${selectedProgramRows.length} exercises in this session`
                      : "Choose a workout to begin"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTab("program")}
                  style={{
                    minHeight: 44,
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#111827",
                  }}
                >
                  Back to Program
                </button>
              </div>
            </div>

            <Field label="Workout Date">
              <input
                style={{ ...compactWorkoutInputStyle, maxWidth: 220 }}
                type="date"
                value={liftForm.entry_date}
                onChange={(e) => setLiftForm({ ...liftForm, entry_date: e.target.value })}
              />
            </Field>

            {selectedProgramRows.length === 0 ? (
              <p style={{ color: "#374151", marginBottom: 0 }}>Choose a workout from the Program tab.</p>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {selectedProgramRows.map((row, rowIndex) => {
                  const plannedSets = getProgramPlannedSets(row);
                  const effectiveExerciseName = getSessionExerciseName(row, rowIndex);
                  const substituteOptions = EXERCISE_SUBSTITUTIONS[row.exercise_name] ?? [];
                  const rowKey = getProgramRowKey(row, rowIndex);
                  const extraSets = sessionExtraSets[rowKey] ?? 0;
                  const totalSets = plannedSets + extraSets;

                  return (
                    <div
                      key={rowKey}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: 10,
                        background: "#fcfcfd",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          marginBottom: 8,
                        }}
                      >
                        <div>
                          <h3 style={{ margin: "0 0 2px", color: "#111827", fontSize: 18 }}>{effectiveExerciseName}</h3>
                          {effectiveExerciseName !== row.exercise_name ? (
                            <div style={{ fontSize: 12, color: "#6b7280" }}>Swapped from {row.exercise_name}</div>
                          ) : null}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          <div style={workoutMetaPillStyle}>{plannedSets} x {row.reps ?? ""}</div>
                          {row.target_rpe ? <div style={workoutMetaPillStyle}>RPE {row.target_rpe}</div> : null}
                          {substituteOptions.length > 0 ? (
                            <select
                              aria-label={`Swap ${row.exercise_name}`}
                              style={{ ...compactWorkoutInputStyle, width: "auto", minWidth: 170 }}
                              value={effectiveExerciseName}
                              onChange={(e) =>
                                setSessionExerciseOverrides((prev) => ({
                                  ...prev,
                                  [rowKey]: e.target.value,
                                }))
                              }
                            >
                              <option value={row.exercise_name}>Swap: Keep {row.exercise_name}</option>
                              {substituteOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : null}
                        </div>
                      </div>

                      <div style={{ display: "grid", gap: 8 }}>
                        {Array.from({ length: totalSets }, (_, index) => {
                          const setNo = index + 1;
                          const key = getLiftSetKey(row, rowIndex, setNo);
                          const draft = liftSetDrafts[key] ?? {};
                          const savedLog = getSavedLogForSessionRow(row, rowIndex, setNo);
                          const isSaved = !!savedLog;
                          const isExtraSet = setNo > plannedSets;
                          const rowValues = {
                            reps: savedLog?.reps ?? draft.reps ?? "",
                            weight: savedLog?.weight ?? draft.weight ?? "",
                            rpe: savedLog?.rpe ?? draft.rpe ?? "",
                            pain_score: savedLog?.pain_score ?? draft.pain_score ?? "",
                            energy_score: savedLog?.energy_score ?? draft.energy_score ?? "",
                            notes: savedLog?.notes ?? draft.notes ?? "",
                          };

                          return (
                            <div
                              key={key}
                              style={{
                                display: "grid",
                                gap: 8,
                                border: isSaved ? "1px solid #4ade80" : "1px solid #e5e7eb",
                                borderRadius: 8,
                                background: isSaved ? "#f0fdf4" : "#ffffff",
                                padding: isSaved ? 8 : 10,
                                boxShadow: isSaved ? "inset 0 0 0 1px #dcfce7" : "none",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "72px repeat(auto-fit, minmax(84px, 1fr)) minmax(96px, 120px)",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <div style={{ ...workoutMetaPillStyle, justifyContent: "center", minHeight: 40 }}>
                                  Set {setNo}{isExtraSet ? " +" : ""}
                                </div>
                                <input
                                  aria-label={`Reps for ${effectiveExerciseName} set ${setNo}`}
                                  placeholder="Reps"
                                  style={compactWorkoutInputStyle}
                                  value={rowValues.reps}
                                  readOnly={isSaved}
                                  onChange={(e) => updateLiftSetDraft(key, { reps: e.target.value })}
                                />
                                <input
                                  aria-label={`Weight for ${effectiveExerciseName} set ${setNo}`}
                                  placeholder="Weight"
                                  style={compactWorkoutInputStyle}
                                  type="number"
                                  value={rowValues.weight}
                                  readOnly={isSaved}
                                  onChange={(e) =>
                                    updateLiftSetDraft(key, {
                                      weight: e.target.value === "" ? null : Number(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  aria-label={`RPE for ${effectiveExerciseName} set ${setNo}`}
                                  placeholder="RPE"
                                  style={compactWorkoutInputStyle}
                                  type="number"
                                  step="0.5"
                                  value={rowValues.rpe}
                                  readOnly={isSaved}
                                  onChange={(e) =>
                                    updateLiftSetDraft(key, {
                                      rpe: e.target.value === "" ? null : Number(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  aria-label={`Pain for ${effectiveExerciseName} set ${setNo}`}
                                  placeholder="Pain"
                                  style={compactWorkoutInputStyle}
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={rowValues.pain_score}
                                  readOnly={isSaved}
                                  onChange={(e) =>
                                    updateLiftSetDraft(key, {
                                      pain_score: e.target.value === "" ? null : Number(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  aria-label={`Energy for ${effectiveExerciseName} set ${setNo}`}
                                  placeholder="Energy"
                                  style={compactWorkoutInputStyle}
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={rowValues.energy_score}
                                  readOnly={isSaved}
                                  onChange={(e) =>
                                    updateLiftSetDraft(key, {
                                      energy_score: e.target.value === "" ? null : Number(e.target.value),
                                    })
                                  }
                                />
                                <div style={{ display: "grid", gap: 6 }}>
                                  {isSaved ? (
                                    <div
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "#166534",
                                        textAlign: "center",
                                        background: "#dcfce7",
                                        borderRadius: 999,
                                        padding: "4px 8px",
                                      }}
                                    >
                                      ✓ Saved
                                    </div>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => saveLift(row, rowIndex, setNo)}
                                    disabled={saving || isSaved}
                                    style={{
                                      minHeight: 40,
                                      padding: "8px 12px",
                                      cursor: saving || isSaved ? "not-allowed" : "pointer",
                                      borderRadius: 8,
                                      border: isSaved ? "1px solid #86efac" : "1px solid #059669",
                                      background: isSaved ? "#dcfce7" : "#059669",
                                      color: isSaved ? "#166534" : "#ffffff",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {saving ? "Saving..." : isSaved ? "Saved" : "Save"}
                                  </button>
                                </div>
                              </div>
                              <input
                                aria-label={`Notes for ${effectiveExerciseName} set ${setNo}`}
                                placeholder="Notes (optional)"
                                style={compactWorkoutInputStyle}
                                value={rowValues.notes}
                                readOnly={isSaved}
                                onChange={(e) => updateLiftSetDraft(key, { notes: e.target.value })}
                              />
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() =>
                            setSessionExtraSets((prev) => ({
                              ...prev,
                              [rowKey]: (prev[rowKey] ?? 0) + 1,
                            }))
                          }
                          style={{
                            minHeight: 40,
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderRadius: 8,
                            border: "1px dashed #9ca3af",
                            background: "#ffffff",
                            color: "#374151",
                            fontWeight: 600,
                          }}
                        >
                          Add Set
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
      {tab === "diet" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, color: "#111827" }}>Log Diet & Recovery</h2>
            <Field label="Date">
              <input
                style={inputStyle}
                type="date"
                value={dietForm.entry_date}
                onChange={(e) => setDietForm({ ...dietForm, entry_date: e.target.value })}
              />
            </Field>
            <Field label="Day Type">
              <select
                style={inputStyle}
                value={dietForm.day_type}
                onChange={(e) => setDietForm({ ...dietForm, day_type: e.target.value as "Training" | "Rest" })}
              >
                <option value="Training">Training</option>
                <option value="Rest">Rest</option>
              </select>
            </Field>
            <Field label="Calories">
              <input
                style={inputStyle}
                type="number"
                value={dietForm.calories ?? ""}
                onChange={(e) => setDietForm({ ...dietForm, calories: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Protein">
              <input
                style={inputStyle}
                type="number"
                value={dietForm.protein_g ?? ""}
                onChange={(e) => setDietForm({ ...dietForm, protein_g: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Carbs">
              <input
                style={inputStyle}
                type="number"
                value={dietForm.carbs_g ?? ""}
                onChange={(e) => setDietForm({ ...dietForm, carbs_g: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Fat">
              <input
                style={inputStyle}
                type="number"
                value={dietForm.fat_g ?? ""}
                onChange={(e) => setDietForm({ ...dietForm, fat_g: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Sleep Hours">
              <input
                style={inputStyle}
                type="number"
                step="0.1"
                value={dietForm.sleep_hours ?? ""}
                onChange={(e) => setDietForm({ ...dietForm, sleep_hours: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Sleep Quality">
              <input
                style={inputStyle}
                type="number"
                min="1"
                max="10"
                value={dietForm.sleep_quality ?? ""}
                onChange={(e) => setDietForm({ ...dietForm, sleep_quality: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Steps">
              <input
                style={inputStyle}
                type="number"
                value={dietForm.steps ?? ""}
                onChange={(e) => setDietForm({ ...dietForm, steps: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Bodyweight">
              <input
                style={inputStyle}
                type="number"
                value={dietForm.bodyweight_lb ?? ""}
                onChange={(e) => setDietForm({ ...dietForm, bodyweight_lb: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Notes">
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                value={dietForm.notes ?? ""}
                onChange={(e) => setDietForm({ ...dietForm, notes: e.target.value })}
              />
            </Field>

            <button
              onClick={saveDiet}
              disabled={saving}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                borderRadius: 8,
                border: "1px solid #059669",
                background: "#059669",
                color: "#ffffff",
              }}
            >
              {saving ? "Saving..." : "Save diet log"}
            </button>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0, color: "#111827" }}>Recent diet logs</h2>
            <SimpleTable
              columns={["Date", "Type", "Calories", "Protein", "Carbs", "Fat", "Sleep"]}
              rows={dietLogs.map((row) => [
                row.entry_date,
                row.day_type,
                row.calories ?? "",
                row.protein_g ?? "",
                row.carbs_g ?? "",
                row.fat_g ?? "",
                row.sleep_hours ?? "",
              ])}
            />
          </section>
        </div>
      )}

      {tab === "progress" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <Metric title="Workout Logs" value={String(liftLogs.length)} />
          <Metric title="Diet Logs" value={String(dietLogs.length)} />
          <Metric title="Average Sleep" value={`${avgSleep} hrs`} />
          <Metric title="Persistence" value="Supabase" />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 10, color: "#111827" }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#374151" }}>{label}</div>
      {children}
    </label>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: 10,
        padding: 16,
        color: "#111827",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{value}</div>
    </div>
  );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: Array<Array<string | number>> }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "transparent",
        color: "#111827",
      }}
    >
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c}
              style={{
                textAlign: "left",
                borderBottom: "1px solid #9ca3af",
                padding: 8,
                color: "#111827",
                background: "transparent",
                fontWeight: 700,
              }}
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                style={{
                  borderBottom: "1px solid #d1d5db",
                  padding: 8,
                  color: "#374151",
                  background: "transparent",
                }}
              >
                {String(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
