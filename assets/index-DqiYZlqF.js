(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const d of n.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function i(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(s){if(s.ep)return;s.ep=!0;const n=i(s);fetch(s.href,n)}})();function I(e){return new Promise(t=>{Papa.parse(e,{header:!0,skipEmptyLines:!0,complete:i=>{const r=i.data.map(s=>({key:s["Issue key"]||"",summary:s.Summary||"",type:s["Issue Type"]||"Task",status:s.Status||"",components:s.Components||"",labels:s.Labels||"",description:s.Description||"",currentPriority:s.Priority||"",currentEstimate:s["Original estimate"]||"",currentImpact:s["Custom field (Estimated Impact)"]||""})).filter(s=>s.key);t(r)}})})}const E={"Mobile Startup":[/startup/i,/applink/i,/app.?link/i,/android.*launch/i,/cold.?start/i,/warm.?start/i],"Browser Responsiveness":[/speedometer/i,/jetstream/i,/input.?latency/i,/responsiveness/i,/jank/i,/frame.?rate/i],"Perceived Performance":[/lcp/i,/largest.?contentful/i,/prerender/i,/prefetch/i,/navigation.?speed/i,/page.?load/i,/fcp/i,/first.?contentful/i],"Adaptive Performance":[/battery/i,/power/i,/adaptive/i,/hardware.?pref/i]};function f(e){for(const[t,i]of Object.entries(E))for(const r of i)if(r.test(e))return{okr:t,confidence:.8};return null}const $=[e=>{const t=/intermittent|perma|flaky|sporadic/i.test(e.summaryLower+e.descriptionLower),i=/ci|test.?failure|failure.?in/i.test(e.summaryLower+e.descriptionLower);return t||e.isBug&&i?{priority:"P1",impact:"High",workTrack:"Operational",estimate:"1w",reasoning:"Intermittent/perma test failure - highest priority due to CI usage",labels:["perf-ci"]}:null},e=>{const t=/chrome|safari|chromium|webkit/i.test(e.summaryLower+e.descriptionLower),i=/intermittent|perma|flaky/i.test(e.summaryLower);return t?i?{priority:"P1",impact:"High",workTrack:"Operational",estimate:"1w",reasoning:"External browser intermittent - Operational due to CI usage"}:{priority:"P4",impact:"Low",workTrack:"Vision",estimate:"2w",reasoning:"External browser task - Vision by default, lower priority"}:null},e=>e.isBug&&/slow|performance|latency|timeout|hang/i.test(e.summaryLower)?{priority:"P2",impact:"Medium",workTrack:"Operational",estimate:"1w",reasoning:"Performance bug - dev-pain, Operational"}:null,e=>e.isBug&&/button|display|ui|view|window|show|hidden|close/i.test(e.summaryLower)?{priority:"P3",impact:"Low",workTrack:"Operational",estimate:"3d",reasoning:"UI bug - minor dev-pain"}:null,e=>{if(e.isMeta){const t=f(e.summaryLower+e.descriptionLower);return{priority:t?"P2":"P3",impact:t?"High":"Medium",workTrack:"Vision",estimate:"4w",reasoning:"Meta bug - tracking issue for larger effort",...t&&{okrMatch:t}}}return null},e=>{const t=/sheriff|backfill|alert|triage/i.test(e.summaryLower+e.descriptionLower),i=/automat|bot|mirror/i.test(e.summaryLower+e.descriptionLower);return t||i?{priority:"P2",impact:"High",workTrack:"Operational",estimate:"2w",reasoning:"Sheriffing/automation - improves operational efficiency"}:null},e=>/doc|perfdoc|readme|guide/i.test(e.summaryLower+e.descriptionLower)?{priority:"P4",impact:"Medium",workTrack:"Vision",estimate:"1w",reasoning:"Documentation task",labels:["documentation"]}:null,e=>{const t=/remove|cleanup|clean.?up|deprecate|obsolete/i.test(e.summaryLower),i=e.descriptionLower.length<200;return t&&i?{priority:"P4",impact:"Low",workTrack:"Vision",estimate:"1d",reasoning:"Quick cleanup task"}:null},e=>e.components.includes("Perfherder")&&!e.isBug?{priority:"P3",impact:"Medium",workTrack:"Vision",estimate:"2w",reasoning:"Perfherder tooling improvement"}:null,e=>/raptor|browsertime|mozperftest|xpcshell/i.test(e.summaryLower+e.components)&&!e.isBug?{priority:"P3",impact:"Medium",workTrack:"Vision",estimate:"2w",reasoning:"Testing infrastructure improvement",labels:["testing"]}:null,e=>{const t=f(e.summaryLower+e.descriptionLower);return t?{priority:"P3",impact:"High",workTrack:"Vision",estimate:"2w",reasoning:`Supports ${t.okr} OKR`,okrMatch:t}:null}],c={priority:"P4",impact:"Low",workTrack:"Vision",estimate:"1w",reasoning:"Default classification - needs manual review"};function O(e){var p;const t=[];for(const o of $){const a=o(e);a&&t.push(a)}if(t.length===0)return c;const i=["P1","P2","P3","P4"],s=t.map(o=>o.priority).filter(Boolean).sort((o,a)=>i.indexOf(o)-i.indexOf(a))[0]||c.priority,n=["High","Medium","Low"],w=t.map(o=>o.impact).filter(Boolean).sort((o,a)=>n.indexOf(o)-n.indexOf(a))[0]||c.impact,u=t.map(o=>o.workTrack).filter(Boolean),h=u.includes("Operational")?"Operational":u[0]||c.workTrack,P=t.map(o=>o.estimate).filter(Boolean)[0]||c.estimate,L=t.map(o=>o.reasoning).join("; "),b=(p=t.find(o=>o.okrMatch))==null?void 0:p.okrMatch,T=[...new Set(t.flatMap(o=>o.labels||[]))];return{priority:s,impact:w,workTrack:h,estimate:P,reasoning:L,okrMatch:b,labels:T}}function B(e){const t={summary:e.summary,summaryLower:e.summary.toLowerCase(),description:e.description,descriptionLower:e.description.toLowerCase(),type:e.type,components:e.components,labels:e.labels,isMeta:e.summary.toLowerCase().includes("[meta]"),isBug:e.type.toLowerCase()==="bug"},i=O(t);return{issue:e,priority:i.priority,impact:i.impact,estimate:i.estimate,workTrack:i.workTrack,reasoning:[i.reasoning],okrMatch:i.okrMatch||null,labels:i.labels||[]}}function M(e){return e.map(B)}let l=[];function C(){const e=document.getElementById("uploadArea"),t=document.getElementById("fileInput"),i=document.getElementById("uploadBtn");i.addEventListener("click",()=>t.click()),e.addEventListener("click",r=>{r.target!==i&&t.click()}),e.addEventListener("dragover",r=>{r.preventDefault(),e.classList.add("dragover")}),e.addEventListener("dragleave",()=>{e.classList.remove("dragover")}),e.addEventListener("drop",r=>{var n;r.preventDefault(),e.classList.remove("dragover");const s=(n=r.dataTransfer)==null?void 0:n.files;s!=null&&s.length&&y(s[0])}),t.addEventListener("change",()=>{var r;(r=t.files)!=null&&r.length&&y(t.files[0])})}async function y(e){const t=await e.text(),i=await I(t);l=M(i),S(l)}function S(e){document.getElementById("results").classList.remove("hidden"),j(e),R(e),V()}function j(e){const t=document.getElementById("stats"),i={P1:0,P2:0,P3:0,P4:0};e.forEach(r=>i[r.priority]++),t.innerHTML=`
    <div class="stat-card">
      <div class="label">Total Issues</div>
      <div class="value">${e.length}</div>
    </div>
    <div class="stat-card p1">
      <div class="label">P1</div>
      <div class="value">${i.P1}</div>
    </div>
    <div class="stat-card p2">
      <div class="label">P2</div>
      <div class="value">${i.P2}</div>
    </div>
    <div class="stat-card p3">
      <div class="label">P3</div>
      <div class="value">${i.P3}</div>
    </div>
    <div class="stat-card p4">
      <div class="label">P4</div>
      <div class="value">${i.P4}</div>
    </div>
    <div class="stat-card">
      <div class="label">Operational</div>
      <div class="value">${e.filter(r=>r.workTrack==="Operational").length}</div>
    </div>
    <div class="stat-card">
      <div class="label">Vision</div>
      <div class="value">${e.filter(r=>r.workTrack==="Vision").length}</div>
    </div>
  `}function R(e){const t=document.getElementById("issuesBody"),i=[...e].sort((r,s)=>{const n=["P1","P2","P3","P4"];return n.indexOf(r.priority)-n.indexOf(s.priority)});t.innerHTML=i.map(r=>`
    <tr>
      <td>
        <a href="https://mozilla-hub.atlassian.net/browse/${r.issue.key}" target="_blank" class="issue-key">${r.issue.key}</a>
      </td>
      <td class="issue-summary">
        ${v(r.issue.summary)}
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
        <div class="reasoning">${v(r.reasoning.join("; "))}</div>
        ${r.okrMatch?`<div class="okr-tag">${r.okrMatch.okr}</div>`:""}
        ${r.labels.length?`<div style="margin-top: 0.25rem">${r.labels.map(s=>`<span class="okr-tag">${s}</span>`).join(" ")}</div>`:""}
      </td>
    </tr>
  `).join("")}function V(){document.getElementById("exportCsv").onclick=()=>g("CSV",H()),document.getElementById("exportMarkdown").onclick=()=>g("Markdown",k()),document.getElementById("copyTable").onclick=()=>{navigator.clipboard.writeText(k()),alert("Table copied to clipboard!")},document.getElementById("closeModal").onclick=()=>{document.getElementById("exportModal").classList.add("hidden")}}function g(e,t){document.getElementById("modalTitle").textContent=`Export ${e}`,document.getElementById("exportContent").value=t,document.getElementById("exportModal").classList.remove("hidden")}function H(){const e=["Issue Key","Summary","Priority","Impact","Estimate","Work Track","OKR","Labels","Reasoning"],t=l.map(i=>{var r;return[i.issue.key,`"${i.issue.summary.replace(/"/g,'""')}"`,i.priority,i.impact,i.estimate,i.workTrack,((r=i.okrMatch)==null?void 0:r.okr)||"",i.labels.join("; "),`"${i.reasoning.join("; ").replace(/"/g,'""')}"`]});return[e.join(","),...t.map(i=>i.join(","))].join(`
`)}function k(){const e=[...l].sort((i,r)=>{const s=["P1","P2","P3","P4"];return s.indexOf(i.priority)-s.indexOf(r.priority)});let t=`# PerfTest Grooming Results

`;t+=`Total: ${l.length} issues

`,t+=`| Issue | Summary | Priority | Impact | Estimate | Work Track | Reasoning |
`,t+=`|-------|---------|----------|--------|----------|------------|----------|
`;for(const i of e){const r=i.issue.summary.length>50?i.issue.summary.slice(0,50)+"...":i.issue.summary,s=i.reasoning.join("; ").slice(0,50);t+=`| ${i.issue.key} | ${r} | ${i.priority} | ${i.impact} | ${i.estimate} | ${i.workTrack} | ${s} |
`}return t}function v(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const m=document.createElement("script");m.src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js";m.onload=()=>{C()};document.head.appendChild(m);
