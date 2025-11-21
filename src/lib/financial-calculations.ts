export type FinancingDetails = {
    totalValue: number;
    downPayment: number;
    interestRate: number;
    installments: number;
};

export type ConsortiumDetails = {
    totalValue: number;
    adminFee: number;
    installments: number;
};

export type FinancialTotals = {
    financingTotal: number;
    consortiumTotal: number;
}

export function calculateFinancingTotal({ totalValue, downPayment, interestRate, installments }: FinancingDetails): number {
    if (interestRate === 0) {
        return totalValue;
    }
    const principal = totalValue - downPayment;
    const monthlyRate = interestRate / 100;
    if (principal <= 0) return downPayment;

    // Formula de pagamento mensal (Tabela Price)
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / (Math.pow(1 + monthlyRate, installments) - 1);
    const totalPaid = downPayment + (monthlyPayment * installments);
    return isNaN(totalPaid) ? 0 : totalPaid;
}

export function calculateConsortiumTotal({ totalValue, adminFee }: ConsortiumDetails): number {
    const total = totalValue * (1 + adminFee / 100);
    return isNaN(total) ? 0 : total;
}
