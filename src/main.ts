import { parseCSV } from './parser';
import { classifyIssues } from './classifier';
import type { GroomingResult, Priority } from './types';

let currentResults: GroomingResult[] = [];

function setupFileUpload() {
  const uploadArea = document.getElementById('uploadArea')!;
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const uploadBtn = document.getElementById('uploadBtn')!;

  uploadBtn.addEventListener('click', () => fileInput.click());

  uploadArea.addEventListener('click', (e) => {
    if (e.target !== uploadBtn) {
      fileInput.click();
    }
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer?.files;
    if (files?.length) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) {
      handleFile(fileInput.files[0]);
    }
  });
}

async function handleFile(file: File) {
  const content = await file.text();
  const issues = await parseCSV(content);
  currentResults = classifyIssues(issues);
  renderResults(currentResults);
}

function renderResults(results: GroomingResult[]) {
  document.getElementById('results')!.classList.remove('hidden');

  renderStats(results);
  renderTable(results);
  setupExportButtons();
}

function renderStats(results: GroomingResult[]) {
  const stats = document.getElementById('stats')!;
  const priorities: Record<Priority, number> = { P1: 0, P2: 0, P3: 0, P4: 0 };

  results.forEach((r) => priorities[r.priority]++);

  stats.innerHTML = `
    <div class="stat-card">
      <div class="label">Total Issues</div>
      <div class="value">${results.length}</div>
    </div>
    <div class="stat-card p1">
      <div class="label">P1</div>
      <div class="value">${priorities.P1}</div>
    </div>
    <div class="stat-card p2">
      <div class="label">P2</div>
      <div class="value">${priorities.P2}</div>
    </div>
    <div class="stat-card p3">
      <div class="label">P3</div>
      <div class="value">${priorities.P3}</div>
    </div>
    <div class="stat-card p4">
      <div class="label">P4</div>
      <div class="value">${priorities.P4}</div>
    </div>
    <div class="stat-card">
      <div class="label">Operational</div>
      <div class="value">${results.filter((r) => r.workTrack === 'Operational').length}</div>
    </div>
    <div class="stat-card">
      <div class="label">Vision</div>
      <div class="value">${results.filter((r) => r.workTrack === 'Vision').length}</div>
    </div>
  `;
}

function renderTable(results: GroomingResult[]) {
  const tbody = document.getElementById('issuesBody')!;

  const sortedResults = [...results].sort((a, b) => {
    const priorityOrder = ['P1', 'P2', 'P3', 'P4'];
    return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
  });

  tbody.innerHTML = sortedResults
    .map(
      (r) => `
    <tr>
      <td>
        <a href="https://mozilla-hub.atlassian.net/browse/${r.issue.key}" target="_blank" class="issue-key">${r.issue.key}</a>
      </td>
      <td class="issue-summary">
        ${escapeHtml(r.issue.summary)}
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
          ${r.issue.components}
        </div>
      </td>
      <td>
        <span class="priority-badge ${r.priority.toLowerCase()}">${r.priority}</span>
      </td>
      <td>
        <span class="impact-badge ${r.impact.toLowerCase()}">${r.impact}</span>
      </td>
      <td>${r.estimate}</td>
      <td>
        <span class="work-track ${r.workTrack.toLowerCase()}">${r.workTrack}</span>
      </td>
      <td>
        <div class="reasoning">${escapeHtml(r.reasoning.join('; '))}</div>
        ${r.okrMatch ? `<div class="okr-tag">${r.okrMatch.okr}</div>` : ''}
        ${r.labels.length ? `<div style="margin-top: 0.25rem">${r.labels.map((l) => `<span class="okr-tag">${l}</span>`).join(' ')}</div>` : ''}
      </td>
    </tr>
  `
    )
    .join('');
}

function setupExportButtons() {
  document.getElementById('exportCsv')!.onclick = () => showExport('CSV', generateCSV());
  document.getElementById('exportMarkdown')!.onclick = () =>
    showExport('Markdown', generateMarkdown());
  document.getElementById('copyTable')!.onclick = () => {
    navigator.clipboard.writeText(generateMarkdown());
    alert('Table copied to clipboard!');
  };

  document.getElementById('closeModal')!.onclick = () => {
    document.getElementById('exportModal')!.classList.add('hidden');
  };
}

function showExport(title: string, content: string) {
  document.getElementById('modalTitle')!.textContent = `Export ${title}`;
  (document.getElementById('exportContent') as HTMLTextAreaElement).value = content;
  document.getElementById('exportModal')!.classList.remove('hidden');
}

function generateCSV(): string {
  const headers = [
    'Issue Key',
    'Summary',
    'Priority',
    'Impact',
    'Estimate',
    'Work Track',
    'OKR',
    'Labels',
    'Reasoning',
  ];
  const rows = currentResults.map((r) => [
    r.issue.key,
    `"${r.issue.summary.replace(/"/g, '""')}"`,
    r.priority,
    r.impact,
    r.estimate,
    r.workTrack,
    r.okrMatch?.okr || '',
    r.labels.join('; '),
    `"${r.reasoning.join('; ').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function generateMarkdown(): string {
  const sortedResults = [...currentResults].sort((a, b) => {
    const priorityOrder = ['P1', 'P2', 'P3', 'P4'];
    return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
  });

  let md = '# PerfTest Grooming Results\n\n';
  md += `Total: ${currentResults.length} issues\n\n`;
  md += '| Issue | Summary | Priority | Impact | Estimate | Work Track | Reasoning |\n';
  md += '|-------|---------|----------|--------|----------|------------|----------|\n';

  for (const r of sortedResults) {
    const summary =
      r.issue.summary.length > 50 ? r.issue.summary.slice(0, 50) + '...' : r.issue.summary;
    const reasoning = r.reasoning.join('; ').slice(0, 50);
    md += `| ${r.issue.key} | ${summary} | ${r.priority} | ${r.impact} | ${r.estimate} | ${r.workTrack} | ${reasoning} |\n`;
  }

  return md;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Display build time
declare const __BUILD_TIME__: string;
const buildTimeEl = document.getElementById('buildTime');
if (buildTimeEl) {
  const buildDate = new Date(__BUILD_TIME__);
  buildTimeEl.textContent = buildDate.toISOString().replace('T', ' ').split('.')[0];
}

// Load PapaParse from CDN
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
script.onload = () => {
  setupFileUpload();
};
document.head.appendChild(script);
