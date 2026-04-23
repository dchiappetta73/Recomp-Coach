import type { GoalType } from "../../types/goals";

export const GOAL_THRESHOLDS: Record<
  GoalType,
  {
    idealWeeklyWeightChangeLow: number;
    idealWeeklyWeightChangeHigh: number;
  }
> = {
  recomp: { idealWeeklyWeightChangeLow: -0.5, idealWeeklyWeightChangeHigh: 0.5 },
  fat_loss: { idealWeeklyWeightChangeLow: -1.5, idealWeeklyWeightChangeHigh: -0.25 },
  muscle_gain: { idealWeeklyWeightChangeLow: 0.1, idealWeeklyWeightChangeHigh: 0.75 },
  maintenance: { idealWeeklyWeightChangeLow: -0.25, idealWeeklyWeightChangeHigh: 0.25 },
  general_fitness: { idealWeeklyWeightChangeLow: -0.5, idealWeeklyWeightChangeHigh: 0.5 },
  performance: { idealWeeklyWeightChangeLow: -0.5, idealWeeklyWeightChangeHigh: 0.5 },
  recovery_rehab: { idealWeeklyWeightChangeLow: -0.25, idealWeeklyWeightChangeHigh: 0.25 },
};