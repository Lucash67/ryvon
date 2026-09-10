import type { LucideIcon } from "lucide-react";
import {
  CalendarRange,
  Dumbbell,
  FileText,
  HeartPulse,
  Image,
  LayoutDashboard,
  Moon,
  MoreHorizontal,
  PlusCircle,
  Settings,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  meta?: string;
};

export const desktopNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hoje", label: "Hoje", icon: PlusCircle, meta: "rápido" },
  { href: "/semana", label: "Semana", icon: CalendarRange },
  { href: "/treinos", label: "Treinos", icon: Dumbbell },
  { href: "/nutricao", label: "Nutrição", icon: UtensilsCrossed },
  { href: "/cardio", label: "Cardio", icon: HeartPulse },
  { href: "/sono", label: "Sono", icon: Moon },
  { href: "/progresso", label: "Progresso", icon: TrendingUp },
  { href: "/fotos", label: "Fotos", icon: Image },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export const mobileNav: NavItem[] = [
  { href: "/hoje", label: "Hoje", icon: PlusCircle },
  { href: "/semana", label: "Semana", icon: CalendarRange },
  { href: "/treinos", label: "Treino", icon: Dumbbell },
  { href: "/progresso", label: "Progresso", icon: TrendingUp },
  { href: "/mais", label: "Mais", icon: MoreHorizontal },
];

export const maisRoutes = ["/mais", "/nutricao", "/cardio", "/sono", "/fotos", "/relatorios", "/configuracoes", "/dashboard"];
