"use server";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, desc, eq, gte, lte, sql, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOperationalDataSchema } from "./schema";
import dayjs from "dayjs";

export const getOperationalData = actionClient
  .schema(getOperationalDataSchema)
  .action(async ({ parsedInput: { from, to, doctorId } }) => {
    try {
      console.log("Iniciando busca de dados operacionais com filtros:", {
        from,
        to,
        doctorId,
      });

      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user?.id) {
        redirect("/authentication");
      }

      console.log("Usuário autenticado:", session.user.id);
      console.log("Dados da sessão:", session.user);

      // Verificar se o usuário tem uma clínica associada na sessão
      if (!session.user.clinic?.id) {
        console.error("Usuário não tem clínica associada na sessão");
        throw new Error("Usuário não possui clínica associada");
      }

      const clinicId = session.user.clinic.id;
      console.log("ID da clínica:", clinicId);
      const fromDate = new Date(from);
      const toDate = new Date(to);

      // Filtros base
      const baseFilters = [
        eq(appointmentsTable.clinicId, clinicId),
        gte(appointmentsTable.date, fromDate),
        lte(appointmentsTable.date, toDate),
      ];

      // Adicionar filtro de médico se especificado
      if (doctorId && doctorId !== "all" && doctorId !== "") {
        baseFilters.push(eq(appointmentsTable.doctorId, doctorId));
      }

      // Buscar dados básicos primeiro
      const [appointments, doctors, appointmentsByStatus] = await Promise.all([
        // Consultas no período
        db
          .select({
            id: appointmentsTable.id,
            doctorId: appointmentsTable.doctorId,
            patientId: appointmentsTable.patientId,
            date: appointmentsTable.date,
            appointmentStatus: appointmentsTable.appointmentStatus,
          })
          .from(appointmentsTable)
          .where(and(...baseFilters)),

        // Médicos da clínica
        db
          .select({
            id: doctorsTable.id,
            name: doctorsTable.name,
            specialty: doctorsTable.specialty,
          })
          .from(doctorsTable)
          .where(eq(doctorsTable.clinicId, clinicId)),

        // Status dos appointments
        db
          .select({
            status: appointmentsTable.appointmentStatus,
            count: count(appointmentsTable.id),
          })
          .from(appointmentsTable)
          .where(and(...baseFilters))
          .groupBy(appointmentsTable.appointmentStatus),
      ]);

      // Calcular ocupação por médico de forma simples
      const doctorsOccupation = doctors.map((doctor) => {
        const doctorAppointments = appointments.filter(
          (apt) => apt.doctorId === doctor.id,
        );
        const totalSlots = 40; // Assumindo 40 slots por semana por médico
        const occupiedSlots = doctorAppointments.length;
        const occupationRate =
          totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

        return {
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          totalSlots,
          occupiedSlots,
          occupationRate: Number(occupationRate.toFixed(1)),
        };
      });

      // Horários populares - extrair horas dos appointments
      const hoursMap = new Map<number, number>();
      appointments.forEach((apt) => {
        const hour = new Date(apt.date).getHours();
        hoursMap.set(hour, (hoursMap.get(hour) || 0) + 1);
      });

      const popularHours = Array.from(hoursMap.entries())
        .map(([hour, count]) => ({
          hour,
          appointments: count,
          hourFormatted: `${hour.toString().padStart(2, "0")}:00`,
          dayOfWeek: 1, // Simplificado
          dayName: "Semana",
        }))
        .sort((a, b) => b.appointments - a.appointments)
        .slice(0, 10);

      // Processar dados de status para calcular percentuais
      const totalAppointments = appointmentsByStatus.reduce(
        (acc, curr) => acc + curr.count,
        0,
      );
      const processedStatusData = appointmentsByStatus.map((status) => ({
        status: status.status,
        count: status.count,
        percentage:
          totalAppointments > 0
            ? ((status.count / totalAppointments) * 100).toFixed(1)
            : "0",
      }));

      // Calcular taxas específicas
      const completedCount =
        appointmentsByStatus.find((s) => s.status === "completed")?.count || 0;
      const cancelledCount =
        appointmentsByStatus.find((s) => s.status === "cancelled")?.count || 0;

      const attendanceRate =
        totalAppointments > 0
          ? ((completedCount / totalAppointments) * 100).toFixed(1)
          : "0.0";
      const noShowRate =
        totalAppointments > 0
          ? ((cancelledCount / totalAppointments) * 100).toFixed(1)
          : "0.0";

      // Cancelamentos por data (simplificado)
      const cancelledAppointments = appointments.filter(
        (apt) => apt.appointmentStatus === "cancelled",
      );
      const cancellationsByDate = [
        {
          date: dayjs().format("YYYY-MM-DD"),
          cancelled: cancelledAppointments.length,
        },
      ]; // Demografia dos pacientes - buscar pacientes únicos
      const uniquePatientIds = [
        ...new Set(appointments.map((apt) => apt.patientId)),
      ];

      let patients: { id: string; sex: "male" | "female" }[] = [];
      if (uniquePatientIds.length > 0) {
        patients = await db
          .select({
            id: patientsTable.id,
            sex: patientsTable.sex,
          })
          .from(patientsTable)
          .where(inArray(patientsTable.id, uniquePatientIds));
      }

      const patientsDemographics = [
        {
          sex: "male",
          count: patients.filter((p) => p.sex === "male").length,
          percentage:
            patients.length > 0
              ? (
                  (patients.filter((p) => p.sex === "male").length /
                    patients.length) *
                  100
                ).toFixed(1)
              : "0",
          sexLabel: "Masculino",
        },
        {
          sex: "female",
          count: patients.filter((p) => p.sex === "female").length,
          percentage:
            patients.length > 0
              ? (
                  (patients.filter((p) => p.sex === "female").length /
                    patients.length) *
                  100
                ).toFixed(1)
              : "0",
          sexLabel: "Feminino",
        },
      ];

      console.log("Pacientes demographics calculado:", patientsDemographics);
      console.log("Unique patient IDs:", uniquePatientIds.length);
      console.log("Patients data:", patients);

      return {
        data: {
          doctorsOccupation,
          popularHours,
          appointmentsByStatus: processedStatusData,
          cancellationsByDate,
          patientsDemographics,
          clinicDoctors: doctors,
          period: { from, to },
          totalAppointments,
          totalPatients: uniquePatientIds.length,
          // Adicionar taxas calculadas
          attendanceRate,
          noShowRate,
        },
      };
    } catch (error) {
      console.error("Erro detalhado na busca de dados operacionais:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "N/A",
      );
      throw new Error(
        `Erro ao buscar dados operacionais: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    }
  });
