"use server";

import { and, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { actionClient } from "@/lib/next-safe-action";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { getPaymentsReportSchema } from "./schema";
import dayjs from "dayjs";

export interface PaymentDetail {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: Date;
  amount: number;
  paymentStatus: "paid" | "pending" | "overdue";
  daysOverdue?: number;
  paymentDate?: Date;
  notes?: string;
}

export interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalAppointments: number;
  countPaid: number;
  countPending: number;
  countOverdue: number;
}

export interface PaymentsReportData {
  summary: PaymentSummary;
  details: {
    paid: PaymentDetail[];
    pending: PaymentDetail[];
    overdue: PaymentDetail[];
  };
  allDetails?: {
    paid: PaymentDetail[];
    pending: PaymentDetail[];
    overdue: PaymentDetail[];
  };
  clinicName: string;
}

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
    const emptyResult: PaymentsReportData = {
      summary: {
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalAppointments: 0,
        countPaid: 0,
        countPending: 0,
        countOverdue: 0,
      },
      details: {
        paid: [],
        pending: [],
        overdue: [],
      },
      allDetails: {
        paid: [],
        pending: [],
        overdue: [],
      },
      clinicName: "Clínica Demo (Desenvolvimento)",
    };
    return emptyResult;
  }

  const { from, to, doctorId, paymentStatus } = parsedInput;

  const fromDate = dayjs(from).startOf("day").toDate();
  const toDate = dayjs(to).endOf("day").toDate();
  const today = dayjs().startOf("day").toDate();

  // Condições base
  const baseConditions = [
    eq(appointmentsTable.clinicId, session.user.clinic.id),
    gte(appointmentsTable.date, fromDate),
    lte(appointmentsTable.date, toDate),
  ];

  // Adicionar filtro por médico se especificado
  if (doctorId) {
    baseConditions.push(eq(appointmentsTable.doctorId, doctorId));
  } // Buscar todos os appointments com joins
  const appointments = await db
    .select({
      id: appointmentsTable.id,
      date: appointmentsTable.date,
      amount: appointmentsTable.appointmentPriceInCents,
      paymentStatus: appointmentsTable.paymentStatus,
      notes: appointmentsTable.notes,
      patientName: patientsTable.name,
      patientPhone: patientsTable.phoneNumber,
      patientEmail: patientsTable.email,
      doctorName: doctorsTable.name,
      doctorSpecialty: doctorsTable.specialty,
    })
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(and(...baseConditions))
    .orderBy(desc(appointmentsTable.date));

  // Processar os dados
  const paid: PaymentDetail[] = [];
  const pending: PaymentDetail[] = [];
  const overdue: PaymentDetail[] = [];

  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;

  appointments.forEach((appointment) => {
    // Determinar o status real baseado na lógica de negócio
    let finalStatus: "paid" | "pending" | "overdue";

    if (appointment.paymentStatus === "paid") {
      finalStatus = "paid";
    } else if (appointment.paymentStatus === "overdue") {
      finalStatus = "overdue";
    } else if (appointment.date < today) {
      // Se não está pago e a data já passou, está em atraso
      finalStatus = "overdue";
    } else {
      // Caso contrário, está pendente/em aberto
      finalStatus = "pending";
    }

    const detail: PaymentDetail = {
      id: appointment.id,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      patientEmail: appointment.patientEmail,
      doctorName: appointment.doctorName,
      doctorSpecialty: appointment.doctorSpecialty,
      appointmentDate: appointment.date,
      amount: appointment.amount,
      paymentStatus: finalStatus,
      notes: appointment.notes || undefined,
    };

    // Categorizar e somar
    if (finalStatus === "paid") {
      detail.paymentDate = appointment.date;
      paid.push(detail);
      totalPaid += appointment.amount;
    } else if (finalStatus === "overdue") {
      detail.daysOverdue = dayjs().diff(dayjs(appointment.date), "day");
      overdue.push(detail);
      totalOverdue += appointment.amount;
    } else {
      pending.push(detail);
      totalPending += appointment.amount;
    }
  });

  // Aplicar filtro de status se especificado
  let filteredDetails = { paid, pending, overdue };
  if (paymentStatus !== "all") {
    filteredDetails = {
      paid: paymentStatus === "paid" ? paid : [],
      pending: paymentStatus === "pending" ? pending : [],
      overdue: paymentStatus === "overdue" ? overdue : [],
    };
  }
  const summary: PaymentSummary = {
    totalPaid,
    totalPending,
    totalOverdue,
    totalAppointments: appointments.length,
    countPaid: paid.length,
    countPending: pending.length,
    countOverdue: overdue.length,
  };
  // Para o gráfico, sempre retornamos todos os dados
  // Para as tabelas, retornamos os dados filtrados
  const result: PaymentsReportData = {
    summary,
    details: {
      paid: paymentStatus === "all" || paymentStatus === "paid" ? paid : [],
      pending:
        paymentStatus === "all" || paymentStatus === "pending" ? pending : [],
      overdue:
        paymentStatus === "all" || paymentStatus === "overdue" ? overdue : [],
    },
    // Incluir dados completos para o gráfico
    allDetails: { paid, pending, overdue },
    clinicName: session.user.clinic.name,
  };

  return result;
};

export const getPaymentsReport = actionClient
  .schema(getPaymentsReportSchema)
  .action(handler);
