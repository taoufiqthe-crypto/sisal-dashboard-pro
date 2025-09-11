// src/components/sales/NewSale.tsx
import { Card } from "@/components/ui/card";

interface NewSaleProps {
  onTabChange: (tab: string) => void;
}

export function NewSale({ onTabChange }: NewSaleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nova Venda</h2>
        <p className="text-muted-foreground">Adicione os produtos de uma nova venda.</p>
      </div>
    </div>
  );
}