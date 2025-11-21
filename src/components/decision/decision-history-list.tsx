'use client';

import { useDecisionHistory } from '@/hooks/use-decision-history';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import type { Decision } from '@/lib/types';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

function DecisionCard({ decision, onDelete }: { decision: Decision; onDelete: (id: string) => void; }) {
  const renderDecisionDetails = () => {
    switch (decision.type) {
      case 'Yes/No':
        return <p>Sua escolha: <span className="font-semibold">{decision.decision}</span></p>;
      case 'Multiple Choice':
        return <p>Sua escolha: <span className="font-semibold">{decision.decision}</span></p>;
      case 'Financial Spending':
        return <p>Sua escolha: <span className="font-semibold">{decision.decision}</span></p>;
      case 'Financial Analysis':
        return (
          <div className='text-sm text-muted-foreground'>
            <p>Custo Fixo: R$ {decision.fixedCost.toLocaleString('pt-BR')}</p>
            <p>Custo Variável: R$ {decision.variableCost.toLocaleString('pt-BR')}</p>
          </div>
        );
      case 'Weighted Analysis':
        const finalScores: { name: string; score: number }[] = decision.options.map(opt => {
            const totalScore = decision.criteria.reduce((acc, crit) => {
              const score = opt.scores[crit.name] || 0;
              const weight = crit.weight / 100;
              return acc + (score * weight);
            }, 0);
            return { name: opt.name, score: totalScore };
        });

        return (
            <div>
                <p className="mb-2">Sua escolha: <span className="font-semibold">{decision.decision}</span></p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Opção</TableHead>
                            <TableHead className="text-right">Pontuação Final</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {finalScores.map(item => (
                            <TableRow key={item.name}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">{item.score.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
      default:
        return null;
    }
  }
  
  const renderFooter = () => {
    if ((decision.type === 'Multiple Choice' || decision.type === 'Financial Spending') && decision.options.length > 0) {
      return (
        <div className="text-sm">
          <p className="font-medium">Opções consideradas:</p>
          <ul className="list-disc list-inside text-muted-foreground">
            {decision.options.map((opt, i) => <li key={i}>{opt}</li>)}
          </ul>
        </div>
      );
    }
     if (decision.type === 'Weighted Analysis') {
      return (
        <div className="text-sm w-full">
            <p className="font-medium mb-2">Critérios Utilizados:</p>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Critério</TableHead>
                        <TableHead className="text-right">Peso</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {decision.criteria.map(crit => (
                        <TableRow key={crit.name}>
                            <TableCell>{crit.name}</TableCell>
                            <TableCell className="text-right">{crit.weight}%</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      );
    }
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg">{decision.context}</CardTitle>
                <CardDescription>
                {format(parseISO(decision.date), "d 'de' MMMM, yyyy 'às' h:mm a", { locale: ptBR })}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="secondary">{decision.type}</Badge>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Isso excluirá permanentemente esta decisão do seu histórico. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(decision.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderDecisionDetails()}
      </CardContent>
      {((decision.type === 'Multiple Choice' || decision.type === 'Financial Spending' || decision.type === 'Weighted Analysis') && decision.options.length > 0) && (
        <CardFooter>
            {renderFooter()}
        </CardFooter>
      )}
    </Card>
  );
}

export function DecisionHistoryList() {
  const { history, isLoaded, clearHistory, deleteDecision } = useDecisionHistory();

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {history.length > 0 && (
            <div className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Limpar Histórico</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Isso excluirá permanentemente todo o seu histórico de decisões. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={clearHistory}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        )}
      {history.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-medium">Nenhuma decisão ainda!</h3>
            <p className="text-muted-foreground">Comece a usar as ferramentas e suas decisões aparecerão aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} onDelete={deleteDecision} />
          ))}
        </div>
      )}
    </div>
  );
}
