export function renderSpec(container) {
    const state = window.launchLensState;

    if (!state.categoryId) {
        window.location.hash = "#categories";
        return;
    }

    let cancelled = false;

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
                <p class="spec-loading-status" id="spec-status">Analyzing market data...</p>
                <p class="spec-loading-hint">This usually takes 8–12 seconds</p>
                <button class="btn-secondary spec-cancel-btn" id="spec-cancel-btn">&larr; Back to Deep Dive</button>
            </div>
        </div>
    `;

    document.getElementById('spec-cancel-btn').addEventListener('click', () => {
        cancelled = true;
        window.location.hash = `#deep-dive/${state.categoryId}`;
    });

    const statuses = [
        "Analyzing market data...",
        "Extracting review insights...",
        "Identifying product opportunities...",
        "Writing your spec brief...",
    ];
    let statusIdx = 0;
    const statusEl = container.querySelector('#spec-status');
    const intervalId = setInterval(() => {
        statusIdx = (statusIdx + 1) % statuses.length;
        if (statusEl) statusEl.textContent = statuses[statusIdx];
    }, 3000);

    window.apiFetch("/api/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            category_id: state.categoryId,
            budget: state.budget,
        }),
    })
        .then((res) => {
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            return res.json();
        })
        .then((data) => {
            clearInterval(intervalId);
            if (cancelled) return;
            state.productSpec = data.spec;
            state.categoryName = data.category_name;
            renderSpecContent(container, data);
        })
        .catch((err) => {
            clearInterval(intervalId);
            container.innerHTML = `
                <div class="screen">
                    <h1 class="screen-title">Something went wrong</h1>
                    <p class="screen-subtitle">${err.message}</p>
                    <button class="btn-secondary" onclick="window.location.hash='#deep-dive/${state.categoryId}'">
                        &larr; Back to Deep Dive
                    </button>
                </div>
            `;
        });
}

// ── Priority label by position (first items most important) ──────────────────
const PRIORITY_LABELS = ['Critical', 'High', 'High', 'Medium', 'Medium', 'Standard'];

function priorityLabel(index) {
    return PRIORITY_LABELS[Math.min(index, PRIORITY_LABELS.length - 1)];
}

// ── Per-type implementation tip shown in expanded card ───────────────────────
function expandedTip(type, name) {
    if (type === 'required') {
        return `<span class="spec-tip-label">Manufacturer note</span>
                <p class="spec-tip-text">"${name}" is non-negotiable. Add it explicitly to your product brief, sample checklist, and QC inspection form.</p>`;
    }
    if (type === 'avoid') {
        return `<span class="spec-tip-label">RFQ note</span>
                <p class="spec-tip-text">List "${name}" as out-of-scope in your supplier RFQ to prevent cost overruns and off-spec samples.</p>`;
    }
    return `<span class="spec-tip-label">Listing strategy</span>
            <p class="spec-tip-text">Highlight "${name}" in your title, first bullet point, and A+ content — this is your primary competitive hook.</p>`;
}

// ── Feature card HTML ────────────────────────────────────────────────────────
function featureCardHTML(name, rationale, type, index) {
    const colorClass =
        type === 'required' ? 'spec-feature-required' :
        type === 'avoid'    ? 'spec-feature-avoid'    :
                              'spec-feature-diff';

    return `
        <div class="spec-feature-card card ${colorClass}" tabindex="0" role="button" aria-expanded="false">
            <div class="spec-feature-header">
                <span class="spec-feature-name">${name}</span>
                <div class="spec-feature-meta">
                    <span class="spec-feature-priority">${priorityLabel(index)}</span>
                    <span class="spec-feature-chevron">›</span>
                </div>
            </div>
            <p class="spec-feature-rationale">${rationale}</p>
            <div class="spec-feature-expanded">
                ${expandedTip(type, name)}
            </div>
        </div>`;
}

// ── Main render ──────────────────────────────────────────────────────────────
function renderSpecContent(container, data) {
    const spec = data.spec;
    const categoryId = data.category_id;

    const requiredCards = spec.required_features
        .map((f, i) => featureCardHTML(f.feature, f.rationale, 'required', i))
        .join('');

    const avoidCards = spec.features_to_avoid
        .map((f, i) => featureCardHTML(f.feature, f.rationale, 'avoid', i))
        .join('');

    const diffCards = spec.key_differentiators
        .map((d, i) => featureCardHTML(d.differentiator, d.reasoning, 'diff', i))
        .join('');

    container.innerHTML = `
        <div class="screen spec-screen">

            <!-- ── Header ─────────────────────────────────────────── -->
            <div class="spec-header spec-reveal">
                <button class="btn-back" onclick="window.location.hash='#deep-dive/${categoryId}'">&larr; Back</button>
                <div class="spec-title-group">
                    <h1 class="screen-title">${spec.product_title}</h1>
                    <span class="spec-category">${data.category_name}</span>
                </div>
                <button class="btn-primary spec-econ-top-btn" onclick="window.location.hash='#economics'">
                    Unit Economics &rarr;
                </button>
            </div>

            <!-- ── Ideal Product (hero card) ──────────────────────── -->
            <div class="spec-section card spec-reveal">
                <h2 class="section-heading">Ideal Product</h2>
                <p class="spec-narrative">${spec.ideal_product_description}</p>
                <div class="spec-scroll-hint">
                    <span class="scroll-hint-arrow">↓</span>
                    <span class="scroll-hint-text">Scroll to see pricing, features &amp; differentiators</span>
                </div>
            </div>

            <!-- ── Pricing Targets ─────────────────────────────────── -->
            <div class="spec-section card spec-reveal">
                <h2 class="section-heading">Pricing Targets</h2>
                <div class="spec-price-grid">
                    <div class="spec-price-item">
                        <span class="spec-price-label">SELL PRICE RANGE</span>
                        <span class="spec-price-value">$${spec.target_price_min.toFixed(2)} &ndash; $${spec.target_price_max.toFixed(2)}</span>
                    </div>
                    <div class="spec-price-item">
                        <span class="spec-price-label">MAX UNIT COST</span>
                        <span class="spec-price-value">$${spec.target_unit_cost_max.toFixed(2)}</span>
                    </div>
                    <div class="spec-price-item">
                        <span class="spec-price-label">TARGET RATING</span>
                        <span class="spec-price-value">${spec.target_rating.toFixed(1)} &#9733;</span>
                    </div>
                    <div class="spec-price-item">
                        <span class="spec-price-label">EST. MONTHLY UNITS</span>
                        <span class="spec-price-value">${spec.estimated_monthly_units.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <!-- ── Required Features ──────────────────────────────── -->
            <div class="spec-section spec-reveal">
                <h2 class="section-heading">Required Features</h2>
                <p class="section-desc">Must-haves based on buyer expectations — click any card for implementation notes</p>
                <div class="spec-features-grid">${requiredCards}</div>
            </div>

            <!-- ── Features to Avoid ──────────────────────────────── -->
            <div class="spec-section spec-reveal">
                <h2 class="section-heading">Features to Avoid</h2>
                <p class="section-desc">These hurt reviews or add cost without value — click to see RFQ guidance</p>
                <div class="spec-features-grid">${avoidCards}</div>
            </div>

            <!-- ── Key Differentiators ────────────────────────────── -->
            <div class="spec-section spec-reveal">
                <h2 class="section-heading">Key Differentiators</h2>
                <p class="section-desc">What will set your product apart — click to see listing strategy</p>
                <div class="spec-features-grid">${diffCards}</div>
            </div>

            <!-- ── Packaging Notes ────────────────────────────────── -->
            ${spec.packaging_notes ? `
            <div class="spec-section card spec-reveal">
                <h2 class="section-heading">Packaging Notes</h2>
                <p class="spec-narrative">${spec.packaging_notes}</p>
            </div>` : ''}

            <!-- ── Actions ────────────────────────────────────────── -->
            <div class="spec-copy-wrap spec-reveal">
                <button class="btn-secondary btn-copy" id="copy-spec-btn">Copy Spec to Clipboard</button>
            </div>

            <!-- ── Footer ─────────────────────────────────────────── -->
            <div class="spec-footer spec-reveal">
                <button class="btn-secondary" onclick="window.location.hash='#deep-dive/${categoryId}'">&larr; Back to Deep Dive</button>
                <button class="btn-primary" onclick="window.location.hash='#economics'">Unit Economics &rarr;</button>
            </div>
        </div>
    `;

    // ── Progressive reveal (stagger each section in) ─────────────────────────
    const revealEls = container.querySelectorAll('.spec-reveal');
    revealEls.forEach((el, i) => {
        setTimeout(() => el.classList.add('spec-revealed'), i * 110);
    });

    // ── Feature card expand / collapse ───────────────────────────────────────
    container.querySelectorAll('.spec-feature-card').forEach((card) => {
        const toggle = () => {
            const expanded = card.classList.toggle('expanded');
            card.setAttribute('aria-expanded', expanded);
        };
        card.addEventListener('click', toggle);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
    });

    // ── Copy spec to clipboard ───────────────────────────────────────────────
    document.getElementById('copy-spec-btn').addEventListener('click', () => {
        const text = formatSpecAsText(spec, data.category_name);
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copy-spec-btn');
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = 'Copy Spec to Clipboard';
                btn.classList.remove('copied');
            }, 2000);
        });
    });
}

function formatSpecAsText(spec, categoryName) {
    let text = `PRODUCT SPECIFICATION — ${spec.product_title}\n`;
    text += `Category: ${categoryName}\n\n`;
    text += `${spec.ideal_product_description}\n\n`;
    text += `PRICING TARGETS\n`;
    text += `  Sell Price: $${spec.target_price_min.toFixed(2)} – $${spec.target_price_max.toFixed(2)}\n`;
    text += `  Max Unit Cost: $${spec.target_unit_cost_max.toFixed(2)}\n`;
    text += `  Target Rating: ${spec.target_rating.toFixed(1)}\n`;
    text += `  Est. Monthly Units: ${spec.estimated_monthly_units}\n\n`;
    text += `REQUIRED FEATURES\n`;
    spec.required_features.forEach((f) => { text += `  - ${f.feature}: ${f.rationale}\n`; });
    text += `\nFEATURES TO AVOID\n`;
    spec.features_to_avoid.forEach((f) => { text += `  - ${f.feature}: ${f.rationale}\n`; });
    text += `\nKEY DIFFERENTIATORS\n`;
    spec.key_differentiators.forEach((d) => { text += `  - ${d.differentiator}: ${d.reasoning}\n`; });
    if (spec.packaging_notes) { text += `\nPACKAGING NOTES\n  ${spec.packaging_notes}\n`; }
    return text;
}
