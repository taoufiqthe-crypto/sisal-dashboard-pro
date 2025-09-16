import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/navigation/Navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ProductManagement } from "@/components/products/ProductManagement";
import { SalesManagement } from "@/components/sales";
import { StockManagement } from "@/components/stock/StockManagement";
import { Reports } from "@/components/reports/Reports";
import { WithdrawalsManagement } from "@/components/withdrawals/WithdrawalsManagement";
import { Settings } from "@/components/Settings/Settings";
import { Manufacturing } from "@/components/Manufacturing/Manufacturing";
import { Terminal } from "@/components/terminal/Terminal";
import { BudgetManagement } from "@/components/budget/BudgetManagement";
import { CustomerManagement } from "@/components/customers/CustomerManagement";
import { BackupRestore } from "@/components/backup/BackupRestore";
import { FinancialManagement } from "@/components/financial/FinancialManagement";
import { AdvancedStockManagement } from "@/components/advanced-stock/AdvancedStockManagement";

// ✅ importamos os mocks e tipos
import { mockProducts, Product, mockCustomers, Customer } from "@/components/sales";

// -------------------------------
// Funções utilitárias
// -------------------------------
const loadProductsFromLocalStorage = (): Product[] => {
  try {
    const storedProducts = localStorage.getItem("products");
    return storedProducts ? JSON.parse(storedProducts) : mockProducts;
  } catch (error) {
    console.error("Failed to load products from localStorage", error);
    return mockProducts;
  }
};

const loadCustomersFromLocalStorage = (): Customer[] => {
  try {
    const storedCustomers = localStorage.getItem("customers");
    return storedCustomers ? JSON.parse(storedCustomers) : mockCustomers;
  } catch (error) {
    console.error("Failed to load customers from localStorage", error);
    return mockCustomers;
  }
};

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Produtos
  const [products, setProducts] = useState<Product[]>(loadProductsFromLocalStorage);

  // Clientes
  const [customers, setCustomers] = useState<Customer[]>(loadCustomersFromLocalStorage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Persistência
  useEffect(() => {
    try {
      localStorage.setItem("products", JSON.stringify(products));
    } catch (error) {
      console.error("Failed to save products to localStorage", error);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem("customers", JSON.stringify(customers));
    } catch (error) {
      console.error("Failed to save customers to localStorage", error);
    }
  }, [customers]);

  // Handlers
  const handleProductAdded = (newProduct: Product) => {
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const productWithId = { ...newProduct, id: newId };
    setProducts((prevProducts) => [...prevProducts, productWithId]);
  };

  const handleSaleCreated = (newSale: any) => {
    console.log("Venda criada:", newSale);
    
    // Atualizar estoque automaticamente
    if (newSale.products && Array.isArray(newSale.products)) {
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const saleProduct = newSale.products.find((p: any) => 
            p.name === product.name || p.productName === product.name
          );
          
          if (saleProduct) {
            const newStock = Math.max(0, product.stock - saleProduct.quantity);
            console.log(`Atualizando estoque de ${product.name}: ${product.stock} -> ${newStock}`);
            return { ...product, stock: newStock };
          }
          
          return product;
        })
      );
    }
  };

  // Renderização
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return (
          <ProductManagement
            products={products}
            onProductAdded={handleProductAdded}
          />
        );
      case "sales":
        return (
          <SalesManagement
            products={products}
            setProducts={setProducts}
            customers={customers}
            setCustomers={setCustomers}
            onSaleCreated={handleSaleCreated}
          />
        );
      case "stock":
        return (
          <StockManagement
            products={products}
            setProducts={setProducts}
            sales={[]}
          />
        );
      case "customers":
        return (
          <CustomerManagement
            customers={customers}
            setCustomers={setCustomers}
          />
        );
      case "budget":
        return (
          <BudgetManagement
            products={products}
            onSaleCreated={handleSaleCreated}
          />
        );
      case "withdrawals":
        return <WithdrawalsManagement />;
      case "reports":
        return <Reports />;
      case "manufacturing":
        return <Manufacturing onTabChange={setActiveTab} />;
      case "terminal":
        return <Terminal />;
      case "backup":
        return <BackupRestore />;
      case "financial":
        return <FinancialManagement />;
      case "advanced-stock":
        return <AdvancedStockManagement />;
      case "settings":
        return <Settings onProductAdded={handleProductAdded} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 ml-64 transition-all duration-300">
        <div className="container mx-auto px-4 py-6">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Index;
