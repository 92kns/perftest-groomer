import type { Priority, Impact, WorkTrack, Estimate, OKRMatch } from './types';

export interface RuleContext {
  summary: string;
  summaryLower: string;
  description: string;
  descriptionLower: string;
  type: string;
  components: string;
  labels: string;
  isMeta: boolean;
  isBug: boolean;
}

export interface RuleResult {
  priority?: Priority;
  impact?: Impact;
  workTrack?: WorkTrack;
  estimate?: Estimate;
  reasoning: string;
  okrMatch?: OKRMatch;
  labels?: string[];
}

type Rule = (ctx: RuleContext) => RuleResult | null;

const OKR_PATTERNS = {
  'Mobile Startup': [
    /startup/i,
    /applink/i,
    /app.?link/i,
    /android.*launch/i,
    /cold.?start/i,
    /warm.?start/i,
  ],
  'Browser Responsiveness': [
    /speedometer/i,
    /jetstream/i,
    /input.?latency/i,
    /responsiveness/i,
    /jank/i,
    /frame.?rate/i,
  ],
  'Perceived Performance': [
    /lcp/i,
    /largest.?contentful/i,
    /prerender/i,
    /prefetch/i,
    /navigation.?speed/i,
    /page.?load/i,
    /fcp/i,
    /first.?contentful/i,
  ],
  'Adaptive Performance': [/battery/i, /power/i, /adaptive/i, /hardware.?pref/i],
};

function matchOKR(text: string): OKRMatch | null {
  for (const [okr, patterns] of Object.entries(OKR_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return { okr, confidence: 0.8 };
      }
    }
  }
  return null;
}

const rules: Rule[] = [
  // Intermittent/Perma - highest priority (only check title/summary)
  (ctx) => {
    const isIntermittent = /intermittent|perma|flaky|sporadic/i.test(ctx.summaryLower);
    const isCIRelated = /ci|test.?failure|failure.?in/i.test(
      ctx.summaryLower + ctx.descriptionLower
    );

    if (isIntermittent || (ctx.isBug && isCIRelated)) {
      return {
        priority: 'P1',
        impact: 'High',
        workTrack: 'Operational',
        estimate: '1w',
        reasoning: 'Intermittent/perma test failure - highest priority due to CI usage',
        labels: ['perf-ci'],
      };
    }
    return null;
  },

  // External browser (Chrome/Safari) - Vision by default
  (ctx) => {
    const isExternalBrowser = /chrome|safari|chromium|webkit/i.test(
      ctx.summaryLower + ctx.descriptionLower
    );
    const isIntermittent = /intermittent|perma|flaky/i.test(ctx.summaryLower);

    if (isExternalBrowser) {
      if (isIntermittent) {
        return {
          priority: 'P1',
          impact: 'High',
          workTrack: 'Operational',
          estimate: '1w',
          reasoning: 'External browser intermittent - Operational due to CI usage',
        };
      }
      return {
        priority: 'P4',
        impact: 'Low',
        workTrack: 'Vision',
        estimate: '2w',
        reasoning: 'External browser task - Vision by default, lower priority',
      };
    }
    return null;
  },

  // Performance/slowness bugs - dev pain
  (ctx) => {
    const isSlowBug = ctx.isBug && /slow|performance|latency|timeout|hang/i.test(ctx.summaryLower);

    if (isSlowBug) {
      return {
        priority: 'P2',
        impact: 'Medium',
        workTrack: 'Operational',
        estimate: '1w',
        reasoning: 'Performance bug - dev-pain, Operational',
      };
    }
    return null;
  },

  // UI/UX bugs - lower priority operational
  (ctx) => {
    const isUIBug =
      ctx.isBug && /button|display|ui|view|window|show|hidden|close/i.test(ctx.summaryLower);

    if (isUIBug) {
      return {
        priority: 'P3',
        impact: 'Low',
        workTrack: 'Operational',
        estimate: '3d',
        reasoning: 'UI bug - minor dev-pain',
      };
    }
    return null;
  },

  // Meta bugs - larger effort
  (ctx) => {
    if (ctx.isMeta) {
      const okrMatch = matchOKR(ctx.summaryLower + ctx.descriptionLower);
      return {
        priority: okrMatch ? 'P2' : 'P3',
        impact: okrMatch ? 'High' : 'Medium',
        workTrack: okrMatch ? 'Vision' : 'Vision',
        estimate: '4w',
        reasoning: 'Meta bug - tracking issue for larger effort',
        ...(okrMatch && { okrMatch }),
      };
    }
    return null;
  },

  // Sheriffing/automation tasks
  (ctx) => {
    const isSheriffing = /sheriff|backfill|alert|triage/i.test(
      ctx.summaryLower + ctx.descriptionLower
    );
    const isAutomation = /automat|bot|mirror/i.test(ctx.summaryLower + ctx.descriptionLower);

    if (isSheriffing || isAutomation) {
      return {
        priority: 'P2',
        impact: 'High',
        workTrack: 'Operational',
        estimate: '2w',
        reasoning: 'Sheriffing/automation - improves operational efficiency',
      };
    }
    return null;
  },

  // Documentation tasks
  (ctx) => {
    const isDocumentation = /doc|perfdoc|readme|guide/i.test(
      ctx.summaryLower + ctx.descriptionLower
    );

    if (isDocumentation) {
      return {
        priority: 'P4',
        impact: 'Medium',
        workTrack: 'Vision',
        estimate: '1w',
        reasoning: 'Documentation task',
        labels: ['documentation'],
      };
    }
    return null;
  },

  // Quick cleanup tasks
  (ctx) => {
    const isCleanup = /remove|cleanup|clean.?up|deprecate|obsolete/i.test(ctx.summaryLower);
    const isSmall = ctx.descriptionLower.length < 200;

    if (isCleanup && isSmall) {
      return {
        priority: 'P4',
        impact: 'Low',
        workTrack: 'Vision',
        estimate: '1d',
        reasoning: 'Quick cleanup task',
      };
    }
    return null;
  },

  // Tooling improvements - Perfherder
  (ctx) => {
    const isPerfherder = ctx.components.includes('Perfherder');

    if (isPerfherder && !ctx.isBug) {
      return {
        priority: 'P3',
        impact: 'Medium',
        workTrack: 'Vision',
        estimate: '2w',
        reasoning: 'Perfherder tooling improvement',
      };
    }
    return null;
  },

  // Testing infrastructure
  (ctx) => {
    const isTestInfra = /raptor|browsertime|mozperftest|xpcshell/i.test(
      ctx.summaryLower + ctx.components
    );

    if (isTestInfra && !ctx.isBug) {
      return {
        priority: 'P3',
        impact: 'Medium',
        workTrack: 'Vision',
        estimate: '2w',
        reasoning: 'Testing infrastructure improvement',
        labels: ['testing'],
      };
    }
    return null;
  },

  // OKR-aligned tasks (catch-all for OKR matches)
  (ctx) => {
    const okrMatch = matchOKR(ctx.summaryLower + ctx.descriptionLower);

    if (okrMatch) {
      return {
        priority: 'P3',
        impact: 'High',
        workTrack: 'Vision',
        estimate: '2w',
        reasoning: `Supports ${okrMatch.okr} OKR`,
        okrMatch,
      };
    }
    return null;
  },
];

const defaultResult: RuleResult = {
  priority: 'P4',
  impact: 'Low',
  workTrack: 'Vision',
  estimate: '1w',
  reasoning: 'Default classification - needs manual review',
};

export function applyRules(ctx: RuleContext): RuleResult {
  const results: RuleResult[] = [];

  for (const rule of rules) {
    const result = rule(ctx);
    if (result) {
      results.push(result);
    }
  }

  if (results.length === 0) {
    return defaultResult;
  }

  // Priority: take highest priority (P1 > P2 > P3 > P4)
  const priorityOrder: Priority[] = ['P1', 'P2', 'P3', 'P4'];
  const priorities = results.map((r) => r.priority).filter(Boolean) as Priority[];
  const bestPriority =
    priorities.sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b))[0] ||
    defaultResult.priority!;

  // Impact: take highest impact
  const impactOrder: Impact[] = ['High', 'Medium', 'Low'];
  const impacts = results.map((r) => r.impact).filter(Boolean) as Impact[];
  const bestImpact =
    impacts.sort((a, b) => impactOrder.indexOf(a) - impactOrder.indexOf(b))[0] ||
    defaultResult.impact!;

  // WorkTrack: prefer Operational
  const workTracks = results.map((r) => r.workTrack).filter(Boolean) as WorkTrack[];
  const bestWorkTrack = workTracks.includes('Operational')
    ? 'Operational'
    : workTracks[0] || defaultResult.workTrack!;

  // Estimate: take the first non-null
  const estimates = results.map((r) => r.estimate).filter(Boolean) as Estimate[];
  const bestEstimate = estimates[0] || defaultResult.estimate!;

  // Combine reasoning
  const reasoning = results.map((r) => r.reasoning).join('; ');

  // Get OKR match if any
  const okrMatch = results.find((r) => r.okrMatch)?.okrMatch;

  // Combine labels
  const labels = [...new Set(results.flatMap((r) => r.labels || []))];

  return {
    priority: bestPriority,
    impact: bestImpact,
    workTrack: bestWorkTrack,
    estimate: bestEstimate,
    reasoning,
    okrMatch,
    labels,
  };
}
