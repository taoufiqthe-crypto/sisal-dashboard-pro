import { render } from "@testing-library/react";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SalesManagement } from "@/components/sales/SalesManagement";
import { Product, Customer } from "@/components/sales/types";

// Mock useSalesData hook
vi.mock("@/hooks/useSalesData", () => ({
  useSalesData: () => ({
    sales: [],
    loading: false,
    error: null,
    createSale: vi.fn().mockResolvedValue({}),
    deleteSale: vi.fn().mockResolvedValue(undefined),
    loadSales: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock useStockManagement hook
vi.mock("@/hooks/useStockManagement", () => ({
  useStockManagement: () => ({
    updateProductStock: vi.fn(),
    validateStock: vi.fn().mockReturnValue(true),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock the child components
vi.mock("@/components/sales/ModernPDV", () => ({
  ModernPDV: ({ onSaleCreated }: { onSaleCreated: (sale: any) => void }) => (
    <div data-testid="modern-pdv">
      <button 
        onClick={() => onSaleCreated({
          id: 1,
          date: "2024-01-01",
          total: 100,
          products: [],
          cart: [{ productId: 1, productName: "Test", quantity: 1, price: 100 }],
          paymentMethod: "pix",
          amountPaid: 100,
          change: 0,
          status: "pago",
          profit: 30,
          customer: { id: 1, name: "Cliente Teste" }
        })}
      >
        Create Sale
      </button>
    </div>
  )
}));

vi.mock("@/components/sales/SalesAnalytics", () => ({
  SalesAnalytics: () => <div data-testid="sales-analytics">Sales Analytics</div>
}));

vi.mock("@/components/sales/SalesHistory", () => ({
  SalesHistory: () => <div data-testid="sales-history">Sales History</div>
}));

vi.mock("@/components/sales/NewSale", () => ({
  NewSale: ({ onSaleCreated, onClose }: { onSaleCreated: (sale: any) => void, onClose: () => void }) => (
    <div data-testid="new-sale">
      <button onClick={() => {
        onSaleCreated({
          id: 2,
          date: "2024-01-01",
          total: 50,
          products: [],
          cart: [{ productId: 2, productName: "Manual", quantity: 1, price: 50 }],
          paymentMethod: "dinheiro",
          amountPaid: 50,
          change: 0,
          status: "pago",
          profit: 15,
          customer: { id: 1, name: "Cliente" }
        });
        onClose();
      }}>
        Create Manual Sale
      </button>
    </div>
  )
}));

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Produto Teste",
    category: "Categoria A",
    price: 10.50,
    cost: 5.25,
    stock: 100,
    barcode: "123456789",
  },
];

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Cliente Teste",
    phone: "(11) 99999-9999",
    email: "cliente@teste.com",
  },
];

const defaultProps = {
  products: mockProducts,
  setProducts: vi.fn(),
  customers: mockCustomers,
  setCustomers: vi.fn(),
  onSaleCreated: vi.fn(),
};

describe("SalesManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render sales management interface", () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    expect(screen.getByText("PDV Moderno")).toBeInTheDocument();
    expect(screen.getByText("Relatórios de Vendas")).toBeInTheDocument();
  });

  it("should default to PDV tab", () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId("modern-pdv")).toBeInTheDocument();
  });

  it("should have all tab triggers", () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    expect(screen.getByRole("tab", { name: /Relatórios de Vendas/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Importar Dados/i })).toBeInTheDocument();
  });

  it("should handle sale creation from PDV", async () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    
    const createSaleButton = screen.getByText("Create Sale");
    fireEvent.click(createSaleButton);
    
    await waitFor(() => {
      expect(defaultProps.onSaleCreated).toHaveBeenCalled();
    });
  });

  it("should render PDV component", () => {
    render(<SalesManagement {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByTestId("modern-pdv")).toBeInTheDocument();
  });
});
