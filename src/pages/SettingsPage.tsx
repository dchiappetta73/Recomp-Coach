import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/shared/PageSection";
import {
  getCurrentAthlete,
  updateAthleteProfile,
} from "../services/athleteService";
import type { Athlete } from "../types/athlete";
import type { CSSProperties } from "react";

type SettingsDraft = {
  name: string;
  currentGoalDisplay: string;
  experienceLevel: string;
  equipmentProfile: string;
  injuryNotes: string;
  homeGymNotes: string;
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
    lineHeight: 1.5,
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
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.25,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

function createEmptyDraft(): SettingsDraft {
  return {
    name: "",
    currentGoalDisplay: "",
    experienceLevel: "",
    equipmentProfile: "",
    injuryNotes: "",
    homeGymNotes: "",
  };
}

function createDraftFromAthlete(athlete: Athlete | null): SettingsDraft {
  if (!athlete) return createEmptyDraft();

  return {
    name: athlete.name ?? "",
    currentGoalDisplay: athlete.current_goal ?? "",
    experienceLevel: athlete.experience_level ?? "",
    equipmentProfile: athlete.equipment_profile ?? "",
    injuryNotes: athlete.injury_notes ?? "",
    homeGymNotes: athlete.home_gym_notes ?? "",
  };
}

function getProfileCompletionLabel(athlete: Athlete | null, draft: SettingsDraft) {
  const values = [
    athlete?.name ?? draft.name,
    athlete?.current_goal ?? draft.currentGoalDisplay,
    athlete?.experience_level ?? draft.experienceLevel,
    athlete?.equipment_profile ?? draft.equipmentProfile,
    athlete?.injury_notes ?? draft.injuryNotes,
    athlete?.home_gym_notes ?? draft.homeGymNotes,
  ];

  const filledCount = values.filter((value) => value && String(value).trim().length > 0).length;

  if (filledCount <= 2) return "Basic";
  if (filledCount <= 4) return "Partial";
  return "Complete Enough";
}

export default function SettingsPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [draft, setDraft] = useState<SettingsDraft>(createEmptyDraft());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettingsPage() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);
        setDraft(createDraftFromAthlete(currentAthlete));
      } catch (error) {
        console.error("Failed to load settings page:", error);
        setErrorMessage("Settings data could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSettingsPage();
  }, []);

  const completionLabel = useMemo(() => {
    return getProfileCompletionLabel(athlete, draft);
  }, [athlete, draft]);

  function updateDraft(field: keyof SettingsDraft, value: string) {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (!athlete) return;
    if (!draft.name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const savedAthlete = await updateAthleteProfile({
        athleteId: athlete.id,
        name: draft.name.trim(),
        currentGoal: athlete.current_goal ?? null,
        experienceLevel: draft.experienceLevel.trim() || null,
        equipmentProfile: draft.equipmentProfile.trim() || null,
        injuryNotes: draft.injuryNotes.trim() || null,
        homeGymNotes: draft.homeGymNotes.trim() || null,
      });

      setAthlete(savedAthlete);
      setDraft(createDraftFromAthlete(savedAthlete));
    } catch (error) {
      console.error("Failed to save settings:", error);
      setErrorMessage("Settings could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageSection title="Settings">
      {isLoading ? (
        <p style={styles.stateText}>Loading settings...</p>
      ) : errorMessage ? (
        <p style={styles.stateText}>{errorMessage}</p>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : (
        <div style={styles.stack}>
          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>Profile Settings</p>
                <p style={styles.subtitle}>
                  Safe editing for the current athlete profile. This v1 slice keeps
                  the page focused on core profile fields only.
                </p>
              </div>

              <span style={styles.statusBadge}>{completionLabel}</span>
            </div>

            <div style={styles.metricGrid}>
              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Athlete</p>
                <p style={styles.metricValue}>{athlete.name || "—"}</p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Current Goal</p>
                <p style={styles.metricValue}>{athlete.current_goal || "—"}</p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Experience</p>
                <p style={styles.metricValue}>{athlete.experience_level || "—"}</p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Equipment</p>
                <p style={styles.metricValue}>{athlete.equipment_profile || "—"}</p>
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>Edit Profile</p>
                <p style={styles.subtitle}>
                  Update the profile fields already supported by the current schema.
                </p>
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.fieldBlock}>
                <label style={styles.label}>Name</label>
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft("name", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Current Goal</label>
                <input value={draft.currentGoalDisplay} readOnly style={styles.input} />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Experience Level</label>
                <input
                  value={draft.experienceLevel}
                  onChange={(event) => updateDraft("experienceLevel", event.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldBlock}>
                <label style={styles.label}>Equipment Profile</label>
                <input
                  value={draft.equipmentProfile}
                  onChange={(event) => updateDraft("equipmentProfile", event.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={styles.label}>Injury Notes</label>
              <textarea
                value={draft.injuryNotes}
                onChange={(event) => updateDraft("injuryNotes", event.target.value)}
                style={styles.textArea}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={styles.label}>Home Gym Notes</label>
              <textarea
                value={draft.homeGymNotes}
                onChange={(event) => updateDraft("homeGymNotes", event.target.value)}
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
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageSection>
  );
}