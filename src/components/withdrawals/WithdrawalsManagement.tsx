import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Calendar, DollarSign, TrendingUp, TrendingDown, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Withdrawal {
  id: number;
  date: string;
  amount: number;
  description: string;
  type: "pessoal" | "empresa";
}

const loadWithdrawals = (): Withdrawal[] => {
  try {
    const stored = localStorage.getItem("withdrawals");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function WithdrawalsManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(loadWithdrawals);
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"pessoal" | "empresa">("pessoal");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<"todos" | "pessoal" | "empresa">("todos");

  // Persist
  useEffect(() => {
    localStorage.setItem("withdrawals", JSON.stringify(withdrawals));
  }, [withdrawals]);

  // Load sales profit for comparison
  const getSalesProfit = (): number => {
    try {
      const sales = JSON.parse(localStorage.getItem("sales") || "[]");
      return sales.reduce((sum: number, s: any) => sum + (s.profit || 0), 0);
    } catch {
      return 0;
    }
  };

  const handleAdd = () => {
    if (!newAmount || isNaN(parseFloat(newAmount)) || parseFloat(newAmount) <= 0) return;

    const entry: Withdrawal = {
      id: Date.now(),
      date: newDate
        ? new Date(newDate).toLocaleDateString("pt-BR")
        : new Date().toLocaleDateString("pt-BR"),
      amount: parseFloat(newAmount),
      description: newDescription || (newType === "pessoal" ? "Retirada pessoal" : "Despesa da empresa"),
      type: newType,
    };

    setWithdrawals(prev => [entry, ...prev]);
    setNewAmount("");
    setNewDate("");
    setNewDescription("");
    setNewType("pessoal");
    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Deseja excluir esta retirada?")) {
      setWithdrawals(prev => prev.filter(w => w.id !== id));
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const filtered = filterType === "todos"
    ? withdrawals
    : withdrawals.filter(w => w.type === filterType);

  const totalPessoal = withdrawals.filter(w => w.type === "pessoal").reduce((s, w) => s + w.amount, 0);
  const totalEmpresa = withdrawals.filter(w => w.type === "empresa").reduce((s, w) => s + w.amount, 0);
  const totalGeral = totalPessoal + totalEmpresa;
  const lucroTotal = getSalesProfit();
  const lucroLiquido = lucroTotal - totalPessoal;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Controle de Retiradas</h2>
          <p className="text-muted-foreground">
            Registre retiradas pessoais separadamente do lucro da empresa.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Retirada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Retirada</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Retirada</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newType === "pessoal" ? "default" : "outline"}
                    onClick={() => setNewType("pessoal")}
                    className="flex-1"
                  >
                    💰 Pessoal
                  </Button>
                  <Button
                    type="button"
                    variant={newType === "empresa" ? "default" : "outline"}
                    onClick={() => setNewType("empresa")}
                    className="flex-1"
                  >
                    🏢 Empresa
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 250.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Ex: Conta pessoal, Aluguel..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAdd}>Salvar Retirada</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-muted-foreground">Lucro Total (Vendas)</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(lucroTotal)}</p>
        </Card>

        <Card className="p-4 border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-muted-foreground">Retiradas Pessoais</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPessoal)}</p>
        </Card>

        <Card className="p-4 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">Despesas da Empresa</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalEmpresa)}</p>
        </Card>

        <Card className="p-4 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-muted-foreground">Lucro Líquido</span>
          </div>
          <p className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(lucroLiquido)}
          </p>
          <p className="text-xs text-muted-foreground">Lucro - Retiradas pessoais</p>
        </Card>
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-2">
        <Label>Filtrar:</Label>
        <div className="flex gap-2">
          {(["todos", "pessoal", "empresa"] as const).map(type => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
            >
              {type === "todos" ? "Todos" : type === "pessoal" ? "💰 Pessoal" : "🏢 Empresa"}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabela de retiradas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Histórico de Retiradas</h3>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma retirada registrada ainda.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {entry.date}
                    </div>
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <Badge variant={entry.type === "pessoal" ? "secondary" : "default"}>
                      {entry.type === "pessoal" ? "💰 Pessoal" : "🏢 Empresa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    - {formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

export { WithdrawalsManagement as Component };
