export type DecisionType = 'Yes/No' | 'Multiple Choice' | 'Financial Analysis' | 'Financial Spending' | 'Weighted Analysis';

export interface BaseDecision {
  id: string;
  type: DecisionType;
  context: string;
  date: string;
}

export interface YesNoDecision extends BaseDecision {
  type: 'Yes/No';
  decision: 'Sim' | 'Não';
}

export interface MultipleChoiceDecision extends BaseDecision {
  type: 'Multiple Choice';
  options: string[];
  decision: string;
}

export interface FinancialSpendingDecision extends BaseDecision {
  type: 'Financial Spending';
  options: string[];
  decision: string;
}

export interface FinancialAnalysisDecision extends BaseDecision {
  type: 'Financial Analysis';
  fixedCost: number;
  variableCost: number;
}

export interface WeightedAnalysisDecision extends BaseDecision {
    type: 'Weighted Analysis';
    criteria: { name: string; weight: number }[];
    options: { name: string; scores: Record<string, number> }[];
    decision: string;
}

export type Decision = YesNoDecision | MultipleChoiceDecision | FinancialSpendingDecision | FinancialAnalysisDecision | WeightedAnalysisDecision;
