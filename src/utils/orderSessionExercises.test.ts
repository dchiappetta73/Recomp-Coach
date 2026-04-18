import { orderSessionExercises } from "./orderSessionExercises";

const upperA = [
  "Dumbbell Bench Press",
  "Cable Row",
  "Lat Pulldown",
  "Tonal Fly",
  "Lateral Raise",
  "Triceps Pushdowns",
  "Incline Curls",
  "Shoulder Finisher",
];

const lowerA = [
  "Goblet Squat",
  "Romanian Deadlift",
  "Leg Curl",
  "Leg Extension",
  "Calf Raises",
  "Core Tri-Set",
];

console.log("Upper A ordered:");
console.log(orderSessionExercises(upperA, "upperA"));

console.log("Lower A ordered:");
console.log(orderSessionExercises(lowerA, "lowerA"));