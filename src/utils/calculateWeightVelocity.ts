export function calculateWeightVelocity(currentAvg: number, previousAvg: number): number | null {
  if (currentAvg == null || previousAvg == null) return null;
  return Number((currentAvg - previousAvg).toFixed(2));
}