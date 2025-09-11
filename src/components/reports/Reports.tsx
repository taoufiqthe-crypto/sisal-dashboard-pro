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

// Mock data para os gráficos
const monthlyData = [
  { name: 'Jan', faturamento: 45680, lucro: 18720, dinheiro: 15200, pix: 18300, credito: 8900, debito: 3280 },
  { name: 'Fev', faturamento: 52300, lucro: 21430, dinheiro: 18200, pix: 21100, credito: 9800, debito: 3200 },
  { name: 'Mar', faturamento: 48900, lucro: 19890, dinheiro: 16700, pix: 19200, credito: 9100, debito: 3900 },
  { name: 'Abr', faturamento: 61200, lucro: 25480, dinheiro: 21000, pix: 24300, credito: 11200, debito: 4700 },
  { name: 'Mai', faturamento: 58700, lucro: 24100, dinheiro: 19500, pix: 23100, credito: 11000, debito: 5100 },
  { name: 'Jun', faturamento: 67800, lucro: 28900, dinheiro: 22300, pix: 26800, credito: 12900, debito: 5800 },
];

const paymentMethodData = [
  { name: 'PIX', value: 45680, percentage: 42.1, color: '#00D4AA' },
  { name: 'Dinheiro', value: 32100, percentage: 29.6, color: '#4CAF50' },
  { name: 'Cartão Crédito', value: 19850, percentage: 18.3, color: '#FF9800' },
  { name: 'Cartão Débito', value: 10870, percentage: 10.0, color: '#2196F3' },
];

const yearlyPieData = [
  { name: 'Lucro', value: 187320, color: 'hsl(var(--profit))' },
  { name: 'Custos', value: 312680, color: 'hsl(var(--muted))' },
];

const productPerformance = [
  { name: 'Placas 60x60', vendas: 145, faturamento: 4350 },
  { name: 'Gesso São Francisco', vendas: 120, faturamento: 3588 },
  { name: 'Sisal', vendas: 85, faturamento: 2550 },
  { name: 'Arame', vendas: 200, faturamento: 2000 },
  { name: 'Rebites', vendas: 500, faturamento: 250 },
];

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

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Faturamento x Lucro Mensal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Faturamento x Lucro (Últimos 6 Meses)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="faturamento" fill="hsl(var(--revenue))" name="Faturamento" />
                <Bar dataKey="lucro" fill="hsl(var(--profit))" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico de pizza - Formas de Pagamento */}
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
      </div>

      {/* Gráfico adicional - Vendas por forma de pagamento mensal */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evolução das Formas de Pagamento (Últimos 6 Meses)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="pix" fill="#00D4AA" name="PIX" />
              <Bar dataKey="dinheiro" fill="#4CAF50" name="Dinheiro" />
              <Bar dataKey="credito" fill="#FF9800" name="Cartão Crédito" />
              <Bar dataKey="debito" fill="#2196F3" name="Cartão Débito" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Performance dos produtos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance dos Produtos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Produto</th>
                <th className="text-center p-2">Vendas</th>
                <th className="text-center p-2">Faturamento</th>
                <th className="text-center p-2">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((product, index) => {
                const totalRevenue = productPerformance.reduce((sum, p) => sum + p.faturamento, 0);
                const percentage = ((product.faturamento / totalRevenue) * 100).toFixed(1);
                
                return (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3 text-center">{product.vendas}</td>
                    <td className="p-3 text-center font-semibold text-profit">
                      {formatCurrency(product.faturamento)}
                    </td>
                    <td className="p-3 text-center">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resumo executivo */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-profit/5 border-primary/20">
        <h3 className="text-lg font-semibold mb-4">Resumo Executivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Margem de Lucro Média</p>
            <p className="text-xl font-bold text-profit">37.5%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Crescimento Mensal</p>
            <p className="text-xl font-bold text-success">+8.2%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Produto Top</p>
            <p className="text-xl font-bold">Placas 60x60</p>
          </div>
          <div>
            <p className="text-muted-foreground">Meta Anual</p>
            <p className="text-xl font-bold text-revenue">78% atingida</p>
          </div>
        </div>
      </Card>
    </div>
  );
}