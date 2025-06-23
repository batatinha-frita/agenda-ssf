import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/ui/page-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  BarChart3,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  UserCheck,
  XCircle,
  Play,
  Pause,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Relatórios",
  description: "Relatórios e análises da clínica",
};

const allReports = [
  // Relatórios Financeiros
  {
    category: "Financeiro",
    name: "Pagamentos",
    description: "Clientes em atraso, aberto e pagos",
    href: "/reports/financial/payments",
    icon: DollarSign,
    status: "Ativo",
    type: "Financeiro",
  },
  {
    category: "Financeiro",
    name: "Receita por Período",
    description: "Análise temporal de receitas",
    href: "/reports/financial/revenue",
    icon: TrendingUp,
    status: "Em breve",
    type: "Financeiro",
  },
  // Relatórios Operacionais
  {
    category: "Operacional",
    name: "Taxa de Ocupação",
    description: "Ocupação por médico e horário",
    href: "/reports/operational/occupation",
    icon: Calendar,
    status: "Ativo",
    type: "Operacional",
  },
  {
    category: "Operacional",
    name: "Horários Populares",
    description: "Análise de horários mais procurados",
    href: "/reports/operational/time-analysis",
    icon: Clock,
    status: "Ativo",
    type: "Operacional",
  },
  {
    category: "Operacional",
    name: "Comparecimento",
    description: "Taxa de no-show vs comparecimento",
    href: "/reports/operational/attendance",
    icon: UserCheck,
    status: "Ativo",
    type: "Operacional",
  },
  {
    category: "Operacional",
    name: "Cancelamentos",
    description: "Análise de cancelamentos",
    href: "/reports/operational/cancellations",
    icon: XCircle,
    status: "Ativo",
    type: "Operacional",
  },
  // Relatórios de Pacientes
  {
    category: "Pacientes",
    name: "Demografia",
    description: "Análise demográfica dos pacientes",
    href: "/reports/patients/demographics",
    icon: Users,
    status: "Em breve",
    type: "Pacientes",
  },
];

export default function ReportsPage() {
  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Ativo: {
        variant: "default" as const,
        icon: Play,
        className: "bg-green-100 text-green-800",
      },
      "Em breve": {
        variant: "secondary" as const,
        icon: Pause,
        className: "bg-yellow-100 text-yellow-800",
      },
    };

    const config =
      variants[status as keyof typeof variants] || variants["Em breve"];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      Financeiro: DollarSign,
      Operacional: BarChart3,
      Pacientes: Users,
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Financeiro: "text-green-600",
      Operacional: "text-blue-600",
      Pacientes: "text-purple-600",
    };
    return colors[category as keyof typeof colors] || "text-gray-600";
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e analise os dados da sua clínica através de relatórios
            detalhados
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatórios Disponíveis
            </CardTitle>
            <CardDescription>
              Lista completa de todos os relatórios organizados por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Relatório</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allReports.map((report) => {
                  const CategoryIcon = getCategoryIcon(report.category);
                  const ReportIcon = report.icon;

                  return (
                    <TableRow key={report.href}>
                      <TableCell>
                        <div className="flex items-center">
                          <ReportIcon className="text-muted-foreground h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{report.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CategoryIcon
                            className={`h-4 w-4 ${getCategoryColor(report.category)}`}
                          />
                          <span className="text-sm">{report.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground max-w-md text-sm">
                          {report.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={report.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          size="sm"
                          disabled={report.status === "Em breve"}
                          className="min-w-24"
                        >
                          <Link href={report.href}>
                            {report.status === "Em breve"
                              ? "Em breve"
                              : "Visualizar"}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Estatísticas rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Relatórios
              </CardTitle>
              <FileText className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allReports.length}</div>
              <p className="text-muted-foreground text-xs">
                Relatórios disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Play className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {allReports.filter((r) => r.status === "Ativo").length}
              </div>
              <p className="text-muted-foreground text-xs">Prontos para uso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Em Desenvolvimento
              </CardTitle>
              <Pause className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {allReports.filter((r) => r.status === "Em breve").length}
              </div>
              <p className="text-muted-foreground text-xs">Em breve</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {[...new Set(allReports.map((r) => r.category))].length}
              </div>
              <p className="text-muted-foreground text-xs">Tipos diferentes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
