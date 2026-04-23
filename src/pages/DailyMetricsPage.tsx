import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import {
  getDailyMetricByDate,
  upsertDailyMetricEntry,
} from "../services/dailyMetricsService";
import type { Athlete } from "../types/athlete";
import type { DailyMetric } from "../types/dailyMetrics";
import type { CSSProperties } from "react";

type DailyMetricDraft = {
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  sleepHours: string;
  steps: string;
  energyScore: string;
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
  helperText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: 1.6,
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
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginTop: "16px",
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
    minHeight: "96px",
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
  stateText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "15px",
  },
};

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyDraft(): DailyMetricDraft {
  return {
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    sleepHours: "",
    steps: "",
    energyScore: "",
    manualNotes: "",
  };
}

function toInputString(value?: number | null) {
  if (value == null) return "";
  return String(value);
}

function formatMetricValue(value?: number | null, suffix = "") {
  if (value == null) return "—";
  return `${value}${suffix}`;
}

function formatSleepHours(minutes?: number | null) {
  if (minutes == null) return "—";
  return `${(minutes / 60).toFixed(1)} hrs`;
}

function getCompletionLabel(metric: DailyMetric | null, draft: DailyMetricDraft) {
  const values = [
    metric?.calories ?? (draft.calories ? Number(draft.calories) : null),
    metric?.protein_g ?? (draft.proteinG ? Number(draft.proteinG) : null),
    metric?.carbs_g ?? (draft.carbsG ? Number(draft.carbsG) : null),
    metric?.fat_g ?? (draft.fatG ? Number(draft.fatG) : null),
    metric?.sleep_minutes ??
      (draft.sleepHours ? Math.round(Number(draft.sleepHours) * 60) : null),
    metric?.steps ?? (draft.steps ? Number(draft.steps) : null),
  ];

  const filledCount = values.filter((value) => value != null && !Number.isNaN(value)).length;

  if (filledCount === 0) return "Not Started";
  if (filledCount <= 2) return "Partial";
  if (filledCount <= 4) return "Mostly Complete";
  return "Complete Enough";
}

export default function DailyMetricsPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [dailyMetric, setDailyMetric] = useState<DailyMetric | null>(null);
  const [draft, setDraft] = useState<DailyMetricDraft>(createEmptyDraft());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);

        if (!currentAthlete) {
          setDailyMetric(null);
          setDraft(createEmptyDraft());
          return;
        }

        const metric = await getDailyMetricByDate(currentAthlete.id, selectedDate);
        setDailyMetric(metric);

        setDraft({
          calories: toInputString(metric?.calories),
          proteinG: toInputString(metric?.protein_g),
          carbsG: toInputString(metric?.carbs_g),
          fatG: toInputString(metric?.fat_g),
          sleepHours:
            metric?.sleep_minutes != null
              ? String((metric.sleep_minutes / 60).toFixed(1))
              : "",
          steps: toInputString(metric?.steps),
          energyScore: toInputString(metric?.energy_score),
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

  const completionLabel = useMemo(() => {
    return getCompletionLabel(dailyMetric, draft);
  }, [dailyMetric, draft]);

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

      const savedMetric = await upsertDailyMetricEntry({
        athleteId: athlete.id,
        metricDate: selectedDate,
        goalTypeAtTime: athlete.current_goal ?? null,
        calories: draft.calories.trim() ? Number(draft.calories) : null,
        proteinG: draft.proteinG.trim() ? Number(draft.proteinG) : null,
        carbsG: draft.carbsG.trim() ? Number(draft.carbsG) : null,
        fatG: draft.fatG.trim() ? Number(draft.fatG) : null,
        sleepMinutes: draft.sleepHours.trim()
          ? Math.round(Number(draft.sleepHours) * 60)
          : null,
        steps: draft.steps.trim() ? Number(draft.steps) : null,
        energyScore: draft.energyScore.trim() ? Number(draft.energyScore) : null,
        manualNotes: draft.manualNotes.trim() || null,
      });

      setDailyMetric(savedMetric);
      setDraft({
        calories: toInputString(savedMetric.calories),
        proteinG: toInputString(savedMetric.protein_g),
        carbsG: toInputString(savedMetric.carbs_g),
        fatG: toInputString(savedMetric.fat_g),
        sleepHours:
          savedMetric.sleep_minutes != null
            ? String((savedMetric.sleep_minutes / 60).toFixed(1))
            : "",
        steps: toInputString(savedMetric.steps),
        energyScore: toInputString(savedMetric.energy_score),
        manualNotes: savedMetric.manual_notes ?? "",
      });
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
      ) : errorMessage ? (
        <p style={styles.stateText}>{errorMessage}</p>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : (
        <div style={styles.stack}>
          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>Recovery / Nutrition</p>
                <p style={styles.subtitle}>
                  Daily totals entry for nutrition and recovery. This v1 slice saves one
                  editable row per date.
                </p>
              </div>

              <span style={styles.statusBadge}>{completionLabel}</span>
            </div>

            <div style={styles.actionRow}>
              <div style={styles.fieldBlock}>
                <label style={styles.label}>Selected Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>Daily Summary</p>
                <p style={styles.subtitle}>
                  Objective daily totals and recovery basics for the selected date.
                </p>
              </div>
            </div>

            <div style={styles.metricGrid}>
              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Calories</p>
                <p style={styles.metricValue}>
                  {formatMetricValue(dailyMetric?.calories ?? (draft.calories ? Number(draft.calories) : null))}
                </p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Protein</p>
                <p style={styles.metricValue}>
                  {formatMetricValue(
                    dailyMetric?.protein_g ?? (draft.proteinG ? Number(draft.proteinG) : null),
                    " g"
                  )}
                </p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Carbs</p>
                <p style={styles.metricValue}>
                  {formatMetricValue(
                    dailyMetric?.carbs_g ?? (draft.carbsG ? Number(draft.carbsG) : null),
                    " g"
                  )}
                </p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Fat</p>
                <p style={styles.metricValue}>
                  {formatMetricValue(
                    dailyMetric?.fat_g ?? (draft.fatG ? Number(draft.fatG) : null),
                    " g"
                  )}
                </p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Sleep</p>
                <p style={styles.metricValue}>
                  {formatSleepHours(
                    dailyMetric?.sleep_minutes ??
                      (draft.sleepHours ? Math.round(Number(draft.sleepHours) * 60) : null)
                  )}
                </p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Steps</p>
                <p style={styles.metricValue}>
                  {formatMetricValue(dailyMetric?.steps ?? (draft.steps ? Number(draft.steps) : null))}
                </p>
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>Daily Entry</p>
                <p style={styles.subtitle}>
                  Save nutrition totals, recovery basics, energy, and notes for the selected date.
                </p>
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.fieldBlock}>
                <label style={styles.label}>Calories</label>
                <input
                  value={draft.calories}
                  onChange={(event) => updateDraft("calories", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Protein (g)</label>
                <input
                  value={draft.proteinG}
                  onChange={(event) => updateDraft("proteinG", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Carbs (g)</label>
                <input
                  value={draft.carbsG}
                  onChange={(event) => updateDraft("carbsG", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Fat (g)</label>
                <input
                  value={draft.fatG}
                  onChange={(event) => updateDraft("fatG", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Sleep (hours)</label>
                <input
                  value={draft.sleepHours}
                  onChange={(event) => updateDraft("sleepHours", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Steps</label>
                <input
                  value={draft.steps}
                  onChange={(event) => updateDraft("steps", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Energy (1–10)</label>
                <input
                  value={draft.energyScore}
                  onChange={(event) => updateDraft("energyScore", event.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={draft.manualNotes}
                onChange={(event) => updateDraft("manualNotes", event.target.value)}
                style={styles.textArea}
              />
            </div>

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
                {isSaving ? "Saving..." : "Save Daily Entry"}
              </button>

              <button type="button" style={styles.buttonSecondary}>
                Enter Nutrition
              </button>
            </div>
          </div>
        </div>
      )}
    </PageSection>
  );
}