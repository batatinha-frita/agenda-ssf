# Sistema de Relatórios - Doctor Agenda

## 📊 Visão Geral

O sistema de relatórios fornece análises detalhadas dos dados da clínica, incluindo informações financeiras, operacionais e de pacientes. Todos os relatórios são otimizados para impressão e exportação.

## 🚀 Funcionalidades Implementadas

### ✅ **RELATÓRIOS FINANCEIROS**

- **Relatório de Pagamentos**: Análise de clientes em atraso, pendentes e pagos
  - Resumo por status de pagamento
  - Tabelas detalhadas por categoria
  - Filtros por período, médico e status
  - Busca por paciente ou médico

### 🔄 **EM DESENVOLVIMENTO**

- Receita por Período
- Receita por Médico/Especialidade
- Taxa de Ocupação por Médico
- Análise de Horários Populares
- Taxa de Comparecimento vs No-Show
- Análise de Cancelamentos

## 📁 Estrutura de Arquivos

```
src/app/(protected)/reports/
├── page.tsx                           # Página principal de relatórios
├── layout.tsx                         # Layout específico
├── _components/
│   ├── print-layout.tsx              # Layout otimizado para impressão
│   ├── report-filters.tsx            # Componente de filtros reutilizável
│   └── print.css                     # Estilos CSS para impressão
├── financial/
│   └── payments/
│       ├── page.tsx                  # Página do relatório
│       └── _components/
│           └── payments-report-client.tsx  # Componente cliente
└── operational/ (em desenvolvimento)
    ├── occupation/
    ├── time-analysis/
    ├── attendance/
    └── cancellations/
```

## 🖨️ Sistema de Impressão

### **CSS Print-Friendly**

- Estilos otimizados para papel A4
- Ocultação automática de elementos de UI (botões, sidebar, etc.)
- Quebras de página inteligentes
- Cores otimizadas para impressão P&B
- Cabeçalho e rodapé profissionais

### **Como Usar**

1. Acesse qualquer relatório
2. Clique no botão "Imprimir Relatório"
3. Ou use Ctrl+P (Cmd+P no Mac)
4. Os estilos de impressão são aplicados automaticamente

## 📊 Tipos de Dados

### **Relatório de Pagamentos**

```typescript
interface PaymentDetail {
  id: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: Date;
  amount: number;
  paymentStatus: "paid" | "pending" | "overdue";
  daysOverdue?: number;
  notes?: string;
}

interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalAppointments: number;
  countPaid: number;
  countPending: number;
  countOverdue: number;
}
```

## 🔧 Como Adicionar Novos Relatórios

### 1. **Criar Action**

```typescript
// src/actions/get-[nome]-report/index.ts
"use server";

import { actionClient } from "@/lib/next-safe-action";
import { auth } from "@/lib/auth";
// ... imports

export const getNewReport = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.clinic?.id) {
      redirect("/authentication");
    }

    // Lógica do relatório
    return data;
  });
```

### 2. **Criar Schema**

```typescript
// src/actions/get-[nome]-report/schema.ts
import { z } from "zod";

export const schema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  // outros filtros...
});
```

### 3. **Criar Página**

```typescript
// src/app/(protected)/reports/[categoria]/[nome]/page.tsx
import { Metadata } from "next";
import { ReportClient } from "./_components/report-client";

export const metadata: Metadata = {
  title: "Nome do Relatório",
  description: "Descrição do relatório",
};

export default function ReportPage() {
  return <ReportClient />;
}
```

### 4. **Criar Componente Cliente**

```typescript
// src/app/(protected)/reports/[categoria]/[nome]/_components/report-client.tsx
"use client";

import { PrintLayout } from "@/app/(protected)/reports/_components/print-layout";
// ... outros imports

export function ReportClient() {
  return (
    <PrintLayout title="Nome do Relatório">
      {/* Conteúdo do relatório */}
    </PrintLayout>
  );
}
```

## 🎨 Componentes Disponíveis

### **PrintLayout**

Layout principal para relatórios com funcionalidades de impressão.

```typescript
<PrintLayout
  title="Título do Relatório"
  description="Descrição opcional"
  backUrl="/reports" // URL de volta
>
  {/* Conteúdo */}
</PrintLayout>
```

### **ReportFiltersComponent**

Componente de filtros reutilizável.

```typescript
<ReportFiltersComponent
  filters={filters}
  onFiltersChange={setFilters}
  showDoctorFilter={true}
  showStatusFilter={true}
  statusOptions={[
    { value: "all", label: "Todos" },
    { value: "paid", label: "Pagos" }
  ]}
  onSearch={setSearchTerm}
/>
```

## 📱 Classes CSS para Impressão

### **Utilitárias**

- `.no-print` - Oculta na impressão
- `.print-only` - Mostra apenas na impressão
- `.page-break` - Força quebra de página
- `.avoid-break` - Evita quebra de página
- `.print-container` - Container principal
- `.financial-summary` - Grid de resumo financeiro

### **Status**

- `.status-paid` - Estilo para pagamentos realizados
- `.status-pending` - Estilo para pagamentos pendentes
- `.status-overdue` - Estilo para pagamentos em atraso

## 🔍 Filtros Disponíveis

### **Filtros Padrão**

- **Período**: Data inicial e final
- **Período Rápido**: 30 dias, 90 dias, 1 ano
- **Busca**: Busca textual nos dados

### **Filtros Específicos**

- **Médico**: Filtrar por médico específico
- **Paciente**: Filtrar por paciente específico
- **Status**: Filtrar por status (customizável)
- **Especialidade**: Filtrar por especialidade médica

## 🚀 Próximos Passos

1. **Implementar relatórios operacionais**
2. **Adicionar gráficos interativos**
3. **Exportação em PDF**
4. **Exportação em Excel**
5. **Agendamento de relatórios**
6. **Templates personalizáveis**
7. **Relatórios de pacientes**
8. **Relatórios de médicos**

## 📞 Suporte

Para dúvidas sobre implementação ou novos relatórios, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.
