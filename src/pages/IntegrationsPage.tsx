import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/shared/PageSection";
import { getCurrentAthlete } from "../services/athleteService";
import {
  getSourceConnectionsForAthlete,
  type SourceConnection,
  type SourceName,
} from "../services/integrationsService";
import type { Athlete } from "../types/athlete";
import type { CSSProperties } from "react";

type ConnectionStatusMap = Record<SourceName, SourceConnection | null>;

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
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
  },
  sourceCard: {
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(2, 6, 23, 0.35)",
    borderRadius: "14px",
    padding: "16px",
  },
  sourceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  sourceTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: 700,
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#1e293b",
    color: "#e2e8f0",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  sourceMeta: {
    margin: "8px 0 0 0",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  stateText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "15px",
  },
};

const AVAILABLE_SOURCES: Array<{
  key: SourceName;
  title: string;
  description: string;
}> = [
  {
    key: "zepp",
    title: "Zepp",
    description: "Wearable and daily recovery source lane.",
  },
  {
    key: "cronometer",
    title: "Cronometer",
    description: "Nutrition and macro tracking source lane.",
  },
  {
    key: "upload",
    title: "Uploads",
    description:
      "File-based import lane for reports, exports, and unsupported external sources.",
  },
  {
    key: "manual",
    title: "Manual",
    description:
      "Direct app-entry path when no live integration or upload source is used.",
  },
];

function formatStatus(status?: string | null) {
  if (!status) return "Disconnected";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatLastSync(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function IntegrationPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [connections, setConnections] = useState<SourceConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadIntegrationsPage() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const currentAthlete = await getCurrentAthlete();
        setAthlete(currentAthlete);

        if (!currentAthlete) {
          setConnections([]);
          return;
        }

        const rows = await getSourceConnectionsForAthlete(currentAthlete.id);
        setConnections(rows);
      } catch (error) {
        console.error("Failed to load integrations page:", error);
        setErrorMessage("Integration data could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadIntegrationsPage();
  }, []);

  const connectionsBySource = useMemo<ConnectionStatusMap>(() => {
    const map: ConnectionStatusMap = {
      manual: null,
      zepp: null,
      cronometer: null,
      upload: null,
    };

    for (const row of connections) {
      map[row.source_name] = row;
    }

    return map;
  }, [connections]);

  const connectedCount = useMemo(() => {
    return connections.filter((row) => row.connection_status === "connected").length;
  }, [connections]);

  const activeCount = useMemo(() => {
    return connections.filter((row) => row.is_active).length;
  }, [connections]);

  return (
    <PageSection title="Integrations">
      {isLoading ? (
        <p style={styles.stateText}>Loading integrations...</p>
      ) : errorMessage ? (
        <p style={styles.stateText}>{errorMessage}</p>
      ) : !athlete ? (
        <p style={styles.stateText}>No athlete record found yet.</p>
      ) : (
        <div style={styles.stack}>
          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>Connections Overview</p>
                <p style={styles.subtitle}>
                  Read-only status view for current and future integration lanes.
                  This v1 slice does not manage live connect/disconnect workflows yet.
                </p>
              </div>
            </div>

            <div style={styles.metricGrid}>
              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Configured Rows</p>
                <p style={styles.metricValue}>{connections.length}</p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Connected</p>
                <p style={styles.metricValue}>{connectedCount}</p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Active</p>
                <p style={styles.metricValue}>{activeCount}</p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Athlete</p>
                <p style={styles.metricValue}>{athlete.name}</p>
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <div>
                <p style={styles.title}>Integration Lanes</p>
                <p style={styles.subtitle}>
                  Zepp and Cronometer are dedicated lanes. Uploads covers file-based
                  imports and unsupported external export paths. Manual remains the
                  direct app-entry lane.
                </p>
              </div>
            </div>

            <div style={styles.cardGrid}>
              {AVAILABLE_SOURCES.map((source) => {
                const row = connectionsBySource[source.key];

                return (
                  <div key={source.key} style={styles.sourceCard}>
                    <div style={styles.sourceHeader}>
                      <div>
                        <p style={styles.sourceTitle}>{source.title}</p>
                      </div>

                      <span style={styles.badge}>
                        {formatStatus(row?.connection_status ?? "disconnected")}
                      </span>
                    </div>

                    <p style={styles.sourceMeta}>{source.description}</p>
                    <p style={styles.sourceMeta}>
                      Active: {row ? (row.is_active ? "Yes" : "No") : "No"}
                    </p>
                    <p style={styles.sourceMeta}>
                      Sync Frequency: {row?.sync_frequency ?? "—"}
                    </p>
                    <p style={styles.sourceMeta}>
                      Last Sync: {formatLastSync(row?.last_sync_at)}
                    </p>

                    {!row ? (
                      <p style={styles.sourceMeta}>
                        No configured connection row yet for this source.
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PageSection>
  );
}