// src/components/Manufacturing/Manufacturing.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, Cog } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ManufacturingProps {
  onTabChange: (tab: string) => void;
}

// Função para carregar as produções do localStorage
const loadProductionsFromLocalStorage = () => {
  try {
    const storedProductions = localStorage.getItem('productions');
    return storedProductions ? JSON.parse(storedProductions) : [];
  } catch (error) {
    console.error("Failed to load productions from localStorage", error);
    return [];
  }
};

// Função para calcular os totais por tipo de peça
const getPieceTotals = (productions) => {
  return productions.reduce((acc, production) => {
    const pieceName = production.pieceName.toLowerCase();
    if (acc[pieceName]) {
      acc[pieceName] += production.quantity;
    } else {
      acc[pieceName] = production.quantity;
    }
    return acc;
  }, {});
};

export function Manufacturing({ onTabChange }: ManufacturingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productions, setProductions] = useState(loadProductionsFromLocalStorage);
  const [productionData, setProductionData] = useState({
    date: "",
    pieceName: "",
    quantity: "",
    gessoSacos: "",
  });

  // Salva as produções no localStorage sempre que a lista de produções mudar
  useEffect(() => {
    try {
      localStorage.setItem('productions', JSON.stringify(productions));
    } catch (error) {
      console.error("Failed to save productions to localStorage", error);
    }
  }, [productions]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProductionData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSaveProduction = () => {
    // Cria um ID único para a nova produção
    const newId = productions.length > 0 ? Math.max(...productions.map(p => p.id)) + 1 : 1;
    const newProduction = {
      ...productionData,
      id: newId,
      quantity: Number(productionData.quantity),
      gessoSacos: Number(productionData.gessoSacos),
    };

    // Adiciona a nova produção à lista e atualiza o estado
    setProductions((prevProductions) => [...prevProductions, newProduction]);

    // Limpa o formulário e fecha o modal
    setProductionData({
      date: "",
      pieceName: "",
      quantity: "",
      gessoSacos: "",
    });
    setIsModalOpen(false);
  };

  const totalGessoSacos = productions.reduce((total, prod) => total + prod.gessoSacos, 0);
  const pieceTotals = getPieceTotals(productions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fabricação</h2>
          <p className="text-muted-foreground">Monitore a produção de molduras e tabicas.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Nova Produção
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Renderiza um cartão para cada tipo de peça */}
        {Object.keys(pieceTotals).map((pieceName) => (
          <Card key={pieceName} className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{pieceName.charAt(0).toUpperCase() + pieceName.slice(1)} Produzidas</p>
              <h3 className="text-2xl font-bold mt-1">{pieceTotals[pieceName]}</h3>
            </div>
            <Cog className="w-8 h-8 text-muted-foreground" />
          </Card>
        ))}

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sacos de Gesso Usados</p>
            <h3 className="text-2xl font-bold mt-1">{totalGessoSacos}</h3>
          </div>
          <Package className="w-8 h-8 text-muted-foreground" />
        </Card>
      </div>

      {/* Pop-up (modal) para Nova Produção */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nova Produção</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Input id="date" type="date" value={productionData.date} onChange={handleInputChange} className="col-span-3" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pieceName" className="text-right">
                Nome da Peça
              </Label>
              <Input id="pieceName" value={productionData.pieceName} onChange={handleInputChange} className="col-span-3" placeholder="Ex: tabica 5x3" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantidade
              </Label>
              <Input id="quantity" type="number" value={productionData.quantity} onChange={handleInputChange} className="col-span-3" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gessoSacos" className="text-right">
                Sacos de Gesso
              </Label>
              <Input id="gessoSacos" type="number" value={productionData.gessoSacos} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProduction}>Salvar Produção</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}