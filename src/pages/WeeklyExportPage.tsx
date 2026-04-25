import { useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import { generateWeeklyExport } from "../services/weeklyExportService";

const styles = {
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  } as const,
  label: {
    display: "grid",
    gap: "6px",
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: 600,
  } as const,
  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "#020617",
    color: "#f8fafc",
    padding: "10px 12px",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "12px",
    marginBottom: "16px",
  },
  button: {
    border: "1px solid #2563eb",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #475569",
    borderRadius: "8px",
    background: "#1e293b",
    color: "#f8fafc",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    color: "#cbd5e1",
    margin: "12px 0",
  },
  error: {
    color: "#fecaca",
    margin: "12px 0",
  },
  output: {
    width: "100%",
    minHeight: "520px",
    boxSizing: "border-box" as const,
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "#020617",
    color: "#f8fafc",
    padding: "16px",
    fontSize: "13px",
    lineHeight: 1.5,
    whiteSpace: "pre" as const,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
} as const;

export default function WeeklyExportPage() {
  const [weekNumber, setWeekNumber] = useState("1");
  const [weekStartDate, setWeekStartDate] = useState("");
  const [weekEndDate, setWeekEndDate] = useState("");
  const [exportText, setExportText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  async function handleGenerateExport() {
    try {
      setIsGenerating(true);
      setErrorMessage(null);
      setCopyMessage(null);

      const parsedWeekNumber = Number(weekNumber);

      if (!Number.isFinite(parsedWeekNumber) || parsedWeekNumber < 1) {
        setErrorMessage("Enter a valid week number.");
        return;
      }

      if (!weekStartDate || !weekEndDate) {
        setErrorMessage("Enter a week start date and week end date.");
        return;
      }

      const athlete = await getCurrentAthlete();

      if (!athlete) {
        setErrorMessage("No athlete record found.");
        return;
      }

      const generatedExport = await generateWeeklyExport({
        athleteId: athlete.id,
        weekNumber: parsedWeekNumber,
        weekStartDate,
        weekEndDate,
      });

      setExportText(generatedExport);
    } catch (error) {
      console.error("Failed to generate weekly export:", error);
      setErrorMessage("Weekly export could not be generated.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyToClipboard() {
    try {
      setCopyMessage(null);
      setErrorMessage(null);

      if (!exportText) {
        setErrorMessage("Generate an export before copying.");
        return;
      }

      await navigator.clipboard.writeText(exportText);
      setCopyMessage("Copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy weekly export:", error);
      setErrorMessage("Weekly export could not be copied.");
    }
  }

  return (
    <PageSection title="Weekly Export">
      <div style={styles.form}>
        <label style={styles.label}>
          Week number
          <input
            style={styles.input}
            type="number"
            min="1"
            value={weekNumber}
            onChange={(event) => setWeekNumber(event.target.value)}
          />
        </label>

        <label style={styles.label}>
          Week start date
          <input
            style={styles.input}
            type="date"
            value={weekStartDate}
            onChange={(event) => setWeekStartDate(event.target.value)}
          />
        </label>

        <label style={styles.label}>
          Week end date
          <input
            style={styles.input}
            type="date"
            value={weekEndDate}
            onChange={(event) => setWeekEndDate(event.target.value)}
          />
        </label>
      </div>

      <div style={styles.actions}>
        <button
          style={styles.button}
          type="button"
          onClick={handleGenerateExport}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Export"}
        </button>

        <button
          style={styles.secondaryButton}
          type="button"
          onClick={handleCopyToClipboard}
          disabled={!exportText}
        >
          Copy to Clipboard
        </button>
      </div>

      {errorMessage ? <p style={styles.error}>{errorMessage}</p> : null}
      {copyMessage ? <p style={styles.message}>{copyMessage}</p> : null}

      <textarea
        style={styles.output}
        readOnly
        value={exportText}
        placeholder="Generated weekly export will appear here."
      />
    </PageSection>
  );
}
