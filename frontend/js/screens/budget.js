export function renderBudget(container) {
    const state = window.launchLensState;

    // Hide progress bar on the hero/landing screen
    document.querySelector('.progress-bar').classList.add('hidden');

    container.innerHTML = `
        <div class="hero">
            <div class="hero-left">
                <h1 class="hero-headline">
                    You have capital. You have ambition.
                    <span class="hero-headline-accent">But what should you actually sell?</span>
                </h1>
                <p class="hero-subtitle">
                    LaunchLens analyzes thousands of Amazon products and reviews
                    to find the best opportunity for your budget. Powered by AI. Updated weekly.
                </p>

                <div class="hero-budget">
                    <div class="budget-display">
                        <span>$</span><span id="budget-value">${state.budget.toLocaleString()}</span>
                    </div>

                    <input
                        type="range"
                        class="budget-slider"
                        id="budget-slider"
                        min="1000"
                        max="25000"
                        step="500"
                        value="${state.budget}"
                    />

                    <div class="budget-range-labels">
                        <span>$1,000</span>
                        <span>$25,000</span>
                    </div>
                </div>

                <button class="btn-primary btn-hero" id="budget-continue">
                    Show me what I can sell &rarr;
                </button>
            </div>

            <div class="hero-right">
                <img
                    src="/images/hero-ecommerce.jpg"
                    alt="Amazon product boxes"
                    class="hero-image"
                />
            </div>
        </div>
    `;

    // Wire up the slider
    const slider = document.getElementById('budget-slider');
    const display = document.getElementById('budget-value');

    slider.addEventListener('input', () => {
        const value = parseInt(slider.value);
        state.budget = value;
        display.textContent = value.toLocaleString();
    });

    // Continue button
    document.getElementById('budget-continue').addEventListener('click', () => {
        window.location.hash = '#categories';
    });
}
