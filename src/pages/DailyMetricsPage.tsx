import { useEffect, useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import {
  getDailyMetricByDate,
  upsertDailyMetricEntry,
} from "../services/dailyMetricsService";
import type { Athlete } from "../types/athlete";
import type { CSSProperties } from "react";

type DailyMetricDraft = {
  weightLb: string;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  sleepHours: string;
  steps: string;
  manualNotes: string;
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
    marginTop: "18px",
  },
  fieldBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
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
    fontSize: "16px",
  },
  textArea: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "16px",
    minHeight: "110px",
    resize: "vertical",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "18px",
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
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  stateText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "15px",
  },
  errorText: {
    margin: "14px 0 0 0",
    color: "#fecaca",
    fontSize: "14px",
  },
  successText: {
    margin: "14px 0 0 0",
    color: "#bbf7d0",
    fontSize: "14px",
  },
};

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyDraft(): DailyMetricDraft {
  return {
    weightLb: "",
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    sleepHours: "",
    steps: "",
    manualNotes: "",
  };
}

function toInputString(value?: number | null) {
  if (value == null) return "";
  return String(value);
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export default function DailyMetricsPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [draft, setDraft] = useState<DailyMetricDraft>(createEmptyDraft());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);

        if (!currentAthlete) {
          setDraft(createEmptyDraft());
          return;
        }

        const metric = await getDailyMetricByDate(currentAthlete.id, selectedDate);

        setDraft({
          weightLb: toInputString(metric?.weight_lb),
          calories: toInputString(metric?.calories),
          proteinG: toInputString(metric?.protein_g),
          carbsG: toInputString(metric?.carbs_g),
          fatG: toInputString(metric?.fat_g),
          sleepHours:
            metric?.sleep_minutes != null
              ? String((metric.sleep_minutes / 60).toFixed(1))
              : "",
          steps: toInputString(metric?.steps),
          manualNotes: metric?.manual_notes ?? "",
        });
      } catch (error) {
        console.error("Failed to load daily metrics page:", error);
        setErrorMessage("Daily metrics could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPage();
  }, [selectedDate]);

  function updateDraft(field: keyof DailyMetricDraft, value: string) {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (!athlete) return;

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const sleepHours = parseOptionalNumber(draft.sleepHours);
      const savedMetric = await upsertDailyMetricEntry({
        athleteId: athlete.id,
        metricDate: selectedDate,
        goalTypeAtTime: athlete.current_goal ?? null,
        weightLb: parseOptionalNumber(draft.weightLb),
        calories: parseOptionalNumber(draft.calories),
        proteinG: parseOptionalNumber(draft.proteinG),
        carbsG: parseOptionalNumber(draft.carbsG),
        fatG: parseOptionalNumber(draft.fatG),
        sleepMinutes: sleepHours == null ? null : Math.round(sleepHours * 60),
        steps: parseOptionalNumber(draft.steps),
        manualNotes: draft.manualNotes.trim() || null,
      });

      setDraft({
        weightLb: toInputString(savedMetric.weight_lb),
        calories: toInputString(savedMetric.calories),
        proteinG: toInputString(savedMetric.protein_g),
        carbsG: toInputString(savedMetric.carbs_g),
        fatG: toInputString(savedMetric.fat_g),
        sleepHours:
          savedMetric.sleep_minutes != null
            ? String((savedMetric.sleep_minutes / 60).toFixed(1))
            : "",
        steps: toInputString(savedMetric.steps),
        manualNotes: savedMetric.manual_notes ?? "",
      });
      setSuccessMessage("Daily metrics saved.");
    } catch (error) {
      console.error("Failed to save daily metrics:", error);
      setErrorMessage("Daily metrics could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageSection title="Daily Metrics">
      {isLoading ? (
        <p style={styles.stateText}>Loading daily metrics...</p>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : (
        <div style={styles.stack}>
          <div style={styles.panel}>
            <p style={styles.title}>Daily Entry</p>
            <p style={styles.subtitle}>
              Save one row of daily nutrition, recovery, and notes for the selected date.
            </p>

            <div style={styles.formGrid}>
              <div style={styles.fieldBlock}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Weight (lb)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={draft.weightLb}
                  onChange={(event) => updateDraft("weightLb", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Calories</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={draft.calories}
                  onChange={(event) => updateDraft("calories", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Protein (g)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={draft.proteinG}
                  onChange={(event) => updateDraft("proteinG", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Carbs (g)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={draft.carbsG}
                  onChange={(event) => updateDraft("carbsG", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Fat (g)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={draft.fatG}
                  onChange={(event) => updateDraft("fatG", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Sleep (hours)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={draft.sleepHours}
                  onChange={(event) => updateDraft("sleepHours", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Steps</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={draft.steps}
                  onChange={(event) => updateDraft("steps", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Notes</label>
                <textarea
                  value={draft.manualNotes}
                  onChange={(event) => updateDraft("manualNotes", event.target.value)}
                  style={styles.textArea}
                />
              </div>
            </div>

            {errorMessage ? <p style={styles.errorText}>{errorMessage}</p> : null}
            {successMessage ? <p style={styles.successText}>{successMessage}</p> : null}

            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  ...styles.buttonPrimary,
                  ...(isSaving ? styles.buttonDisabled : {}),
                }}
              >
                {isSaving ? "Saving..." : "Save Daily Metrics"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageSection>
  );
}
