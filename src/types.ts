export interface JiraIssue {
  key: string;
  summary: string;
  type: string;
  status: string;
  components: string;
  labels: string;
  description: string;
  currentPriority: string;
  currentEstimate: string;
  currentImpact: string;
}

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type Impact = 'High' | 'Medium' | 'Low';
export type WorkTrack = 'Operational' | 'Vision';
export type Estimate = '1d' | '3d' | '1w' | '2w' | '3w' | '4w';

export interface OKRMatch {
  okr: string;
  confidence: number;
}

export interface GroomingResult {
  issue: JiraIssue;
  priority: Priority;
  impact: Impact;
  estimate: Estimate;
  workTrack: WorkTrack;
  reasoning: string[];
  okrMatch: OKRMatch | null;
  labels: string[];
}
