// src/components/sales/ReceiptPrinter.tsx
import React from 'react';
import { Sale } from './types';

interface ReceiptPrinterProps {
  sale: Sale;
  onPrint?: () => void;
}

const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({ sale, onPrint }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getReceiptHTML());
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
    if (onPrint) onPrint();
  };

  const getReceiptHTML = () => {
    const currentDate = new Date().toLocaleString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo de Venda</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .company-info {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .section {
            margin-bottom: 15px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .item-name {
            flex: 1;
            margin-right: 10px;
          }
          .item-qty {
            width: 30px;
            text-align: center;
          }
          .item-price {
            width: 60px;
            text-align: right;
          }
          .total-line {
            border-top: 1px solid #000;
            padding-top: 5px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 15px;
            font-size: 10px;
          }
          .dashed-line {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">GESSO PRIMUS</div>
          <div class="company-info">CNPJ: 12.345.678/0001-90</div>
          <div class="company-info">Materiais de Construção e Gesso</div>
          <div class="company-info">Tel: (11) 9999-9999</div>
        </div>

        <div class="section">
          <div><strong>CUPOM FISCAL</strong></div>
          <div>Data: ${currentDate}</div>
          <div>Venda #${sale.id}</div>
          ${sale.customer?.name ? `<div>Cliente: ${sale.customer.name}</div>` : ''}
        </div>

        <div class="dashed-line"></div>

        <div class="section">
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px;">
            <span>ITEM</span>
            <span>QTD</span>
            <span>VALOR</span>
          </div>
          ${sale.products.map(product => `
            <div class="item-row">
              <div class="item-name">${product.name}</div>
              <div class="item-qty">${product.quantity}</div>
              <div class="item-price">R$ ${(product.price * product.quantity).toFixed(2)}</div>
            </div>
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">
              R$ ${product.price.toFixed(2)} x ${product.quantity}
            </div>
          `).join('')}
        </div>

        <div class="dashed-line"></div>

        <div class="section">
          <div class="item-row">
            <span>SUBTOTAL:</span>
            <span>R$ ${sale.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}</span>
          </div>
          ${sale.total < sale.products.reduce((sum, p) => sum + (p.price * p.quantity), 0) ? `
            <div class="item-row" style="color: #666;">
              <span>DESCONTO:</span>
              <span>-R$ ${(sale.products.reduce((sum, p) => sum + (p.price * p.quantity), 0) - sale.total).toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="item-row total-line">
            <span>TOTAL:</span>
            <span>R$ ${sale.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="section">
          <div class="item-row">
            <span>PAGAMENTO:</span>
            <span>${sale.paymentMethod.toUpperCase()}</span>
          </div>
          <div class="item-row">
            <span>VALOR PAGO:</span>
            <span>R$ ${sale.amountPaid.toFixed(2)}</span>
          </div>
          ${sale.change > 0 ? `
            <div class="item-row">
              <span>TROCO:</span>
              <span>R$ ${sale.change.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div>Volte sempre!</div>
          <div style="margin-top: 10px;">
            *** DOCUMENTO NÃO FISCAL ***
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center transition-colors"
      >
        🖨️ Imprimir Recibo
      </button>
      
      {/* Preview do recibo */}
      <div className="mt-4 p-4 border rounded-lg bg-gray-50 text-xs font-mono max-w-sm mx-auto">
        <div className="text-center border-b-2 border-black pb-2 mb-3">
          <div className="text-lg font-bold">GESSO PRIMUS</div>
          <div className="text-xs">CNPJ: 12.345.678/0001-90</div>
          <div className="text-xs">Materiais de Construção e Gesso</div>
          <div className="text-xs">Tel: (11) 9999-9999</div>
        </div>

        <div className="mb-3">
          <div><strong>CUPOM FISCAL</strong></div>
          <div>Data: {new Date().toLocaleString('pt-BR')}</div>
          <div>Venda #{sale.id}</div>
          {sale.customer?.name && <div>Cliente: {sale.customer.name}</div>}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        <div className="mb-3">
          <div className="flex justify-between font-bold mb-1">
            <span>ITEM</span>
            <span>QTD</span>
            <span>VALOR</span>
          </div>
          {sale.products.map((product, index) => (
            <div key={index}>
              <div className="flex justify-between">
                <div className="flex-1 mr-2">{product.name}</div>
                <div className="w-8 text-center">{product.quantity}</div>
                <div className="w-16 text-right">R$ {(product.price * product.quantity).toFixed(2)}</div>
              </div>
              <div className="text-xs text-gray-600 mb-1">
                R$ {product.price.toFixed(2)} x {product.quantity}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        <div className="mb-3">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>R$ {sale.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}</span>
          </div>
          {sale.total < sale.products.reduce((sum, p) => sum + (p.price * p.quantity), 0) && (
            <div className="flex justify-between text-gray-600">
              <span>DESCONTO:</span>
              <span>-R$ {(sale.products.reduce((sum, p) => sum + (p.price * p.quantity), 0) - sale.total).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-black pt-1 font-bold">
            <span>TOTAL:</span>
            <span>R$ {sale.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between">
            <span>PAGAMENTO:</span>
            <span>{sale.paymentMethod.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>VALOR PAGO:</span>
            <span>R$ {sale.amountPaid.toFixed(2)}</span>
          </div>
          {sale.change > 0 && (
            <div className="flex justify-between">
              <span>TROCO:</span>
              <span>R$ {sale.change.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="text-center border-t-2 border-black pt-2 text-xs">
          <div>Obrigado pela preferência!</div>
          <div>Volte sempre!</div>
          <div className="mt-2">
            *** DOCUMENTO NÃO FISCAL ***
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrinter;

