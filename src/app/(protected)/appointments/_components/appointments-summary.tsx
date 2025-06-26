"use client";

import { useMemo } from "react";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, BarChart3, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appointmentsTable } from "@/db/schema";

interface AppointmentsSummaryProps {
  appointments: (typeof appointmentsTable.$inferSelect & {
    patient: {
      id: string;
      name: string;
    };
    doctor: {
      id: string;
      name: string;
      specialty: string;
    };
  })[];
}

export function AppointmentsSummary({
  appointments,
}: AppointmentsSummaryProps) {
  const stats = useMemo(() => {
    const today = new Date();

    const todayAppointments = appointments.filter(
      (apt) =>
        isToday(new Date(apt.date)) && apt.appointmentStatus !== "cancelled",
    );

    const tomorrowAppointments = appointments.filter(
      (apt) =>
        isTomorrow(new Date(apt.date)) && apt.appointmentStatus !== "cancelled",
    );

    const thisWeekAppointments = appointments.filter(
      (apt) =>
        isThisWeek(new Date(apt.date)) && apt.appointmentStatus !== "cancelled",
    );

    const cancelledAppointments = appointments.filter(
      (apt) => apt.appointmentStatus === "cancelled",
    );

    const confirmedAppointments = appointments.filter(
      (apt) => apt.appointmentStatus === "confirmed",
    );

    return {
      today: todayAppointments.length,
      tomorrow: tomorrowAppointments.length,
      thisWeek: thisWeekAppointments.length,
      cancelled: cancelledAppointments.length,
      confirmed: confirmedAppointments.length,
      total: appointments.length,
    };
  }, [appointments]);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.today}</div>
          <p className="text-muted-foreground text-xs">
            {stats.today === 1 ? "consulta agendada" : "consultas agendadas"}
          </p>
        </CardContent>
      </Card>

      {/* Amanhã */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Amanhã</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.tomorrow}
          </div>
          <p className="text-muted-foreground text-xs">
            {stats.tomorrow === 1 ? "consulta agendada" : "consultas agendadas"}
          </p>
        </CardContent>
      </Card>

      {/* Esta Semana */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {stats.thisWeek}
          </div>
          <p className="text-muted-foreground text-xs">
            {stats.thisWeek === 1 ? "consulta total" : "consultas total"}
          </p>
        </CardContent>
      </Card>

      {/* Canceladas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.cancelled}
          </div>
          <p className="text-muted-foreground text-xs">
            {stats.cancelled === 1
              ? "consulta cancelada"
              : "consultas canceladas"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
