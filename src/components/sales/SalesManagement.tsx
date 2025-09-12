// src/components/sales/SalesManagement.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { NewSale } from "./NewSale";
import { SalesToday } from "./SalesToday";
import { SalesMonth } from "./SalesMonth";
import { SalesYear } from "./SalesYear";
import { SalesHistory } from "./SalesHistory";
import {
  Sale,
  Product,
  paymentMethods,
  mockSales,
  Customer,
} from "./types";

export function SalesManagement({
  products,
  customers,
  setCustomers,
}: {
  products: Product[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}) {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const isToday = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    return date === today;
  };

  const isThisMonth = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  };

  const isThisYear = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear();
  };

  const handleSaleCreated = (newSale: Sale) => {
    setSales([newSale, ...sales]);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
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
            </DialogHeader>
            <NewSale
              products={products}
              customers={customers}
              setCustomers={setCustomers} // ✅ agora conseguimos cadastrar cliente novo
              onSaleCreated={handleSaleCreated}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendas do Dia */}
      <SalesToday
        sales={sales}
        paymentMethods={paymentMethods}
        formatCurrency={formatCurrency}
        isToday={isToday}
      />

      {/* Vendas do Mês */}
      <SalesMonth
        sales={sales}
        paymentMethods={paymentMethods}
        formatCurrency={formatCurrency}
        isThisMonth={isThisMonth}
      />

      {/* Vendas do Ano */}
      <SalesYear
        sales={sales}
        paymentMethods={paymentMethods}
        formatCurrency={formatCurrency}
        isThisYear={isThisYear}
      />

      {/* Histórico */}
      <SalesHistory sales={sales} formatCurrency={formatCurrency} />
    </div>
  );
}
