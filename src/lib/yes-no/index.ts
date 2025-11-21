'use server';

import { z } from 'zod';
import { getYesNoDecisionAdvice, type YesNoDecisionAdviceInput } from '@/ai/flows/yes-no-decision-advice';
import type { YesNoDecision } from '../types';

// --- Schemas ---
const yesNoSchema = z.object({
  context: z.string().min(10, 'Por favor, forneça mais contexto para a decisão.'),
});

const saveYesNoDecisionSchema = yesNoSchema.extend({
  decision: z.enum(['Sim', 'Não']),
});

/**
 * Validates input, calls the AI flow, and returns advice for a Yes/No decision.
 * @param data - The raw input data, usually from a form.
 * @returns An object with either the AI advice or an error message.
 */
export async function handleYesNoAdvice(data: unknown) {
  const validation = yesNoSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors.context?.[0] };
  }
  try {
    const result = await getYesNoDecisionAdvice(validation.data as YesNoDecisionAdviceInput);
    return { advice: result.advice };
  } catch (e) {
    console.error(e);
    return { error: 'Falha ao obter conselho da IA. Por favor, tente novamente.' };
  }
}

/**
 * Validates the data for a Yes/No decision and formats it for saving.
 * @param data - The raw input data containing context and the final decision.
 * @returns An object with either the structured decision data or an error message.
 */
export async function handleSaveYesNoDecision(data: unknown) {
    const validation = saveYesNoDecisionSchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors.context?.[0] || 'Dados inválidos.' };
    }
    const decisionData: Omit<YesNoDecision, 'id' | 'date'> = {
        type: 'Yes/No',
        context: validation.data.context,
        decision: validation.data.decision,
    };
    return { decision: decisionData };
}
