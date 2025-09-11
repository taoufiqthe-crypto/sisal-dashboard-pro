import { StatsCard } from "./StatsCard";
import { Card } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  Package,
  ShoppingCart
} from "lucide-react";

// Mock data - em produção seria integrado com backend
const mockData = {
  todayRevenue: "R$ 2.847,90",
  monthRevenue: "R$ 45.680,30",
  yearProfit: "R$ 187.320,50",
  lowStockItems: 5,
  todaySales: 23,
  topProducts: [
    { name: "Placas 60x60", sold: 45, revenue: "R$ 1.350,00" },
    { name: "Gesso São Francisco", sold: 30, revenue: "R$ 897,00" },
    { name: "Sisal", sold: 15, revenue: "R$ 450,00" },
    { name: "Arame", sold: 28, revenue: "R$ 280,00" },
  ],
  lowStock: [
    { name: "Rebites", quantity: 5, min: 50 },
    { name: "Molduras", quantity: 8, min: 25 },
    { name: "Tabicas", quantity: 12, min: 30 },
  ]
};

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Faturamento Hoje"
          value={mockData.todayRevenue}
          icon={<DollarSign className="w-8 h-8" />}
          variant="revenue"
          trend={{ value: 12.5, label: "vs ontem" }}
        />
        <StatsCard
          title="Faturamento do Mês"
          value={mockData.monthRevenue}
          icon={<Calendar className="w-8 h-8" />}
          variant="revenue"
          trend={{ value: 8.2, label: "vs mês anterior" }}
        />
        <StatsCard
          title="Lucro do Ano"
          value={mockData.yearProfit}
          icon={<TrendingUp className="w-8 h-8" />}
          variant="profit"
          trend={{ value: 15.8, label: "vs ano anterior" }}
        />
        <StatsCard
          title="Produtos em Falta"
          value={mockData.lowStockItems}
          icon={<AlertTriangle className="w-8 h-8" />}
          variant="warning"
        />
      </div>

      {/* Seção de vendas de hoje e produtos por categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Produtos Mais Vendidos Hoje</h3>
          </div>
          <div className="space-y-3">
            {mockData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sold} unidades</p>
                </div>
                <p className="font-semibold text-profit">{product.revenue}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold">Produtos com Estoque Baixo</h3>
          </div>
          <div className="space-y-3">
            {mockData.lowStock.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Mínimo: {item.min}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-warning">{item.quantity}</p>
                  <p className="text-xs text-muted-foreground">em estoque</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Vendas por Categoria</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Placas</p>
                <p className="text-sm text-muted-foreground">45 vendas</p>
              </div>
              <p className="font-semibold text-profit">R$ 1.350,00</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Gesso</p>
                <p className="text-sm text-muted-foreground">30 vendas</p>
              </div>
              <p className="font-semibold text-profit">R$ 897,00</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Sisal</p>
                <p className="text-sm text-muted-foreground">15 vendas</p>
              </div>
              <p className="font-semibold text-profit">R$ 450,00</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Arame</p>
                <p className="text-sm text-muted-foreground">28 vendas</p>
              </div>
              <p className="font-semibold text-profit">R$ 280,00</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Resumo rápido de hoje */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-profit/10 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{mockData.todaySales}</p>
            <p className="text-sm text-muted-foreground">Vendas Hoje</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-profit">{mockData.todayRevenue}</p>
            <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{mockData.lowStockItems}</p>
            <p className="text-sm text-muted-foreground">Alertas de Estoque</p>
          </div>
        </div>
      </Card>
    </div>
  );
}