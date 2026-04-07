export function renderSuppliers(container) {
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
                <p class="spec-loading-status" id="suppliers-status">Finding suppliers for your product...</p>
                <p class="spec-loading-hint">This usually takes 8–12 seconds</p>
            </div>
        </div>
    `;

    const specSummary = buildSpecSummary(state.productSpec);

    const supplierStatuses = [
        "Finding suppliers for your product...",
        "Searching manufacturer databases...",
        "Evaluating sourcing options...",
        "Preparing your results...",
    ];
    let supplierStatusIdx = 0;
    const statusEl = container.querySelector('#suppliers-status');
    const intervalId = setInterval(() => {
        supplierStatusIdx = (supplierStatusIdx + 1) % supplierStatuses.length;
        if (statusEl) statusEl.textContent = supplierStatuses[supplierStatusIdx];
    }, 3000);

    window.apiFetch("/api/suppliers", {
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
            renderSuppliersContent(container, data);
        })
        .catch((err) => {
            clearInterval(intervalId);
            container.innerHTML = `
                <div class="screen">
                    <h1 class="screen-title">Something went wrong</h1>
                    <p class="screen-subtitle">${err.message}</p>
                    <button class="btn-secondary" onclick="window.location.hash='#economics'">
                        &larr; Back to Economics
                    </button>
                </div>
            `;
        });
}

function buildSpecSummary(spec) {
    const features = spec.required_features.map((f) => f.feature).join(", ");
    return `${spec.product_title}. Required features: ${features}. Target price: $${spec.target_price_min.toFixed(2)}-$${spec.target_price_max.toFixed(2)}. Max unit cost: $${spec.target_unit_cost_max.toFixed(2)}.`;
}

function renderSuppliersContent(container, data) {
    container.innerHTML = `
        <div class="screen suppliers-screen">
            <div class="suppliers-header">
                <button class="btn-back" onclick="window.location.hash='#economics'">
                    &larr; Back
                </button>
                <h1 class="screen-title">Supplier Search</h1>
            </div>

            <p class="section-desc" style="margin-bottom: 24px;">Search queries generated for your product spec. Click to search Alibaba.</p>

            <div class="supplier-grid">
                ${data.queries
                    .map(
                        (q) => `
                    <div class="supplier-card card">
                        <div class="supplier-card-header">
                            <h3 class="supplier-search-term">${q.search_term}</h3>
                        </div>
                        <p class="supplier-explanation">${q.explanation}</p>
                        <div class="supplier-meta">
                            <span class="supplier-meta-item">
                                <span class="supplier-meta-label">EST. MOQ</span>
                                <span class="supplier-meta-value">${q.estimated_moq}</span>
                            </span>
                            <span class="supplier-meta-item">
                                <span class="supplier-meta-label">PRICE RANGE</span>
                                <span class="supplier-meta-value">${q.estimated_price_range}</span>
                            </span>
                        </div>
                        <a href="${q.alibaba_url}" target="_blank" rel="noopener" class="btn-primary btn-alibaba">
                            Search Alibaba &rarr;
                        </a>
                    </div>
                `
                    )
                    .join("")}
            </div>

            <!-- Footer Nav -->
            <div class="suppliers-footer">
                <button class="btn-secondary" onclick="window.location.hash='#economics'">
                    &larr; Back to Economics
                </button>
                <button class="btn-primary" onclick="window.location.hash='#launch'">
                    Launch Plan &rarr;
                </button>
            </div>
        </div>
    `;
}
