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

    // TODO: Replace with real API call in Phase 2
    // fetch(`/api/categories?budget=${state.budget}`)
    //     .then(res => res.json())
    //     .then(data => renderCategoryCards(container, data));
}
