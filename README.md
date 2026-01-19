# PerfTest Groomer

A rule-based issue classification tool for Firefox Performance testing. Runs entirely in the browser - no backend required.

## Features

- Upload Jira CSV exports
- Automatic classification based on grooming rules:
  - Priority (P1/P2/P3/P4)
  - Impact (High/Medium/Low)
  - Estimate (1d to 4w)
  - Work Track (Operational/Vision)
  - OKR alignment detection
- Export results as CSV or Markdown
- Hosted on GitHub Pages - no installation required

## Usage

1. Go to the [live app](https://92kns.github.io/perftest-groomer/) (update after deploying)
2. Export your issues from Jira as CSV
3. Drag and drop the CSV file (or click to upload)
4. Review the suggested grooming
5. Export results or copy to clipboard

## Local Development

```bash
cd perftest-groomer
npm install
npm run dev
```

## Deployment

```bash
npm run deploy
```

## Grooming Rules

The tool uses rule-based classification based on:

### Priority Rules

| Condition | Priority | Work Track |
|-----------|----------|------------|
| Intermittent/perma test failure | P1 | Operational |
| External browser intermittent | P1 | Operational |
| Performance/slowness bug | P2 | Operational |
| Sheriffing/automation task | P2 | Operational |
| OKR-aligned task | P3 | Vision |
| Meta bug | P3 | Vision |
| Tooling improvement | P3 | Vision |
| Documentation | P4 | Vision |
| Quick cleanup | P4 | Vision |
| External browser (non-intermittent) | P4 | Vision |

### OKR Detection

Automatically detects alignment with 2026 OKRs:
- **Mobile Startup**: startup, applink, cold start, warm start
- **Browser Responsiveness**: speedometer, jetstream, input latency
- **Perceived Performance**: LCP, prerender, prefetch, navigation speed
- **Adaptive Performance**: battery, power, adaptive

### Estimate Heuristics

- `1d`: Quick cleanup tasks
- `3d`: UI bugs, simple fixes
- `1w`: Standard tasks, investigations
- `2w`: Tooling improvements, moderate complexity
- `3w-4w`: Meta bugs, large efforts

## Customizing Rules

Edit `src/rules.ts` to modify the classification logic.
