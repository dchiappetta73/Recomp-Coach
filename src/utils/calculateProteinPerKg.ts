export function calculateProteinPerKg(proteinG: number, bodyweightLb: number): number | null {
  if (!proteinG || !bodyweightLb) return null;
  const bodyweightKg = bodyweightLb / 2.20462;
  return proteinG / bodyweightKg;
}