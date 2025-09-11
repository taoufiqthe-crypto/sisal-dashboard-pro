import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface NewProductFormProps {
  onProductAdded: (newProduct: Product) => void;
}

export function NewProductForm({ onProductAdded }: NewProductFormProps) {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: ""
  });
  const { toast } = useToast();

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price && newProduct.stock && newProduct.category) {
      const product = {
        id: Date.now(),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category
      };
      
      onProductAdded(product);
      
      // Limpa o formulário após adicionar
      setNewProduct({ name: "", price: "", stock: "", category: "" });
      
      toast({
        title: "Produto Adicionado",
        description: `O produto "${product.name}" foi cadastrado com sucesso.`,
      });
    } else {
      toast({
        title: "Erro ao Adicionar Produto",
        description: "Por favor, preencha todos os campos do formulário.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Produto</Label>
        <Input
          id="name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          placeholder="Ex: Gesso São Francisco"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Input
          id="category"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          placeholder="Ex: Gesso"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            placeholder="29.90"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Estoque</Label>
          <Input
            id="stock"
            type="number"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            placeholder="100"
          />
        </div>
      </div>
      <Button onClick={handleAddProduct} className="flex items-center space-x-2">
        <PlusCircle className="w-4 h-4" />
        <span>Adicionar Produto</span>
      </Button>
    </div>
  );
}