/**
 * Utilitários para gerenciar status de médicos
 */

export type DoctorStatus = "active" | "inactive" | "busy";

export interface DoctorStatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive";
  className: string;
  icon: string;
}

/**
 * Configuração visual para cada status de médico
 */
export const DOCTOR_STATUS_CONFIG: Record<DoctorStatus, DoctorStatusConfig> = {
  active: {
    label: "Ativo",
    variant: "default",
    className: "bg-green-100 text-green-700 hover:bg-green-200",
    icon: "🟢",
  },
  busy: {
    label: "Ocupado",
    variant: "secondary",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    icon: "🟡",
  },
  inactive: {
    label: "Inativo",
    variant: "destructive",
    className: "bg-red-100 text-red-700 hover:bg-red-200",
    icon: "🔴",
  },
};

/**
 * Determina o status de um médico baseado em regras de negócio
 */
export function calculateDoctorStatus(doctor: {
  status: DoctorStatus;
  availableFromTime: string;
  availableToTime: string;
  appointmentsToday?: number;
}): DoctorStatus {
  // Se foi manualmente definido como inativo, sempre retorna inativo
  if (doctor.status === "inactive") {
    return "inactive";
  }

  // Se foi manualmente definido como ocupado, retorna ocupado
  if (doctor.status === "busy") {
    return "busy";
  }

  // Verifica se está dentro do horário de trabalho
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [fromHour, fromMin] = doctor.availableFromTime.split(":").map(Number);
  const [toHour, toMin] = doctor.availableToTime.split(":").map(Number);

  const workFromTime = fromHour * 60 + fromMin;
  const workToTime = toHour * 60 + toMin;

  // Se está fora do horário de trabalho, considera ocupado
  if (currentTime < workFromTime || currentTime > workToTime) {
    return "busy";
  }

  // Verifica se tem muitas consultas hoje (opcional)
  if (doctor.appointmentsToday && doctor.appointmentsToday >= 8) {
    return "busy";
  }

  // Caso contrário, está ativo
  return "active";
}

/**
 * Retorna a configuração visual para um status específico
 */
export function getDoctorStatusConfig(
  status: DoctorStatus,
): DoctorStatusConfig {
  return DOCTOR_STATUS_CONFIG[status];
}

/**
 * Lista todos os status possíveis para filtros
 */
export function getAllDoctorStatuses(): Array<{
  value: DoctorStatus;
  label: string;
}> {
  return Object.entries(DOCTOR_STATUS_CONFIG).map(([value, config]) => ({
    value: value as DoctorStatus,
    label: config.label,
  }));
}
