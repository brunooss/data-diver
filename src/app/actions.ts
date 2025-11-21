'use server';

import { z } from 'zod';
import { getYesNoDecisionAdvice } from '@/ai/flows/yes-no-decision-advice';
import { getMultipleChoiceDecisionAdvice } from '@/ai/flows/multiple-choice-decision-advice';
import { suggestFinancialWeights } from '@/ai/flows/financial-decision-weight-suggestion';
import { getFinancialSpendingAdvice } from '@/ai/flows/financial-spending-advice';

const yesNoSchema = z.object({
  context: z.string().min(10, 'Por favor, forneça mais contexto para a decisão.'),
});

export async function getYesNoAdviceAction(prevState: any, formData: FormData) {
  const rawData = { context: formData.get('context') };
  const validation = yesNoSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors.context?.[0] };
  }
  try {
    const result = await getYesNoDecisionAdvice({ context: validation.data.context });
    return { advice: result.advice };
  } catch (e) {
    console.error(e);
    return { error: 'Falha ao obter conselho da IA. Por favor, tente novamente.' };
  }
}

const multipleChoiceOptionSchema = z.object({
  value: z.string().min(1, 'A opção não pode estar vazia.'),
  description: z.string().optional(),
});

const multipleChoiceSchema = z.object({
  context: z.string().min(10, 'Por favor, forneça mais contexto para a decisão.'),
  options: z.array(multipleChoiceOptionSchema).min(2, 'Por favor, forneça pelo menos duas opções.'),
});

export async function getMultipleChoiceAdviceAction(prevState: any, formData: FormData) {
  const optionValues = formData.getAll('options.value').map(String);
  const optionDescriptions = formData.getAll('options.description').map(String);
  
  const options = optionValues.map((value, index) => ({
    value,
    description: optionDescriptions[index] || '',
  })).filter(opt => opt.value.trim() !== '');

  const rawData = {
    context: formData.get('context'),
    options,
  };
  
  const validation = multipleChoiceSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const contextError = fieldErrors.context?.[0];
    const optionsError = (fieldErrors.options as unknown as string[])?.[0];
    return { error: contextError || optionsError || 'Entrada inválida.' };
  }

  try {
    const result = await getMultipleChoiceDecisionAdvice({ context: validation.data.context, options: validation.data.options });
    return { advice: result.advice };
  } catch (e) {
    console.error(e);
    return { error: 'Falha ao obter conselho da IA. Por favor, tente novamente.' };
  }
}


const financialAnalysisSchema = z.object({
  context: z.string().min(10, 'Por favor, forneça mais contexto para a decisão financeira.'),
});

export async function getFinancialWeightsAction(prevState: any, formData: FormData) {
  const rawData = { context: formData.get('context') };
  const validation = financialAnalysisSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors.context?.[0] };
  }
  try {
    const result = await suggestFinancialWeights({ context: validation.data.context });
    return { suggestions: result.suggestions };
  } catch (e) {
    console.error(e);
    return { error: 'Falha ao obter sugestões da IA. Por favor, tente novamente.' };
  }
}

const financialSpendingSchema = z.object({
  context: z.string(),
  financing: z.object({
    totalValue: z.number(),
    downPayment: z.number(),
    interestRate: z.number(),
    installments: z.number(),
  }),
  consortium: z.object({
    totalValue: z.number(),
    adminFee: z.number(),
    installments: z.number(),
  }),
});

export async function getFinancialSpendingAdviceAction(prevState: any, formData: FormData) {
  const rawData = {
    context: formData.get('context'),
    financing: {
      totalValue: Number(formData.get('financing.totalValue')),
      downPayment: Number(formData.get('financing.downPayment')),
      interestRate: Number(formData.get('financing.interestRate')),
      installments: Number(formData.get('financing.installments')),
    },
    consortium: {
      totalValue: Number(formData.get('consortium.totalValue')),
      adminFee: Number(formData.get('consortium.adminFee')),
      installments: Number(formData.get('consortium.installments')),
    },
  };

  const validation = financialSpendingSchema.safeParse(rawData);

  if (!validation.success) {
    console.error(validation.error.flatten());
    return { error: 'Dados inválidos. Por favor, verifique os campos.' };
  }

  try {
    const result = await getFinancialSpendingAdvice(validation.data);
    return { advice: result.advice };
  } catch (e) {
    console.error(e);
    return { error: 'Falha ao obter conselho da IA. Por favor, tente novamente.' };
  }
}
