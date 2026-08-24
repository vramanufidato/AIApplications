export interface SimulationResult {
  year: number;
  totalInvested: number;
  futureValue: number;
  inflationAdjustedValue: number;
  delayedFutureValue?: number;
  wealthGain: number;
}

export interface SimulationSummary {
  totalInvested: number;
  totalCorpus: number;
  totalWealthGain: number;
  realPurchasingPower: number;
  costOfDelay2Years: number;
  costOfDelay5Years: number;
  yearlyData: SimulationResult[];
}

export function calculateSipProjection(
  monthlySip: number,
  annualReturnRate: number, // e.g. 12 for 12%
  years: number, // e.g. 15
  stepUpPercent: number = 0, // e.g. 10 for 10% annual step-up
  inflationRate: number = 6 // 6% annual inflation
): SimulationSummary {
  const monthlyRate = annualReturnRate / (12 * 100);
  const inflationMonthlyRate = inflationRate / (12 * 100);
  let currentMonthlySip = monthlySip;
  let totalInvested = 0;
  let corpus = 0;
  const yearlyData: SimulationResult[] = [];

  // Also calculate delayed start (e.g., delaying 2 years)
  let delayedCorpus2Y = 0;
  let delayedCorpus5Y = 0;

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      totalInvested += currentMonthlySip;
      corpus = (corpus + currentMonthlySip) * (1 + monthlyRate);

      // If delayed 2 years
      if (year > 2) {
        delayedCorpus2Y = (delayedCorpus2Y + currentMonthlySip) * (1 + monthlyRate);
      }
      // If delayed 5 years
      if (year > 5) {
        delayedCorpus5Y = (delayedCorpus5Y + currentMonthlySip) * (1 + monthlyRate);
      }
    }

    const monthsElapsed = year * 12;
    const inflationDiscount = Math.pow(1 + inflationMonthlyRate, monthsElapsed);
    const realValue = corpus / inflationDiscount;

    yearlyData.push({
      year,
      totalInvested: Math.round(totalInvested),
      futureValue: Math.round(corpus),
      inflationAdjustedValue: Math.round(realValue),
      delayedFutureValue: year > 2 ? Math.round(delayedCorpus2Y) : 0,
      wealthGain: Math.round(corpus - totalInvested),
    });

    if (stepUpPercent > 0) {
      currentMonthlySip = currentMonthlySip * (1 + stepUpPercent / 100);
    }
  }

  const finalCorpus = Math.round(corpus);
  const costOfDelay2Years = Math.max(0, finalCorpus - Math.round(delayedCorpus2Y));
  const costOfDelay5Years = Math.max(0, finalCorpus - Math.round(delayedCorpus5Y));

  return {
    totalInvested: Math.round(totalInvested),
    totalCorpus: finalCorpus,
    totalWealthGain: Math.round(corpus - totalInvested),
    realPurchasingPower: Math.round(corpus / Math.pow(1 + inflationRate / 100, years)),
    costOfDelay2Years,
    costOfDelay5Years,
    yearlyData,
  };
}

export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
