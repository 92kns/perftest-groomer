import type { JiraIssue } from './types';

declare const Papa: {
  parse: (
    input: string,
    config: {
      header: boolean;
      skipEmptyLines: boolean;
      complete: (results: { data: Record<string, string>[] }) => void;
    }
  ) => void;
};

export function parseCSV(csvContent: string): Promise<JiraIssue[]> {
  return new Promise((resolve) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const issues: JiraIssue[] = results.data
          .map((row: Record<string, string>) => ({
            key: row['Issue key'] || '',
            summary: row['Summary'] || '',
            type: row['Issue Type'] || 'Task',
            status: row['Status'] || '',
            components: row['Components'] || '',
            labels: row['Labels'] || '',
            description: row['Description'] || '',
            currentPriority: row['Priority'] || '',
            currentEstimate: row['Original estimate'] || '',
            currentImpact: row['Custom field (Estimated Impact)'] || '',
          }))
          .filter((issue) => issue.key);

        resolve(issues);
      },
    });
  });
}
