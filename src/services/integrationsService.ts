import { supabase } from "./supabaseClient";

export type SourceName = "manual" | "zepp" | "cronometer" | "upload";
export type ConnectionStatus = "disconnected" | "connected" | "error" | "pending";

export interface SourceConnection {
  id: string;
  athlete_id: string;
  source_name: SourceName;
  is_active: boolean;
  connection_status: ConnectionStatus;
  last_sync_at?: string | null;
  sync_frequency?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export async function getSourceConnectionsForAthlete(
  athleteId: string
): Promise<SourceConnection[]> {
  const { data, error } = await supabase
    .from("source_connections")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("source_name", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as SourceConnection[];
}