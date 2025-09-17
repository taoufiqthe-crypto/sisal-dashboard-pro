import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
  Button,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar
} from '@mui/material';
import { Add, Delete, Print, Save, Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Budget, Product } from '../types/budgetTypes';
import { formatCurrency } from '../utils/currency';
import { saveBudget, loadBudget, generateBudgetNumber } from '../services/budgetService';
import PrintBudget from './PrintBudget';

const BudgetModel: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [budget, setBudget] = useState<Budget>({
    number: '1426',
    date: new Date(),
    company: {
      name: 'GESSO ART DESIGNER',
      address: 'Rua Exemplo, 123 - Bairro',
      city: 'São Paulo - SP',
      phone: '(11) 1234-5678',
      email: 'contato@gessoart.com.br'
    },
    client: {
      name: 'Dleidson Denier',
      address: '',
      phone: '',
      email: ''
    },
    products: [
      { id: 1, description: 'Pacote Cimentico 55mm', quantity: 1, unitPrice: 850.00, subtotal: 850.00 },
      { id: 2, description: 'Manta de Impermeabilização', quantity: 2, unitPrice: 120.00, subtotal: 240.00 },
      { id: 3, description: 'Argamassa Colante', quantity: 4, unitPrice: 35.00, subtotal: 140.00 },
      { id: 4, description: 'Rejunte Epóxi', quantity: 1, unitPrice: 107.00, subtotal: 107.00 }
    ],
    payment: {
      condition: '50% na entrada, 50% na entrega',
      dueDate: '30/11/2023'
    },
    notes: 'Orçamento válido por 15 dias. Valores sujeitos a alteração sem aviso prévio.'
  });

  const [isPrinting, setIsPrinting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const savedBudget = loadBudget();
    if (savedBudget) {
      setBudget({
        ...savedBudget,
        date: new Date(savedBudget.date)
      });
    }
  }, []);

  const showNotification = (message: string, severity: 'success' | 'error' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: budget.products.length + 1,
      description: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0
    };
    setBudget({
      ...budget,
      products: [...budget.products, newProduct]
    });
  };

  const removeProduct = (id: number) => {
    if (budget.products.length <= 1) {
      showNotification('É necessário manter pelo menos um item no orçamento', 'error');
      return;
    }
    setBudget({
      ...budget,
      products: budget.products.filter(product => product.id !== id)
    });
  };

  const updateProduct = (id: number, field: keyof Product, value: string | number) => {
    const updatedProducts = budget.products.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, [field]: value };
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedProduct.subtotal = Number(updatedProduct.quantity) * Number(updatedProduct.unitPrice);
        }
        
        return updatedProduct;
      }
      return product;
    });
    
    setBudget({ ...budget, products: updatedProducts });
  };

  const calculateTotal = () => {
    return budget.products.reduce((total, product) => total + product.subtotal, 0);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleSave = () => {
    try {
      saveBudget(budget);
      showNotification('Orçamento salvo com sucesso!');
    } catch (error) {
      showNotification('Erro ao salvar orçamento', 'error');
    }
  };

  const handleNewBudget = () => {
    setBudget({
      ...budget,
      number: generateBudgetNumber(),
      date: new Date(),
      client: {
        name: '',
        address: '',
        phone: '',
        email: ''
      },
      products: [
        { id: 1, description: '', quantity: 1, unitPrice: 0, subtotal: 0 }
      ],
      payment: {
        condition: '',
        dueDate: ''
      },
      notes: ''
    });
    showNotification('Novo orçamento criado!');
  };

  if (isPrinting) {
    return <PrintBudget budget={budget} />;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: isMobile ? 1 : 2 }}>
      {/* Cabeçalho do Orçamento */}
      <Paper sx={{ p: 3, mb: 2, border: '1px solid #ddd', bgcolor: '#fafafa' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: isMobile ? '1.5rem' : '2rem', color: '#333' }}>
            ORÇAMENTO Nº {budget.number}
          </Typography>
          <Typography variant="h6" sx={{ fontSize: isMobile ? '0.9rem' : '1.25rem', color: '#555' }}>
            {format(budget.date, "dd/MM/yyyy", { locale: ptBR })}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2, borderColor: '#ccc' }} />
        
        {/* Dados da Empresa */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem', color: '#1976d2' }}>
            {budget.company.name}
          </Typography>
          <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#555' }}>
            {budget.company.address}
          </Typography>
          <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#555' }}>
            {budget.company.city}
          </Typography>
          <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#555' }}>
            Tel: {budget.company.phone} | E-mail: {budget.company.email}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2, borderColor: '#ccc' }} />
        
        {/* Dados do Cliente */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#333' }}>
            Cliente
          </Typography>
          <TextField
            fullWidth
            label="Nome"
            value={budget.client.name}
            onChange={(e) => setBudget({
              ...budget,
              client: { ...budget.client, name: e.target.value }
            })}
            margin="normal"
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ bgcolor: '#fff' }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Endereço"
                value={budget.client.address}
                onChange={(e) => setBudget({
                  ...budget,
                  client: { ...budget.client, address: e.target.value }
                })}
                margin="normal"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                sx={{ bgcolor: '#fff' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={budget.client.phone}
                onChange={(e) => setBudget({
                  ...budget,
                  client: { ...budget.client, phone: e.target.value }
                })}
                margin="normal"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                sx={{ bgcolor: '#fff' }}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Tabela de Produtos */}
      <Paper sx={{ p: 3, mb: 2, border: '1px solid #ddd', bgcolor: '#fafafa' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#333' }}>
            Produtos e Serviços
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={addProduct}
            size={isMobile ? "small" : "medium"}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          >
            Adicionar Item
          </Button>
        </Box>
        
        <TableContainer>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                <TableCell><strong>Descrição</strong></TableCell>
                <TableCell align="right"><strong>Qtd</strong></TableCell>
                <TableCell align="right"><strong>Unitário</strong></TableCell>
                <TableCell align="right"><strong>Subtotal</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budget.products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <TextField
                      fullWidth
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                      variant="standard"
                      size={isMobile ? "small" : "medium"}
                      placeholder="Descrição do produto/serviço"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={product.quantity}
                      onChange={(e) => updateProduct(product.id, 'quantity', Number(e.target.value))}
                      variant="standard"
                      inputProps={{ min: 1 }}
                      size={isMobile ? "small" : "medium"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={product.unitPrice}
                      onChange={(e) => updateProduct(product.id, 'unitPrice', Number(e.target.value))}
                      variant="standard"
                      inputProps={{ min: 0, step: 0.01 }}
                      size={isMobile ? "small" : "medium"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 'bold' }}>
                      {formatCurrency(product.subtotal)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="error" 
                      onClick={() => removeProduct(product.id)}
                      disabled={budget.products.length <= 1}
                      size={isMobile ? "small" : "medium"}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Typography variant="h5" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem', color: '#1976d2' }}>
            <strong>Total: {formatCurrency(calculateTotal())}</strong>
          </Typography>
        </Box>
      </Paper>
      
      {/* Informações de Pagamento */}
      <Paper sx={{ p: 3, mb: 2, border: '1px solid #ddd', bgcolor: '#fafafa' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#333' }}>
          Condições de Pagamento
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Condição"
              value={budget.payment.condition}
              onChange={(e) => setBudget({
                ...budget,
                payment: { ...budget.payment, condition: e.target.value }
              })}
              margin="normal"
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{ bgcolor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data de Vencimento"
              value={budget.payment.dueDate}
              onChange={(e) => setBudget({
                ...budget,
                payment: { ...budget.payment, dueDate: e.target.value }
              })}
              margin="normal"
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{ bgcolor: '#fff' }}
            />
          </Grid>
        </Grid>
        
        <Box mt={2}>
          <TextField
            fullWidth
            label="Observações"
            multiline
            rows={3}
            value={budget.notes}
            onChange={(e) => setBudget({ ...budget, notes: e.target.value })}
            margin="normal"
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ bgcolor: '#fff' }}
          />
        </Box>
      </Paper>
      
      {/* Ações */}
      <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap">
        <Button 
          variant="outlined" 
          color="primary"
          onClick={handleNewBudget}
          startIcon={<Refresh />}
          size={isMobile ? "small" : "medium"}
          sx={{ borderColor: '#1976d2', color: '#1976d2' }}
        >
          Novo Orçamento
        </Button>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
            size={isMobile ? "small" : "medium"}
            sx={{ borderColor: '#1976d2', color: '#1976d2' }}
          >
            Salvar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Print />}
            onClick={handlePrint}
            size={isMobile ? "small" : "medium"}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          >
            Imprimir Orçamento
          </Button>
        </Box>
      </Box>

      {/* Notificação */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity as 'success' | 'error'}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetModel;