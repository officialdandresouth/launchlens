export function renderLaunchPlan(container) {
    const state = window.launchLensState;

    if (!state.productSpec) {
        window.location.hash = "#spec";
        return;
    }

    container.innerHTML = `
        <div class="screen">
            <div class="spec-loading">
                <div class="spec-cube-wrap">
                    <div class="spec-cube">
                        <div class="spec-cube-face front"></div>
                        <div class="spec-cube-face back"></div>
                        <div class="spec-cube-face top"></div>
                        <div class="spec-cube-face bottom"></div>
                        <div class="spec-cube-face left"></div>
                        <div class="spec-cube-face right"></div>
                    </div>
                </div>
                <p class="spec-loading-status" id="launch-status">Building your personalized launch timeline...</p>
                <p class="spec-loading-hint">This usually takes 10–15 seconds</p>
            </div>
        </div>
    `;

    const specSummary = buildSpecSummary(state.productSpec);

    const launchStatuses = [
        "Building your personalized launch timeline...",
        "Calculating milestones and durations...",
        "Estimating costs for your budget...",
        "Writing your launch plan...",
    ];
    let launchStatusIdx = 0;
    const statusEl = container.querySelector('#launch-status');
    const intervalId = setInterval(() => {
        launchStatusIdx = (launchStatusIdx + 1) % launchStatuses.length;
        if (statusEl) statusEl.textContent = launchStatuses[launchStatusIdx];
    }, 3000);

    window.apiFetch("/api/launch-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            category_id: state.categoryId,
            budget: state.budget,
            product_spec_summary: specSummary,
        }),
    }, () => { if (statusEl) statusEl.textContent = "Server waking up, retrying..."; })
        .then((res) => {
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            return res.json();
        })
        .then((data) => {
            clearInterval(intervalId);
            renderLaunchContent(container, data);
        })
        .catch((err) => {
            clearInterval(intervalId);
            container.innerHTML = `
                <div class="screen">
                    <h1 class="screen-title">Something went wrong</h1>
                    <p class="screen-subtitle">${err.message}</p>
                    <button class="btn-secondary" onclick="window.location.hash='#suppliers'">
                        &larr; Back to Suppliers
                    </button>
                </div>
            `;
        });
}

function buildSpecSummary(spec) {
    const features = spec.required_features.map((f) => f.feature).join(", ");
    return `${spec.product_title}. Required features: ${features}. Target price: $${spec.target_price_min.toFixed(2)}-$${spec.target_price_max.toFixed(2)}.`;
}

function formatDate(isoDate) {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function renderLaunchContent(container, data) {
    const state = window.launchLensState;

    container.innerHTML = `
        <div class="screen launch-screen">
            <div class="launch-header">
                <button class="btn-back" onclick="window.location.hash='#suppliers'">&larr; Back</button>
                <div class="launch-title-group">
                    <h1 class="screen-title">Your Launch Plan</h1>
                    <span class="launch-timeline-badge">${data.total_timeline_weeks} weeks total</span>
                </div>
                <button class="btn-primary launch-download-btn" id="launch-download-btn">
                    &#8681; Download Plan
                </button>
            </div>

            <!-- Timeline -->
            <div class="timeline">
                ${data.milestones.map((m) => `
                    <div class="milestone">
                        <div class="milestone-dot"></div>
                        <div class="milestone-content">
                            <div class="milestone-header">
                                <span class="milestone-step">Step ${m.step_number}</span>
                                <span class="milestone-date">${formatDate(m.target_date)}</span>
                            </div>
                            <h3 class="milestone-title">${m.title}</h3>
                            <p class="milestone-desc">${m.description}</p>
                            ${m.duration_days ? `<span class="milestone-duration">${m.duration_days} days</span>` : ""}
                            ${m.cost_estimate ? `<span class="milestone-cost">${m.cost_estimate}</span>` : ""}
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Common Mistakes -->
            ${data.common_mistakes && data.common_mistakes.length > 0 ? `
            <div class="launch-section">
                <h2 class="section-heading">Common Mistakes to Avoid</h2>
                <div class="mistakes-grid">
                    ${data.common_mistakes.map((m) => `
                        <div class="mistake-card card">
                            <span class="mistake-label">${m.mistake}</span>
                            <p class="mistake-fix">${m.how_to_avoid}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
            ` : ""}

            <!-- Footer Nav -->
            <div class="launch-footer">
                <button class="btn-secondary" onclick="window.location.hash='#suppliers'">&larr; Back to Suppliers</button>
                <button class="btn-primary" onclick="window.location.hash='#budget'">Start Over</button>
            </div>
        </div>
    `;

    document.getElementById('launch-download-btn').addEventListener('click', () => {
        downloadLaunchPlan(data, state);
    });
}

// ── Download as a self-contained styled HTML file ────────────────────────────
function downloadLaunchPlan(data, state) {
    const productTitle = state.productSpec?.product_title || data.category_name || 'Product';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const milestonesHTML = data.milestones.map((m) => `
        <div class="milestone">
            <div class="milestone-dot"></div>
            <div class="milestone-content">
                <div class="milestone-meta">
                    <span class="step-badge">Step ${m.step_number}</span>
                    <span class="date">${formatDate(m.target_date)}</span>
                    ${m.duration_days ? `<span class="duration">${m.duration_days} days</span>` : ''}
                    ${m.cost_estimate ? `<span class="cost">${m.cost_estimate}</span>` : ''}
                </div>
                <h3>${escHtml(m.title)}</h3>
                <p>${escHtml(m.description)}</p>
            </div>
        </div>
    `).join('');

    const mistakesHTML = (data.common_mistakes || []).map((m) => `
        <div class="mistake">
            <div class="mistake-title">⚠ ${escHtml(m.mistake)}</div>
            <div class="mistake-fix">${escHtml(m.how_to_avoid)}</div>
        </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Launch Plan — ${escHtml(productTitle)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d1117; color: #e6edf3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 48px 24px; }
  .wrapper { max-width: 780px; margin: 0 auto; }

  .doc-header { margin-bottom: 48px; padding-bottom: 28px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .doc-brand { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #22c55e; margin-bottom: 16px; }
  .doc-title { font-size: 2rem; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
  .doc-sub { font-size: 0.88rem; color: #8b949e; }
  .doc-sub span { margin-right: 20px; }
  .timeline-badge { display: inline-block; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); color: #22c55e; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-top: 12px; }

  h2 { font-size: 1rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #fff; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.07); }

  /* Timeline */
  .timeline { position: relative; padding-left: 32px; margin-bottom: 48px; }
  .timeline::before { content: ''; position: absolute; left: 10px; top: 0; bottom: 0; width: 1px; background: rgba(34,197,94,0.25); }
  .milestone { position: relative; margin-bottom: 32px; }
  .milestone-dot { position: absolute; left: -27px; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; border: 2px solid #0d1117; box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
  .milestone-content { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 20px 22px; }
  .milestone-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
  .step-badge { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; color: #8b949e; }
  .date { font-size: 0.8rem; color: #22c55e; font-weight: 600; }
  .duration { font-size: 0.75rem; color: #8b949e; background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 4px; }
  .cost { font-size: 0.75rem; color: #f0a500; background: rgba(240,165,0,0.08); border: 1px solid rgba(240,165,0,0.2); padding: 2px 8px; border-radius: 4px; font-weight: 600; }
  .milestone-content h3 { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 8px; }
  .milestone-content p { font-size: 0.85rem; color: #8b949e; line-height: 1.7; }

  /* Mistakes */
  .mistakes { margin-bottom: 48px; }
  .mistake { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-left: 3px solid #f85149; border-radius: 8px; padding: 16px 18px; margin-bottom: 12px; }
  .mistake-title { font-size: 0.88rem; font-weight: 600; color: #f85149; margin-bottom: 6px; }
  .mistake-fix { font-size: 0.82rem; color: #8b949e; line-height: 1.65; }

  .doc-footer { padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.07); font-size: 0.72rem; color: #8b949e; }

  @media print {
    body { background: #fff; color: #000; }
    .milestone-content, .mistake { border-color: #ccc; background: #f9f9f9; }
    .doc-title, .milestone-content h3 { color: #000; }
    .doc-sub, .milestone-content p, .mistake-fix { color: #444; }
    .timeline-badge { background: #e6ffe6; color: #1a7a1a; }
  }
</style>
</head>
<body>
<div class="wrapper">

  <div class="doc-header">
    <div class="doc-brand">LaunchLens — Amazon FBA Research</div>
    <h1 class="doc-title">${escHtml(productTitle)}</h1>
    <div class="doc-sub">
      <span>Category: ${escHtml(data.category_name)}</span>
      <span>Budget: $${Number(data.budget).toLocaleString()}</span>
      <span>Generated: ${today}</span>
    </div>
    <div class="timeline-badge">${data.total_timeline_weeks} weeks total</div>
  </div>

  <h2>Launch Timeline</h2>
  <div class="timeline">${milestonesHTML}</div>

  ${mistakesHTML ? `
  <div class="mistakes">
    <h2>Common Mistakes to Avoid</h2>
    ${mistakesHTML}
  </div>` : ''}

  <div class="doc-footer">
    Generated by LaunchLens &nbsp;·&nbsp; launchlens.onrender.com &nbsp;·&nbsp; ${today}
  </div>

</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LaunchLens_Plan_${(productTitle).replace(/\s+/g, '_').slice(0, 40)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Button feedback
    const btn = document.getElementById('launch-download-btn');
    if (btn) {
        btn.textContent = '✓ Downloaded';
        btn.style.background = 'rgba(34,197,94,0.15)';
        setTimeout(() => {
            btn.innerHTML = '&#8681; Download Plan';
            btn.style.background = '';
        }, 2500);
    }
}

function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
