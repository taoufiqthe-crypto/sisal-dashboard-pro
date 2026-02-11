import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Printer, Download, Eye, Plus, Trash2, Hash } from 'lucide-react';
import { toast } from 'sonner';
import logoGessoPrimus from '@/assets/gesso-primus-logo.png';

interface InvoiceItem {
  id: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  number: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerCpfCnpj: string;
  customerAddress: string;
  customerCity: string;
  customerPhone: string;
  customerEmail: string;
  items: InvoiceItem[];
  paymentMethod: string;
  notes: string;
  subtotal: number;
  discount: number;
  total: number;
}

interface InvoiceGeneratorProps {
  saleData?: any;
  onClose?: () => void;
}

export function InvoiceGenerator({ saleData, onClose }: InvoiceGeneratorProps) {
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    const items: InvoiceItem[] = saleData?.products?.map((p: any, i: number) => ({
      id: i + 1,
      description: p.name || p.productName || '',
      unit: 'UN',
      quantity: p.quantity || 1,
      unitPrice: p.price || 0,
      total: (p.price || 0) * (p.quantity || 1),
    })) || [];

    return {
      number: `NF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      date: now.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      customerName: saleData?.customer?.name || '',
      customerCpfCnpj: '',
      customerAddress: saleData?.customer?.address || '',
      customerCity: '',
      customerPhone: saleData?.customer?.phone || '',
      customerEmail: saleData?.customer?.email || '',
      items,
      paymentMethod: saleData?.paymentMethod || 'pix',
      notes: '',
      subtotal: items.reduce((sum, item) => sum + item.total, 0),
      discount: saleData?.discount || 0,
      total: saleData?.total || items.reduce((sum, item) => sum + item.total, 0),
    };
  });

  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: invoice.items.length + 1,
      description: '',
      unit: 'UN',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    const newItems = [...invoice.items, newItem];
    setInvoice({ ...invoice, items: newItems });
  };

  const removeItem = (id: number) => {
    const newItems = invoice.items.filter(item => item.id !== id);
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    setInvoice({ ...invoice, items: newItems, subtotal, total: subtotal - invoice.discount });
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    const newItems = invoice.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    });
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    setInvoice({ ...invoice, items: newItems, subtotal, total: subtotal - invoice.discount });
  };

  const getInvoiceHTML = () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Nota Fiscal ${invoice.number}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff;padding:20px}
.header{border:2px solid #000;padding:15px;display:flex;justify-content:space-between;align-items:flex-start}
.company-info{flex:1;padding-right:20px}
.company-name{font-size:18px;font-weight:bold;margin-bottom:8px;color:#2d5a27}
.company-details{font-size:10px;line-height:1.4;color:#333}
.logo-container{flex-shrink:0;border:1px solid #000;padding:5px;background:#fff}
.logo-container img{width:80px;height:60px;object-fit:contain}
.nf-header{background:#2d5a27;color:#fff;border:2px solid #000;border-top:none;padding:10px;text-align:center}
.nf-title{font-weight:bold;font-size:16px;margin-bottom:3px}
.nf-subtitle{font-size:11px}
.section{border:1px solid #000;padding:8px;margin-top:-1px;font-size:10px}
.section-title{font-weight:bold;margin-bottom:5px;font-size:11px;background:#f0f0f0;padding:3px 5px;margin:-8px -8px 8px;border-bottom:1px solid #000}
.row{display:flex;margin-bottom:3px}
.label{font-weight:bold;min-width:100px}
table{width:100%;border-collapse:collapse;font-size:10px}
th,td{border:1px solid #000;padding:4px;text-align:left}
th{background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px}
.total-row{font-weight:bold;background:#e8f5e9}
.payment-section{border:1px solid #000;padding:10px;margin-top:10px;font-size:10px}
.footer{margin-top:20px;text-align:center;font-size:9px;color:#666;border-top:1px solid #ccc;padding-top:10px}
.signatures{display:flex;justify-content:space-around;margin-top:40px}
.sig-line{text-align:center;font-size:10px}
.sig-line hr{border:none;border-top:1px solid #000;width:200px;margin-bottom:5px}
.badge{display:inline-block;background:#2d5a27;color:#fff;padding:2px 8px;border-radius:3px;font-size:9px;font-weight:bold}
@media print{body{padding:10px}}
</style></head><body>
<div class="header">
  <div class="company-info">
    <div class="company-name">GESSO PRIMUS</div>
    <div class="company-details">
      <strong>CNPJ:</strong> 45.174.762/0001-42<br>
      <strong>Razão Social:</strong> GESSO PRIMUS LTDA<br>
      <strong>IE:</strong> ISENTO<br>
      <strong>Endereço:</strong> Valparaíso de Goiás - GO<br>
      <strong>Telefone:</strong> (62) 98335-0384<br>
      <strong>Email:</strong> contato@gessoprimus.com.br
    </div>
  </div>
  <div class="logo-container">
    <img src="${logoGessoPrimus}" alt="Logo">
  </div>
</div>
<div class="nf-header">
  <div class="nf-title">NOTA FISCAL DE SERVIÇO / VENDA</div>
  <div class="nf-subtitle">Nº ${invoice.number} | Emissão: ${new Date(invoice.date).toLocaleDateString('pt-BR')} | Vencimento: ${new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</div>
</div>
<div class="section">
  <div class="section-title">DADOS DO CLIENTE / TOMADOR</div>
  <div class="row"><span class="label">Nome/Razão:</span><span>${invoice.customerName || '---'}</span></div>
  <div class="row"><span class="label">CPF/CNPJ:</span><span>${invoice.customerCpfCnpj || '---'}</span></div>
  <div class="row"><span class="label">Endereço:</span><span>${invoice.customerAddress || '---'}</span></div>
  <div class="row"><span class="label">Cidade:</span><span>${invoice.customerCity || '---'}</span></div>
  <div class="row"><span class="label">Telefone:</span><span>${invoice.customerPhone || '---'}</span></div>
  <div class="row"><span class="label">Email:</span><span>${invoice.customerEmail || '---'}</span></div>
</div>
<div class="section" style="padding:0">
  <div class="section-title" style="margin:0;padding:5px 8px;border-bottom:1px solid #000">ITENS DA NOTA FISCAL</div>
  <table>
    <thead><tr>
      <th style="width:8%">ITEM</th>
      <th style="width:35%">DESCRIÇÃO</th>
      <th style="width:8%">UND</th>
      <th style="width:10%">QTD</th>
      <th style="width:15%">VL. UNIT.</th>
      <th style="width:15%">SUBTOTAL</th>
    </tr></thead>
    <tbody>
      ${invoice.items.map((item, i) => `<tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${item.description}</td>
        <td style="text-align:center">${item.unit}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">R$ ${item.unitPrice.toFixed(2)}</td>
        <td style="text-align:right">R$ ${item.total.toFixed(2)}</td>
      </tr>`).join('')}
      <tr class="total-row">
        <td colspan="5" style="text-align:right">SUBTOTAL:</td>
        <td style="text-align:right">R$ ${invoice.subtotal.toFixed(2)}</td>
      </tr>
      ${invoice.discount > 0 ? `<tr>
        <td colspan="5" style="text-align:right">DESCONTO:</td>
        <td style="text-align:right;color:red">- R$ ${invoice.discount.toFixed(2)}</td>
      </tr>` : ''}
      <tr class="total-row" style="font-size:12px">
        <td colspan="5" style="text-align:right"><strong>TOTAL:</strong></td>
        <td style="text-align:right"><strong>R$ ${invoice.total.toFixed(2)}</strong></td>
      </tr>
    </tbody>
  </table>
</div>
<div class="payment-section">
  <div style="font-weight:bold;margin-bottom:5px">DADOS DO PAGAMENTO</div>
  <div class="row"><span class="label">Forma:</span><span>${invoice.paymentMethod.toUpperCase()}</span></div>
  <div class="row"><span class="label">Valor Total:</span><span>R$ ${invoice.total.toFixed(2)}</span></div>
  ${invoice.notes ? `<div class="row"><span class="label">Observações:</span><span>${invoice.notes}</span></div>` : ''}
</div>
<div class="signatures">
  <div class="sig-line"><hr/>Emitente</div>
  <div class="sig-line"><hr/>Cliente / Tomador</div>
</div>
<div class="footer">
  <p>GESSO PRIMUS LTDA - CNPJ: 45.174.762/0001-42</p>
  <p>Documento gerado eletronicamente pelo Sistema PDV Gesso Primus</p>
  <p>Este documento não substitui a Nota Fiscal Eletrônica (NF-e)</p>
</div>
</body></html>`;
  };

  const handlePrint = () => {
    if (invoice.items.length === 0) {
      toast.error('Adicione pelo menos um item à nota fiscal');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getInvoiceHTML());
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
    toast.success('Nota fiscal gerada com sucesso!');
  };

  const handleDownload = () => {
    if (invoice.items.length === 0) {
      toast.error('Adicione pelo menos um item à nota fiscal');
      return;
    }
    const blob = new Blob([getInvoiceHTML()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota-fiscal-${invoice.number}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Nota fiscal baixada!');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Gerador de Nota Fiscal
            <Badge variant="secondary" className="ml-auto">
              <Hash className="w-3 h-3 mr-1" />
              {invoice.number}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dados da NF */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Nº da Nota</Label>
              <Input value={invoice.number} onChange={e => setInvoice({ ...invoice, number: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Data Emissão</Label>
              <Input type="date" value={invoice.date} onChange={e => setInvoice({ ...invoice, date: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Data Vencimento</Label>
              <Input type="date" value={invoice.dueDate} onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })} className="h-8 text-sm" />
            </div>
          </div>

          <Separator />

          {/* Dados do Cliente */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome / Razão Social</Label>
                <Input value={invoice.customerName} onChange={e => setInvoice({ ...invoice, customerName: e.target.value })} className="h-8 text-sm" placeholder="Nome do cliente" />
              </div>
              <div>
                <Label className="text-xs">CPF / CNPJ</Label>
                <Input value={invoice.customerCpfCnpj} onChange={e => setInvoice({ ...invoice, customerCpfCnpj: e.target.value })} className="h-8 text-sm" placeholder="000.000.000-00" />
              </div>
              <div>
                <Label className="text-xs">Endereço</Label>
                <Input value={invoice.customerAddress} onChange={e => setInvoice({ ...invoice, customerAddress: e.target.value })} className="h-8 text-sm" placeholder="Endereço completo" />
              </div>
              <div>
                <Label className="text-xs">Cidade</Label>
                <Input value={invoice.customerCity} onChange={e => setInvoice({ ...invoice, customerCity: e.target.value })} className="h-8 text-sm" placeholder="Cidade - UF" />
              </div>
              <div>
                <Label className="text-xs">Telefone</Label>
                <Input value={invoice.customerPhone} onChange={e => setInvoice({ ...invoice, customerPhone: e.target.value })} className="h-8 text-sm" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={invoice.customerEmail} onChange={e => setInvoice({ ...invoice, customerEmail: e.target.value })} className="h-8 text-sm" placeholder="email@exemplo.com" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Itens da Nota Fiscal</h3>
              <Button size="sm" variant="outline" onClick={addItem} className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Adicionar Item
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {invoice.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded">
                  <span className="col-span-1 text-xs text-center font-medium">{index + 1}</span>
                  <Input className="col-span-4 h-7 text-xs" placeholder="Descrição" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                  <Input className="col-span-1 h-7 text-xs text-center" value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} />
                  <Input className="col-span-2 h-7 text-xs text-center" type="number" min={1} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                  <Input className="col-span-2 h-7 text-xs" type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                  <span className="col-span-1 text-xs text-right font-medium">R$ {item.total.toFixed(2)}</span>
                  <Button size="sm" variant="ghost" className="col-span-1 h-7 w-7 p-0" onClick={() => removeItem(item.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))}
              {invoice.items.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum item adicionado. Clique em "Adicionar Item".</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Pagamento e Totais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Forma de Pagamento</Label>
                <Select value={invoice.paymentMethod} onValueChange={v => setInvoice({ ...invoice, paymentMethod: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="debito">Cartão de Débito</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Observações</Label>
                <Textarea value={invoice.notes} onChange={e => setInvoice({ ...invoice, notes: e.target.value })} className="text-sm h-16" placeholder="Observações adicionais..." />
              </div>
            </div>
            <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>R$ {invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Desconto:</span>
                <Input type="number" step="0.01" value={invoice.discount} onChange={e => {
                  const d = Number(e.target.value);
                  setInvoice({ ...invoice, discount: d, total: invoice.subtotal - d });
                }} className="w-24 h-7 text-xs text-right" />
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>TOTAL:</span>
                <span>R$ {invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => setShowPreview(true)} variant="outline" className="flex-1">
              <Eye className="w-4 h-4 mr-2" /> Visualizar
            </Button>
            <Button onClick={handlePrint} className="flex-1 bg-primary hover:bg-primary/90">
              <Printer className="w-4 h-4 mr-2" /> Imprimir
            </Button>
            <Button onClick={handleDownload} variant="secondary" className="flex-1">
              <Download className="w-4 h-4 mr-2" /> Baixar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização da Nota Fiscal</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-4 bg-white text-black text-xs" dangerouslySetInnerHTML={{ __html: getInvoiceHTML().replace(/<html>.*<body>/s, '').replace(/<\/body>.*<\/html>/s, '') }} />
          <div className="flex gap-2 mt-4">
            <Button onClick={handlePrint} className="flex-1 bg-primary hover:bg-primary/90">
              <Printer className="w-4 h-4 mr-2" /> Imprimir
            </Button>
            <Button onClick={handleDownload} variant="secondary" className="flex-1">
              <Download className="w-4 h-4 mr-2" /> Baixar HTML
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
