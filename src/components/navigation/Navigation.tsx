// src/components/navigation/Navigation.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  PlusCircle,
  DollarSign,
  Cog,
  User, // 👈 adicionado
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Produtos", icon: Package },
  { id: "sales", label: "Vendas", icon: ShoppingCart },
  { id: "customers", label: "Clientes", icon: User }, // 👈 nova aba Clientes
  { id: "budget", label: "Orçamentos", icon: BarChart3 },
  { id: "withdrawals", label: "Retiradas", icon: DollarSign },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "manufacturing", label: "Fabricação", icon: Cog },
  { id: "terminal", label: "Terminal", icon: PlusCircle },
  { id: "settings", label: "Configurações", icon: Settings },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Grupo da Esquerda (Logo e Navegação) */}
          <div className="flex items-center space-x-6">
            {/* Logo e Título */}
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/gesso.png"
                alt="Gesso Primus - Qualidade e Preço Baixo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-green-500">Gesso Primus</h1>
                <p className="text-xs text-muted-foreground">Sistema de Vendas</p>
              </div>
            </div>

            {/* Botões de Navegação */}
            <div className="flex items-center space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2 transition-all",
                      activeTab === item.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Botão de Nova Venda (Grupo da Direita) */}
          <Button
            variant="default"
            className="flex items-center space-x-2"
            onClick={() => onTabChange("sales")}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Venda</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
