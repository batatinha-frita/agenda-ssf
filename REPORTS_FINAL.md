# Sistema de Relatórios - Doctor Agenda

## 🎯 Visão Geral

Sistema completo de relatórios financeiros para gestão médica, com foco em relatórios de pagamentos, status de consultas e análise de receitas.

## 📁 Estrutura do Projeto

```
src/
├── app/(protected)/reports/
│   ├── page.tsx                          # Página principal de relatórios
│   ├── layout.tsx                        # Layout base para relatórios
│   ├── _components/
│   │   ├── print-layout.tsx              # Layout para impressão
│   │   ├── print.css                     # Estilos específicos de impressão
│   │   ├── report-filters.tsx            # Componente de filtros
│   │   └── bar-chart-interactive.tsx     # Gráfico de barras interativo
│   └── financial/
│       └── payments/
│           ├── page.tsx                  # Página do relatório de pagamentos
│           └── _components/
│               └── payments-report-client.tsx  # Cliente do relatório
├── actions/
│   └── get-payments-report/
│       ├── index.ts                      # Action para buscar dados
│       └── schema.ts                     # Validação de parâmetros
├── helpers/
│   └── currency.ts                       # Formatação de moedas
└── app/globals.css                       # Estilos globais + print CSS
```

## 🚀 Funcionalidades Implementadas

### ✅ Relatório de Pagamentos

- **Filtros avançados**: Data inicial/final e status (Todos, Pagos, Em Aberto, Em Atraso)
- **Gráfico interativo**: Visualização por barras dos valores por status
- **Tabelas detalhadas**: Informações completas dos pacientes e valores
- **Busca em tempo real**: Campo de busca em cada tabela
- **Layout responsivo**: Otimizado para desktop e impressão

### ✅ Sistema de Status Inteligente

- **Pagos**: Status marcado como "paid" no banco
- **Em Aberto**: Consultas futuras com status "pending"
- **Em Atraso**: Consultas passadas não pagas ou marcadas como "overdue"

### ✅ Recursos de Impressão

- **Layout profissional**: Cabeçalho com dados da clínica
- **Ocultação de elementos**: Filtros e navegação removidos na impressão
- **Quebras de página**: Evita cortes indesejados nas tabelas
- **Estilização específica**: CSS otimizado para impressão

## 🔧 Componentes Técnicos

### Actions (Server-Side)

```typescript
// src/actions/get-payments-report/index.ts
export const getPaymentsReport = actionClient
  .schema(getPaymentsReportSchema)
  .action(handler);
```

**Funcionalidades**:

- Consulta ao banco com JOINs otimizados
- Lógica de status inteligente
- Agregação de dados para resumo
- Filtros aplicados no servidor

### Componentes Client-Side

```typescript
// payments-report-client.tsx
- Gerenciamento de estado com useState
- Filtros reativos com useEffect
- Preparação de dados para gráficos
- Busca em tempo real
```

### Gráfico Interativo

```typescript
// bar-chart-interactive.tsx
- Usando Recharts
- Cores diferenciadas por status
- Tooltip personalizado
- Responsive design
```

## 📊 Dados de Teste

Para testar o sistema, execute:

```bash
node seed-test-data.js
```

**Dados criados**:

- 1 Clínica de teste
- 1 Médico (Dr. João Silva - Cardiologia)
- 4 Pacientes
- 6 Consultas com diferentes status

## 🎨 Esquema de Cores

- **Verde** (#22c55e): Pagamentos realizados
- **Azul** (#3b82f6): Pagamentos em aberto
- **Vermelho** (#ef4444): Pagamentos em atraso

## 🖨️ Sistema de Impressão

### Estilos CSS

```css
@media print {
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
  .print-container {
    width: 100% !important;
  }
}
```

### Elementos Ocultos na Impressão

- Filtros e botões de ação
- Navegação e sidebar
- Campos de busca

### Elementos Mostrados na Impressão

- Cabeçalho com dados da clínica
- Resumo financeiro
- Tabelas de dados
- Gráficos (se aplicável)

## 🔍 Funcionalidades de Busca

### Busca Global

- Campo presente em cada tabela (Pagos, Em Aberto, Em Atraso)
- Busca por nome do paciente ou médico
- Filtro em tempo real sem reload

### Implementação

```typescript
const filteredData = (data: any[]) => {
  if (!searchTerm) return data;
  return data.filter(
    (item) =>
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()),
  );
};
```

## 📋 Informações das Tabelas

### Pagamentos Realizados

- Paciente, Telefone, Email, Data da Consulta, Valor

### Pagamentos em Aberto

- Paciente, Telefone, Email, Data da Consulta, Valor

### Pagamentos em Atraso

- Paciente, Telefone, Email, Data da Consulta, Valor, Dias em Atraso

## 🚀 Como Usar

### 1. Acessar Relatórios

```
/reports → Página principal
/reports/financial/payments → Relatório de pagamentos
```

### 2. Aplicar Filtros

- Selecione o período (data inicial/final)
- Escolha o status desejado (radio buttons)
- Use a busca para encontrar pacientes específicos

### 3. Visualizar Dados

- Analise o resumo nos cards
- Explore o gráfico interativo
- Navegue pelas abas (Pagos, Em Aberto, Em Atraso)

### 4. Imprimir

- Clique em "Imprimir Relatório"
- O layout será otimizado automaticamente

## 🔄 Próximas Melhorias

### Relatórios Adicionais

- [ ] Relatório de consultas por médico
- [ ] Relatório de faturamento mensal
- [ ] Relatório de pacientes por período
- [ ] Análise de receitas por especialidade

### Funcionalidades

- [ ] Exportação para PDF
- [ ] Exportação para Excel
- [ ] Gráficos de tendência temporal
- [ ] Comparação entre períodos
- [ ] Alertas automáticos para atrasos

### Otimizações

- [ ] Cache de relatórios
- [ ] Paginação para grandes volumes
- [ ] Filtros avançados (por médico, especialidade)
- [ ] Dashboard executivo

## 📝 Observações Técnicas

### Performance

- Consultas otimizadas com indexes
- Dados agregados no servidor
- Componentes React otimizados

### Responsividade

- Layout adapta-se a diferentes telas
- Tabelas com scroll horizontal se necessário
- Botões e filtros reorganizados em mobile

### Acessibilidade

- Cores com contraste adequado
- Labels apropriados para screen readers
- Navegação por teclado

### Manutenibilidade

- Código bem estruturado e documentado
- Separação clara de responsabilidades
- Tipos TypeScript consistentes

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs no console do navegador
2. Confirme se os dados de teste foram inseridos
3. Teste em modo de desenvolvimento (`npm run dev`)

**Sistema desenvolvido com Next.js 15, Drizzle ORM, shadcn/ui e Recharts.**
