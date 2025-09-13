// src/pages/Index.tsx
import { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState("dashboard");

  // Produtos
  const [products, setProducts] = useState<Product[]>(loadProductsFromLocalStorage);

  // Clientes
  const [customers, setCustomers] = useState<Customer[]>(loadCustomersFromLocalStorage);

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

  const handleSaleCreated = (budgetItems: any[]) => {
    console.log("Venda criada a partir do orçamento:", budgetItems);
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
            customers={customers}
            setCustomers={setCustomers}
          />
        );
      case "stock":
        return (
          <StockManagement
            products={products}
            setProducts={setProducts}
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
      case "settings":
        return <Settings onProductAdded={handleProductAdded} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-6">{renderContent()}</main>
    </div>
  );
};

export default Index;
