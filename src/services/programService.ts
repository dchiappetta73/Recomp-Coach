    import { getPlannedWorkoutSessionsForAthlete } from "./workoutSessionService";
import type { PlannedWorkoutSession } from "../types/workoutSession";

export interface ProgramDayGroup {
  dayNo: number;
  sessions: PlannedWorkoutSession[];
}

export interface ProgramWeekGroup {
  weekNo: number;
  block: string;
  days: ProgramDayGroup[];
}

export async function getProgramOverviewForAthlete(
  athleteId: string
): Promise<ProgramWeekGroup[]> {
  const sessions = await getPlannedWorkoutSessionsForAthlete(athleteId);

  const weekMap = new Map<string, ProgramWeekGroup>();

  for (const session of sessions) {
    const weekKey = `${session.week_no}__${session.block}`;

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        weekNo: session.week_no,
        block: session.block,
        days: [],
      });
    }

    const weekGroup = weekMap.get(weekKey)!;
    let dayGroup = weekGroup.days.find((day) => day.dayNo === session.day_no);

    if (!dayGroup) {
      dayGroup = {
        dayNo: session.day_no,
        sessions: [],
      };
      weekGroup.days.push(dayGroup);
    }

    dayGroup.sessions.push(session);
  }

  return Array.from(weekMap.values())
    .sort((a, b) => a.weekNo - b.weekNo)
    .map((week) => ({
      ...week,
      days: [...week.days].sort((a, b) => a.dayNo - b.dayNo),
    }));
}