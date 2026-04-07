const SCORE_LABELS = {
    gross_margin: "Gross Margin",
    demand_satisfaction_gap: "Demand Gap",
    revenue_concentration: "Low Concentration",
    capital_efficiency: "Capital Efficiency",
    barrier_to_entry: "Ease of Entry",
};

function scoreColor(score) {
    if (score >= 70) return "score-green";
    if (score >= 50) return "score-yellow";
    return "score-red";
}

const SCORE_DESCS = {
    gross_margin: ["Low margin — cost-sensitive", "Moderate margin", "Strong margin potential"],
    demand_satisfaction_gap: ["Buyers are mostly satisfied", "Some unmet demand", "Big gap to exploit"],
    revenue_concentration: ["Few sellers dominate", "Moderate spread", "Revenue well distributed"],
    capital_efficiency: ["Capital-heavy category", "Moderate ROI", "Capital-efficient"],
    barrier_to_entry: ["Hard to enter", "Moderate competition", "Accessible for new sellers"],
};

function scoreDesc(key, val) {
    const tiers = SCORE_DESCS[key];
    if (!tiers) return "";
    if (val >= 70) return tiers[2];
    if (val >= 45) return tiers[1];
    return tiers[0];
}

function renderScoreBars(scores) {
    return Object.entries(SCORE_LABELS)
        .map(([key, label]) => {
            const val = scores[key];
            const color = scoreColor(val);
            return `
                <div class="score-bar-row">
                    <div class="score-bar-header">
                        <span class="score-bar-label">${label}</span>
                        <div class="score-bar-right">
                            <span class="score-bar-desc">${scoreDesc(key, val)}</span>
                            <span class="score-bar-value ${color}">${val}<span class="score-bar-pct">%</span></span>
                        </div>
                    </div>
                    <div class="score-bar-track">
                        <div class="score-bar-fill ${color}" style="width: ${val}%"></div>
                    </div>
                </div>
            `;
        })
        .join("");
}

function renderCard(cat, index) {
    const color = scoreColor(cat.scores.composite);
    return `
        <div class="card category-card" style="--card-delay: ${index * 100}ms">
            <div class="category-card-header">
                <span class="category-rank">#${index + 1}</span>
                <div class="category-card-info">
                    <h3 class="category-name">${cat.name}</h3>
                    <span class="category-parent">${cat.parent_category}</span>
                </div>
                <div class="composite-score ${color}">${cat.scores.composite}</div>
            </div>

            <div class="score-bars">
                ${renderScoreBars(cat.scores)}
            </div>

            <div class="category-meta">
                <span>Avg price: $${cat.avg_price.toFixed(2)}</span>
                <span>Min budget: $${cat.min_viable_budget.toLocaleString()}</span>
                <span>${cat.sample_products} products analyzed</span>
            </div>

            <div class="category-card-footer">
                <button class="btn-secondary btn-explore" onclick="window.launchLensState.categoryId='${cat.id}'; window.location.hash='#deep-dive/${cat.id}'">
                    Explore category &rarr;
                </button>
            </div>
        </div>
    `;
}

function observeCards(container) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("card-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    container.querySelectorAll(".category-card").forEach((card) => {
        observer.observe(card);
    });
}

function renderCategoryCards(container, data) {
    if (data.count === 0) {
        container.querySelector(".screen").innerHTML = `
            <h1 class="screen-title">No categories found</h1>
            <p class="screen-subtitle">
                No categories match a <strong>$${data.budget.toLocaleString()}</strong> budget.
                Try increasing your starting capital.
            </p>
            <button class="btn-secondary" onclick="window.location.hash='#budget'">
                &larr; Adjust budget
            </button>
        `;
        return;
    }

    container.querySelector(".screen").innerHTML = `
        <h1 class="screen-title">Your best categories</h1>
        <p class="screen-subtitle">
            With <strong>$${data.budget.toLocaleString()}</strong> in starting capital,
            here are <strong>${data.count}</strong> subcategories ranked by opportunity score.
        </p>
        <div class="category-grid">
            ${data.categories.map((cat, i) => renderCard(cat, i)).join("")}
        </div>
        <div class="categories-back">
            <button class="btn-secondary" onclick="window.location.hash='#budget'">
                &larr; Change budget
            </button>
        </div>
    `;

    observeCards(container);
}

export function renderCategories(container) {
    const state = window.launchLensState;

    container.innerHTML = `
        <div class="screen">
            <h1 class="screen-title">Your best categories</h1>
            <p class="screen-subtitle">
                With <strong>$${state.budget.toLocaleString()}</strong> in starting capital,
                here are the subcategories ranked by profitability, demand gaps, and competition.
            </p>
            <div class="loading">
                <div class="spinner"></div>
                <p>Analyzing categories for your budget...</p>
            </div>
        </div>
    `;

    fetch(`/api/categories?budget=${state.budget}`)
        .then((res) => {
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            return res.json();
        })
        .then((data) => renderCategoryCards(container, data))
        .catch((err) => {
            container.querySelector(".screen").innerHTML = `
                <h1 class="screen-title">Something went wrong</h1>
                <p class="screen-subtitle">${err.message}</p>
                <button class="btn-primary" onclick="window.location.hash='#categories'">
                    Try again
                </button>
            `;
        });
}
