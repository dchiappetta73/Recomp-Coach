export function analyzeSleepConsistency(sdHours: number | null | undefined): string {
  if (sdHours == null) return "No data";
  if (sdHours < 0.5) return "Excellent";
  if (sdHours <= 1.0) return "Good";
  if (sdHours <= 1.5) return "Variable";
  return "Erratic";
}