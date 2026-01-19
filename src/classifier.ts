import type { JiraIssue, GroomingResult } from './types';
import { applyRules, type RuleContext } from './rules';

export function classifyIssue(issue: JiraIssue): GroomingResult {
  const ctx: RuleContext = {
    summary: issue.summary,
    summaryLower: issue.summary.toLowerCase(),
    description: issue.description,
    descriptionLower: issue.description.toLowerCase(),
    type: issue.type,
    components: issue.components,
    labels: issue.labels,
    isMeta: issue.summary.toLowerCase().includes('[meta]'),
    isBug: issue.type.toLowerCase() === 'bug',
  };

  const result = applyRules(ctx);

  return {
    issue,
    priority: result.priority!,
    impact: result.impact!,
    estimate: result.estimate!,
    workTrack: result.workTrack!,
    reasoning: [result.reasoning],
    okrMatch: result.okrMatch || null,
    labels: result.labels || [],
  };
}

export function classifyIssues(issues: JiraIssue[]): GroomingResult[] {
  return issues.map(classifyIssue);
}
