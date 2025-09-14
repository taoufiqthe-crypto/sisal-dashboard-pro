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
  User,
  Warehouse,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Produtos", icon: Package },
  { id: "sales", label: "Vendas", icon: ShoppingCart },
  { id: "stock", label: "Estoque", icon: Warehouse },
  { id: "customers", label: "Clientes", icon: User },
  { id: "budget", label: "Orçamentos", icon: BarChart3 },
  { id: "withdrawals", label: "Retiradas", icon: DollarSign },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "manufacturing", label: "Fabricação", icon: Cog },
  { id: "terminal", label: "Terminal", icon: PlusCircle },
  { id: "settings", label: "Configurações", icon: Settings },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/gesso.png"
                alt="Gesso Primus"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-green-500">Gesso Primus</h1>
                <p className="text-xs text-muted-foreground">Sistema de Vendas</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col p-2 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "justify-start transition-all",
                isCollapsed ? "px-2" : "px-3",
                activeTab === item.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Footer - Nova Venda Button */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-border bg-card">
        <Button
          variant="default"
          className={cn(
            "w-full justify-start",
            isCollapsed ? "px-2" : "px-3"
          )}
          onClick={() => onTabChange("sales")}
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Nova Venda</span>}
        </Button>
      </div>
    </div>
  );
}
