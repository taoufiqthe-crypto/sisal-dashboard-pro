export interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  description?: string;
  barcode?: string;
  image?: string;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Sale {
  id: number;
  date: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  cart?: SaleItem[]; // Adicionado para facilitar atualização do estoque
  total: number;
  profit: number;
  paymentMethod: "dinheiro" | "pix" | "credito" | "debito";
  amountPaid: number;
  change: number;
  status: "pago" | "pendente";
  customer: Customer;
}

export interface Budget {
  id: number;
  date: string;
  budgetNumber: string;
  deliveryDate?: string;
  products: Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  customer: {
    name: string;
    document: string;
    address?: string;
    city?: string;
    phone?: string;
  };
  company: {
    name: string;
    document: string;
    address: string;
    phone: string;
    email: string;
  };
  paymentMethod?: string;
  observations?: string;
  status: 'orcamento' | 'aprovado' | 'rejeitado' | 'vendido';
  validUntil: string;
}

export interface PaymentMethod {
  type: "dinheiro" | "pix" | "credito" | "debito";
  label: string;
  icon: string;
}

export const paymentMethods: PaymentMethod[] = [
  { type: "dinheiro", label: "Dinheiro", icon: "💰" },
  { type: "pix", label: "PIX", icon: "📱" },
  { type: "credito", label: "Cartão de Crédito", icon: "💳" },
  { type: "debito", label: "Cartão de Débito", icon: "💳" },
];

// Mock de clientes
export const mockCustomers: Customer[] = [
  { id: 1, name: "João Silva", phone: "11999999999", email: "joao@email.com" },
  { id: 2, name: "Maria Santos", phone: "11988888888", email: "maria@email.com" },
  { id: 3, name: "Pedro Almeida", phone: "11977777777" },
];

// Mock de produtos
export const mockProducts: Product[] = [
  { id: 1, name: "Gesso São Francisco", price: 29.9, cost: 18.0, stock: 150, category: "Gesso" },
  { id: 2, name: "Placas 60x60", price: 30.0, cost: 18.0, stock: 85, category: "Placas" },
  { id: 3, name: "Sisal", price: 30.0, cost: 15.0, stock: 45, category: "Sisal" },
  { id: 4, name: "Arame", price: 10.0, cost: 6.0, stock: 120, category: "Arame" },
  { id: 5, name: "Rebites", price: 0.5, cost: 0.25, stock: 5, category: "Rebites" },
  { id: 6, name: "Molduras", price: 15.0, cost: 8.0, stock: 8, category: "Molduras" },
  { id: 7, name: "Tabicas", price: 25.0, cost: 12.0, stock: 12, category: "Tabicas" },
];

// Mock de vendas
export const mockSales: Sale[] = [
  {
    id: 1,
    date: "2024-01-10",
    products: [
      { name: "Gesso São Francisco", quantity: 5, price: 29.9 },
      { name: "Placas 60x60", quantity: 2, price: 30.0 },
    ],
    total: 209.5,
    profit: 89.5,
    paymentMethod: "pix",
    amountPaid: 209.5,
    change: 0,
    status: "pago",
    customer: mockCustomers[0],
  },
  {
    id: 2,
    date: "2024-01-10",
    products: [{ name: "Sisal", quantity: 3, price: 30.0 }],
    total: 90.0,
    profit: 45.0,
    paymentMethod: "dinheiro",
    amountPaid: 100.0,
    change: 10.0,
    status: "pago",
    customer: mockCustomers[1],
  },
];
