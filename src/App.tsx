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

export default function RecompCoachSupabaseApp() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [nutrition, setNutrition] = useState<NutritionTarget | null>(null);
  const [liftLogs, setLiftLogs] = useState<LiftLog[]>([]);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
    const [programRows, setProgramRows] = useState<ProgramTemplateRow[]>([]);
  const [tab, setTab] = useState<"program" | "workout" | "diet" | "progress">("program");
  const [saving, setSaving] = useState(false);
  const [selectedProgramKey, setSelectedProgramKey] = useState<string | null>(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [liftForm, setLiftForm] = useState<LiftLog>({

    athlete_id: "",
    entry_date: new Date().toISOString().slice(0, 10),
    exercise_name: "",
    sets: 3,
    reps: "8",
    weight: null,
    unit: "lb",
    rpe: null,
    pain_score: 0,
    energy_score: null,
    notes: "",
  });

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

  const saveLift = async () => {
    if (!athlete?.id || !liftForm.exercise_name.trim()) return;

    setSaving(true);
    try {
      const payload = {
        ...liftForm,
        athlete_id: athlete.id,
        exercise_name: liftForm.exercise_name.trim(),
      };

      const { error } = await supabase.from("lift_logs").insert([payload]);
      if (error) throw error;

            const nextIndex = selectedExerciseIndex + 1;
      const nextProgramRow =
        selectedProgramRows.length > 0 && nextIndex < selectedProgramRows.length
          ? selectedProgramRows[nextIndex]
          : null;

      if (nextProgramRow) {
        setSelectedExerciseIndex(nextIndex);
        setLiftForm({
          athlete_id: athlete.id,
          entry_date: new Date().toISOString().slice(0, 10),
          week_no: nextProgramRow.week_no ?? null,
          block: nextProgramRow.block ?? null,
          day_no: nextProgramRow.day_no ?? null,
          session_name: nextProgramRow.session_name ?? null,
          exercise_name: nextProgramRow.exercise_name ?? "",
          sets: nextProgramRow.sets ? Number(nextProgramRow.sets) || null : null,
          reps: nextProgramRow.reps ?? "",
          weight: null,
          unit: "lb",
          rpe: null,
          pain_score: 0,
          energy_score: null,
          notes: nextProgramRow.notes ?? "",
        });
      } else {
        setLiftForm({
          athlete_id: athlete.id,
          entry_date: new Date().toISOString().slice(0, 10),
          exercise_name: "",
          sets: 3,
          reps: "8",
          weight: null,
          unit: "lb",
          rpe: null,
          pain_score: 0,
          energy_score: null,
          notes: "",
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save workout log. Check console for details.");
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

const selectedProgramRow =
  selectedProgramRows.length > 0 ? selectedProgramRows[selectedExerciseIndex] ?? null : null;

const selectProgramSession = (groupName: string, rows: ProgramTemplateRow[]) => {
  if (selectedProgramKey === groupName) {
    setTab("workout");
    return;
  }

  const firstRow = rows[0];
  setSelectedProgramKey(groupName);
  setSelectedExerciseIndex(0);
  setTab("workout");
  setLiftForm((prev) => ({
    ...prev,
    athlete_id: athlete?.id ?? prev.athlete_id,
    week_no: firstRow?.week_no ?? null,
    block: firstRow?.block ?? null,
    day_no: firstRow?.day_no ?? null,
    session_name: firstRow?.session_name ?? null,
    exercise_name: firstRow?.exercise_name ?? "",
    sets: firstRow?.sets ? Number(firstRow.sets) || null : null,
    reps: firstRow?.reps ?? "",
    notes: firstRow?.notes ?? "",
  }));
};

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>Recomp Coach</h1>
      <p>Connected to Supabase. Data persists across refreshes, browsers, and devices.</p>
      <p><strong>Athlete:</strong> {athlete?.name || "Not loaded"}</p>

      {nutrition && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
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
              background: tab === name ? "#059669" : "white",
              color: tab === name ? "white" : "#111827",
              cursor: "pointer",
            }}
          >
            {name}
          </button>
        ))}
      </div>

            {tab === "program" && (
        <div>
          <h2 style={{ marginBottom: 16 }}>Program</h2>
          {programRows.length === 0 ? (
            <p>No program rows found.</p>
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
                  background: selectedProgramKey === groupName ? "#ecfdf5" : "white",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  cursor: "pointer",
                }}
              >
                <h3 style={{ marginTop: 0 }}>{groupName}</h3>
                <SimpleTable
                  columns={["Exercise", "Sets", "Reps", "Target RPE", "Starting Load", "Notes"]}
                  rows={rows.map((row) => [
                    row.exercise_name,
                    row.sets ?? "",
                    row.reps ?? "",
                    row.target_rpe ?? "",
                    row.starting_load ?? "",
                    row.notes ?? "",
                  ])}
                />
              </button>
            ))
          )}
        </div>
      )}

      {tab === "workout" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <section>
            <h2>Log Workout</h2>
                        {selectedProgramRow && (
              <div
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  background: "#f9fafb",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Selected Program Session</div>
                <div style={{ marginBottom: 4 }}>{selectedProgramKey}</div>
                <div style={{ fontSize: 14 }}>
                  <strong>Current exercise:</strong> {selectedProgramRow.exercise_name}
                </div>
                <div style={{ fontSize: 14 }}>
                  <strong>Prescription:</strong> {selectedProgramRow.sets ?? ""} sets x {selectedProgramRow.reps ?? ""} reps
                </div>
                <div style={{ fontSize: 14 }}>
                  <strong>Target RPE:</strong> {selectedProgramRow.target_rpe ?? ""}
                </div>
              </div>
            )}
            <Field label="Date">
              <input type="date" value={liftForm.entry_date} onChange={(e) => setLiftForm({ ...liftForm, entry_date: e.target.value })} />
            </Field>
            <Field label="Exercise">
              <input value={liftForm.exercise_name} onChange={(e) => setLiftForm({ ...liftForm, exercise_name: e.target.value })} />
            </Field>
            <Field label="Sets">
              <input type="number" value={liftForm.sets ?? ""} onChange={(e) => setLiftForm({ ...liftForm, sets: Number(e.target.value) || null })} />
            </Field>
            <Field label="Reps">
              <input value={liftForm.reps ?? ""} onChange={(e) => setLiftForm({ ...liftForm, reps: e.target.value })} />
            </Field>
            <Field label="Weight">
              <input type="number" value={liftForm.weight ?? ""} onChange={(e) => setLiftForm({ ...liftForm, weight: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="RPE">
              <input type="number" step="0.5" value={liftForm.rpe ?? ""} onChange={(e) => setLiftForm({ ...liftForm, rpe: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Pain">
              <input type="number" min="0" max="10" value={liftForm.pain_score ?? ""} onChange={(e) => setLiftForm({ ...liftForm, pain_score: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Energy">
              <input type="number" min="1" max="10" value={liftForm.energy_score ?? ""} onChange={(e) => setLiftForm({ ...liftForm, energy_score: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Notes">
              <textarea value={liftForm.notes ?? ""} onChange={(e) => setLiftForm({ ...liftForm, notes: e.target.value })} />
            </Field>
            <button onClick={saveLift} disabled={saving} style={{ padding: "10px 14px", cursor: "pointer" }}>
              {saving ? "Saving..." : "Save workout"}
            </button>
          </section>

          <section>
            <h2>Recent workout logs</h2>
            <SimpleTable
              columns={["Date", "Exercise", "Sets", "Reps", "Weight", "RPE", "Pain"]}
              rows={liftLogs.map((row) => [
                row.entry_date,
                row.exercise_name,
                row.sets ?? "",
                row.reps ?? "",
                row.weight ?? "",
                row.rpe ?? "",
                row.pain_score ?? "",
              ])}
            />
          </section>
        </div>
      )}

      {tab === "diet" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <section>
            <h2>Log Diet & Recovery</h2>
            <Field label="Date">
              <input type="date" value={dietForm.entry_date} onChange={(e) => setDietForm({ ...dietForm, entry_date: e.target.value })} />
            </Field>
            <Field label="Day Type">
              <select value={dietForm.day_type} onChange={(e) => setDietForm({ ...dietForm, day_type: e.target.value as "Training" | "Rest" })}>
                <option value="Training">Training</option>
                <option value="Rest">Rest</option>
              </select>
            </Field>
            <Field label="Calories">
              <input type="number" value={dietForm.calories ?? ""} onChange={(e) => setDietForm({ ...dietForm, calories: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Protein">
              <input type="number" value={dietForm.protein_g ?? ""} onChange={(e) => setDietForm({ ...dietForm, protein_g: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Carbs">
              <input type="number" value={dietForm.carbs_g ?? ""} onChange={(e) => setDietForm({ ...dietForm, carbs_g: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Fat">
              <input type="number" value={dietForm.fat_g ?? ""} onChange={(e) => setDietForm({ ...dietForm, fat_g: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Sleep Hours">
              <input type="number" step="0.1" value={dietForm.sleep_hours ?? ""} onChange={(e) => setDietForm({ ...dietForm, sleep_hours: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Sleep Quality">
              <input type="number" min="1" max="10" value={dietForm.sleep_quality ?? ""} onChange={(e) => setDietForm({ ...dietForm, sleep_quality: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Steps">
              <input type="number" value={dietForm.steps ?? ""} onChange={(e) => setDietForm({ ...dietForm, steps: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Bodyweight">
              <input type="number" value={dietForm.bodyweight_lb ?? ""} onChange={(e) => setDietForm({ ...dietForm, bodyweight_lb: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Notes">
              <textarea value={dietForm.notes ?? ""} onChange={(e) => setDietForm({ ...dietForm, notes: e.target.value })} />
            </Field>
            <button onClick={saveDiet} disabled={saving} style={{ padding: "10px 14px", cursor: "pointer" }}>
              {saving ? "Saving..." : "Save diet log"}
            </button>
          </section>

          <section>
            <h2>Recent diet logs</h2>
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
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ border: "1px solid #d1d5db", borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: Array<Array<string | number>> }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} style={{ textAlign: "left", borderBottom: "1px solid #d1d5db", padding: 8 }}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{ borderBottom: "1px solid #f3f4f6", padding: 8 }}>
                {String(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}