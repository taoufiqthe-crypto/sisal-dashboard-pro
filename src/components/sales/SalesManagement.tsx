import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, ShoppingCart, Calendar, DollarSign } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

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
  paymentMethod: 'dinheiro' | 'pix' | 'credito' | 'debito';
  amountPaid: number;
  change: number;
  status: 'pago' | 'pendente';
  customerName?: string;
}

interface PaymentMethod {
  type: 'dinheiro' | 'pix' | 'credito' | 'debito';
  label: string;
  icon: string;
}

const paymentMethods: PaymentMethod[] = [
  { type: 'dinheiro', label: 'Dinheiro', icon: '💰' },
  { type: 'pix', label: 'PIX', icon: '📱' },
  { type: 'credito', label: 'Cartão de Crédito', icon: '💳' },
  { type: 'debito', label: 'Cartão de Débito', icon: '💳' },
];

const mockSales: Sale[] = [
  { 
    id: 1, 
    date: "2024-01-10", 
    products: [
      { name: "Gesso São Francisco", quantity: 5, price: 29.90 },
      { name: "Placas 60x60", quantity: 2, price: 30.00 }
    ],
    total: 209.50,
    profit: 89.50,
    paymentMethod: 'pix',
    amountPaid: 209.50,
    change: 0,
    status: 'pago',
    customerName: 'João Silva'
  },
  { 
    id: 2, 
    date: "2024-01-10", 
    products: [
      { name: "Sisal", quantity: 3, price: 30.00 }
    ],
    total: 90.00,
    profit: 45.00,
    paymentMethod: 'dinheiro',
    amountPaid: 100.00,
    change: 10.00,
    status: 'pago',
    customerName: 'Maria Santos'
  },
];

interface SalesManagementProps {
  products: Product[];
}

export function SalesManagement(props: SalesManagementProps) {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SaleItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod['type']>('dinheiro');
  const [amountPaid, setAmountPaid] = useState("");
  const [customerName, setCustomerName] = useState("");

  const addProductToSale = () => {
    if (currentProduct && currentQuantity) {
      // PRODUTOS DE PROPS: Busca na lista que foi passada como propriedade
      const product = props.products.find(p => p.id.toString() === currentProduct);
      if (product) {
        const saleItem: SaleItem = {
          productId: product.id,
          productName: product.name,
          quantity: parseInt(currentQuantity),
          price: product.price,
        };
        setSelectedProducts([...selectedProducts, saleItem]);
        setCurrentProduct("");
        setCurrentQuantity("");
      }
    }
  };

  const removeProductFromSale = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  // FUNÇÃO DE LUCRO: Adaptada para usar os dados do item da venda, que não inclui o custo
  const calculateProfit = () => {
    return selectedProducts.reduce((sum, item) => {
      const productData = props.products.find(p => p.id === item.productId);
      if (productData) {
        return sum + (item.quantity * (item.price - productData.cost));
      }
      return sum;
    }, 0);
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return selectedPaymentMethod === 'dinheiro' ? Math.max(0, paid - total) : 0;
  };

  const finalizeSale = () => {
    if (selectedProducts.length > 0) {
      const total = calculateTotal();
      const profit = calculateProfit();
      const paid = parseFloat(amountPaid) || total;
       
      const finalAmountPaid = ['pix', 'credito', 'debito'].includes(selectedPaymentMethod) ? total : paid;
       
      const newSale: Sale = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        products: selectedProducts.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        profit: profit,
        paymentMethod: selectedPaymentMethod,
        amountPaid: finalAmountPaid,
        change: calculateChange(),
        status: 'pago',
        customerName: customerName || 'Cliente'
      };
      setSales([newSale, ...sales]);
      setSelectedProducts([]);
      setAmountPaid("");
      setCustomerName("");
      setSelectedPaymentMethod('dinheiro');
      setIsDialogOpen(false);
    }
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
          <p className="text-muted-foreground">Registre e acompanhe suas vendas</p>
        </div>
         
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4" />
              <span>Nova Venda</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nova Venda</DialogTitle>
              <DialogDescription>
                Selecione os produtos e quantidades vendidas.
              </DialogDescription>
            </DialogHeader>
             
            <div className="space-y-4">
              {/* Nome do cliente */}
              <div className="space-y-2">
                <Label htmlFor="customer">Nome do Cliente (opcional)</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Digite o nome do cliente"
                />
              </div>

              {/* Adicionar produto */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  {/* ALTERAÇÃO AQUI: Usa a lista de produtos da prop */}
                  <Select value={currentProduct} onValueChange={setCurrentProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {props.products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - {formatCurrency(product.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(e.target.value)}
                  />
                </div>
                <Button onClick={addProductToSale} disabled={!currentProduct || !currentQuantity}>
                  Adicionar
                </Button>
              </div>

              {/* ... resto do código ... */}
              {selectedProducts.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Produtos da Venda</h3>
                  {selectedProducts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeProductFromSale(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                   
                  <div className="border-t pt-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-revenue">{formatCurrency(calculateTotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Lucro:</span>
                      <span className="font-bold text-profit">{formatCurrency(calculateProfit())}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Forma de pagamento */}
              {selectedProducts.length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Forma de Pagamento</h3>
                   
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.type}
                        variant={selectedPaymentMethod === method.type ? "default" : "outline"}
                        className="flex items-center space-x-2 justify-start p-4 h-auto"
                        onClick={() => setSelectedPaymentMethod(method.type)}
                      >
                        <span className="text-lg">{method.icon}</span>
                        <span>{method.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Valor pago e troco (apenas para dinheiro) */}
                  {selectedPaymentMethod === 'dinheiro' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="amountPaid">Valor Pago pelo Cliente</Label>
                        <Input
                          id="amountPaid"
                          type="number"
                          step="0.01"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          placeholder={formatCurrency(calculateTotal())}
                        />
                      </div>
                       
                      {amountPaid && parseFloat(amountPaid) >= calculateTotal() && (
                        <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Troco:</span>
                            <span className="text-lg font-bold text-success">
                              {formatCurrency(calculateChange())}
                            </span>
                          </div>
                        </div>
                      )}

                      {amountPaid && parseFloat(amountPaid) < calculateTotal() && (
                        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                          <span className="text-sm text-warning-foreground">
                            Valor insuficiente. Faltam {formatCurrency(calculateTotal() - parseFloat(amountPaid))}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedPaymentMethod !== 'dinheiro' && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Valor a ser {selectedPaymentMethod === 'pix' ? 'recebido via PIX' : 'cobrado no cartão'}:</span>
                        <span className="text-lg font-bold text-revenue">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={finalizeSale} 
                disabled={
                  selectedProducts.length === 0 || 
                  (selectedPaymentMethod === 'dinheiro' && 
                    (!amountPaid || parseFloat(amountPaid) < calculateTotal()))
                }
              >
                Finalizar Venda
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo das vendas de hoje por forma de pagamento */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Vendas por Forma de Pagamento (Hoje)</span>
        </h3>
         
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethods.map((method) => {
            const todaySales = sales.filter(s => s.date === new Date().toISOString().split('T')[0] && s.paymentMethod === method.type);
            const total = todaySales.reduce((sum, s) => sum + s.total, 0);
            const count = todaySales.length;
             
            return (
              <div key={method.type} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{method.icon}</span>
                  <span className="font-medium text-sm">{method.label}</span>
                </div>
                <p className="text-lg font-bold text-revenue">{formatCurrency(total)}</p>
                <p className="text-xs text-muted-foreground">{count} venda{count !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Histórico de vendas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Histórico de Vendas</span>
        </h3>
         
        <div className="space-y-4">
          {sales.map((sale) => {
            const paymentMethodInfo = paymentMethods.find(p => p.type === sale.paymentMethod);
            return (
              <div key={sale.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">Venda #{sale.id}</Badge>
                    <span className="text-sm text-muted-foreground">{sale.date}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{paymentMethodInfo?.icon}</span>
                      <span className="text-sm font-medium">{paymentMethodInfo?.label}</span>
                    </div>
                    {sale.customerName && sale.customerName !== 'Cliente' && (
                      <span className="text-sm text-muted-foreground">• {sale.customerName}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-revenue">{formatCurrency(sale.total)}</p>
                    <p className="text-sm text-profit">Lucro: {formatCurrency(sale.profit)}</p>
                    {sale.change > 0 && (
                      <p className="text-xs text-warning">Troco: {formatCurrency(sale.change)}</p>
                    )}
                  </div>
                </div>
                 
                <div className="space-y-2">
                  {sale.products.map((product, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{product.name}</span>
                      <span>{product.quantity} x {formatCurrency(product.price)}</span>
                    </div>
                  ))}
                </div>

                {/* Detalhes do pagamento */}
                <div className="mt-3 pt-3 border-t bg-muted/30 -m-4 p-4 rounded-b-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor Pago</p>
                      <p className="font-semibold">{formatCurrency(sale.amountPaid)}</p>
                    </div>
                    {sale.change > 0 && (
                      <div>
                        <p className="text-muted-foreground">Troco</p>
                        <p className="font-semibold text-warning">{formatCurrency(sale.change)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant="success" className="text-xs">Pago</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pagamento</p>
                      <p className="font-semibold">{paymentMethodInfo?.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sales.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma venda registrada</h3>
            <p className="text-muted-foreground">Comece registrando sua primeira venda</p>
          </div>
        )}
      </Card>
    </div>
  );
}