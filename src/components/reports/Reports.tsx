import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  ShoppingCart,
  Users
} from "lucide-react";

// Mock data para os gráficos
const monthlyData = [
  { name: 'Jan', faturamento: 45680, lucro: 18720, dinheiro: 15200, pix: 18300, credito: 8900, debito: 3280, vendas: 245 },
  { name: 'Fev', faturamento: 52300, lucro: 21430, dinheiro: 18200, pix: 21100, credito: 9800, debito: 3200, vendas: 289 },
  { name: 'Mar', faturamento: 48900, lucro: 19890, dinheiro: 16700, pix: 19200, credito: 9100, debito: 3900, vendas: 267 },
  { name: 'Abr', faturamento: 61200, lucro: 25480, dinheiro: 21000, pix: 24300, credito: 11200, debito: 4700, vendas: 342 },
  { name: 'Mai', faturamento: 58700, lucro: 24100, dinheiro: 19500, pix: 23100, credito: 11000, debito: 5100, vendas: 318 },
  { name: 'Jun', faturamento: 67800, lucro: 28900, dinheiro: 22300, pix: 26800, credito: 12900, debito: 5800, vendas: 387 },
];

const paymentMethodData = [
  { name: 'PIX', value: 152800, percentage: 42.1, color: 'hsl(142 76% 36%)' },
  { name: 'Dinheiro', value: 107400, percentage: 29.6, color: 'hsl(38 92% 50%)' },
  { name: 'Cartão Crédito', value: 66350, percentage: 18.3, color: 'hsl(220 100% 55%)' },
  { name: 'Cartão Débito', value: 36300, percentage: 10.0, color: 'hsl(0 84.2% 60.2%)' },
];

const productPerformance = [
  { name: 'Placas 60x60', vendas: 145, faturamento: 43500, margem: 35.2 },
  { name: 'Gesso São Francisco', vendas: 120, faturamento: 35880, margem: 28.5 },
  { name: 'Sisal', vendas: 85, faturamento: 25500, margem: 22.8 },
  { name: 'Arame', vendas: 200, faturamento: 20000, margem: 15.4 },
  { name: 'Rebites', vendas: 500, faturamento: 7500, margem: 45.2 },
  { name: 'Parafusos', vendas: 180, faturamento: 5400, margem: 38.7 },
];

const dailySalesData = [
  { day: 'Seg', vendas: 45, faturamento: 2340 },
  { day: 'Ter', vendas: 52, faturamento: 2780 },
  { day: 'Qua', vendas: 38, faturamento: 1950 },
  { day: 'Qui', vendas: 61, faturamento: 3200 },
  { day: 'Sex', vendas: 75, faturamento: 3900 },
  { day: 'Sab', vendas: 89, faturamento: 4650 },
  { day: 'Dom', vendas: 34, faturamento: 1780 },
];

const chartConfig = {
  faturamento: {
    label: "Faturamento",
    color: "hsl(var(--revenue))",
  },
  lucro: {
    label: "Lucro",
    color: "hsl(var(--profit))",
  },
  vendas: {
    label: "Vendas",
    color: "hsl(var(--warning))",
  },
  pix: {
    label: "PIX",
    color: "hsl(142 76% 36%)",
  },
  dinheiro: {
    label: "Dinheiro",
    color: "hsl(38 92% 50%)",
  },
  credito: {
    label: "Cartão Crédito", 
    color: "hsl(220 100% 55%)",
  },
  debito: {
    label: "Cartão Débito",
    color: "hsl(0 84.2% 60.2%)",
  },
};

export function Reports() {
  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="h-screen overflow-y-auto">
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">Análise detalhada do desempenho do seu negócio</p>
        </div>

        {/* Cards de estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Faturamento Anual"
            value="R$ 500.000"
            icon={<DollarSign className="w-8 h-8" />}
            variant="revenue"
            trend={{ value: 15.8, label: "vs ano anterior" }}
          />
          <StatsCard
            title="Lucro Anual"
            value="R$ 187.320"
            icon={<TrendingUp className="w-8 h-8" />}
            variant="profit"
            trend={{ value: 22.4, label: "vs ano anterior" }}
          />
          <StatsCard
            title="Vendas no Mês"
            value="1.247"
            icon={<BarChart3 className="w-8 h-8" />}
            variant="success"
            trend={{ value: 8.1, label: "vs mês anterior" }}
          />
          <StatsCard
            title="Ticket Médio"
            value="R$ 54,30"
            icon={<Calendar className="w-8 h-8" />}
            variant="revenue"
            trend={{ value: 5.2, label: "vs mês anterior" }}
          />
        </div>

        {/* Gráfico principal - Faturamento x Lucro */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Faturamento x Lucro (Últimos 6 Meses)</h3>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <ChartTooltip 
                content={<ChartTooltipContent formatter={(value: number, name: string) => [formatCurrency(value), name]} />}
              />
              <Bar dataKey="faturamento" fill="var(--color-faturamento)" name="Faturamento" />
              <Bar dataKey="lucro" fill="var(--color-lucro)" name="Lucro" />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Gráficos de vendas por pagamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PIX - Vendas por Forma de Pagamento (Anual) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vendas por Forma de Pagamento (Anual)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.percentage}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {paymentMethodData.map((method, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: method.color }}
                  ></div>
                  <span className="text-sm">{method.name} ({method.percentage}%)</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Vendas Diárias */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vendas da Semana</h3>
            <ChartContainer config={chartConfig} className="h-80">
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="var(--color-vendas)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-vendas)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </Card>
        </div>

        {/* Evolução das Formas de Pagamento */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Evolução das Formas de Pagamento (Últimos 6 Meses)</h3>
          <ChartContainer config={chartConfig} className="h-80">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <ChartTooltip 
                content={<ChartTooltipContent formatter={(value: number, name: string) => [formatCurrency(value), name]} />}
              />
              <Area dataKey="pix" stackId="1" stroke="var(--color-pix)" fill="var(--color-pix)" fillOpacity={0.6} />
              <Area dataKey="dinheiro" stackId="1" stroke="var(--color-dinheiro)" fill="var(--color-dinheiro)" fillOpacity={0.6} />
              <Area dataKey="credito" stackId="1" stroke="var(--color-credito)" fill="var(--color-credito)" fillOpacity={0.6} />
              <Area dataKey="debito" stackId="1" stroke="var(--color-debito)" fill="var(--color-debito)" fillOpacity={0.6} />
            </AreaChart>
          </ChartContainer>
        </Card>

        {/* Performance dos Produtos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance dos Produtos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Produto</th>
                  <th className="text-center p-3">Vendas</th>
                  <th className="text-center p-3">Faturamento</th>
                  <th className="text-center p-3">Margem</th>
                  <th className="text-center p-3">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {productPerformance.map((product, index) => {
                  const totalRevenue = productPerformance.reduce((sum, p) => sum + p.faturamento, 0);
                  const percentage = ((product.faturamento / totalRevenue) * 100).toFixed(1);
                  
                  return (
                    <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-center">{product.vendas}</td>
                      <td className="p-3 text-center font-semibold text-profit">
                        {formatCurrency(product.faturamento)}
                      </td>
                      <td className="p-3 text-center text-success font-medium">
                        {product.margem}%
                      </td>
                      <td className="p-3 text-center">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Gráfico de Vendas por Forma de Pagamento Mensal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vendas por Forma de Pagamento Mensal</h3>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <ChartTooltip 
                content={<ChartTooltipContent formatter={(value: number, name: string) => [formatCurrency(value), name]} />}
              />
              <Bar dataKey="pix" fill="var(--color-pix)" name="PIX" />
              <Bar dataKey="dinheiro" fill="var(--color-dinheiro)" name="Dinheiro" />
              <Bar dataKey="credito" fill="var(--color-credito)" name="Cartão Crédito" />
              <Bar dataKey="debito" fill="var(--color-debito)" name="Cartão Débito" />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Orçamento Simples com Rolagem */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Orçamento Simples - Resumo Financeiro</h3>
          <div className="max-h-80 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-revenue/10 to-revenue/5 rounded-lg border border-revenue/20">
              <span className="font-medium text-revenue-foreground">Receita Total Anual</span>
              <span className="text-revenue font-bold text-lg">{formatCurrency(500000)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-danger/10 to-danger/5 rounded-lg border border-danger/20">
              <span className="font-medium text-danger-foreground">Custos Operacionais</span>
              <span className="text-danger font-bold text-lg">{formatCurrency(280000)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-profit/10 to-profit/5 rounded-lg border border-profit/20">
              <span className="font-medium text-profit-foreground">Lucro Bruto</span>
              <span className="text-profit font-bold text-lg">{formatCurrency(220000)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg border border-warning/20">
              <span className="font-medium text-warning-foreground">Impostos e Taxas</span>
              <span className="text-warning font-bold text-lg">{formatCurrency(32680)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
              <span className="font-medium text-success-foreground">Salários e Encargos</span>
              <span className="text-success font-bold text-lg">{formatCurrency(45000)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-muted/10 to-muted/5 rounded-lg border border-muted/20">
              <span className="font-medium">Despesas Operacionais</span>
              <span className="text-muted-foreground font-bold text-lg">{formatCurrency(18500)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20">
              <span className="font-medium">Manutenção e Equipamentos</span>
              <span className="text-secondary-foreground font-bold text-lg">{formatCurrency(12300)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/20">
              <span className="font-medium">Marketing e Publicidade</span>
              <span className="text-accent-foreground font-bold text-lg">{formatCurrency(8200)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-profit/20 to-profit/10 border-2 border-profit/30 rounded-lg shadow-lg">
              <span className="font-semibold text-lg">💰 Lucro Líquido</span>
              <span className="text-profit font-bold text-xl">{formatCurrency(187320)}</span>
            </div>
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Margem de Lucro Líquida</p>
                <p className="text-2xl font-bold text-primary">37.5%</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              💡 Role para ver mais detalhes do orçamento anual
            </p>
          </div>
        </Card>

        {/* Resumo Executivo */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-profit/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Resumo Executivo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <p className="text-muted-foreground">Margem de Lucro Média</p>
              <p className="text-2xl font-bold text-profit">37.5%</p>
              <p className="text-xs text-muted-foreground mt-1">Meta: 35%</p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <p className="text-muted-foreground">Crescimento Mensal</p>
              <p className="text-2xl font-bold text-success">+8.2%</p>
              <p className="text-xs text-muted-foreground mt-1">Meta: +5%</p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <p className="text-muted-foreground">Produto Top</p>
              <p className="text-xl font-bold">Placas 60x60</p>
              <p className="text-xs text-muted-foreground mt-1">R$ 43.500 faturados</p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-lg">
              <p className="text-muted-foreground">Meta Anual</p>
              <p className="text-2xl font-bold text-revenue">78%</p>
              <p className="text-xs text-muted-foreground mt-1">R$ 390k de R$ 500k</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}