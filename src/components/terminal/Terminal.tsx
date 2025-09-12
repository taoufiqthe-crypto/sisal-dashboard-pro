import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal as TerminalIcon, Send } from "lucide-react";

interface TerminalEntry {
  id: number;
  command: string;
  output: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
}

export function Terminal() {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<TerminalEntry[]>([
    {
      id: 1,
      command: "help",
      output: "Comandos disponíveis:\n- help: Mostra esta ajuda\n- status: Status do sistema\n- vendas: Resumo de vendas\n- produtos: Lista produtos em estoque baixo\n- clear: Limpa o terminal",
      timestamp: new Date(),
      type: 'info'
    }
  ]);

  const executeCommand = (cmd: string) => {
    const newEntry: TerminalEntry = {
      id: Date.now(),
      command: cmd,
      output: "",
      timestamp: new Date(),
      type: 'success'
    };

    switch (cmd.toLowerCase().trim()) {
      case 'help':
        newEntry.output = "Comandos disponíveis:\n- help: Mostra esta ajuda\n- status: Status do sistema\n- vendas: Resumo de vendas\n- produtos: Lista produtos em estoque baixo\n- clear: Limpa o terminal";
        newEntry.type = 'info';
        break;
      case 'status':
        newEntry.output = "✅ Sistema online\n✅ Banco de dados conectado\n✅ Última sincronização: " + new Date().toLocaleString();
        newEntry.type = 'success';
        break;
      case 'vendas':
        newEntry.output = "📊 Resumo de Vendas (Hoje):\n- Total: R$ 1.250,00\n- Transações: 15\n- Ticket médio: R$ 83,33";
        newEntry.type = 'info';
        break;
      case 'produtos':
        newEntry.output = "⚠️ Produtos com estoque baixo:\n- Rebites: 5 unidades\n- Molduras: 8 unidades\n- Tabicas: 12 unidades";
        newEntry.type = 'error';
        break;
      case 'clear':
        setHistory([]);
        return;
      default:
        newEntry.output = `Comando não reconhecido: ${cmd}\nDigite 'help' para ver os comandos disponíveis.`;
        newEntry.type = 'error';
    }

    setHistory(prev => [...prev, newEntry]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      executeCommand(command);
      setCommand("");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'success':
        return 'text-green-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TerminalIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Terminal do Sistema</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Terminal de Comandos</CardTitle>
          <CardDescription>
            Execute comandos para obter informações rápidas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[400px] w-full border rounded-md p-4 bg-black text-green-400 font-mono text-sm">
            <div className="space-y-2">
              {history.map((entry) => (
                <div key={entry.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">$</span>
                    <span className="text-white">{entry.command}</span>
                    <span className="text-gray-500 text-xs">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className={`whitespace-pre-wrap ${getTypeColor(entry.type)} ml-4`}>
                    {entry.output}
                  </pre>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Digite um comando..."
              className="flex-1 font-mono"
              autoFocus
            />
            <Button type="submit" disabled={!command.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="text-sm text-muted-foreground">
            Digite <code className="bg-muted px-1 rounded">help</code> para ver os comandos disponíveis
          </div>
        </CardContent>
      </Card>
    </div>
  );
}