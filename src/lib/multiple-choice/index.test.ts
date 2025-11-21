import { describe, it, expect, vi } from 'vitest';
import { handleMultipleChoiceAdvice, handleSaveMultipleChoiceDecision } from '.';
import * as multipleChoiceFlow from '@/ai/flows/multiple-choice-decision-advice';

// Mock the AI flow
vi.mock('@/ai/flows/multiple-choice-decision-advice');

describe('Multiple Choice Decision Logic', () => {

  describe('handleMultipleChoiceAdvice', () => {
    it('should return advice for valid input', async () => {
      const mockAdvice = 'Choose option B.';
      vi.mocked(multipleChoiceFlow.getMultipleChoiceDecisionAdvice).mockResolvedValue({ advice: mockAdvice });

      const input = {
          context: 'Which testing library is best?',
          options: [{ value: 'Jest' }, { value: 'Vitest' }]
      };
      const result = await handleMultipleChoiceAdvice(input);
      
      expect(result).toEqual({ advice: mockAdvice });
      expect(multipleChoiceFlow.getMultipleChoiceDecisionAdvice).toHaveBeenCalledWith(input);
    });

    it('should return a validation error for too few options', async () => {
      const input = { context: 'test context long enough', options: [{ value: 'A' }] };
      const result = await handleMultipleChoiceAdvice(input);

      expect(result.error).toBe('Por favor, forneça pelo menos duas opções.');
      expect(result.advice).toBeUndefined();
    });

    it('should return a validation error for missing context', async () => {
      const input = { context: '', options: [{ value: 'A' }, { value: 'B' }] };
      const result = await handleMultipleChoiceAdvice(input);
      
      expect(result.error).toBe('Por favor, forneça mais contexto para a decisão.');
      expect(result.advice).toBeUndefined();
    });

     it('should return a generic error if the AI flow fails', async () => {
      vi.mocked(multipleChoiceFlow.getMultipleChoiceDecisionAdvice).mockRejectedValue(new Error('AI fail'));
      
      const input = {
          context: 'Which testing library is best?',
          options: [{ value: 'Jest' }, { value: 'Vitest' }]
      };
      const result = await handleMultipleChoiceAdvice(input);

      expect(result.error).toBe('Falha ao obter conselho da IA. Por favor, tente novamente.');
      expect(result.advice).toBeUndefined();
    });
  });

  describe('handleSaveMultipleChoiceDecision', () => {
    it('should return a structured decision object for valid input', async () => {
      const input = { 
        context: 'Valid context', 
        options: [{value: 'A'}, {value: 'B'}], 
        decision: 'A' 
      };
      const result = await handleSaveMultipleChoiceDecision(input);
      
      expect(result.decision?.type).toBe('Multiple Choice');
      expect(result.decision?.context).toBe('Valid context');
      expect(result.decision?.options).toEqual(['A', 'B']);
      expect(result.decision?.decision).toBe('A');
      expect(result.error).toBeUndefined();
    });

    it('should return an error for invalid data', async () => {
      const input = { context: 'Valid context', options: [], decision: 'A' }; // Invalid: options has < 2 items
      const result = await handleSaveMultipleChoiceDecision(input);

      expect(result.error).toBeDefined();
      expect(result.decision).toBeUndefined();
    });
  });
});
