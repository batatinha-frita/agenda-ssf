"use server";

import { and, eq, gte, lte, isNotNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { actionClient } from "@/lib/next-safe-action";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { appointmentsTable, patientsTable, doctorsTable } from "@/db/schema";
import { getRevenueReportSchema } from "./schema";
import dayjs from "dayjs";

export type RevenueReportData = {
  clinicName: string;
  summary: {
    totalRevenue: number;
    totalAppointments: number;
    averageRevenue: number;
    period: string;
  };
  details: {
    byDoctor: Array<{
      doctorId: string;
      doctorName: string;
      totalRevenue: number;
      appointmentCount: number;
      averageRevenue: number;
    }>;
    byPeriod: Array<{
      date: string;
      revenue: number;
      appointmentCount: number;
    }>;
    appointments: Array<{
      id: string;
      patientName: string;
      patientPhone: string;
      patientEmail: string;
      doctorName: string;
      appointmentDate: Date;
      amount: number;
      paymentStatus: "paid" | "pending" | "overdue";
    }>;
  };
};

const handler = async ({ parsedInput }: { parsedInput: any }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Para desenvolvimento, se não há sessão, usar valores padrão
  if (!session?.user?.clinic?.id) {
    // Em produção, fazer redirect
    if (process.env.NODE_ENV === "production") {
      redirect("/authentication");
    }

    // Em desenvolvimento, retornar dados vazios
    const emptyResult: RevenueReportData = {
      clinicName: "Clínica Demo (Desenvolvimento)",
      summary: {
        totalRevenue: 0,
        totalAppointments: 0,
        averageRevenue: 0,
        period: `${dayjs(parsedInput.from).format("DD/MM/YYYY")} - ${dayjs(parsedInput.to).format("DD/MM/YYYY")}`,
      },
      details: {
        byDoctor: [],
        byPeriod: [],
        appointments: [],
      },
    };
    return emptyResult;
  }

  const { from, to, doctorId } = parsedInput;
  const clinicId = session.user.clinic.id;
  // Buscar dados básicos da clínica
  const clinic = await db.query.clinicsTable.findFirst({
    where: (table, { eq }) => eq(table.id, clinicId),
  });
  // Query base para appointments no período
  const baseQuery = and(
    eq(appointmentsTable.clinicId, clinicId),
    gte(appointmentsTable.date, dayjs(from).toDate()),
    lte(appointmentsTable.date, dayjs(to).toDate()),
    isNotNull(appointmentsTable.appointmentPriceInCents),
    doctorId ? eq(appointmentsTable.doctorId, doctorId) : undefined,
  );

  // Buscar appointments com detalhes
  const appointments = await db
    .select({
      id: appointmentsTable.id,
      patientName: patientsTable.name,
      patientPhone: patientsTable.phoneNumber,
      patientEmail: patientsTable.email,
      doctorName: doctorsTable.name,
      doctorId: doctorsTable.id,
      appointmentDate: appointmentsTable.date,
      amount: appointmentsTable.appointmentPriceInCents,
      paymentStatus: appointmentsTable.paymentStatus,
    })
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(baseQuery);

  // Calcular summary
  const totalRevenue = appointments.reduce(
    (sum, apt) => sum + (apt.amount || 0),
    0,
  );
  const totalAppointments = appointments.length;
  const averageRevenue =
    totalAppointments > 0 ? totalRevenue / totalAppointments : 0;
  // Agrupar por médico
  const byDoctor = appointments.reduce(
    (acc, apt) => {
      const doctorKey = apt.doctorId;
      if (!acc[doctorKey]) {
        acc[doctorKey] = {
          doctorId: apt.doctorId,
          doctorName: apt.doctorName,
          totalRevenue: 0,
          appointmentCount: 0,
          averageRevenue: 0,
        };
      }
      acc[doctorKey].totalRevenue += apt.amount || 0;
      acc[doctorKey].appointmentCount += 1;
      return acc;
    },
    {} as Record<string, any>,
  );

  // Calcular média por médico
  Object.values(byDoctor).forEach((doctor: any) => {
    doctor.averageRevenue =
      doctor.appointmentCount > 0
        ? doctor.totalRevenue / doctor.appointmentCount
        : 0;
  });

  // Agrupar por período (diário)
  const byPeriod = appointments.reduce(
    (acc, apt) => {
      const dateKey = dayjs(apt.appointmentDate).format("YYYY-MM-DD");
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          revenue: 0,
          appointmentCount: 0,
        };
      }
      acc[dateKey].revenue += apt.amount || 0;
      acc[dateKey].appointmentCount += 1;
      return acc;
    },
    {} as Record<string, any>,
  );

  return {
    clinicName: clinic?.name || "Clínica",
    summary: {
      totalRevenue,
      totalAppointments,
      averageRevenue,
      period: `${dayjs(from).format("DD/MM/YYYY")} - ${dayjs(to).format("DD/MM/YYYY")}`,
    },
    details: {
      byDoctor: Object.values(byDoctor),
      byPeriod: Object.values(byPeriod).sort((a: any, b: any) =>
        dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1,
      ),
      appointments: appointments.map((apt) => ({
        ...apt,
        paymentStatus: apt.paymentStatus as "paid" | "pending" | "overdue",
      })),
    },
  };
};

export const getRevenueReport = actionClient
  .schema(getRevenueReportSchema)
  .action(handler);
