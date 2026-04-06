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
            <p class="section-desc">Click any feature for deeper analysis</p>
            <div class="feature-bars">
                ${sorted
                    .map(
                        (f, i) => `
                    <div class="feature-bar-row feature-bar-clickable" data-feature-idx="${i}">
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
                        <span class="feature-bar-cta">Click to explore →</span>
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
            <p class="section-desc">Click any opportunity to see what this means for your product</p>
            <div class="opportunity-grid">
                ${opportunities
                    .map(
                        (o, i) => `
                    <div class="opportunity-card ${priorityClass(o.priority)} opportunity-clickable" data-opp-idx="${i}">
                        <div class="opportunity-header">
                            <span class="opportunity-label">${o.opportunity}</span>
                            <span class="priority-badge ${priorityClass(o.priority)}">${o.priority}</span>
                        </div>
                        <p class="opportunity-reasoning">${o.reasoning}</p>
                        <span class="opportunity-cta">What this means for you →</span>
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

function showModal(title, body) {
    const existing = document.getElementById('dd-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'dd-modal';
    modal.className = 'dd-modal-overlay';
    modal.innerHTML = `
        <div class="dd-modal-box">
            <div class="dd-modal-header">
                <h3 class="dd-modal-title">${title}</h3>
                <button class="dd-modal-close" id="dd-modal-close">&times;</button>
            </div>
            <div class="dd-modal-body">${body}</div>
        </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    document.getElementById('dd-modal-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function featureModalBody(f) {
    const opportunity = f.satisfaction_pct < 70
        ? `<div class="dd-modal-alert dd-modal-alert-opportunity">
               <strong>Opportunity:</strong> Only ${f.satisfaction_pct}% of buyers are satisfied with this feature — this is a gap you can fill with a better implementation.
           </div>`
        : `<div class="dd-modal-alert dd-modal-alert-strong">
               <strong>Market strength:</strong> Buyers are already happy here (${f.satisfaction_pct}%). Match this standard — don't cut corners.
           </div>`;

    const sellerTip = f.satisfaction_pct < 55
        ? "Make this a headline feature in your listing. Negative reviews in this area are common — you can win simply by solving a known problem."
        : f.satisfaction_pct < 75
        ? "Room to differentiate. Study the 1-2 star reviews mentioning this feature to understand exactly what buyers want improved."
        : "This is table stakes. Buyers expect it — include it, but don't over-invest. Focus your differentiation elsewhere.";

    return `
        <div class="dd-modal-stat-row">
            <div class="dd-modal-stat"><span class="dd-modal-stat-label">SATISFACTION</span><span class="dd-modal-stat-value ${scoreColor(f.satisfaction_pct)}">${f.satisfaction_pct}%</span></div>
            <div class="dd-modal-stat"><span class="dd-modal-stat-label">PRODUCTS MENTIONING</span><span class="dd-modal-stat-value">${f.mention_count}</span></div>
            <div class="dd-modal-stat"><span class="dd-modal-stat-label">AVG RATING</span><span class="dd-modal-stat-value">${f.avg_rating_with_feature.toFixed(1)} ★</span></div>
        </div>
        ${opportunity}
        <div class="dd-modal-section">
            <h4>Market Insight</h4>
            <p>${f.insight}</p>
        </div>
        <div class="dd-modal-section">
            <h4>Seller Takeaway</h4>
            <p>${sellerTip}</p>
        </div>
    `;
}

function opportunityModalBody(o) {
    const priorityMap = {
        high: { label: "High Priority", desc: "Act on this — it's a meaningful gap with real revenue upside." },
        medium: { label: "Medium Priority", desc: "Worth considering as a secondary differentiator." },
        low: { label: "Low Priority", desc: "Nice to have, but unlikely to be a deciding factor for buyers." },
    };
    const p = priorityMap[o.priority] || priorityMap.medium;

    return `
        <div class="dd-modal-stat-row">
            <div class="dd-modal-stat"><span class="dd-modal-stat-label">PRIORITY</span><span class="dd-modal-stat-value priority-${o.priority}">${p.label}</span></div>
        </div>
        <div class="dd-modal-alert dd-modal-alert-${o.priority === 'high' ? 'opportunity' : 'strong'}">
            ${p.desc}
        </div>
        <div class="dd-modal-section">
            <h4>Why This Exists</h4>
            <p>${o.reasoning}</p>
        </div>
        <div class="dd-modal-section">
            <h4>How to Exploit It</h4>
            <p>${o.priority === 'high'
                ? "Build this into your product spec as a required feature. Mention it explicitly in your title, bullet points, and A+ content. It's a differentiator buyers are actively searching for."
                : "Consider this for your listing copy and packaging. It's a supporting selling point that can push buyers over the line."
            }</p>
        </div>
    `;
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

    // Feature bar click handlers
    const sortedFeatures = [...cat.features].sort((a, b) => b.satisfaction_pct - a.satisfaction_pct);
    container.querySelectorAll('.feature-bar-clickable').forEach(el => {
        el.addEventListener('click', () => {
            const f = sortedFeatures[parseInt(el.dataset.featureIdx)];
            showModal(f.feature_name, featureModalBody(f));
        });
    });

    // Opportunity click handlers
    container.querySelectorAll('.opportunity-clickable').forEach(el => {
        el.addEventListener('click', () => {
            const o = cat.opportunities[parseInt(el.dataset.oppIdx)];
            showModal(o.opportunity, opportunityModalBody(o));
        });
    });
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
