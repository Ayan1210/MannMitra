import { CheckInRecord, PatternAnalysisResult, WellBeingStatus, TrendDirection } from '../types';

/**
 * Calculates a single composite wellbeing score (0 - 100) for a check-in.
 * 
 * Dimensions (each 1-5):
 * - Overall Wellbeing (weight 25%)
 * - Academic Stress (weight 20% - inverted: 5 stress = 1 score)
 * - Sleep Quality (weight 15%)
 * - Energy Level (weight 15%)
 * - Concentration (weight 15%)
 * - Social Connection (weight 10%)
 */
export function calculateCompositeScore(checkIn: CheckInRecord): number {
  if (!checkIn) return 50;

  const ow = typeof checkIn.overallWellbeing === 'number' && !isNaN(checkIn.overallWellbeing) ? checkIn.overallWellbeing : 3;
  const as = typeof checkIn.academicStress === 'number' && !isNaN(checkIn.academicStress) ? checkIn.academicStress : 3;
  const sq = typeof checkIn.sleepQuality === 'number' && !isNaN(checkIn.sleepQuality) ? checkIn.sleepQuality : 3;
  const el = typeof checkIn.energyLevel === 'number' && !isNaN(checkIn.energyLevel) ? checkIn.energyLevel : 3;
  const cn = typeof checkIn.concentration === 'number' && !isNaN(checkIn.concentration) ? checkIn.concentration : 3;
  const sc = typeof checkIn.socialConnection === 'number' && !isNaN(checkIn.socialConnection) ? checkIn.socialConnection : 3;

  const normWellbeing = (Math.max(1, Math.min(5, ow)) - 1) / 4; // 0 to 1
  const normStressInverted = (5 - Math.max(1, Math.min(5, as))) / 4; // 0 (extreme stress) to 1 (low stress)
  const normSleep = (Math.max(1, Math.min(5, sq)) - 1) / 4;
  const normEnergy = (Math.max(1, Math.min(5, el)) - 1) / 4;
  const normConcentration = (Math.max(1, Math.min(5, cn)) - 1) / 4;
  const normSocial = (Math.max(1, Math.min(5, sc)) - 1) / 4;

  const composite = (
    normWellbeing * 0.25 +
    normStressInverted * 0.20 +
    normSleep * 0.15 +
    normEnergy * 0.15 +
    normConcentration * 0.15 +
    normSocial * 0.10
  ) * 100;

  const rounded = Math.round(composite);
  return Number.isFinite(rounded) ? Math.max(0, Math.min(100, rounded)) : 50;
}

/**
 * Deterministic Pattern Engine
 * 
 * Compares longitudinal history across multiple weeks to identify significant
 * pattern shifts, consecutive declines, and multi-factor stress divergences.
 * 
 * Complies with WHO digital wellbeing guidance:
 * - Focuses on multi-dimensional changes in student environment/routines.
 * - Non-diagnostic, strictly early-warning triage for counselor review.
 */
export function analyzeWellbeingPattern(checkIns: CheckInRecord[]): PatternAnalysisResult {
  if (!checkIns || checkIns.length === 0) {
    return {
      studentId: '',
      computedScore: 50,
      status: 'stable',
      trend: 'stable',
      consecutiveDeclines: 0,
      scoreDelta: 0,
      primaryDrivers: ['Insufficient history'],
      explanation: 'Awaiting initial check-in data.',
      ruleTriggers: [],
      recommendedAction: 'Invite student to complete baseline check-in.',
      calculatedAt: new Date().toISOString(),
    };
  }

  // Sort chronological
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latest = sorted[sorted.length - 1];
  const latestScore = calculateCompositeScore(latest);
  const studentId = latest.studentId;

  if (sorted.length === 1) {
    let initialStatus: WellBeingStatus = 'stable';
    if (latestScore < 45 || latest.overallWellbeing <= 2) {
      initialStatus = 'monitor';
    }
    return {
      studentId,
      computedScore: latestScore,
      status: initialStatus,
      trend: 'stable',
      consecutiveDeclines: 0,
      scoreDelta: 0,
      primaryDrivers: ['Baseline check-in registered'],
      explanation: `Baseline check-in recorded with overall wellbeing rating of ${latest.overallWellbeing}/5 and composite index of ${latestScore}/100.`,
      ruleTriggers: ['R-00: Baseline Check-in Recorded'],
      recommendedAction: initialStatus === 'monitor' ? 'Review baseline context during orientation.' : 'No immediate action required.',
      calculatedAt: new Date().toISOString(),
    };
  }

  const previous = sorted[sorted.length - 2];
  const previousScore = calculateCompositeScore(previous);
  const scoreDelta = latestScore - previousScore;
  const wellbeingDelta = latest.overallWellbeing - previous.overallWellbeing;
  const stressDelta = latest.academicStress - previous.academicStress;

  // Calculate consecutive declines in overall wellbeing or composite score
  let consecutiveDeclines = 0;
  for (let i = sorted.length - 1; i > 0; i--) {
    const curr = calculateCompositeScore(sorted[i]);
    const prev = calculateCompositeScore(sorted[i - 1]);
    if (curr < prev || sorted[i].overallWellbeing < sorted[i - 1].overallWellbeing) {
      consecutiveDeclines++;
    } else {
      break;
    }
  }

  const ruleTriggers: string[] = [];
  const primaryDrivers: string[] = [];

  // Rule 1: Consecutive decline streak (3+ or 2 consecutive drops)
  if (consecutiveDeclines >= 3) {
    ruleTriggers.push(`R-01: ${consecutiveDeclines} consecutive weeks of wellbeing decline detected`);
    primaryDrivers.push(`Prolonged downward trend (${consecutiveDeclines} weeks)`);
  } else if (consecutiveDeclines === 2 && scoreDelta <= -12) {
    ruleTriggers.push('R-02: Moderate multi-week sustained decline');
    primaryDrivers.push('2 consecutive weeks of lower scores');
  }

  // Rule 2: Academic pressure spike + sleep/concentration dip
  if (latest.academicStress >= 4 && (latest.sleepQuality <= 2 || latest.concentration <= 2)) {
    ruleTriggers.push(`R-03: Academic overload divergence (Stress: ${latest.academicStress}/5, Sleep: ${latest.sleepQuality}/5, Focus: ${latest.concentration}/5)`);
    primaryDrivers.push('Academic workload impact on sleep/focus');
  }

  // Rule 3: Sharp single-week drop
  if (scoreDelta <= -20 || wellbeingDelta <= -2) {
    ruleTriggers.push(`R-04: Sharp delta detected (Drop of ${Math.abs(scoreDelta)} composite pts / ${Math.abs(wellbeingDelta)} mood pts)`);
    primaryDrivers.push('Sudden drop from previous check-in');
  }

  // Rule 4: Social isolation indicator
  if (latest.socialConnection <= 2 && latest.overallWellbeing <= 3) {
    ruleTriggers.push(`R-05: Low social connectedness reported (${latest.socialConnection}/5)`);
    primaryDrivers.push('Social disconnection/isolation');
  }

  // Rule 5: Sleep deficit persistence
  if (latest.sleepQuality <= 2 && previous.sleepQuality <= 2) {
    ruleTriggers.push('R-06: Persistent poor sleep quality (< 2/5 across multiple check-ins)');
    primaryDrivers.push('Persistent sleep disruption');
  }

  // Determine Trend Direction
  let trend: TrendDirection = 'stable';
  if (scoreDelta <= -8 || consecutiveDeclines >= 2) {
    trend = 'declining';
  } else if (scoreDelta >= 8) {
    trend = 'improving';
  }

  // Determine Status
  let status: WellBeingStatus = 'stable';

  if (
    consecutiveDeclines >= 3 ||
    (consecutiveDeclines >= 2 && latestScore < 50) ||
    ruleTriggers.length >= 2 ||
    (latest.overallWellbeing <= 2 && latest.academicStress >= 4) ||
    latestScore <= 35
  ) {
    status = 'check_in_recommended';
  } else if (
    consecutiveDeclines === 2 ||
    scoreDelta <= -10 ||
    latestScore < 55 ||
    latest.academicStress >= 4 ||
    latest.sleepQuality <= 2 ||
    latest.socialConnection <= 2
  ) {
    status = 'monitor';
  }

  // Fallback driver if empty
  if (primaryDrivers.length === 0) {
    if (status === 'stable') {
      primaryDrivers.push('Balanced wellbeing & workload');
    } else {
      primaryDrivers.push('General baseline monitoring');
    }
  }

  // Craft clear plain-English explanation
  let explanation = '';
  if (status === 'check_in_recommended') {
    explanation = `Support attention recommended. Student reports a ${Math.abs(scoreDelta)} pt decline in composite score, marked by ${primaryDrivers.join(' and ')}. A proactive, supportive check-in is advised.`;
  } else if (status === 'monitor') {
    explanation = `Routine monitoring suggested. Minor shifts noted in ${primaryDrivers.join(', ')}. No urgent intervention required; observe next check-in.`;
  } else {
    explanation = `Wellbeing metrics remain stable across academic, sleep, and social dimensions.`;
  }

  let recommendedAction = 'Routine campus support available.';
  if (status === 'check_in_recommended') {
    if (primaryDrivers.some(d => d.includes('Academic'))) {
      recommendedAction = 'Proactive 1-on-1 check-in + academic mentoring or workload pacing support.';
    } else if (primaryDrivers.some(d => d.includes('Social'))) {
      recommendedAction = 'Counselor gentle greeting + peer support group introduction.';
    } else {
      recommendedAction = 'Gentle wellness check-in to explore recent sleep and routine changes.';
    }
  } else if (status === 'monitor') {
    recommendedAction = 'Keep on active monitoring watchlist; review following check-in.';
  }

  return {
    studentId,
    computedScore: latestScore,
    status,
    trend,
    consecutiveDeclines,
    scoreDelta,
    primaryDrivers: primaryDrivers.slice(0, 3),
    explanation,
    ruleTriggers,
    recommendedAction,
    calculatedAt: new Date().toISOString(),
  };
}
