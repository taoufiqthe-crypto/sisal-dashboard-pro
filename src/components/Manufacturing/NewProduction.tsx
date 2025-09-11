// src/components/Manufacturing/NewProduction.tsx
import { Button } from "@/components/ui/button";

interface NewProductionProps {
  onTabChange: (tab: string) => void;
}

export function NewProduction({ onTabChange }: NewProductionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nova Produção</h2>
          <p className="text-muted-foreground">Adicione uma nova produção de gesso.</p>
        </div>
        {/* Futuramente, aqui você pode adicionar um botão para voltar para a tela de Fabricação */}
        {/* Exemplo: <Button onClick={() => onTabChange("manufacturing")}>Voltar</Button> */}
      </div>
    </div>
  );
}