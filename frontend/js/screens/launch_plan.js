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
    container.innerHTML = `
        <div class="screen launch-screen">
            <div class="launch-header">
                <button class="btn-back" onclick="window.location.hash='#suppliers'">
                    &larr; Back
                </button>
                <div class="launch-title-group">
                    <h1 class="screen-title">Your Launch Plan</h1>
                    <span class="launch-timeline-badge">${data.total_timeline_weeks} weeks total</span>
                </div>
            </div>

            <!-- Timeline -->
            <div class="timeline">
                ${data.milestones
                    .map(
                        (m) => `
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
                `
                    )
                    .join("")}
            </div>

            <!-- Common Mistakes -->
            ${data.common_mistakes && data.common_mistakes.length > 0 ? `
            <div class="launch-section">
                <h2 class="section-heading">Common Mistakes to Avoid</h2>
                <div class="mistakes-grid">
                    ${data.common_mistakes
                        .map(
                            (m) => `
                        <div class="mistake-card card">
                            <span class="mistake-label">${m.mistake}</span>
                            <p class="mistake-fix">${m.how_to_avoid}</p>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>
            ` : ""}

            <!-- Footer Nav -->
            <div class="launch-footer">
                <button class="btn-secondary" onclick="window.location.hash='#suppliers'">
                    &larr; Back to Suppliers
                </button>
                <button class="btn-primary" onclick="window.location.hash='#budget'">
                    Start Over
                </button>
            </div>
        </div>
    `;
}
