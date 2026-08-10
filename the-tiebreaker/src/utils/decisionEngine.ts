import { DecisionAnalysis, DecisionFactor, DecisionOption, ProConItem } from '../types';

export interface CalculatedOptionScore {
  option: DecisionOption;
  rawScore: number; // 0 to 10 scale
  percentageScore: number; // 0 to 100%
  rank: number;
  factorBreakdown: {
    factorId: string;
    factorName: string;
    weight: number;
    score: number; // 0 to 10
    weightedValue: number;
  }[];
}

/**
 * Calculates option scores dynamically based on active factor weights
 */
export function calculateWeightedScores(
  options: DecisionOption[],
  factors: DecisionFactor[]
): CalculatedOptionScore[] {
  const totalWeight = factors.reduce((sum, f) => sum + (f.weight || 0), 0);

  const scores: CalculatedOptionScore[] = options.map((option) => {
    let sumWeightedScores = 0;

    const factorBreakdown = factors.map((factor) => {
      const score = factor.scores?.[option.id] ?? 5; // default 5 if unrated
      const w = factor.weight || 0;
      const weightedVal = (score * w);
      sumWeightedScores += weightedVal;

      return {
        factorId: factor.id,
        factorName: factor.name,
        weight: w,
        score,
        weightedValue: weightedVal,
      };
    });

    const rawScore = totalWeight > 0 ? sumWeightedScores / totalWeight : 0;
    const percentageScore = Math.min(100, Math.max(0, Math.round(rawScore * 10)));

    return {
      option,
      rawScore: Math.round(rawScore * 10) / 10,
      percentageScore,
      rank: 1, // assigned after sort
      factorBreakdown,
    };
  });

  // Sort descending by percentageScore
  scores.sort((a, b) => b.percentageScore - a.percentageScore);

  // Assign 1-based ranks
  scores.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return scores;
}

const STORAGE_KEY = 'tiebreaker_saved_decisions_v1';

export function getSavedDecisions(): DecisionAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved decisions:', e);
    return [];
  }
}

export function saveDecisionToLocalStorage(decision: DecisionAnalysis): void {
  try {
    const existing = getSavedDecisions();
    const index = existing.findIndex((d) => d.id === decision.id);
    const updated = { ...decision, updatedAt: new Date().toISOString() };

    if (index >= 0) {
      existing[index] = updated;
    } else {
      existing.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save decision to localStorage:', e);
  }
}

export function deleteDecisionFromLocalStorage(id: string): DecisionAnalysis[] {
  try {
    const existing = getSavedDecisions();
    const filtered = existing.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Failed to delete decision from localStorage:', e);
    return [];
  }
}

/**
 * Generates clean formatted Markdown summary of the decision for export or sharing
 */
export function exportDecisionAsMarkdown(decision: DecisionAnalysis): string {
  const ranked = calculateWeightedScores(decision.options, decision.factors);
  const winner = ranked[0];

  let md = `# Decision Report: ${decision.title}\n`;
  md += `**Date:** ${new Date(decision.createdAt).toLocaleDateString()}\n`;
  md += `**Category:** ${decision.category}\n\n`;
  md += `## Dilemma\n${decision.dilemma}\n\n`;

  md += `## Executive Verdict\n`;
  md += `🏆 **Recommended Choice:** ${winner?.option.title} (${winner?.percentageScore}% Match)\n`;
  md += `**Confidence:** ${decision.aiVerdict.confidencePercentage}%\n\n`;
  md += `> ${decision.aiVerdict.executiveSummary}\n\n`;
  md += `* **Key Decisive Factor:** ${decision.aiVerdict.keyDecisiveFactor}\n`;
  md += `* **Sensitivity Insight:** ${decision.aiVerdict.sensitivityInsight}\n\n`;

  md += `## Weighted Score Ranking\n`;
  ranked.forEach((r) => {
    md += `${r.rank}. **${r.option.title}** - Score: ${r.rawScore}/10 (${r.percentageScore}%)\n`;
    md += `   *${r.option.description}*\n`;
  });
  md += `\n`;

  md += `## Factor Weights & Ratings\n`;
  md += `| Factor | Importance Weight | ` + decision.options.map(o => o.title).join(' | ') + ` |\n`;
  md += `| :--- | :---: | ` + decision.options.map(() => `:---:`).join(' | ') + ` |\n`;
  decision.factors.forEach((f) => {
    const scoresStr = decision.options.map(o => `${f.scores[o.id] ?? '-'}/10`).join(' | ');
    md += `| **${f.name}** | ${f.weight}% | ${scoresStr} |\n`;
  });
  md += `\n`;

  md += `## Key Pros & Cons\n`;
  decision.options.forEach((opt) => {
    md += `### ${opt.title}\n`;
    const pros = decision.prosCons.filter(pc => pc.optionId === opt.id && pc.type === 'pro');
    const cons = decision.prosCons.filter(pc => pc.optionId === opt.id && pc.type === 'con');

    md += `**Pros:**\n`;
    pros.forEach(p => { md += `* [${p.impact.toUpperCase()}] ${p.text}\n`; });
    if (pros.length === 0) md += `* None specified\n`;

    md += `\n**Cons:**\n`;
    cons.forEach(c => { md += `* [${c.impact.toUpperCase()}] ${c.text}\n`; });
    if (cons.length === 0) md += `* None specified\n`;
    md += `\n`;
  });

  md += `---\n*Generated by The Tiebreaker - AI Decision Support Studio*`;
  return md;
}
