import { useEffect, useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import {
  getWeeklyCheckinByWeekNumber,
  upsertWeeklyCheckinMvpFields,
} from "../services/weeklyCheckinService";
import type { Athlete } from "../types/athlete";
import type { CSSProperties } from "react";

type WeeklyCheckinDraft = {
  wentWell: string;
  difficult: string;
  scheduleIssues: string;
  painInjuryChanges: string;
  requestedAdjustments: string;
  readinessScore: string;
};

const styles: Record<string, CSSProperties> = {
  stateText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "15px",
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
    gap: "16px",
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

function createEmptyDraft(): WeeklyCheckinDraft {
  return {
    wentWell: "",
    difficult: "",
    scheduleIssues: "",
    painInjuryChanges: "",
    requestedAdjustments: "",
    readinessScore: "",
  };
}

function toInputString(value?: string | number | null) {
  if (value == null) return "";
  return String(value);
}

function nullableText(value: string) {
  return value.trim() || null;
}

function parseReadinessScore(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new Error("Readiness score must be between 1 and 5.");
  }

  return parsed;
}

function getCurrentWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.ceil(((now.getTime() - start.getTime()) / dayMs + start.getDay() + 1) / 7);
}

export default function WeeklyCheckinPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [weekNumber, setWeekNumber] = useState(String(getCurrentWeekNumber()));
  const [draft, setDraft] = useState<WeeklyCheckinDraft>(createEmptyDraft());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeeklyCheckin() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);

        const parsedWeekNumber = Number(weekNumber);
        if (!currentAthlete || !Number.isInteger(parsedWeekNumber) || parsedWeekNumber < 1) {
          setDraft(createEmptyDraft());
          return;
        }

        const checkin = await getWeeklyCheckinByWeekNumber(
          currentAthlete.id,
          parsedWeekNumber
        );

        setDraft({
          wentWell: toInputString(checkin?.went_well),
          difficult: toInputString(checkin?.difficult),
          scheduleIssues: toInputString(checkin?.schedule_issues),
          painInjuryChanges: toInputString(checkin?.pain_injury_changes),
          requestedAdjustments: toInputString(checkin?.requested_adjustments),
          readinessScore: toInputString(checkin?.readiness_score),
        });
      } catch (error) {
        console.error("Failed to load weekly check-in:", error);
        setErrorMessage("Weekly check-in could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadWeeklyCheckin();
  }, [weekNumber]);

  function updateDraft(field: keyof WeeklyCheckinDraft, value: string) {
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

      const parsedWeekNumber = Number(weekNumber);
      if (!Number.isInteger(parsedWeekNumber) || parsedWeekNumber < 1) {
        throw new Error("Week number is required.");
      }

      const savedCheckin = await upsertWeeklyCheckinMvpFields({
        athleteId: athlete.id,
        weekNumber: parsedWeekNumber,
        wentWell: nullableText(draft.wentWell),
        difficult: nullableText(draft.difficult),
        scheduleIssues: nullableText(draft.scheduleIssues),
        painInjuryChanges: nullableText(draft.painInjuryChanges),
        requestedAdjustments: nullableText(draft.requestedAdjustments),
        readinessScore: parseReadinessScore(draft.readinessScore),
      });

      setDraft({
        wentWell: toInputString(savedCheckin.went_well),
        difficult: toInputString(savedCheckin.difficult),
        scheduleIssues: toInputString(savedCheckin.schedule_issues),
        painInjuryChanges: toInputString(savedCheckin.pain_injury_changes),
        requestedAdjustments: toInputString(savedCheckin.requested_adjustments),
        readinessScore: toInputString(savedCheckin.readiness_score),
      });
      setSuccessMessage("Weekly check-in saved.");
    } catch (error) {
      console.error("Failed to save weekly check-in:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Weekly check-in could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageSection title="Weekly Check-In">
      {isLoading ? (
        <p style={styles.stateText}>Loading weekly check-in...</p>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : (
        <div style={styles.panel}>
          <p style={styles.title}>Weekly Check-In</p>
          <p style={styles.subtitle}>
            Save one subjective weekly check-in for export.
          </p>

          <div style={styles.formGrid}>
            <div style={styles.fieldBlock}>
              <label style={styles.label}>Week Number</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={weekNumber}
                onChange={(event) => setWeekNumber(event.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.label}>What went well</label>
              <textarea
                value={draft.wentWell}
                onChange={(event) => updateDraft("wentWell", event.target.value)}
                style={styles.textArea}
              />
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.label}>What was difficult</label>
              <textarea
                value={draft.difficult}
                onChange={(event) => updateDraft("difficult", event.target.value)}
                style={styles.textArea}
              />
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.label}>Schedule issues</label>
              <textarea
                value={draft.scheduleIssues}
                onChange={(event) => updateDraft("scheduleIssues", event.target.value)}
                style={styles.textArea}
              />
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.label}>Pain/injury changes</label>
              <textarea
                value={draft.painInjuryChanges}
                onChange={(event) =>
                  updateDraft("painInjuryChanges", event.target.value)
                }
                style={styles.textArea}
              />
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.label}>Requested adjustments</label>
              <textarea
                value={draft.requestedAdjustments}
                onChange={(event) =>
                  updateDraft("requestedAdjustments", event.target.value)
                }
                style={styles.textArea}
              />
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.label}>Readiness score (1-5)</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="5"
                value={draft.readinessScore}
                onChange={(event) => updateDraft("readinessScore", event.target.value)}
                style={styles.input}
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
              {isSaving ? "Saving..." : "Save Weekly Check-In"}
            </button>
          </div>
        </div>
      )}
    </PageSection>
  );
}
