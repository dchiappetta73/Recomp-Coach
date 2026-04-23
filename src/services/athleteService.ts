import { supabase } from "./supabaseClient";
import type { Athlete } from "../types/athlete";

export async function getCurrentAthlete(): Promise<Athlete | null> {
  const { data, error } = await supabase
    .from("athletes")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Athlete | null;
}

export async function updateAthleteProfile(params: {
  athleteId: string;
  name: string;
  currentGoal: string | null;
  experienceLevel?: string | null;
  equipmentProfile?: string | null;
  injuryNotes?: string | null;
  homeGymNotes?: string | null;
}): Promise<Athlete> {
  const payload = {
    name: params.name,
    current_goal: params.currentGoal,
    experience_level: params.experienceLevel ?? null,
    equipment_profile: params.equipmentProfile ?? null,
    injury_notes: params.injuryNotes ?? null,
    home_gym_notes: params.homeGymNotes ?? null,
  };

  const { data, error } = await supabase
    .from("athletes")
    .update(payload)
    .eq("id", params.athleteId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Athlete;
}