function scoreColor(score) {
    if (score >= 75) return "score-green";
    if (score >= 50) return "score-yellow";
    return "score-red";
}

function priorityClass(priority) {
    if (priority === "high") return "priority-high";
    if (priority === "medium") return "priority-medium";
    return "priority-low";
}

function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + "…" : str;
}

function renderMarketSummary(summary) {
    return `
        <div class="market-summary card">
            <div class="market-stats">
                <div class="market-stat">
                    <span class="market-stat-label">PRICE RANGE</span>
                    <span class="market-stat-value">${summary.price_range}</span>
                </div>
                <div class="market-stat">
                    <span class="market-stat-label">AVG RATING</span>
                    <span class="market-stat-value">${summary.avg_rating.toFixed(1)} ★</span>
                </div>
                <div class="market-stat">
                    <span class="market-stat-label">PRODUCTS ANALYZED</span>
                    <span class="market-stat-value">${summary.total_products_analyzed}</span>
                </div>
            </div>
            <p class="market-insight">${summary.market_insight}</p>
        </div>
    `;
}

function renderFeatureBars(features) {
    const sorted = [...features].sort((a, b) => b.satisfaction_pct - a.satisfaction_pct);
    return `
        <div class="deep-dive-section">
            <h2 class="section-heading">Feature Satisfaction</h2>
            <p class="section-desc">How buyers rate products that advertise each feature</p>
            <div class="feature-bars">
                ${sorted
                    .map(
                        (f) => `
                    <div class="feature-bar-row">
                        <div class="feature-bar-info">
                            <span class="feature-bar-label">${f.feature_name}</span>
                            <span class="feature-bar-mentions">${f.mention_count} products</span>
                        </div>
                        <div class="feature-bar-track-wrap">
                            <div class="feature-bar-track">
                                <div class="feature-bar-fill ${scoreColor(f.satisfaction_pct)}" style="width: ${f.satisfaction_pct}%"></div>
                            </div>
                            <span class="feature-bar-value ${scoreColor(f.satisfaction_pct)}">${f.satisfaction_pct}%</span>
                        </div>
                        <p class="feature-insight">${f.insight}</p>
                    </div>
                `
                    )
                    .join("")}
            </div>
        </div>
    `;
}

function renderOpportunities(opportunities) {
    if (!opportunities || opportunities.length === 0) return "";
    return `
        <div class="deep-dive-section">
            <h2 class="section-heading">Opportunities</h2>
            <p class="section-desc">Gaps in the market a new seller could exploit</p>
            <div class="opportunity-grid">
                ${opportunities
                    .map(
                        (o) => `
                    <div class="opportunity-card ${priorityClass(o.priority)}">
                        <div class="opportunity-header">
                            <span class="opportunity-label">${o.opportunity}</span>
                            <span class="priority-badge ${priorityClass(o.priority)}">${o.priority}</span>
                        </div>
                        <p class="opportunity-reasoning">${o.reasoning}</p>
                    </div>
                `
                    )
                    .join("")}
            </div>
        </div>
    `;
}

function renderProductTable(products) {
    return `
        <div class="deep-dive-section">
            <h2 class="section-heading">Top Products</h2>
            <p class="section-desc">Ranked by estimated monthly revenue</p>
            <div class="product-table-wrap">
                <table class="product-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th>Reviews</th>
                            <th>Est. Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products
                            .map(
                                (p, i) => `
                            <tr>
                                <td class="product-rank">${i + 1}</td>
                                <td>
                                    <div class="product-name">${truncate(p.name, 60)}</div>
                                    <div class="product-features">
                                        ${p.key_features.map((f) => `<span class="feature-tag">${f}</span>`).join("")}
                                    </div>
                                </td>
                                <td>$${p.price.toFixed(2)}</td>
                                <td>${p.rating.toFixed(1)} ★</td>
                                <td>${p.reviews_count.toLocaleString()}</td>
                                <td class="revenue-estimate">$${p.estimated_monthly_revenue.toLocaleString()}/mo</td>
                            </tr>
                        `
                            )
                            .join("")}
                    </tbody>
                </table>
            </div>

            <!-- Mobile cards (hidden on desktop) -->
            <div class="product-cards-mobile">
                ${products
                    .map(
                        (p, i) => `
                    <div class="product-card-mobile card">
                        <div class="product-card-rank">#${i + 1}</div>
                        <div class="product-card-name">${truncate(p.name, 70)}</div>
                        <div class="product-card-stats">
                            <span>$${p.price.toFixed(2)}</span>
                            <span>${p.rating.toFixed(1)} ★</span>
                            <span>${p.reviews_count.toLocaleString()} reviews</span>
                        </div>
                        <div class="product-card-revenue revenue-estimate">$${p.estimated_monthly_revenue.toLocaleString()}/mo est.</div>
                        <div class="product-features">
                            ${p.key_features.map((f) => `<span class="feature-tag">${f}</span>`).join("")}
                        </div>
                    </div>
                `
                    )
                    .join("")}
            </div>
        </div>
    `;
}

const SCORE_LABELS = {
    gross_margin: "Gross Margin",
    demand_satisfaction_gap: "Demand Gap",
    revenue_concentration: "Low Concentration",
    capital_efficiency: "Capital Efficiency",
    barrier_to_entry: "Ease of Entry",
};

function renderScoreBreakdown(scores) {
    return Object.entries(SCORE_LABELS)
        .map(([key, label]) => {
            const val = scores[key];
            return `
                <div class="score-bar-row">
                    <span class="score-bar-label">${label}</span>
                    <div class="score-bar-track">
                        <div class="score-bar-fill ${scoreColor(val)}" style="width: ${val}%"></div>
                    </div>
                    <span class="score-bar-value">${val}</span>
                </div>
            `;
        })
        .join("");
}

function renderDeepDiveContent(container, data) {
    const cat = data.category;
    const compositeColor = scoreColor(data.scores.composite);

    container.innerHTML = `
        <div class="screen deep-dive-screen">
            <!-- Header -->
            <div class="deep-dive-header">
                <button class="btn-back" onclick="window.location.hash='#categories'">
                    &larr; Back
                </button>
                <div class="deep-dive-title-group">
                    <h1 class="screen-title">${cat.category_name}</h1>
                    <span class="category-parent">${data.category.category_id.replace(/-/g, " ")}</span>
                </div>
                <div class="composite-score ${compositeColor}">${data.scores.composite}</div>
            </div>

            <!-- Score breakdown -->
            <div class="deep-dive-scores card">
                <div class="score-bars">
                    ${renderScoreBreakdown(data.scores)}
                </div>
            </div>

            <!-- Market summary -->
            ${cat.market_summary ? renderMarketSummary(cat.market_summary) : ""}

            <!-- Feature satisfaction bars -->
            ${renderFeatureBars(cat.features)}

            <!-- Opportunities -->
            ${renderOpportunities(cat.opportunities)}

            <!-- Top products -->
            ${cat.top_products && cat.top_products.length > 0 ? renderProductTable(cat.top_products) : ""}

            <!-- Footer nav -->
            <div class="deep-dive-footer">
                <button class="btn-secondary" onclick="window.location.hash='#categories'">
                    &larr; Back to categories
                </button>
                <button class="btn-primary" onclick="window.location.hash='#spec'">
                    Select this category &rarr;
                </button>
            </div>
        </div>
    `;
}

export function renderDeepDive(container) {
    const state = window.launchLensState;
    const categoryId = window.location.hash.split("/")[1] || state.categoryId;

    if (!categoryId) {
        window.location.hash = "#categories";
        return;
    }

    state.categoryId = categoryId;

    container.innerHTML = `
        <div class="screen">
            <div class="loading">
                <div class="spinner"></div>
                <p>Analyzing category data...</p>
            </div>
        </div>
    `;

    fetch(`/api/category/${categoryId}?budget=${state.budget}`)
        .then((res) => {
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            return res.json();
        })
        .then((data) => renderDeepDiveContent(container, data))
        .catch((err) => {
            container.innerHTML = `
                <div class="screen">
                    <h1 class="screen-title">Something went wrong</h1>
                    <p class="screen-subtitle">${err.message}</p>
                    <button class="btn-secondary" onclick="window.location.hash='#categories'">
                        &larr; Back to categories
                    </button>
                </div>
            `;
        });
}
