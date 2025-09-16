import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const BackupRestore = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportAllData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Buscar todos os dados do usuário
      const [products, customers, sales, suppliers, accounts, cashFlow] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id),
        supabase.from('customers').select('*').eq('user_id', user.id),
        supabase.from('sales').select(`
          *,
          sale_items (
            *,
            products (name, price)
          ),
          customers (name, email)
        `).eq('user_id', user.id),
        supabase.from('suppliers').select('*').eq('user_id', user.id),
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('cash_flow').select('*').eq('user_id', user.id)
      ]);

      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        user_id: user.id,
        data: {
          products: products.data || [],
          customers: customers.data || [],
          sales: sales.data || [],
          suppliers: suppliers.data || [],
          accounts: accounts.data || [],
          cash_flow: cashFlow.data || []
        }
      };

      // Criar arquivo para download
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-pdv-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup realizado com sucesso!",
        description: "Seus dados foram exportados.",
      });
    } catch (error) {
      console.error('Erro no backup:', error);
      toast({
        title: "Erro no backup",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (file: File) => {
    if (!user) return;
    
    setIsImporting(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      if (!backupData.data) {
        throw new Error('Formato de arquivo inválido');
      }

      // Restaurar dados (exemplo básico - você pode melhorar isso)
      const { data } = backupData;
      
      // Importar produtos
      if (data.products?.length > 0) {
        await supabase.from('products').upsert(
          data.products.map((p: any) => ({ ...p, user_id: user.id }))
        );
      }

      // Importar clientes
      if (data.customers?.length > 0) {
        await supabase.from('customers').upsert(
          data.customers.map((c: any) => ({ ...c, user_id: user.id }))
        );
      }

      // Importar fornecedores
      if (data.suppliers?.length > 0) {
        await supabase.from('suppliers').upsert(
          data.suppliers.map((s: any) => ({ ...s, user_id: user.id }))
        );
      }

      toast({
        title: "Restauração concluída!",
        description: "Seus dados foram importados com sucesso.",
      });
    } catch (error) {
      console.error('Erro na restauração:', error);
      toast({
        title: "Erro na restauração",
        description: "Ocorreu um erro ao importar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Backup e Restauração</h2>
        <p className="text-muted-foreground">
          Faça backup dos seus dados ou restaure de um arquivo existente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Dados
            </CardTitle>
            <CardDescription>
              Fazer backup de todos os dados do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportAllData} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Database className="mr-2 h-4 w-4 animate-pulse" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Fazer Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Dados
            </CardTitle>
            <CardDescription>
              Restaurar dados de um arquivo de backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Restaurar Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Atenção - Restaurar Dados
                  </DialogTitle>
                  <DialogDescription>
                    Esta ação irá sobrescrever os dados existentes. Recomendamos fazer um backup antes de continuar.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    disabled={isImporting}
                    className="w-full p-2 border rounded"
                  />
                  {isImporting && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Database className="h-4 w-4 animate-pulse" />
                      Importando dados...
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Informações do Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• O backup inclui: produtos, clientes, vendas, fornecedores, contas e fluxo de caixa</p>
            <p>• Os arquivos são salvos em formato JSON</p>
            <p>• Recomendamos fazer backup regularmente</p>
            <p>• A restauração sobrescreve os dados existentes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};