// src/components/sales/NewSale.tsx
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Receipt, Calendar, CalendarIcon, Printer } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Product, Sale, SaleItem, Customer, paymentMethods } from "./types";
import ReceiptPrinter from "./ReceiptPrinter";

interface NewSaleProps {
  products: Product[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onSaleCreated: (sale: Sale) => void | Promise<void>;
  onClose: () => void;
}

export function NewSale({
  products,
  customers,
  setCustomers,
  onSaleCreated,
  onClose,
}: NewSaleProps) {
  // Estados principais da venda
  const [selectedProducts, setSelectedProducts] = useState<SaleItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [keepSaleDate, setKeepSaleDate] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"dinheiro" | "pix" | "credito" | "debito">("dinheiro");
  const [amountPaid, setAmountPaid] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // Estados para cadastro rápido de cliente
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");

  // Estados para produto avulso
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCost, setNewProductCost] = useState("");

  const formatCurrency = useCallback((value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), []);

  const addProductToSale = useCallback(() => {
    if (currentProduct && currentQuantity) {
      const quantity = parseInt(currentQuantity);
      if (quantity <= 0) {
        toast.error("Quantidade deve ser maior que zero!");
        return;
      }

      if (currentProduct.stock < quantity) {
        toast.error(`Estoque insuficiente! Disponível: ${currentProduct.stock}`);
        return;
      }

      const saleItem: SaleItem = {
        productId: currentProduct.id,
        productName: currentProduct.name,
        quantity: quantity,
        price: currentProduct.price,
      };
      setSelectedProducts(prev => [...prev, saleItem]);
      setCurrentProduct(null);
      setCurrentQuantity("");
      toast.success(`${currentProduct.name} adicionado à venda!`);
    }
  }, [currentProduct, currentQuantity]);

  const addManualProductToSale = useCallback(() => {
    if (!newProductName.trim()) {
      toast.error("Nome do produto é obrigatório!");
      return;
    }
    
    if (!newProductPrice || parseFloat(newProductPrice) <= 0) {
      toast.error("Preço deve ser maior que zero!");
      return;
    }
    
    if (!currentQuantity || parseInt(currentQuantity) <= 0) {
      toast.error("Quantidade deve ser maior que zero!");
      return;
    }

    const saleItem: SaleItem = {
      productId: Date.now(),
      productName: newProductName.trim(),
      quantity: parseInt(currentQuantity),
      price: parseFloat(newProductPrice),
    };
    
    setSelectedProducts(prev => [...prev, saleItem]);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductCost("");
    setCurrentQuantity("");
    toast.success(`${newProductName} adicionado à venda!`);
  }, [newProductName, newProductPrice, currentQuantity]);

  const removeProductFromSale = useCallback((index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
    toast.info("Produto removido da venda");
  }, []);

  const calculateTotal = useCallback(() =>
    selectedProducts.reduce((sum, item) => sum + item.quantity * item.price, 0), 
    [selectedProducts]
  );

  const calculateProfit = useCallback(() =>
    selectedProducts.reduce((sum, item) => {
      const productData = products.find((p) => p.id === item.productId);
      if (productData) {
        return sum + item.quantity * (item.price - productData.cost);
      }
      const estimatedCost = item.price * 0.3;
      return sum + item.quantity * (item.price - estimatedCost);
    }, 0), 
    [selectedProducts, products]
  );

  const calculateChange = useCallback(() => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return selectedPaymentMethod === "dinheiro" ? Math.max(0, paid - total) : 0;
  }, [calculateTotal, amountPaid, selectedPaymentMethod]);

  const finalizeSale = useCallback(async () => {
    if (selectedProducts.length === 0) {
      toast.error("Adicione pelo menos um produto à venda!");
      return;
    }

    // Validação para pagamento em dinheiro
    if (selectedPaymentMethod === "dinheiro") {
      const total = calculateTotal();
      const paid = parseFloat(amountPaid) || 0;
      
      if (paid < total) {
        toast.error(`Valor insuficiente! Total: ${formatCurrency(total)}, Pago: ${formatCurrency(paid)}`);
        return;
      }
    }

    // Validar estoque
    for (const item of selectedProducts) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        toast.error(`Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const total = calculateTotal();
      const profit = calculateProfit();
      const paid = parseFloat(amountPaid) || total;
      const finalAmountPaid = ["pix", "credito", "debito"].includes(selectedPaymentMethod) ? total : paid;

      const newSale: Sale = {
        id: Date.now(),
        date: saleDate.toISOString().split("T")[0],
        products: selectedProducts.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        cart: selectedProducts,
        total,
        profit,
        paymentMethod: selectedPaymentMethod,
        amountPaid: finalAmountPaid,
        change: calculateChange(),
        status: "pago",
        customer: selectedCustomer || { id: Date.now(), name: "Cliente Avulso" },
      };

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Chamar callback - await caso seja async
      await Promise.resolve(onSaleCreated(newSale));
      
      // Salvar para exibir comprovante
      setLastSale(newSale);
      setShowReceiptDialog(true);
      
      // Limpar formulário após sucesso
      setSelectedProducts([]);
      setCurrentProduct(null);
      setCurrentQuantity("");
      setSelectedCustomer(null);
      setAmountPaid("");
      if (!keepSaleDate) {
        setSaleDate(new Date());
      }
      setSelectedPaymentMethod("dinheiro");
      setIsAddingCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");
      setNewProductName("");
      setNewProductPrice("");
      setNewProductCost("");
      
      toast.success("✅ Venda finalizada com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      toast.error("❌ Erro ao finalizar a venda. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    selectedProducts,
    selectedPaymentMethod,
    calculateTotal,
    amountPaid,
    formatCurrency,
    calculateProfit,
    calculateChange,
    saleDate,
    selectedCustomer,
    onSaleCreated,
    keepSaleDate,
    products
  ]);

  return (
    <div className="space-y-4">
      {/* Data da Venda */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Data da Venda
        </Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !saleDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {saleDate ? format(saleDate, "dd/MM/yyyy") : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={saleDate}
                onSelect={(date) => date && setSaleDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant={keepSaleDate ? "default" : "outline"}
            size="sm"
            onClick={() => setKeepSaleDate(!keepSaleDate)}
            className="px-3"
          >
            {keepSaleDate ? "Fixar" : "Livre"}
          </Button>
        </div>
        {keepSaleDate && (
          <p className="text-xs text-muted-foreground">
            Data mantida para próximas vendas - ideal para inserir várias vendas do mesmo dia
          </p>
        )}
      </div>

      {/* Cliente */}
      <div className="space-y-2">
        <Label>Cliente</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {selectedCustomer
                ? selectedCustomer.name
                : "Selecione um cliente"}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Buscar cliente..." />
              <CommandList>
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                <CommandGroup>
                  {customers.map((c) => (
                    <CommandItem
                      key={c.id}
                      onSelect={() => setSelectedCustomer(c)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selectedCustomer?.id === c.id
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </CommandItem>
                  ))}
                  <CommandItem
                    onSelect={() => setIsAddingCustomer(true)}
                    className="text-primary cursor-pointer"
                  >
                    + Adicionar novo cliente
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Formulário de novo cliente */}
      {isAddingCustomer && (
        <div className="p-4 border rounded-lg space-y-3">
          <h4 className="font-semibold">Novo Cliente</h4>
          <Input
            placeholder="Nome"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
          />
          <Input
            placeholder="Telefone"
            value={newCustomerPhone}
            onChange={(e) => setNewCustomerPhone(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={newCustomerEmail}
            onChange={(e) => setNewCustomerEmail(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                if (!newCustomerName.trim()) {
                  toast.error("Nome do cliente é obrigatório!");
                  return;
                }
                const newCustomer: Customer = {
                  id: Date.now(),
                  name: newCustomerName,
                  phone: newCustomerPhone,
                  email: newCustomerEmail,
                };
                setCustomers((prev) => [...prev, newCustomer]);
                setSelectedCustomer(newCustomer);
                setIsAddingCustomer(false);
                setNewCustomerName("");
                setNewCustomerPhone("");
                setNewCustomerEmail("");
                toast.success("Cliente adicionado!");
              }}
            >
              Salvar Cliente
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddingCustomer(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Adicionar Produtos */}
      <div className="space-y-4">
        <Label>Adicionar Produtos</Label>
        
        {/* Seleção de Produto Cadastrado */}
        <div className="space-y-3 p-4 border rounded-lg">
          <h4 className="font-medium text-sm">Produtos do Estoque</h4>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {currentProduct ? currentProduct.name : "Selecione um produto"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar produto..." />
                    <CommandList>
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            onSelect={() => setCurrentProduct(product)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                currentProduct?.id === product.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {product.name} — {formatCurrency(product.price)} (Est: {product.stock})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="Qtd"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
              />
            </div>
            <Button
              onClick={addProductToSale}
              disabled={!currentProduct || !currentQuantity}
            >
              Adicionar
            </Button>
          </div>
        </div>

        {/* Produto Avulso */}
        <div className="space-y-3 p-4 border rounded-lg">
          <h4 className="font-medium text-sm">Produto Avulso</h4>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Nome do produto"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
            </div>
            <div className="w-28">
              <Input
                placeholder="Preço (R$)"
                type="number"
                step="0.01"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
              />
            </div>
            <div className="w-20">
              <Input
                type="number"
                placeholder="Qtd"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
              />
            </div>
            <Button
              onClick={addManualProductToSale}
              disabled={!newProductName || !newProductPrice || !currentQuantity}
            >
              Adicionar
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          💡 Adicione produtos do estoque ou crie produtos avulsos. Adicione quantos produtos desejar antes de finalizar a venda.
        </div>
      </div>

      {/* Lista de produtos adicionados */}
      {selectedProducts.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Produtos da Venda</h3>
          {selectedProducts.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x {formatCurrency(item.price)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold">
                  {formatCurrency(item.quantity * item.price)}
                </p>
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
              <span className="font-bold text-primary text-lg">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Lucro estimado:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(calculateProfit())}
              </span>
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
                variant={
                  selectedPaymentMethod === method.type ? "default" : "outline"
                }
                className="flex items-center space-x-2 justify-start p-4 h-auto"
                onClick={() => setSelectedPaymentMethod(method.type)}
              >
                <span className="text-lg">{method.icon}</span>
                <span>{method.label}</span>
              </Button>
            ))}
          </div>

          {selectedPaymentMethod === "dinheiro" && (
            <div className="space-y-2">
              <Label htmlFor="amountPaid">Valor Pago</Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={formatCurrency(calculateTotal())}
              />
              {amountPaid && parseFloat(amountPaid) >= calculateTotal() && (
                <p className="text-green-600 font-semibold">
                  Troco: {formatCurrency(calculateChange())}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="sticky bottom-0 bg-background flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button
          onClick={finalizeSale}
          disabled={selectedProducts.length === 0 || isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold shadow-lg"
        >
          <Receipt className="w-4 h-4 mr-2" />
          {isProcessing ? "Processando..." : `Finalizar Venda (${formatCurrency(calculateTotal())})`}
        </Button>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={(open) => {
        setShowReceiptDialog(open);
        if (!open) onClose();
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-green-600" />
              Venda Finalizada com Sucesso!
            </DialogTitle>
          </DialogHeader>
          
          {lastSale && (
            <div className="space-y-4">
              <ReceiptPrinter sale={lastSale} />
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-700 dark:text-green-400">Pagamento processado!</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-semibold">{formatCurrency(lastSale.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pagamento:</span>
                    <span>{lastSale.paymentMethod.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor pago:</span>
                    <span>{formatCurrency(lastSale.amountPaid)}</span>
                  </div>
                  {lastSale.change > 0 && (
                    <div className="flex justify-between">
                      <span>Troco:</span>
                      <span className="font-semibold">{formatCurrency(lastSale.change)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReceiptDialog(false);
                    onClose();
                  }}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setShowReceiptDialog(false);
                    // Don't close - allow creating another sale
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Nova Venda
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
