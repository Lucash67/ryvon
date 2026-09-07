export type SeedExercise = {
  name: string;
  muscle: string;
  baseline?: Array<{ weight: number; reps: number }>;
};

export type SeedTemplate = {
  name: string;
  slug: string;
  isRest: boolean;
  exercises: Array<{
    name: string;
    workSets: number;
    repMin: number;
    repMax: number;
    rest: number;
    instructions?: string;
  }>;
};

export const SEED_EXERCISES: SeedExercise[] = [
  { name: "Puxada Alta Pronada", muscle: "Costas", baseline: [{ weight: 47, reps: 8 }] },
  { name: "T-Bar Row", muscle: "Costas", baseline: [{ weight: 25, reps: 8 }] },
  {
    name: "Remada Baixa Unilateral Neutra",
    muscle: "Costas",
    baseline: [{ weight: 33, reps: 9 }],
  },
  { name: "Crucifixo inverso máquina", muscle: "Ombro posterior", baseline: [{ weight: 4, reps: 10 }] },
  { name: "Rosca Scott máquina", muscle: "Bíceps" },
  { name: "Abdominal infra banco declinado", muscle: "Abdômen" },
  { name: "Supino reto máquina", muscle: "Peito" },
  { name: "Crucifixo polia baixa", muscle: "Peito" },
  {
    name: "Desenvolvimento máquina",
    muscle: "Ombro",
    baseline: [
      { weight: 12.5, reps: 10 },
      { weight: 12.5, reps: 8 },
    ],
  },
  {
    name: "Elevação lateral polia média unilateral",
    muscle: "Ombro",
    baseline: [{ weight: 8, reps: 10 }],
  },
  { name: "Tríceps Carter", muscle: "Tríceps" },
  { name: "Abdominal supra máquina", muscle: "Abdômen", baseline: [{ weight: 65, reps: 10 }] },
  { name: "Cadeira flexora", muscle: "Posterior" },
  { name: "Cadeira adutora", muscle: "Adutores" },
  { name: "Agachamento Hack", muscle: "Quadríceps" },
  { name: "Elevação pélvica máquina", muscle: "Glúteo" },
  { name: "Cadeira extensora", muscle: "Quadríceps", baseline: [{ weight: 60, reps: 8 }] },
  { name: "Panturrilha em pé", muscle: "Panturrilha" },
  {
    name: "Supino inclinado máquina",
    muscle: "Peito",
    baseline: [{ weight: 15, reps: 6 }],
  },
  {
    name: "Puxador frente unilateral",
    muscle: "Costas",
    baseline: [
      { weight: 20, reps: 8 },
      { weight: 20, reps: 6 },
    ],
  },
  { name: "Voador", muscle: "Peito" },
  {
    name: "Remada articulada pronada",
    muscle: "Costas",
    baseline: [{ weight: 20, reps: 8 }],
  },
  { name: "Elevação lateral halter sentado", muscle: "Ombro" },
  { name: "Tríceps francês polia", muscle: "Tríceps", baseline: [{ weight: 19, reps: 8 }] },
  { name: "Rosca direta de costas para polia barra W", muscle: "Bíceps" },
  { name: "Stiff-Legged Deadlift", muscle: "Posterior", baseline: [{ weight: 30, reps: 8 }] },
  { name: "Panturrilha Leg Press 45", muscle: "Panturrilha" },
  { name: "Leg Press 45", muscle: "Quadríceps", baseline: [{ weight: 120, reps: 8 }] },
  { name: "Mesa flexora", muscle: "Posterior" },
];

const pullWarmup =
  "Warm-up: 12–15 reps a 50% com >5 RIR. Preparatória: 3–5 reps a 75% com >5 RIR. Reconhecimento: 1–2 reps a 90% com >5 RIR.";

export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    name: "Pull",
    slug: "pull",
    isRest: false,
    exercises: [
      { name: "Puxada Alta Pronada", workSets: 2, repMin: 5, repMax: 9, rest: 120, instructions: pullWarmup },
      { name: "T-Bar Row", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Remada Baixa Unilateral Neutra", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Crucifixo inverso máquina", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Rosca Scott máquina", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Abdominal infra banco declinado", workSets: 2, repMin: 5, repMax: 9, rest: 60 },
    ],
  },
  {
    name: "Push",
    slug: "push",
    isRest: false,
    exercises: [
      { name: "Supino reto máquina", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Crucifixo polia baixa", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Desenvolvimento máquina", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Elevação lateral polia média unilateral", workSets: 2, repMin: 5, repMax: 12, rest: 90 },
      { name: "Tríceps Carter", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Abdominal supra máquina", workSets: 2, repMin: 5, repMax: 9, rest: 60 },
    ],
  },
  {
    name: "Lower A",
    slug: "lower-a",
    isRest: false,
    exercises: [
      { name: "Cadeira flexora", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Cadeira adutora", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Agachamento Hack", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Elevação pélvica máquina", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Cadeira extensora", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Panturrilha em pé", workSets: 2, repMin: 5, repMax: 9, rest: 60 },
    ],
  },
  { name: "Descanso", slug: "rest-1", isRest: true, exercises: [] },
  {
    name: "Upper",
    slug: "upper",
    isRest: false,
    exercises: [
      { name: "Supino inclinado máquina", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Puxador frente unilateral", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Voador", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Remada articulada pronada", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Elevação lateral halter sentado", workSets: 2, repMin: 5, repMax: 12, rest: 90 },
      { name: "Tríceps francês polia", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Rosca direta de costas para polia barra W", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
    ],
  },
  {
    name: "Lower B",
    slug: "lower-b",
    isRest: false,
    exercises: [
      { name: "Stiff-Legged Deadlift", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Panturrilha Leg Press 45", workSets: 2, repMin: 5, repMax: 9, rest: 60 },
      { name: "Leg Press 45", workSets: 2, repMin: 5, repMax: 9, rest: 120 },
      { name: "Mesa flexora", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Cadeira extensora", workSets: 2, repMin: 5, repMax: 9, rest: 90 },
      { name: "Abdominal supra máquina", workSets: 2, repMin: 5, repMax: 9, rest: 60 },
    ],
  },
  { name: "Descanso", slug: "rest-2", isRest: true, exercises: [] },
];

export const WEEK1_LOGS = [
  {
    date: "2026-08-30",
    sleepStart: "23:00",
    sleepEnd: "08:00",
    sleepMinutes: 540,
    cardio: [{ type: "bike", minutes: 30 }],
    workout: { label: "Peito + tríceps", status: "completed" },
    activity: "low",
    calories: 2500,
    carbs: 280,
    protein: 90,
    fat: 90,
    dayType: "on",
  },
  {
    date: "2026-08-31",
    sleepStart: "23:30",
    sleepEnd: "06:00",
    sleepMinutes: 390,
    cardio: [{ type: "stairs", minutes: 40 }],
    workout: { label: "Costas + ombro", status: "completed" },
    activity: "low",
    calories: 1900,
    carbs: 240,
    protein: 140,
    fat: 50,
    dayType: "on",
  },
  {
    date: "2026-09-01",
    sleepStart: "23:30",
    sleepEnd: "06:00",
    sleepMinutes: 390,
    cardio: [{ type: "bike", minutes: 30 }],
    workout: { label: "Perna", status: "completed" },
    activity: "low",
    calories: 1800,
    carbs: 200,
    protein: 140,
    fat: 60,
    dayType: "on",
  },
  {
    date: "2026-09-02",
    sleepStart: "22:30",
    sleepEnd: "06:30",
    sleepMinutes: 480,
    cardio: [{ type: "stairs", minutes: 60 }],
    workout: { label: "Descanso", status: "completed" },
    activity: "high",
    calories: 1700,
    carbs: 210,
    protein: 150,
    fat: 40,
    dayType: "off",
  },
  {
    date: "2026-09-03",
    sleepStart: "02:00",
    sleepEnd: "06:00",
    sleepMinutes: 240,
    cardio: [{ type: "bike", minutes: 20 }],
    workout: { label: "Upper", status: "completed" },
    activity: "high",
    calories: 1900,
    carbs: 230,
    protein: 160,
    fat: 45,
    dayType: "on",
  },
  {
    date: "2026-09-04",
    sleepStart: "01:00",
    sleepEnd: "06:00",
    sleepMinutes: 300,
    cardio: [],
    workout: { label: "Lower", status: "missed" },
    activity: "medium",
    calories: 2100,
    carbs: 260,
    protein: 130,
    fat: 60,
    dayType: "on",
  },
  {
    date: "2026-09-05",
    sleepStart: "01:30",
    sleepEnd: "09:30",
    sleepMinutes: 480,
    cardio: [],
    workout: { label: "Descanso", status: "completed" },
    activity: "medium",
    calories: 2000,
    carbs: 200,
    protein: 130,
    fat: 75,
    dayType: "off",
  },
] as const;
