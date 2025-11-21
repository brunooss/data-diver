'use server';

import { z } from 'zod';
import { getMultipleChoiceDecisionAdvice, type MultipleChoiceDecisionAdviceInput } from '@/ai/flows/multiple-choice-decision-advice';
import type { MultipleChoiceDecision } from '../types';

// --- Schemas ---
const multipleChoiceOptionSchema = z.object({
  value: z.string().min(1, 'A opção não pode estar vazia.'),
  description: z.string().optional(),
});

const multipleChoiceSchema = z.object({
  context: z.string().min(10, 'Por favor, forneça mais contexto para a decisão.'),
  options: z.array(multipleChoiceOptionSchema).min(2, 'Por favor, forneça pelo menos duas opções.'),
});

const saveMultipleChoiceDecisionSchema = multipleChoiceSchema.extend({
  decision: z.string().min(1),
});

/**
 * Validates input, calls the AI flow, and returns advice for a Multiple Choice decision.
 * @param data - The raw input data, usually from a form.
 * @returns An object with either the AI advice or an error message.
 */
export async function handleMultipleChoiceAdvice(data: unknown) {
  const validation = multipleChoiceSchema.safeParse(data);
  
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const contextError = fieldErrors.context?.[0];
    const optionsError = (fieldErrors.options as unknown as string[])?.[0];
    return { error: contextError || optionsError || 'Entrada inválida.' };
  }
  
  try {
    const result = await getMultipleChoiceDecisionAdvice(validation.data as MultipleChoiceDecisionAdviceInput);
    return { advice: result.advice };
  } catch (e) {
    console.error(e);
    return { error: 'Falha ao obter conselho da IA. Por favor, tente novamente.' };
  }
}

/**
 * Validates the data for a Multiple Choice decision and formats it for saving.
 * @param data - The raw input data containing context, options, and the final decision.
 * @returns An object with either the structured decision data or an error message.
 */
export async function handleSaveMultipleChoiceDecision(data: unknown) {
  const validation = saveMultipleChoiceDecisionSchema.safeParse(data);
  if (!validation.success) {
      return { error: 'Dados inválidos para salvar a decisão.' };
  }
  const decisionData: Omit<MultipleChoiceDecision, 'id' | 'date'> = {
      type: 'Multiple Choice',
      context: validation.data.context,
      options: validation.data.options.map(o => o.value),
      decision: validation.data.decision,
  };
  return { decision: decisionData };
}
