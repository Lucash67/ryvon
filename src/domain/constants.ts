import type {
  AdherenceWeights,
  CardioType,
  HealthNoteType,
  MealPlan,
  PhotoCategory,
} from "@/types";

export const APP_NAME = "RYVON";
export const DEFAULT_USER_NAME = "Lucas";

export const PROGRAM_START_DATE = "2026-08-30";
export const CYCLE_START_DATE = "2026-09-07";

export const DEFAULT_ADHERENCE_WEIGHTS: AdherenceWeights = {
  training: 30,
  nutrition: 25,
  sleep: 20,
  cardio: 15,
  routine: 10,
};

export const DEFAULT_MEAL_TIMES = ["07:00", "12:00", "17:30", "21:30"];
export const DEFAULT_MEAL_CUTOFF = "21:30";
export const DEFAULT_SLEEP_GOAL_MINUTES = 450;
export const DEFAULT_CARDIO_GOAL = 200;
export const DEFAULT_CARDIO_RPE = 8;
export const CALORIE_IN_RANGE_TOLERANCE = 0.08;
export const PROTEIN_IN_RANGE_TOLERANCE = 0.05;

export const DEFAULT_ON_TARGETS = {
  calories: 2270,
  protein: 146,
  carbs: 322,
  fat: 44,
};

export const DEFAULT_OFF_TARGETS = {
  calories: 2060,
  protein: 142,
  carbs: 279,
  fat: 43,
};

export const DEFAULT_MEAL_PLAN: MealPlan = {
  on: [
    {
      name: "Café da manhã",
      time: "07:00",
      items: [
        { name: "Pão de forma", quantity: "2 fatias" },
        { name: "Requeijão light", quantity: "20g" },
        { name: "Ovos", quantity: "2" },
        { name: "Queijo", quantity: "2 fatias" },
        { name: "Fruta", quantity: "1" },
      ],
    },
    {
      name: "Almoço",
      time: "12:00",
      items: [
        { name: "Arroz", quantity: "200g" },
        { name: "Feijão", quantity: "100g" },
        { name: "Peito de frango", quantity: "100g" },
        { name: "Hortaliças", quantity: "150g" },
        { name: "Fruta", quantity: "1" },
      ],
    },
    {
      name: "Sobremesa",
      time: "12:30",
      items: [{ name: "Chocolate", quantity: "30g" }],
    },
    {
      name: "Lanche / ceia",
      time: "17:00",
      items: [
        { name: "Iogurte natural desnatado", quantity: "160g" },
        { name: "Aveia", quantity: "40g" },
        { name: "Whey", quantity: "15g" },
        { name: "Fruta", quantity: "1" },
        { name: "Psyllium", quantity: "10g", optional: true },
      ],
    },
    {
      name: "Jantar",
      time: "21:30",
      items: [
        { name: "Arroz", quantity: "200g" },
        { name: "Feijão", quantity: "100g" },
        { name: "Peito de frango", quantity: "100g" },
        { name: "Hortaliças", quantity: "150g" },
        { name: "Fruta", quantity: "1" },
      ],
    },
  ],
  off: [
    {
      name: "Café da manhã",
      time: "07:00",
      items: [
        { name: "Pão de forma", quantity: "2 fatias" },
        { name: "Requeijão light", quantity: "20g" },
        { name: "Ovos", quantity: "2" },
        { name: "Queijo", quantity: "2 fatias" },
        { name: "Fruta", quantity: "1" },
      ],
    },
    {
      name: "Almoço",
      time: "12:00",
      items: [
        { name: "Arroz", quantity: "150g" },
        { name: "Feijão", quantity: "100g" },
        { name: "Peito de frango", quantity: "100g" },
        { name: "Hortaliças", quantity: "150g" },
        { name: "Fruta", quantity: "1" },
      ],
    },
    {
      name: "Sobremesa",
      time: "12:30",
      items: [{ name: "Chocolate", quantity: "30g" }],
    },
    {
      name: "Lanche / ceia",
      time: "17:00",
      items: [
        { name: "Iogurte natural desnatado", quantity: "160g" },
        { name: "Aveia", quantity: "20g" },
        { name: "Whey", quantity: "15g" },
        { name: "Fruta", quantity: "1" },
        { name: "Psyllium", quantity: "10g", optional: true },
      ],
    },
    {
      name: "Jantar",
      time: "21:30",
      items: [
        { name: "Arroz", quantity: "150g" },
        { name: "Feijão", quantity: "100g" },
        { name: "Peito de frango", quantity: "100g" },
        { name: "Hortaliças", quantity: "150g" },
        { name: "Fruta", quantity: "1" },
      ],
    },
  ],
};

export const CARDIO_LABELS: Record<CardioType, string> = {
  walk: "Caminhada",
  bike: "Bike",
  stairs: "Escada",
  run: "Corrida",
  treadmill: "Esteira",
  elliptical: "Elíptico",
  swim: "Natação",
  cycling: "Ciclismo",
  other: "Outro",
};

export const CARDIO_TIMING_LABELS = {
  before_workout: "Antes do treino",
  after_workout: "Depois do treino",
  other: "Outro",
} as const;

export const ACTIVITY_LABELS: Record<"low" | "medium" | "high", string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};

export const PHOTO_CATEGORY_LABELS: Record<PhotoCategory, string> = {
  relaxed_front: "Relaxado frente",
  relaxed_side: "Relaxado lado",
  relaxed_back: "Relaxado costas",
  pose_front: "Pose frente",
  pose_back: "Pose costas",
  pose_side: "Pose lateral",
  other: "Outras",
};

export const HEALTH_NOTE_LABELS: Record<HealthNoteType, string> = {
  pain: "Dor",
  discomfort: "Desconforto",
  fatigue: "Fadiga",
  illness: "Doença",
  travel: "Viagem",
  different_gym: "Academia diferente",
  free_meal: "Refeição livre",
  event: "Evento",
  other: "Outro",
};

export const WEEKDAY_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
export const WEEKDAY_LONG = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export const WORKOUT_CYCLE = [
  { slug: "pull", name: "Pull", isRest: false },
  { slug: "push", name: "Push", isRest: false },
  { slug: "lower-a", name: "Lower A", isRest: false },
  { slug: "rest-1", name: "Descanso", isRest: true },
  { slug: "upper", name: "Upper", isRest: false },
  { slug: "lower-b", name: "Lower B", isRest: false },
  { slug: "rest-2", name: "Descanso", isRest: true },
] as const;
