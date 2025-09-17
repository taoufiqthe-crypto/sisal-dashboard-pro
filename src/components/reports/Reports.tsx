import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3
} from "lucide-react";

export function Reports() {
  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Análise detalhada do desempenho do seu negócio</p>
      </div>

      {/* Cards de estatísticas anuais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Faturamento Anual"
          value="R$ 0,00"
          icon={<DollarSign className="w-8 h-8" />}
          variant="revenue"
          trend={{ value: 0, label: "vs ano anterior" }}
        />
        <StatsCard
          title="Lucro Anual"
          value="R$ 0,00"
          icon={<TrendingUp className="w-8 h-8" />}
          variant="profit"
          trend={{ value: 0, label: "vs ano anterior" }}
        />
        <StatsCard
          title="Vendas no Mês"
          value="0"
          icon={<BarChart3 className="w-8 h-8" />}
          variant="success"
          trend={{ value: 0, label: "vs mês anterior" }}
        />
        <StatsCard
          title="Ticket Médio"
          value="R$ 0,00"
          icon={<Calendar className="w-8 h-8" />}
          variant="revenue"
          trend={{ value: 0, label: "vs mês anterior" }}
        />
      </div>

      {/* Informação sobre dados */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">Relatórios Dinâmicos</h3>
          <p className="text-muted-foreground mb-4">
            Os relatórios serão gerados automaticamente conforme você realizar vendas no sistema.
          </p>
          <p className="text-sm text-muted-foreground">
            Comece fazendo algumas vendas para ver os dados aparecerem aqui!
          </p>
        </Card>
      </div>
    </div>
  );
}