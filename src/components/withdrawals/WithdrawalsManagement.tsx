import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Calendar } from "lucide-react";

// Definindo a interface (estrutura) para o objeto de retirada
interface Withdrawal {
  id: number;
  date: string;
  amount: number;
}

export function WithdrawalsManagement() {
  // Estado para armazenar a lista de retiradas diárias
  const [dailyWithdrawals, setDailyWithdrawals] = useState<Withdrawal[]>([]);
  // Estado para o valor da nova retirada
  const [newWithdrawalValue, setNewWithdrawalValue] = useState<string>("");
  // Estado para controlar a abertura da janela (dialog)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Função para adicionar a retirada
  const handleAddWithdrawal = () => {
    if (newWithdrawalValue.trim() !== "" && !isNaN(parseFloat(newWithdrawalValue))) {
      const today = new Date().toLocaleDateString('pt-BR');
      const newEntry: Withdrawal = {
        id: Date.now(),
        date: today,
        amount: parseFloat(newWithdrawalValue),
      };
      setDailyWithdrawals([...dailyWithdrawals, newEntry]);
      setNewWithdrawalValue(""); // Limpa o campo após adicionar
      setIsDialogOpen(false); // Fecha a janela
    }
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Controle de Retiradas Diárias</h2>
          <p className="text-muted-foreground">Registre quanto dinheiro foi retirado do caixa por dia.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4" />
              <span>Nova Retirada</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Retirada</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor da Retirada (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 250.00"
                  value={newWithdrawalValue}
                  onChange={(e) => setNewWithdrawalValue(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddWithdrawal}>
                Salvar Retirada
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Retiradas Diárias */}
      <div>
        <h3 className="text-xl font-bold mb-4">Histórico de Retiradas</h3>
        <div className="grid gap-4">
          {dailyWithdrawals.length > 0 ? (
            dailyWithdrawals.map((entry) => (
              <Card key={entry.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">{entry.date}</p>
                    <p className="text-sm text-muted-foreground">Valor Retirado</p>
                  </div>
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(entry.amount)}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma retirada registrada ainda.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { WithdrawalsManagement as Component };