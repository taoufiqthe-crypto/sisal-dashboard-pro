// src/pages/Index.tsx
import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation/Navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ProductManagement } from "@/components/products/ProductManagement";
import { SalesManagement } from "@/components/sales/SalesManagement";
import { Reports } from "@/components/reports/Reports";
import { WithdrawalsManagement } from "@/components/withdrawals/WithdrawalsManagement";
import { Settings } from "@/components/Settings/Settings";
import { Manufacturing } from "@/components/Manufacturing/Manufacturing";
import { Terminal } from "@/components/terminal/Terminal";
// NÃO PRECISA MAIS DESTE IMPORT, O CÓDIGO FOI MOVIDO PARA UM POP-UP
// import { NewProduction } from "@/components/Manufacturing/NewProduction"; 
// NÃO PRECISA MAIS DESTE IMPORT POR ENQUANTO
// import { NewSale } from "@/components/sales/NewSale";

// DADOS MOCKADOS CENTRALIZADOS
const mockProducts = [
  { id: 1, name: "Gesso São Francisco", price: 29.90, cost: 18.00, stock: 150, category: "Gesso" },
  { id: 2, name: "Placas 60x60", price: 30.00, cost: 18.00, stock: 85, category: "Placas" },
  { id: 3, name: "Sisal", price: 30.00, cost: 15.00, stock: 45, category: "Sisal" },
  { id: 4, name: "Arame", price: 10.00, cost: 6.00, stock: 120, category: "Arame" },
  { id: 5, name: "Rebites", price: 0.50, cost: 0.25, stock: 5, category: "Rebites" },
  { id: 6, name: "Molduras", price: 15.00, cost: 8.00, stock: 8, category: "Molduras" },
  { id: 7, name: "Tabicas", price: 25.00, cost: 12.00, stock: 12, category: "Tabicas" },
];

const loadProductsFromLocalStorage = () => {
  try {
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : mockProducts;
  } catch (error) {
    console.error("Failed to load products from localStorage", error);
    return mockProducts;
  }
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState(loadProductsFromLocalStorage);
  
  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error("Failed to save products to localStorage", error);
    }
  }, [products]);
  
  const handleProductAdded = (newProduct) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const productWithId = { ...newProduct, id: newId };
    setProducts((prevProducts) => [...prevProducts, productWithId]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductManagement products={products} onProductAdded={handleProductAdded} />;
      case "sales":
        return <SalesManagement products={products} />;
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
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;