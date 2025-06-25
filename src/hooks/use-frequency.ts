import { Flame, Star, User, Badge as BadgeIcon } from "lucide-react";

export type FrequencyLevel = "VIP" | "Frequente" | "Regular" | "Novo";

export interface FrequencyConfig {
  level: FrequencyLevel;
  icon: any;
  color: string;
  label: string;
  minConsultations: number;
}

export const frequencyConfigs: FrequencyConfig[] = [
  {
    level: "VIP",
    icon: Flame,
    color: "text-red-600 bg-red-50 border-red-200",
    label: "🔥 VIP",
    minConsultations: 10,
  },
  {
    level: "Frequente",
    icon: Star,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    label: "⭐ Frequente",
    minConsultations: 5,
  },
  {
    level: "Regular",
    icon: User,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    label: "👤 Regular",
    minConsultations: 2,
  },
  {
    level: "Novo",
    icon: BadgeIcon,
    color: "text-green-600 bg-green-50 border-green-200",
    label: "🆕 Novo",
    minConsultations: 1,
  },
];

export function getFrequencyLevel(consultations: number): FrequencyConfig {
  if (consultations >= 10) return frequencyConfigs[0]; // VIP
  if (consultations >= 5) return frequencyConfigs[1]; // Frequente
  if (consultations >= 2) return frequencyConfigs[2]; // Regular
  return frequencyConfigs[3]; // Novo
}

export function getFrequencyBadge(level: FrequencyLevel): FrequencyConfig {
  return (
    frequencyConfigs.find((config) => config.level === level) ||
    frequencyConfigs[3]
  );
}
