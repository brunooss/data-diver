'use client';

import { useForm, useWatch } from 'react-hook-form';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDecisionHistory } from '@/hooks/use-decision-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getFinancialSpendingAdviceAction, getFinancialTotalsAction } from '@/app/actions';
import { AiAdviceCard } from './ai-advice-card';
import { Loader2 } from 'lucide-react';
import type { FinancialTotals } from '@/lib/financial-calculations';

const formSchema = z.object({
  context: z.string().min(10, 'Por favor, forneça mais contexto para a decisão.'),
  financing: z.object({
    totalValue: z.coerce.number().min(0, 'O valor total deve ser positivo.'),
    downPayment: z.coerce.number().min(0, 'A entrada deve ser positiva.'),
    interestRate: z.coerce.number().min(0, 'A taxa de juros deve ser positiva.'),
    installments: z.coerce.number().int().min(1, 'O número de parcelas deve ser pelo menos 1.'),
  }),
  consortium: z.object({
    totalValue: z.coerce.number().min(0, 'O valor total deve ser positivo.'),
    adminFee: z.coerce.number().min(0, 'A taxa de administração deve ser positiva.'),
    installments: z.coerce.number().int().min(1, 'O número de parcelas deve ser pelo menos 1.'),
  }),
});

type FormData = z.infer<typeof formSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Me ajude a escolher
    </Button>
  );
}

export function FinancialSpendingForm() {
  const [state, formAction, isPending] = useActionState(getFinancialSpendingAdviceAction, { advice: null, error: null });
  const { addDecision } = useDecisionHistory();
  const { toast } = useToast();
  const [totals, setTotals] = useState<FinancialTotals>({ financingTotal: 0, consortiumTotal: 0 });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      context: 'Aquisição de carro',
      financing: {
        totalValue: 50000,
        downPayment: 10000,
        interestRate: 1.5,
        installments: 48,
      },
      consortium: {
        totalValue: 50000,
        adminFee: 15,
        installments: 60,
      }
    },
  });

  const watchedData = useWatch({ control: form.control });

  useEffect(() => {
    async function calculateTotals() {
      const result = await getFinancialTotalsAction(watchedData);
      if(result.totals) {
        setTotals(result.totals);
      }
    }
    const validation = formSchema.safeParse(watchedData);
    if(validation.success) {
        calculateTotals();
    }
  }, [watchedData]);

  
  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: state.error,
      });
    }
  }, [state.error, toast]);
  
  const handleDecision = (decision: string) => {
    const { context } = form.getValues();
    
    addDecision({
      type: 'Financial Spending',
      context,
      options: ['Financiamento', 'Consórcio'],
      decision,
    });
    toast({
      title: 'Decisão Salva',
      description: `Você escolheu "${decision}" para: ${context.substring(0, 30)}...`,
    });
    state.advice = null;
  };
  

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sua Decisão</CardTitle>
            <CardDescription>Descreva o contexto e as opções financeiras que você está considerando.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contexto da Decisão</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Comprar um carro novo." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Opção 1: Financiamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="financing.totalValue" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor Total do Bem</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="financing.downPayment" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor da Entrada</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="financing.interestRate" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Taxa de Juros (% a.m.)</FormLabel>
                            <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="financing.installments" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número de Parcelas</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
                <CardFooter>
                    <div className="w-full p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold text-lg">Custo Total Estimado:</h4>
                        <p className="text-2xl font-bold text-primary">{totals.financingTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Opção 2: Consórcio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="consortium.totalValue" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor Total da Carta</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="consortium.adminFee" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Taxa de Administração (%)</FormLabel>
                            <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="consortium.installments" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número de Parcelas</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
                <CardFooter>
                    <div className="w-full p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold text-lg">Custo Total Estimado:</h4>
                        <p className="text-2xl font-bold text-primary">{totals.consortiumTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </CardFooter>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Ação</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <SubmitButton />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={!form.formState.isValid} className="w-full">Tomar uma Decisão</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                    <DropdownMenuItem onSelect={() => handleDecision('Financiamento')}>
                        Financiamento
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDecision('Consórcio')}>
                        Consórcio
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
        
        <AiAdviceCard advice={state.advice} isLoading={isPending} />
      </form>
    </Form>
  );
}
