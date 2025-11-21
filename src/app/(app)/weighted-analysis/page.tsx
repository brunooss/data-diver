import { WeightedAnalysisForm } from '@/components/decision/weighted-analysis-form';

export default function WeightedAnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Análise Ponderada</h1>
        <p className="text-muted-foreground">
          Tome decisões complexas de forma objetiva. Defina seus critérios, atribua pesos e avalie suas opções para encontrar a melhor escolha.
        </p>
      </div>
      <WeightedAnalysisForm />
    </div>
  );
}
