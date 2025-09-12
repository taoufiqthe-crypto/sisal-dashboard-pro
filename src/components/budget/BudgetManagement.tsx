import { useState } from "react";
import * as XLSX from 'xlsx';
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
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, FileText, Printer, ShoppingCart, Download, Edit, Settings } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

interface BudgetItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Budget {
  id: number;
  date: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  profit: number;
  customerName: string;
  customerDocument: string;
  customerAddress: string;
  customerPhone: string;
  customerType: 'pessoa_fisica' | 'pessoa_juridica';
  status: 'orcamento' | 'pedido' | 'vendido';
  validUntil: string;
}

interface CompanyData {
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  name: string;
}

const defaultCompanyData: CompanyData = {
  cnpj: '45.174.762/0001-42',
  email: 'gessoprimus2017@gmail.com',
  phone: '(62) 98335-0384',
  address: 'Av. V-8, 08 - qd 09 lt 02 - Mansões Paraíso, Aparecida de Goiânia - GO, 74952-370, Brasil',
  name: 'Gesso Primus'
};

const mockBudgets: Budget[] = [
  { 
    id: 1, 
    date: "2024-01-10", 
    products: [
      { name: "Gesso São Francisco", quantity: 10, price: 29.90 },
      { name: "Placas 60x60", quantity: 5, price: 30.00 }
    ],
    total: 449.00,
    profit: 179.00,
    customerName: 'João Silva',
    customerDocument: '123.456.789-10',
    customerAddress: 'Rua das Flores, 123',
    customerPhone: '(62) 99999-9999',
    customerType: 'pessoa_fisica',
    status: 'orcamento',
    validUntil: "2024-01-25"
  },
  { 
    id: 2, 
    date: "2024-01-09", 
    products: [
      { name: "Sisal", quantity: 8, price: 30.00 }
    ],
    total: 240.00,
    profit: 120.00,
    customerName: 'Maria Santos Ltda',
    customerDocument: '12.345.678/0001-90',
    customerAddress: 'Av. Principal, 456',
    customerPhone: '(62) 88888-8888',
    customerType: 'pessoa_juridica',
    status: 'pedido',
    validUntil: "2024-01-24"
  },
];

interface BudgetManagementProps {
  products: Product[];
  onSaleCreated: (budgetItems: any[]) => void;
}

export function BudgetManagement({ products, onSaleCreated }: BudgetManagementProps) {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<BudgetItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerDocument, setCustomerDocument] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerType, setCustomerType] = useState<'pessoa_fisica' | 'pessoa_juridica'>('pessoa_fisica');
  const [validUntil, setValidUntil] = useState("");
  const [companyData, setCompanyData] = useState<CompanyData>(defaultCompanyData);
  const [editCompanyData, setEditCompanyData] = useState<CompanyData>(defaultCompanyData);

  const addProductToBudget = () => {
    if (currentProduct && currentQuantity) {
      const product = products.find(p => p.id.toString() === currentProduct);
      if (product) {
        const budgetItem: BudgetItem = {
          productId: product.id,
          productName: product.name,
          quantity: parseInt(currentQuantity),
          price: product.price,
        };
        setSelectedProducts([...selectedProducts, budgetItem]);
        setCurrentProduct("");
        setCurrentQuantity("");
      }
    }
  };

  const removeProductFromBudget = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  const calculateProfit = () => {
    return selectedProducts.reduce((sum, item) => {
      const productData = products.find(p => p.id === item.productId);
      if (productData) {
        return sum + (item.quantity * (item.price - productData.cost));
      }
      return sum;
    }, 0);
  };

  const createBudget = () => {
    if (selectedProducts.length > 0 && customerName && customerDocument) {
      const total = calculateTotal();
      const profit = calculateProfit();
       
      const newBudget: Budget = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        products: selectedProducts.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        profit: profit,
        customerName,
        customerDocument,
        customerAddress,
        customerPhone,
        customerType,
        status: 'orcamento',
        validUntil: validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setBudgets([newBudget, ...budgets]);
      setSelectedProducts([]);
      setCustomerName("");
      setCustomerDocument("");
      setCustomerAddress("");
      setCustomerPhone("");
      setValidUntil("");
      setIsDialogOpen(false);
    }
  };

  const convertToPedido = (budgetId: number) => {
    setBudgets(budgets.map(b => 
      b.id === budgetId ? { ...b, status: 'pedido' } : b
    ));
  };

  const convertToSale = (budget: Budget) => {
    // Converter para venda
    onSaleCreated(budget.products);
    setBudgets(budgets.map(b => 
      b.id === budget.id ? { ...b, status: 'vendido' } : b
    ));
  };

  const saveCompanyData = () => {
    setCompanyData(editCompanyData);
    setIsCompanyDialogOpen(false);
  };

  const exportToExcel = () => {
    // Dados de vendas por produto
    const salesData = budgets
      .filter(b => b.status === 'vendido')
      .flatMap(budget => 
        budget.products.map(product => ({
          'Data': budget.date,
          'Cliente': budget.customerName,
          'Produto': product.name,
          'Quantidade Vendida': product.quantity,
          'Preço Unitário': product.price,
          'Total': product.quantity * product.price,
          'Orçamento #': budget.id
        }))
      );

    // Dados de estoque atual
    const stockData = products.map(product => ({
      'Produto': product.name,
      'Categoria': product.category,
      'Estoque Atual': product.stock,
      'Preço de Venda': product.price,
      'Custo': product.cost,
      'Valor Total do Estoque': product.stock * product.cost
    }));

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Adicionar planilhas
    const salesWs = XLSX.utils.json_to_sheet(salesData);
    const stockWs = XLSX.utils.json_to_sheet(stockData);
    
    XLSX.utils.book_append_sheet(wb, salesWs, "Vendas por Produto");
    XLSX.utils.book_append_sheet(wb, stockWs, "Estoque Atual");
    
    // Salvar arquivo
    const fileName = `relatorio_gesso_primus_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const printBudget = (budget: Budget) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Orçamento #${budget.id} - ${companyData.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #22c55e; padding-bottom: 20px; }
              .logo { color: #22c55e; font-size: 24px; font-weight: bold; }
              .subtitle { color: #666; margin: 5px 0; }
              .company-info { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .client-info { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
              .products { margin: 20px 0; }
              .product-item { display: flex; justify-content: space-between; margin: 5px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
              .total { font-weight: bold; font-size: 18px; margin-top: 20px; text-align: right; }
              .footer { margin-top: 30px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
              .info-row { margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">${companyData.name}</div>
              <div class="subtitle">Sistema de Vendas - Qualidade e Preço Baixo</div>
            </div>
            
            <div class="company-info">
              <h3>Dados da Empresa</h3>
              <div class="info-row"><strong>CNPJ:</strong> ${companyData.cnpj}</div>
              <div class="info-row"><strong>Email:</strong> ${companyData.email}</div>
              <div class="info-row"><strong>Telefone/WhatsApp:</strong> ${companyData.phone}</div>
              <div class="info-row"><strong>Endereço:</strong> ${companyData.address}</div>
            </div>
            
            <h2>Orçamento #${budget.id}</h2>
            
            <div class="client-info">
              <h3>Dados do Cliente</h3>
              <div class="info-row"><strong>Nome:</strong> ${budget.customerName}</div>
              <div class="info-row"><strong>${budget.customerType === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}:</strong> ${budget.customerDocument}</div>
              <div class="info-row"><strong>Telefone:</strong> ${budget.customerPhone}</div>
              <div class="info-row"><strong>Endereço:</strong> ${budget.customerAddress}</div>
              <div class="info-row"><strong>Data:</strong> ${new Date(budget.date).toLocaleDateString('pt-BR')}</div>
              <div class="info-row"><strong>Válido até:</strong> ${new Date(budget.validUntil).toLocaleDateString('pt-BR')}</div>
            </div>
            
            <div class="products">
              <h3>Produtos:</h3>
              ${budget.products.map(product => `
                <div class="product-item">
                  <span>${product.name} (${product.quantity}x R$ ${product.price.toFixed(2)})</span>
                  <span>R$ ${(product.quantity * product.price).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              <p>Total: R$ ${budget.total.toFixed(2)}</p>
            </div>
            
            <div class="footer">
              <p>${companyData.name} - Qualidade e Preço Baixo</p>
              <p>Este orçamento é válido até ${new Date(budget.validUntil).toLocaleDateString('pt-BR')}</p>
              <p>Email: ${companyData.email} | Telefone/WhatsApp: ${companyData.phone}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const getStatusBadge = (status: Budget['status']) => {
    const statusConfig = {
      orcamento: { label: 'Orçamento', variant: 'secondary' as const },
      pedido: { label: 'Pedido', variant: 'default' as const },
      vendido: { label: 'Vendido', variant: 'outline' as const }
    };
    return statusConfig[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
          <p className="text-muted-foreground">Gerencie orçamentos e pedidos</p>
        </div>
         
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToExcel} className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </Button>
          
          <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Dados da Empresa</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Dados da Empresa</DialogTitle>
                <DialogDescription>
                  Edite os dados que aparecerão nos orçamentos impressos.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={editCompanyData.name}
                    onChange={(e) => setEditCompanyData({...editCompanyData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyCnpj">CNPJ</Label>
                  <Input
                    id="companyCnpj"
                    value={editCompanyData.cnpj}
                    onChange={(e) => setEditCompanyData({...editCompanyData, cnpj: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={editCompanyData.email}
                    onChange={(e) => setEditCompanyData({...editCompanyData, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefone/WhatsApp</Label>
                  <Input
                    id="companyPhone"
                    value={editCompanyData.phone}
                    onChange={(e) => setEditCompanyData({...editCompanyData, phone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Endereço</Label>
                  <Textarea
                    id="companyAddress"
                    value={editCompanyData.address}
                    onChange={(e) => setEditCompanyData({...editCompanyData, address: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveCompanyData}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4" />
                <span>Novo Orçamento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Orçamento</DialogTitle>
                <DialogDescription>
                  Selecione os produtos e quantidades para o orçamento.
                </DialogDescription>
              </DialogHeader>
               
              <div className="space-y-4">
                {/* Tipo de pessoa */}
                <div className="space-y-2">
                  <Label>Tipo de Cliente</Label>
                  <Select value={customerType} onValueChange={(value: 'pessoa_fisica' | 'pessoa_juridica') => setCustomerType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                      <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nome do cliente */}
                <div className="space-y-2">
                  <Label htmlFor="customer">Nome do Cliente/Empresa *</Label>
                  <Input
                    id="customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={customerType === 'pessoa_fisica' ? "Nome completo" : "Razão social"}
                    required
                  />
                </div>
                
                {/* CPF/CNPJ */}
                <div className="space-y-2">
                  <Label htmlFor="document">{customerType === 'pessoa_fisica' ? 'CPF' : 'CNPJ'} *</Label>
                  <Input
                    id="document"
                    value={customerDocument}
                    onChange={(e) => setCustomerDocument(e.target.value)}
                    placeholder={customerType === 'pessoa_fisica' ? "000.000.000-00" : "00.000.000/0000-00"}
                    required
                  />
                </div>
                
                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                {/* Endereço */}
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Endereço completo"
                    rows={2}
                  />
                </div>

                {/* Válido até */}
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Válido até</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Adicionar produto */}
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Select value={currentProduct} onValueChange={setCurrentProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
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
                  <Button onClick={addProductToBudget} disabled={!currentProduct || !currentQuantity}>
                    Adicionar
                  </Button>
                </div>

                {selectedProducts.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold">Produtos do Orçamento</h3>
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
                            onClick={() => removeProductFromBudget(index)}
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
                        <span className="font-semibold">Lucro Estimado:</span>
                        <span className="font-bold text-profit">{formatCurrency(calculateProfit())}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={createBudget} 
                  disabled={selectedProducts.length === 0 || !customerName || !customerDocument}
                >
                  Criar Orçamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de orçamentos */}
      <div className="space-y-4">
        {budgets.map((budget) => {
          const statusConfig = getStatusBadge(budget.status);
          const isExpired = new Date(budget.validUntil) < new Date() && budget.status === 'orcamento';
          
          return (
            <Card key={budget.id} className={`p-4 ${isExpired ? 'border-destructive' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Badge variant={statusConfig.variant}>{statusConfig.label} #{budget.id}</Badge>
                  <span className="text-sm text-muted-foreground">{new Date(budget.date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-sm font-medium">{budget.customerName}</span>
                  <span className="text-xs text-muted-foreground">
                    {budget.customerType === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}: {budget.customerDocument}
                  </span>
                  {isExpired && (
                    <Badge variant="destructive">Vencido</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right mr-4">
                    <p className="font-semibold text-revenue">{formatCurrency(budget.total)}</p>
                    <p className="text-sm text-profit">Lucro: {formatCurrency(budget.profit)}</p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => printBudget(budget)}
                    className="flex items-center space-x-1"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir</span>
                  </Button>
                  
                  {budget.status === 'orcamento' && !isExpired && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => convertToPedido(budget.id)}
                      className="flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Virar Pedido</span>
                    </Button>
                  )}
                  
                  {budget.status === 'pedido' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => convertToSale(budget)}
                      className="flex items-center space-x-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Vender</span>
                    </Button>
                  )}
                </div>
              </div>
               
              <div className="space-y-2">
                {budget.products.map((product, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{product.name}</span>
                    <span>{product.quantity} x {formatCurrency(product.price)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span>Válido até: {new Date(budget.validUntil).toLocaleDateString('pt-BR')}</span>
                  <span className="font-semibold">Total: {formatCurrency(budget.total)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}