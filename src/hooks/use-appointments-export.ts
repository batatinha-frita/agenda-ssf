"use client";

import { useCallback } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { appointmentsTable } from "@/db/schema";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
};

export function useAppointmentsExport() {
  const exportToExcel = useCallback(
    (appointments: AppointmentWithRelations[]) => {
      // Preparar dados para o Excel
      const excelData = appointments.map((appointment) => ({
        "Data/Hora": format(new Date(appointment.date), "dd/MM/yyyy HH:mm", {
          locale: ptBR,
        }),
        Paciente: appointment.patient.name,
        Médico: `${appointment.doctor.name} - ${appointment.doctor.specialty}`,
        Status:
          appointment.appointmentStatus === "confirmed"
            ? "Confirmado"
            : "Cancelado",
        Valor: `R$ ${(appointment.appointmentPriceInCents / 100).toFixed(2).replace(".", ",")}`,
        Observações: appointment.notes || "-",
      }));

      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Configurar largura das colunas
      const colWidths = [
        { wch: 15 }, // Data/Hora
        { wch: 25 }, // Paciente
        { wch: 30 }, // Médico
        { wch: 12 }, // Status
        { wch: 12 }, // Valor
        { wch: 30 }, // Observações
      ];
      ws["!cols"] = colWidths;

      // Adicionar planilha ao workbook
      XLSX.utils.book_append_sheet(wb, ws, "Agendamentos");

      // Gerar nome do arquivo com data atual
      const fileName = `agendamentos_${format(new Date(), "dd-MM-yyyy_HH-mm")}.xlsx`;

      // Fazer download
      XLSX.writeFile(wb, fileName);
    },
    [],
  );

  const printAppointments = useCallback(
    (appointments: AppointmentWithRelations[]) => {
      // Criar conteúdo HTML para impressão
      const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Agendamentos</title>
        <style>
          @media print {
            body { margin: 0; font-family: Arial, sans-serif; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .summary { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .status-confirmed { color: #16a34a; font-weight: bold; }
            .status-cancelled { color: #dc2626; font-weight: bold; }
            .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CLÍNICA MÉDICA DEMO</h1>
          <h2>RELATÓRIO DE AGENDAMENTOS</h2>
          <p>Data/Hora de Impressão: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
        </div>

        <div class="summary">
          <h3>RESUMO:</h3>
          <p><strong>Total de Agendamentos:</strong> ${appointments.length}</p>
          <p><strong>Confirmados:</strong> ${appointments.filter((a) => a.appointmentStatus === "confirmed").length}</p>
          <p><strong>Cancelados:</strong> ${appointments.filter((a) => a.appointmentStatus === "cancelled").length}</p>
          <p><strong>Valor Total:</strong> R$ ${
            appointments
              .filter((a) => a.appointmentStatus === "confirmed")
              .reduce((sum, a) => sum + a.appointmentPriceInCents, 0) / 100
          }0</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            ${appointments
              .map(
                (appointment) => `
              <tr>
                <td>${format(new Date(appointment.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</td>
                <td>${appointment.patient.name}</td>
                <td>${appointment.doctor.name} - ${appointment.doctor.specialty}</td>
                <td class="status-${appointment.appointmentStatus}">
                  ${appointment.appointmentStatus === "confirmed" ? "Confirmado" : "Cancelado"}
                </td>
                <td>R$ ${(appointment.appointmentPriceInCents / 100).toFixed(2).replace(".", ",")}</td>
                <td>${appointment.notes || "-"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p><em>Relatório gerado automaticamente pelo sistema de agendamentos</em></p>
        </div>
      </body>
      </html>
    `;

      // Abrir janela de impressão
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    },
    [],
  );

  return {
    exportToExcel,
    printAppointments,
  };
}
