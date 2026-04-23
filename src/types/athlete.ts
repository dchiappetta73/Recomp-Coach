import type { GoalType } from "./goals";

export interface Athlete {
  id: string;
  auth_user_id?: string | null;
  name: string;
  athlete_code?: string | null;
  birth_year?: number | null;
  sex?: string | null;
  height_in?: number | null;
  current_goal: GoalType;
  goal_started_on?: string | null;
  experience_level?: string | null;
  equipment_profile?: string | null;
  home_gym_notes?: string | null;
  injury_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}