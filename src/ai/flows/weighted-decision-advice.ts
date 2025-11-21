'use server';
/**
 * @fileOverview Sugere critérios e pesos para uma análise de decisão ponderada.
 *
 * - getWeightedDecisionSuggestions - Uma função que sugere critérios e pesos com base em um contexto.
 * - WeightedDecisionSuggestionsInput - O tipo de entrada para a função `getWeightedDecisionSuggestions`.
 * - WeightedDecisionSuggestionsOutput - O tipo de retorno para a função `getWeightedDecisionSuggestions`.
 */
import {ai} from '../../ai/genkit'
import { z } from 'genkit';

const CriterionSchema = z.object({
  name: z.string(),
  weight: z.number(),
});

const OptionSchema = z.object({
  name: z.string(),
  scores: z.record(z.string(), z.number()),
});

const WeightedDecisionSuggestionsInputSchema = z.object({
  context: z.string().optional().describe('O contexto da decisão a ser tomada.'),
  existingCriteria: z.array(CriterionSchema).optional().describe('Critérios já existentes inseridos pelo usuário.'),
  existingOptions: z.array(OptionSchema).optional().describe('Opções já existentes inseridas pelo usuário.'),
});
export type WeightedDecisionSuggestionsInput = z.infer<typeof WeightedDecisionSuggestionsInputSchema>;

const WeightedDecisionSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        name: z.string().describe('O nome do critério sugerido (ex: Custo, Qualidade).'),
        weight: z.number().describe('O peso sugerido para o critério (um número inteiro entre 1 e 100).'),
        rationale: z.string().describe('Uma breve justificativa para a sugestão do critério e seu peso, em Markdown.'),
      })
    )
    .describe('Uma lista de critérios e pesos sugeridos.'),
});
export type WeightedDecisionSuggestionsOutput = z.infer<typeof WeightedDecisionSuggestionsOutputSchema>;

export async function getWeightedDecisionSuggestions(input: WeightedDecisionSuggestionsInput): Promise<WeightedDecisionSuggestionsOutput> {
  return weightedDecisionSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weightedDecisionSuggestionsPrompt',
  input: { schema: WeightedDecisionSuggestionsInputSchema },
  output: { schema: WeightedDecisionSuggestionsOutputSchema },
  prompt: `Você é um especialista em análise de decisões. Com base no contexto fornecido e nos critérios e opções já inseridos pelo usuário, sugira 5 a 7 critérios de avaliação relevantes e atribua um peso percentual (inteiro, de 1 a 100) para cada um. A soma de todos os pesos (incluindo os existentes, se houver) deve ser igual a 100.
Se o usuário já forneceu critérios, você pode sugerir novos critérios para complementar a lista ou sugerir ajustes nos pesos dos critérios existentes.

Contexto da Decisão: {{{context}}}

{{#if existingCriteria}}
Critérios já inseridos pelo usuário (você pode complementá-los):
{{#each existingCriteria}}
- {{this.name}} (Peso: {{this.weight}}%)
{{/each}}
{{/if}}

{{#if existingOptions}}
Opções já consideradas pelo usuário:
{{#each existingOptions}}
- {{this.name}}
{{/each}}
{{/if}}

Para cada critério que você sugerir, forneça uma breve justificativa para sua inclusão e o peso atribuído. A justificativa deve estar em formato Markdown. Retorne uma lista de sugestões. Certifique-se de que os novos pesos sugeridos, somados aos existentes (se houver), totalizem 100.`,
});

const weightedDecisionSuggestionsFlow = ai.defineFlow(
  {
    name: 'weightedDecisionSuggestionsFlow',
    inputSchema: WeightedDecisionSuggestionsInputSchema,
    outputSchema: WeightedDecisionSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
