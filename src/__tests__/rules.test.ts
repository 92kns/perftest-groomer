import { describe, it, expect } from 'vitest';
import { applyRules, type RuleContext } from '../rules';

describe('Rule Engine', () => {
  describe('Intermittent failures', () => {
    it('should classify intermittent test failures as P1', () => {
      const ctx: RuleContext = {
        summary: 'Intermittent test failure in raptor',
        summaryLower: 'intermittent test failure in raptor',
        description: 'Test fails sporadically',
        descriptionLower: 'test fails sporadically',
        type: 'Bug',
        components: 'Performance Testing',
        labels: '',
        isMeta: false,
        isBug: true,
      };

      const result = applyRules(ctx);

      expect(result.priority).toBe('P1');
      expect(result.workTrack).toBe('Operational');
      expect(result.impact).toBe('High');
    });

    it('should classify perma-orange as P1', () => {
      const ctx: RuleContext = {
        summary: 'Perma-orange in browsertime tests',
        summaryLower: 'perma-orange in browsertime tests',
        description: '',
        descriptionLower: '',
        type: 'Bug',
        components: '',
        labels: '',
        isMeta: false,
        isBug: true,
      };

      const result = applyRules(ctx);

      expect(result.priority).toBe('P1');
      expect(result.workTrack).toBe('Operational');
    });
  });

  describe('External browser tests', () => {
    it('should classify Chrome intermittent as P1', () => {
      const ctx: RuleContext = {
        summary: 'Intermittent Chrome test failure',
        summaryLower: 'intermittent chrome test failure',
        description: '',
        descriptionLower: '',
        type: 'Bug',
        components: '',
        labels: '',
        isMeta: false,
        isBug: true,
      };

      const result = applyRules(ctx);

      expect(result.priority).toBe('P1');
      expect(result.workTrack).toBe('Operational');
    });

    it('should classify non-intermittent Chrome task as P4', () => {
      const ctx: RuleContext = {
        summary: 'Add Chrome support for new test',
        summaryLower: 'add chrome support for new test',
        description: '',
        descriptionLower: '',
        type: 'Task',
        components: '',
        labels: '',
        isMeta: false,
        isBug: false,
      };

      const result = applyRules(ctx);

      expect(result.priority).toBe('P4');
      expect(result.workTrack).toBe('Vision');
    });
  });

  describe('Performance bugs', () => {
    it('should classify slowness bug as P2', () => {
      const ctx: RuleContext = {
        summary: 'Perfherder is slow to load',
        summaryLower: 'perfherder is slow to load',
        description: '',
        descriptionLower: '',
        type: 'Bug',
        components: 'Perfherder',
        labels: '',
        isMeta: false,
        isBug: true,
      };

      const result = applyRules(ctx);

      expect(result.priority).toBe('P2');
      expect(result.workTrack).toBe('Operational');
    });
  });

  describe('Meta bugs', () => {
    it('should classify meta bug with OKR match as P2', () => {
      const ctx: RuleContext = {
        summary: '[meta] Improve mobile startup performance',
        summaryLower: '[meta] improve mobile startup performance',
        description: 'Track all startup improvements',
        descriptionLower: 'track all startup improvements',
        type: 'Task',
        components: '',
        labels: '',
        isMeta: true,
        isBug: false,
      };

      const result = applyRules(ctx);

      expect(result.priority).toBe('P2');
      expect(result.workTrack).toBe('Vision');
      expect(result.okrMatch).toBeDefined();
      expect(result.okrMatch?.okr).toBe('Mobile Startup');
    });

    it('should classify meta bug without OKR as P3', () => {
      const ctx: RuleContext = {
        summary: '[meta] General improvements',
        summaryLower: '[meta] general improvements',
        description: '',
        descriptionLower: '',
        type: 'Task',
        components: '',
        labels: '',
        isMeta: true,
        isBug: false,
      };

      const result = applyRules(ctx);

      expect(result.priority).toBe('P3');
      expect(result.workTrack).toBe('Vision');
    });
  });

  describe('Documentation tasks', () => {
    it('should classify documentation as P4', () => {
      const ctx: RuleContext = {
        summary: 'Update perfdocs for new test',
        summaryLower: 'update perfdocs for new test',
        description: '',
        descriptionLower: '',
        type: 'Task',
        components: '',
        labels: '',
        isMeta: false,
        isBug: false,
      };

      const result = applyRules(ctx);

      expect(result.priority).toBe('P4');
      expect(result.workTrack).toBe('Vision');
      expect(result.labels).toContain('documentation');
    });
  });

  describe('OKR detection', () => {
    it('should detect Mobile Startup OKR', () => {
      const ctx: RuleContext = {
        summary: 'Improve cold start time on Android',
        summaryLower: 'improve cold start time on android',
        description: '',
        descriptionLower: '',
        type: 'Task',
        components: '',
        labels: '',
        isMeta: false,
        isBug: false,
      };

      const result = applyRules(ctx);

      expect(result.okrMatch).toBeDefined();
      expect(result.okrMatch?.okr).toBe('Mobile Startup');
    });

    it('should detect Browser Responsiveness OKR', () => {
      const ctx: RuleContext = {
        summary: 'Add Speedometer 3.0 test',
        summaryLower: 'add speedometer 3.0 test',
        description: '',
        descriptionLower: '',
        type: 'Task',
        components: '',
        labels: '',
        isMeta: false,
        isBug: false,
      };

      const result = applyRules(ctx);

      expect(result.okrMatch).toBeDefined();
      expect(result.okrMatch?.okr).toBe('Browser Responsiveness');
    });
  });

  describe('Default classification', () => {
    it('should use default P4 for unmatched issues', () => {
      const ctx: RuleContext = {
        summary: 'Some random task',
        summaryLower: 'some random task',
        description: '',
        descriptionLower: '',
        type: 'Task',
        components: '',
        labels: '',
        isMeta: false,
        isBug: false,
      };

      const result = applyRules(ctx);

      expect(result.priority).toBe('P4');
      expect(result.workTrack).toBe('Vision');
    });
  });
});
