import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PlusCircle, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// IMPORTAÇÃO CORRIGIDA: Usa "../" para voltar uma pasta
import { NewProductForm } from "../products/NewProductForm";

interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

interface SettingsProps {
  onProductAdded: (newProduct: Omit<Product, 'id'>) => void;
}

export function Settings({ onProductAdded }: SettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProductAdded = (newProduct: Omit<Product, 'id'>) => {
    onProductAdded(newProduct);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Ajuste as configurações do sistema.</p>
        </div>
        
        {/* Adicionado o botão de Novo Produto aqui também, caso o usuário queira adicionar um produto a partir da tela de configurações */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4" />
              <span>Novo Produto</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            <NewProductForm onProductAdded={handleProductAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Dados do Sistema</span>
        </h3>
        <p className="text-muted-foreground">
          Aqui você poderá gerenciar dados sensíveis, como backup e restauração.
        </p>
        <div className="mt-4 flex space-x-2">
          <Button variant="outline">Fazer Backup</Button>
          <Button variant="outline">Restaurar Backup</Button>
        </div>
      </Card>

    </div>
  );
}