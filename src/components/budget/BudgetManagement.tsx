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
    const wb = XLSX.utils.book_new();
    
    // Configurar estilos para o Excel
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    // Planilha de vendas com estilo
    const salesData = budgets
      .filter(b => b.status === 'vendido')
      .map(budget => ({
        'ID Orçamento': budget.id,
        'Data da Venda': new Date(budget.date).toLocaleDateString('pt-BR'),
        'Nome do Cliente': budget.customerName,
        'Telefone': budget.customerPhone || 'N/A',
        'CPF/CNPJ': budget.customerDocument || 'N/A',
        'Endereço': budget.customerAddress || 'N/A',
        'Valor Total': `R$ ${budget.total.toFixed(2)}`,
        'Lucro Obtido': `R$ ${budget.profit.toFixed(2)}`,
        'Margem (%)': `${((budget.profit / budget.total) * 100).toFixed(1)}%`,
        'Status': budget.status.toUpperCase()
      }));
    
    const salesWs = XLSX.utils.json_to_sheet(salesData);
    
    // Adicionar cores e formatação
    const salesRange = XLSX.utils.decode_range(salesWs['!ref'] || 'A1');
    
    // Colorir cabeçalho
    for (let col = salesRange.s.c; col <= salesRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!salesWs[cellAddress]) continue;
      salesWs[cellAddress].s = headerStyle;
    }
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 15 }, // ID
      { wch: 15 }, // Data
      { wch: 25 }, // Cliente
      { wch: 15 }, // Telefone
      { wch: 18 }, // CPF/CNPJ
      { wch: 30 }, // Endereço
      { wch: 15 }, // Total
      { wch: 15 }, // Lucro
      { wch: 12 }, // Margem
      { wch: 12 }  // Status
    ];
    salesWs['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, salesWs, "📊 Vendas Realizadas");
    
    // Planilha de produtos por orçamento
    const productsData: any[] = [];
    budgets.forEach(budget => {
      budget.products.forEach(item => {
        productsData.push({
          'ID Orçamento': budget.id,
          'Data': new Date(budget.date).toLocaleDateString('pt-BR'),
          'Cliente': budget.customerName,
          'Produto': item.name,
          'Quantidade': item.quantity,
          'Valor Unitário': `R$ ${item.price.toFixed(2)}`,
          'Total Item': `R$ ${(item.quantity * item.price).toFixed(2)}`,
          'Status Orçamento': budget.status.toUpperCase()
        });
      });
    });
    
    const productsWs = XLSX.utils.json_to_sheet(productsData);
    
    // Colorir cabeçalho da planilha de produtos
    const productsRange = XLSX.utils.decode_range(productsWs['!ref'] || 'A1');
    for (let col = productsRange.s.c; col <= productsRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!productsWs[cellAddress]) continue;
      productsWs[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "70AD47" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    
    // Ajustar largura das colunas de produtos
    const productColWidths = [
      { wch: 15 }, // ID
      { wch: 12 }, // Data
      { wch: 25 }, // Cliente
      { wch: 30 }, // Produto
      { wch: 12 }, // Quantidade
      { wch: 15 }, // Valor Unit
      { wch: 15 }, // Total Item
      { wch: 18 }  // Status
    ];
    productsWs['!cols'] = productColWidths;
    
    XLSX.utils.book_append_sheet(wb, productsWs, "📦 Produtos Vendidos");
    
    // Planilha de estoque com cores
    const stockData = products.map(product => ({
      'Produto': product.name,
      'Categoria': product.category,
      'Estoque Atual': product.stock,
      'Preço de Venda': `R$ ${product.price.toFixed(2)}`,
      'Custo': `R$ ${product.cost.toFixed(2)}`,
      'Valor Total Estoque': `R$ ${(product.stock * product.cost).toFixed(2)}`,
      'Margem Lucro': `${(((product.price - product.cost) / product.price) * 100).toFixed(1)}%`,
      'Status Estoque': product.stock < 20 ? 'BAIXO' : product.stock < 50 ? 'MÉDIO' : 'BOM'
    }));
    
    const stockWs = XLSX.utils.json_to_sheet(stockData);
    
    // Colorir cabeçalho do estoque
    const stockRange = XLSX.utils.decode_range(stockWs['!ref'] || 'A1');
    for (let col = stockRange.s.c; col <= stockRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!stockWs[cellAddress]) continue;
      stockWs[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "FF6B35" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    
    // Ajustar largura das colunas de estoque
    const stockColWidths = [
      { wch: 25 }, // Produto
      { wch: 15 }, // Categoria
      { wch: 15 }, // Estoque
      { wch: 15 }, // Preço
      { wch: 12 }, // Custo
      { wch: 18 }, // Valor Total
      { wch: 15 }, // Margem
      { wch: 15 }  // Status
    ];
    stockWs['!cols'] = stockColWidths;
    
    XLSX.utils.book_append_sheet(wb, stockWs, "📋 Estoque Atual");
    
    // Planilha de resumo financeiro
    const resumoData = [
      {
        'Métrica': 'Total de Orçamentos',
        'Valor': budgets.length,
        'Observação': 'Todos os orçamentos criados'
      },
      {
        'Métrica': 'Orçamentos Convertidos',
        'Valor': budgets.filter(b => b.status === 'vendido').length,
        'Observação': 'Orçamentos que viraram vendas'
      },
      {
        'Métrica': 'Taxa de Conversão',
        'Valor': `${((budgets.filter(b => b.status === 'vendido').length / budgets.length) * 100).toFixed(1)}%`,
        'Observação': 'Percentual de conversão'
      },
      {
        'Métrica': 'Receita Total',
        'Valor': `R$ ${budgets.filter(b => b.status === 'vendido').reduce((sum, b) => sum + b.total, 0).toFixed(2)}`,
        'Observação': 'Soma de todas as vendas'
      },
      {
        'Métrica': 'Lucro Total',
        'Valor': `R$ ${budgets.filter(b => b.status === 'vendido').reduce((sum, b) => sum + b.profit, 0).toFixed(2)}`,
        'Observação': 'Soma de todos os lucros'
      }
    ];
    
    const resumoWs = XLSX.utils.json_to_sheet(resumoData);
    
    // Colorir cabeçalho do resumo
    const resumoRange = XLSX.utils.decode_range(resumoWs['!ref'] || 'A1');
    for (let col = resumoRange.s.c; col <= resumoRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!resumoWs[cellAddress]) continue;
      resumoWs[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "E74C3C" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    
    // Ajustar largura das colunas do resumo
    resumoWs['!cols'] = [
      { wch: 25 }, // Métrica
      { wch: 20 }, // Valor
      { wch: 35 }  // Observação
    ];
    
    XLSX.utils.book_append_sheet(wb, resumoWs, "💰 Resumo Financeiro");
    
    // Salvar arquivo com nome baseado na data
    const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    XLSX.writeFile(wb, `Relatorio_Completo_${today}.xlsx`);
  };

  const printBudget = (budget: Budget) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orçamento ${budget.id}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 30px;
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
              max-width: 800px;
              margin: 0 auto;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            .header::after {
              content: '';
              position: absolute;
              bottom: -20px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 20px solid transparent;
              border-right: 20px solid transparent;
              border-top: 20px solid #764ba2;
            }
            .header h1 { 
              margin: 0; 
              font-size: 2.5em; 
              font-weight: 300;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .header p { 
              margin: 5px 0; 
              opacity: 0.9;
              font-size: 1.1em;
            }
            .content {
              padding: 40px 30px;
            }
            .budget-info { 
              background: #f8f9ff;
              border-radius: 10px;
              padding: 25px;
              margin-bottom: 30px;
              border-left: 5px solid #667eea;
            }
            .budget-info h2 {
              color: #667eea;
              margin-top: 0;
              font-size: 1.8em;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-top: 20px;
            }
            .info-item {
              background: white;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .info-label {
              font-weight: bold;
              color: #667eea;
              font-size: 0.9em;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              margin-top: 5px;
              font-size: 1.1em;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            th { 
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              padding: 20px;
              text-align: left;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-size: 0.9em;
            }
            td { 
              padding: 18px 20px;
              border-bottom: 1px solid #eee;
              vertical-align: middle;
            }
            tr:nth-child(even) { 
              background-color: #f8f9ff; 
            }
            tr:hover {
              background-color: #f0f2ff;
              transition: background-color 0.3s ease;
            }
            .total-section { 
              background: linear-gradient(135deg, #f8f9ff, #e8edff);
              border-radius: 15px;
              padding: 30px;
              text-align: right;
              border: 2px solid #e0e7ff;
            }
            .total-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 15px 0;
              font-size: 1.2em;
            }
            .total-label {
              font-weight: 600;
              color: #667eea;
            }
            .total-value {
              font-weight: bold;
              color: #333;
            }
            .grand-total {
              border-top: 3px solid #667eea;
              padding-top: 20px;
              margin-top: 20px;
            }
            .grand-total .total-value {
              font-size: 1.4em;
              color: #667eea;
            }
            .footer {
              background: #f8f9ff;
              padding: 20px 30px;
              text-align: center;
              color: #666;
              font-style: italic;
            }
            @media print { 
              body { 
                background: white !important;
                padding: 0 !important;
              }
              .container {
                box-shadow: none !important;
                border-radius: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${companyData.name}</h1>
              <p>CNPJ: ${companyData.cnpj}</p>
              <p>📧 ${companyData.email} | 📱 ${companyData.phone}</p>
              <p>📍 ${companyData.address}</p>
            </div>
            
            <div class="content">
              <div class="budget-info">
                <h2>💼 Orçamento #${budget.id}</h2>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Data</div>
                    <div class="info-value">${new Date(budget.date).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Cliente</div>
                    <div class="info-value">${budget.customerName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Telefone</div>
                    <div class="info-value">${budget.customerPhone || 'Não informado'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">${budget.status}</div>
                  </div>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>📦 Produto</th>
                    <th>📊 Quantidade</th>
                    <th>💰 Valor Unitário</th>
                    <th>💵 Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${budget.products.map(item => `
                    <tr>
                      <td><strong>${item.name}</strong></td>
                      <td>${item.quantity}</td>
                      <td>R$ ${item.price.toFixed(2)}</td>
                      <td><strong>R$ ${(item.quantity * item.price).toFixed(2)}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total-section">
                <div class="total-item">
                  <span class="total-label">💼 Subtotal:</span>
                  <span class="total-value">${formatCurrency(budget.total)}</span>
                </div>
                <div class="total-item">
                  <span class="total-label">📈 Lucro Estimado:</span>
                  <span class="total-value">${formatCurrency(budget.profit)}</span>
                </div>
                <div class="total-item grand-total">
                  <span class="total-label">🎯 TOTAL GERAL:</span>
                  <span class="total-value">${formatCurrency(budget.total)}</span>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>Orçamento válido por 30 dias. Obrigado pela preferência! 🙏</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
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
      {/* Cabeçalho da Empresa - Gesso Primus */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 rounded-lg px-6 py-4 shadow-md border">
              <img
                src="/lovable-uploads/gessoprimus.png"
                alt="Gesso Primus - Qualidade e Preço Baixo"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Gesso Primus
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Sistema de Orçamentos Profissional</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Qualidade e Preço Baixo</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 shadow-md border">
              <p className="text-sm text-slate-600 dark:text-slate-400">CNPJ: {companyData.cnpj}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">📧 {companyData.email}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">📱 {companyData.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Controles */}
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