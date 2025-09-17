import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  Download,
  Filter
} from "lucide-react";
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sale {
  id: number;
  date: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  profit: number;
  paymentMethod: string;
  customer: {
    name: string;
  };
}

interface ReportsProps {
  sales?: Sale[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function EnhancedReports({ sales = [] }: ReportsProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [dateFilter, setDateFilter] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  // Carregar vendas do localStorage se não fornecidas
  const allSales = useMemo(() => {
    if (sales.length > 0) return sales;
    try {
      const storedSales = localStorage.getItem("sales");
      return storedSales ? JSON.parse(storedSales) : [];
    } catch {
      return [];
    }
  }, [sales]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Filtrar vendas por período
  const filteredSales = useMemo(() => {
    return allSales.filter((sale: Sale) => {
      const saleDate = new Date(sale.date);
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      return saleDate >= start && saleDate <= end;
    });
  }, [allSales, dateFilter]);

  // Dados por ano
  const yearSales = useMemo(() => {
    return allSales.filter((sale: Sale) => 
      new Date(sale.date).getFullYear() === selectedYear
    );
  }, [allSales, selectedYear]);

  // Dados mensais do ano selecionado
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(selectedYear, 0, 1))
    });

    return months.map(month => {
      const monthSales = allSales.filter((sale: Sale) => {
        const saleDate = new Date(sale.date);
        return saleDate.getFullYear() === selectedYear && 
               saleDate.getMonth() === month.getMonth();
      });

      const revenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
      const profit = monthSales.reduce((sum, sale) => sum + sale.profit, 0);

      return {
        month: format(month, 'MMM', { locale: ptBR }),
        monthNumber: month.getMonth() + 1,
        revenue,
        profit,
        sales: monthSales.length
      };
    });
  }, [allSales, selectedYear]);

  // Dados por método de pagamento
  const paymentMethodData = useMemo(() => {
    const methods: { [key: string]: { count: number; total: number } } = {};
    
    filteredSales.forEach((sale: Sale) => {
      const method = sale.paymentMethod || 'Não informado';
      if (!methods[method]) {
        methods[method] = { count: 0, total: 0 };
      }
      methods[method].count++;
      methods[method].total += sale.total;
    });

    return Object.entries(methods).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: filteredSales.length > 0 ? (data.count / filteredSales.length * 100) : 0
    }));
  }, [filteredSales]);

  // Produtos mais vendidos
  const topProducts = useMemo(() => {
    const products: { [key: string]: { quantity: number; revenue: number } } = {};
    
    filteredSales.forEach((sale: Sale) => {
      sale.products.forEach(product => {
        if (!products[product.name]) {
          products[product.name] = { quantity: 0, revenue: 0 };
        }
        products[product.name].quantity += product.quantity;
        products[product.name].revenue += product.quantity * product.price;
      });
    });

    return Object.entries(products)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredSales]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
    const averageTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalProfit,
      averageTicket,
      profitMargin,
      totalSales: filteredSales.length
    };
  }, [filteredSales]);

  const exportToExcel = () => {
    const salesData = filteredSales.map((sale: Sale) => ({
      'Data': format(new Date(sale.date), 'dd/MM/yyyy'),
      'Cliente': sale.customer?.name || 'Cliente Avulso',
      'Total': formatCurrency(sale.total),
      'Lucro': formatCurrency(sale.profit),
      'Método de Pagamento': sale.paymentMethod,
      'Produtos': sale.products.map(p => `${p.name} (${p.quantity}x)`).join(', ')
    }));

    const monthlyReportData = monthlyData.map(month => ({
      'Mês': month.month,
      'Vendas': month.sales,
      'Faturamento': formatCurrency(month.revenue),
      'Lucro': formatCurrency(month.profit)
    }));

    const wb = XLSX.utils.book_new();
    
    // Planilha de vendas detalhadas
    const salesWs = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, salesWs, "Vendas Detalhadas");
    
    // Planilha de resumo mensal
    const monthlyWs = XLSX.utils.json_to_sheet(monthlyReportData);
    XLSX.utils.book_append_sheet(wb, monthlyWs, "Resumo Mensal");
    
    // Planilha de produtos mais vendidos
    const productsWs = XLSX.utils.json_to_sheet(
      topProducts.map(p => ({
        'Produto': p.name,
        'Quantidade Vendida': p.quantity,
        'Faturamento': formatCurrency(p.revenue)
      }))
    );
    XLSX.utils.book_append_sheet(wb, productsWs, "Top Produtos");
    
    const today = format(new Date(), "dd-MM-yyyy");
    XLSX.writeFile(wb, `Relatorio_Vendas_${today}.xlsx`);
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allSales.forEach((sale: Sale) => {
      years.add(new Date(sale.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [allSales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios de Vendas</h2>
          <p className="text-muted-foreground">Análise detalhada do desempenho do seu negócio</p>
        </div>
        <Button onClick={exportToExcel}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Ano para Relatório Anual</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  const today = new Date();
                  setDateFilter({
                    startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
                    endDate: format(endOfMonth(today), 'yyyy-MM-dd')
                  });
                }}
              >
                Este Mês
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="monthly">Relatório Mensal</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="detailed">Vendas Detalhadas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Faturamento"
              value={formatCurrency(stats.totalRevenue)}
              icon={<DollarSign className="w-8 h-8" />}
              variant="revenue"
              trend={{ value: 0, label: "período selecionado" }}
            />
            <StatsCard
              title="Lucro"
              value={formatCurrency(stats.totalProfit)}
              icon={<TrendingUp className="w-8 h-8" />}
              variant="profit"
              trend={{ value: stats.profitMargin, label: `${stats.profitMargin.toFixed(1)}% margem` }}
            />
            <StatsCard
              title="Total de Vendas"
              value={stats.totalSales.toString()}
              icon={<BarChart3 className="w-8 h-8" />}
              variant="success"
              trend={{ value: 0, label: "período selecionado" }}
            />
            <StatsCard
              title="Ticket Médio"
              value={formatCurrency(stats.averageTicket)}
              icon={<Calendar className="w-8 h-8" />}
              variant="revenue"
              trend={{ value: 0, label: "por venda" }}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                    >
                      {paymentMethodData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faturamento por Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal - {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' || name === 'profit' ? formatCurrency(Number(value)) : value,
                      name === 'revenue' ? 'Faturamento' : name === 'profit' ? 'Lucro' : 'Vendas'
                    ]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="revenue" />
                  <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Mensal - {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>Vendas</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((month) => (
                    <TableRow key={month.monthNumber}>
                      <TableCell className="font-medium">
                        {format(new Date(selectedYear, month.monthNumber - 1, 1), 'MMMM', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{month.sales}</TableCell>
                      <TableCell>{formatCurrency(month.revenue)}</TableCell>
                      <TableCell>{formatCurrency(month.profit)}</TableCell>
                      <TableCell>
                        {month.revenue > 0 ? `${((month.profit / month.revenue) * 100).toFixed(1)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade Vendida</TableHead>
                    <TableHead>Faturamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.name}>
                      <TableCell className="font-medium">
                        #{index + 1} {product.name}
                      </TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendas Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Produtos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {format(new Date(sale.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{sale.customer?.name || 'Cliente Avulso'}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(sale.total)}
                        </TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {formatCurrency(sale.profit)}
                        </TableCell>
                        <TableCell>{sale.paymentMethod}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {sale.products.map((product, index) => (
                              <div key={index}>
                                {product.name} ({product.quantity}x)
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}