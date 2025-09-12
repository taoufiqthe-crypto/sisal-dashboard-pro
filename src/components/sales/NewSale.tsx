// src/components/sales/NewSale.tsx
import { useState } from "react";
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
import { Check, ChevronsUpDown } from "lucide-react";

import { Product, Sale, SaleItem, Customer, paymentMethods } from "./types";

interface NewSaleProps {
  products: Product[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onSaleCreated: (sale: Sale) => void;
  onClose: () => void;
}

export function NewSale({
  products,
  customers,
  setCustomers,
  onSaleCreated,
  onClose,
}: NewSaleProps) {
  const [selectedProducts, setSelectedProducts] = useState<SaleItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "dinheiro" | "pix" | "credito" | "debito"
  >("dinheiro");
  const [amountPaid, setAmountPaid] = useState("");

  // para cadastro rápido de cliente
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const addProductToSale = () => {
    if (currentProduct && currentQuantity) {
      const saleItem: SaleItem = {
        productId: currentProduct.id,
        productName: currentProduct.name,
        quantity: parseInt(currentQuantity),
        price: currentProduct.price,
      };
      setSelectedProducts([...selectedProducts, saleItem]);
      setCurrentProduct(null);
      setCurrentQuantity("");
    }
  };

  const removeProductFromSale = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateTotal = () =>
    selectedProducts.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

  const calculateProfit = () =>
    selectedProducts.reduce((sum, item) => {
      const productData = products.find((p) => p.id === item.productId);
      return productData
        ? sum + item.quantity * (item.price - productData.cost)
        : sum;
    }, 0);

  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return selectedPaymentMethod === "dinheiro"
      ? Math.max(0, paid - total)
      : 0;
  };

  const finalizeSale = () => {
    if (selectedProducts.length === 0) return;

    const total = calculateTotal();
    const profit = calculateProfit();
    const paid = parseFloat(amountPaid) || total;
    const finalAmountPaid = ["pix", "credito", "debito"].includes(
      selectedPaymentMethod
    )
      ? total
      : paid;

    const newSale: Sale = {
      id: Date.now(),
      date: saleDate,
      products: selectedProducts.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      profit,
      paymentMethod: selectedPaymentMethod,
      amountPaid: finalAmountPaid,
      change: calculateChange(),
      status: "pago",
      customer:
        selectedCustomer || {
          id: Date.now(),
          name: "Cliente",
        },
    };

    onSaleCreated(newSale);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Data */}
      <div className="space-y-2">
        <Label htmlFor="saleDate">Data da Venda</Label>
        <Input
          id="saleDate"
          type="date"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
        />
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

                  {/* opção para adicionar novo cliente */}
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

      {/* Seleção de Produto */}
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
                        {product.name} — {formatCurrency(product.price)}
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
              <span className="font-bold text-revenue">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Lucro:</span>
              <span className="font-bold text-profit">
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
                <p className="text-success font-semibold">
                  Troco: {formatCurrency(calculateChange())}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={finalizeSale}
          disabled={selectedProducts.length === 0}
        >
          Finalizar Venda
        </Button>
      </div>
    </div>
  );
}
