import { useState } from "react";
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
import { Package, Plus, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { Product, Sale } from "@/components/sales/types";

interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: "entrada" | "saida";
  quantity: number;
  date: string;
  reason: string;
}

interface StockManagementProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales?: Sale[];
}

export function StockManagement({ products, setProducts, sales = [] }: StockManagementProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  
  // Estados para entrada de estoque
  const [entryProductId, setEntryProductId] = useState("");
  const [entryQuantity, setEntryQuantity] = useState("");
  const [entryReason, setEntryReason] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Estados para saída de estoque
  const [exitProductId, setExitProductId] = useState("");
  const [exitQuantity, setExitQuantity] = useState("");
  const [exitReason, setExitReason] = useState("");
  const [exitDate, setExitDate] = useState(new Date().toISOString().split("T")[0]);

  const handleStockEntry = () => {
    if (!entryProductId || !entryQuantity) return;

    const product = products.find(p => p.id === parseInt(entryProductId));
    if (!product) return;

    const quantity = parseInt(entryQuantity);
    
    // Atualizar estoque do produto
    setProducts(prev => prev.map(p => 
      p.id === product.id 
        ? { ...p, stock: p.stock + quantity }
        : p
    ));

    // Registrar movimento
    const newMovement: StockMovement = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      type: "entrada",
      quantity,
      date: entryDate,
      reason: entryReason || "Entrada de estoque"
    };

    setMovements(prev => [newMovement, ...prev]);

    // Limpar formulário
    setEntryProductId("");
    setEntryQuantity("");
    setEntryReason("");
    setEntryDate(new Date().toISOString().split("T")[0]);
    setIsEntryDialogOpen(false);
  };

  const handleStockExit = () => {
    if (!exitProductId || !exitQuantity) return;

    const product = products.find(p => p.id === parseInt(exitProductId));
    if (!product) return;

    const quantity = parseInt(exitQuantity);
    
    // Verificar se há estoque suficiente
    if (product.stock < quantity) {
      alert("Estoque insuficiente!");
      return;
    }

    // Atualizar estoque do produto
    setProducts(prev => prev.map(p => 
      p.id === product.id 
        ? { ...p, stock: p.stock - quantity }
        : p
    ));

    // Registrar movimento
    const newMovement: StockMovement = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      type: "saida",
      quantity,
      date: exitDate,
      reason: exitReason || "Saída de estoque"
    };

    setMovements(prev => [newMovement, ...prev]);

    // Limpar formulário
    setExitProductId("");
    setExitQuantity("");
    setExitReason("");
    setExitDate(new Date().toISOString().split("T")[0]);
    setIsExitDialogOpen(false);
  };

  // Função para importar saídas das vendas
  const importSalesData = () => {
    if (!sales.length) {
      alert("Nenhuma venda encontrada para importar!");
      return;
    }

    let importedMovements = 0;
    const today = new Date().toISOString().split("T")[0];

    sales.forEach(sale => {
      sale.products.forEach(saleProduct => {
        const product = products.find(p => p.name === saleProduct.name);
        if (product) {
          // Criar movimento de saída baseado na venda
          const movement: StockMovement = {
            id: Date.now() + Math.random(),
            productId: product.id,
            productName: product.name,
            type: "saida",
            quantity: saleProduct.quantity,
            date: sale.date,
            reason: `Venda #${sale.id} - ${sale.customer?.name || 'Cliente'}`
          };

          setMovements(prev => {
            // Verificar se já existe movimento para esta venda
            const exists = prev.some(m => m.reason.includes(`Venda #${sale.id}`));
            if (!exists) {
              importedMovements++;
              return [movement, ...prev];
            }
            return prev;
          });

          // Atualizar estoque do produto
          setProducts(prev => prev.map(p => 
            p.id === product.id 
              ? { ...p, stock: Math.max(0, p.stock - saleProduct.quantity) }
              : p
          ));
        }
      });
    });

    alert(`${importedMovements} movimentos de saída importados das vendas!`);
  };

  const getTotalMovements = (type: "entrada" | "saida") => {
    return movements.filter(m => m.type === type).reduce((sum, m) => sum + m.quantity, 0);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Controle de Estoque</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={importSalesData}
            variant="secondary" 
            className="flex items-center space-x-2"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Importar Vendas</span>
          </Button>
          
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Entrada</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Entrada de Estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={entryProductId}
                    onChange={(e) => setEntryProductId(e.target.value)}
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Estoque atual: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={entryQuantity}
                    onChange={(e) => setEntryQuantity(e.target.value)}
                    placeholder="Quantidade a adicionar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Motivo (opcional)</Label>
                  <Input
                    value={entryReason}
                    onChange={(e) => setEntryReason(e.target.value)}
                    placeholder="Ex: Compra, Produção, Ajuste..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleStockEntry}>
                    Registrar Entrada
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Minus className="w-4 h-4" />
                <span>Saída</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Saída de Estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={exitProductId}
                    onChange={(e) => setExitProductId(e.target.value)}
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Estoque atual: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={exitQuantity}
                    onChange={(e) => setExitQuantity(e.target.value)}
                    placeholder="Quantidade a retirar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Motivo (opcional)</Label>
                  <Input
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value)}
                    placeholder="Ex: Perda, Devolução, Ajuste..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsExitDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleStockExit}>
                    Registrar Saída
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Total de Entradas</h3>
          </div>
          <p className="text-2xl font-bold text-green-500 mt-2">
            {getTotalMovements("entrada")}
          </p>
          <p className="text-sm text-muted-foreground">unidades</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold">Total de Saídas</h3>
          </div>
          <p className="text-2xl font-bold text-red-500 mt-2">
            {getTotalMovements("saida")}
          </p>
          <p className="text-sm text-muted-foreground">unidades</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Produtos Cadastrados</h3>
          </div>
          <p className="text-2xl font-bold text-blue-500 mt-2">
            {products.length}
          </p>
          <p className="text-sm text-muted-foreground">produtos</p>
        </Card>
      </div>

      {/* Estoque atual */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Estoque Atual</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estoque Atual</TableHead>
              <TableHead>Valor Unitário</TableHead>
              <TableHead>Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <span className={`font-semibold ${product.stock < 20 ? 'text-red-500' : 'text-green-500'}`}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>R$ {product.cost.toFixed(2)}</TableCell>
                <TableCell>R$ {(product.cost * product.stock).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Histórico de movimentações */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Histórico de Movimentações</h3>
        {movements.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma movimentação registrada ainda
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{new Date(movement.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{movement.productName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      movement.type === 'entrada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{movement.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}