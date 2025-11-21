import { describe, it, expect, vi } from 'vitest';
import { handleYesNoAdvice, handleSaveYesNoDecision } from '.';
import * as yesNoFlow from '@/ai/flows/yes-no-decision-advice';

// Mock the AI flow
vi.mock('@/ai/flows/yes-no-decision-advice');

describe('Yes/No Decision Logic', () => {

  describe('handleYesNoAdvice', () => {
    it('should return advice for valid input', async () => {
      const mockAdvice = 'Go for it!';
      vi.mocked(yesNoFlow.getYesNoDecisionAdvice).mockResolvedValue({ advice: mockAdvice });
      
      const result = await handleYesNoAdvice({ context: 'Should I learn Vitest?' });
      
      expect(yesNoFlow.getYesNoDecisionAdvice).toHaveBeenCalledWith({ context: 'Should I learn Vitest?' });
      expect(result).toEqual({ advice: mockAdvice });
    });
    
    it('should return a generic error if the AI flow fails', async () => {
      vi.mocked(yesNoFlow.getYesNoDecisionAdvice).mockRejectedValue(new Error('AI fail'));

      const result = await handleYesNoAdvice({ context: 'A valid decision context' });

      expect(result.error).toBe('Falha ao obter conselho da IA. Por favor, tente novamente.');
      expect(result.advice).toBeUndefined();
    });
  });

  describe('handleSaveYesNoDecision', () => {
    it('should return a structured decision object for valid input', async () => {
      const input = { context: 'A valid decision context', decision: 'Sim' as const };
      const result = await handleSaveYesNoDecision(input);

      expect(result.decision?.type).toBe('Yes/No');
      expect(result.decision?.context).toBe(input.context);
      expect(result.decision?.decision).toBe(input.decision);
      expect(result.error).toBeUndefined();
    });

    it('should return a validation error for invalid data', async () => {
      const input = { context: 'short', decision: 'Maybe' }; // "Maybe" is not a valid enum value

      const result = await handleSaveYesNoDecision(input);

      expect(result.error).toBeDefined();
      expect(result.decision).toBeUndefined();
    });
  });
});
