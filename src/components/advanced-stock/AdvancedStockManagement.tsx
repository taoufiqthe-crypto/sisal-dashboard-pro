import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Package, TrendingDown, TrendingUp, History, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Product {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
  price: number;
  cost_price: number;
  category: string;
}

interface StockMovement {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  created_at: string;
  products: { name: string };
}

export const AdvancedStockManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [movementData, setMovementData] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [productsData, movementsData] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user!.id),
        supabase.from('stock_movements').select(`
          *,
          products (name)
        `).eq('user_id', user!.id).order('created_at', { ascending: false })
      ]);

      setProducts(productsData.data || []);
      setMovements((movementsData.data || []) as StockMovement[]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do estoque.",
        variant: "destructive",
      });
    }
  };

  const createMovement = async () => {
    if (!user || !selectedProduct || !movementData.quantity || !movementData.reason) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const quantity = parseInt(movementData.quantity);
      const product = products.find(p => p.id === selectedProduct);
      
      if (!product) return;

      // Criar movimento
      const { error: movementError } = await supabase.from('stock_movements').insert({
        product_id: selectedProduct,
        type: movementData.type,
        quantity: quantity,
        reason: movementData.reason,
        user_id: user.id
      });

      if (movementError) throw movementError;

      // Atualizar estoque do produto
      let newStock = product.stock;
      if (movementData.type === 'in') {
        newStock += quantity;
      } else if (movementData.type === 'out') {
        newStock -= quantity;
      } else { // adjustment
        newStock = quantity;
      }

      const { error: productError } = await supabase
        .from('products')
        .update({ stock: Math.max(0, newStock) })
        .eq('id', selectedProduct);

      if (productError) throw productError;

      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso!",
      });

      setMovementData({ type: 'in', quantity: '', reason: '' });
      setSelectedProduct('');
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação.",
        variant: "destructive",
      });
    }
  };

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const variants = {
      in: { label: 'Entrada', variant: 'default' as const },
      out: { label: 'Saída', variant: 'destructive' as const },
      adjustment: { label: 'Ajuste', variant: 'secondary' as const }
    };
    
    const typeInfo = variants[type as keyof typeof variants];
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão Avançada de Estoque</h2>
          <p className="text-muted-foreground">Controle detalhado de movimentações e alertas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Movimentação de Estoque</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Produto *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Estoque: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Movimentação *</Label>
                <Select 
                  value={movementData.type} 
                  onValueChange={(value: 'in' | 'out' | 'adjustment') => 
                    setMovementData({ ...movementData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Entrada</SelectItem>
                    <SelectItem value="out">Saída</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  value={movementData.quantity}
                  onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value })}
                  placeholder="Quantidade"
                />
              </div>
              <div>
                <Label>Motivo *</Label>
                <Input
                  value={movementData.reason}
                  onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                  placeholder="Motivo da movimentação"
                />
              </div>
              <Button onClick={createMovement} className="w-full">
                Registrar Movimentação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de Estoque */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outOfStockProducts.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-red-800 mb-2">Produtos em Falta:</h4>
                <div className="flex flex-wrap gap-2">
                  {outOfStockProducts.map(product => (
                    <Badge key={product.id} variant="destructive">{product.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Estoque Baixo:</h4>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map(product => (
                    <Badge key={product.id} variant="outline" className="border-yellow-500">
                      {product.name} ({product.stock}/{product.min_stock})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status do Estoque */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Status do Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total de Produtos:</span>
                <Badge variant="outline">{products.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Produtos em Falta:</span>
                <Badge variant="destructive">{outOfStockProducts.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Estoque Baixo:</span>
                <Badge variant="outline" className="border-yellow-500">
                  {lowStockProducts.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Valor Total em Estoque:</span>
                <span className="font-semibold">
                  R$ {products.reduce((total, p) => total + (p.stock * p.cost_price), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos com Estoque Crítico */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Estoque Crítico</CardTitle>
            <CardDescription>Produtos que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Categoria: {product.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      {product.stock}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Mín: {product.min_stock}
                    </div>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Todos os produtos estão com estoque adequado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Movimentações
          </CardTitle>
          <CardDescription>Últimas movimentações de estoque</CardDescription>
        </CardHeader>
        <CardContent>
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
              {movements.slice(0, 20).map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{movement.products.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementIcon(movement.type)}
                      {getMovementBadge(movement.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={movement.type === 'in' ? 'text-green-600' : movement.type === 'out' ? 'text-red-600' : 'text-blue-600'}>
                      {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '='}{movement.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{movement.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};