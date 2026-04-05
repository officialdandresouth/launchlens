export function renderBudget(container) {
    const state = window.launchLensState;

    // Hide progress bar on the hero/landing screen
    document.querySelector('.progress-bar').classList.add('hidden');

    container.innerHTML = `
        <div class="hero">
            <div class="hero-badge">
                <span class="hero-badge-dot"></span>
                Updated weekly with live Amazon data
            </div>

            <h1 class="hero-headline">
                Find What to Sell<br>
                <span class="hero-headline-dim">Before You Invest</span>
            </h1>

            <p class="hero-subtitle">
                LaunchLens analyzes thousands of Amazon products and reviews
                to find the best FBA opportunity for your budget. Powered by AI.
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

            <div class="hero-ctas">
                <button class="btn-primary" id="budget-continue">
                    Get Started &rarr;
                </button>
                <button class="btn-secondary" id="hero-learn-more">
                    How It Works
                </button>
            </div>

        </div>

        <!-- Why LaunchLens / How It Works section -->
        <section class="why-section" id="why-section">
            <div class="why-inner">
                <div class="why-badge">
                    <span class="why-badge-dot"></span>
                    Your 7-Step Advantage
                </div>

                <h2 class="why-headline">Stop Guessing.<br>Start Selling Smarter.</h2>

                <p class="why-body">
                    Most first-time Amazon sellers fail because they pick products based on gut feeling,
                    not data. They sink thousands into inventory that sits in a warehouse while fees pile up.
                    LaunchLens exists to make sure that doesn't happen to you.
                </p>
                <p class="why-body">
                    Our AI-powered pipeline walks you through <strong>seven carefully designed steps</strong> —
                    starting with your real budget and ending with a launch-ready product plan. First, you
                    set your investment range so we only show products you can actually afford to stock. Then
                    we surface the highest-opportunity categories by scoring demand, competition, margins,
                    and review sentiment across thousands of live Amazon listings. You pick a category that
                    excites you, and we deep-dive into the top products inside it — showing you exactly
                    what's selling, what customers love, and where the gaps are.
                </p>
                <p class="why-body">
                    From there, LaunchLens generates a <strong>tailored product specification</strong> based on the
                    gaps competitors are missing — the features buyers keep asking for in reviews but nobody
                    offers yet. We then build a full <strong>unit economics breakdown</strong>: landed cost,
                    FBA fees, advertising budget, and projected profit per unit so you know your margins before
                    you spend a dollar. Next, we match you with <strong>verified suppliers</strong> and estimate
                    lead times and MOQs. Finally, everything comes together in a <strong>launch plan</strong> —
                    a step-by-step timeline from placing your first order to your first sale.
                </p>
                <p class="why-body why-body-closing">
                    Seven steps. One clear path from idea to income. No guesswork, no wasted capital,
                    no spreadsheet chaos — just data-backed decisions at every stage.
                </p>

                <div class="why-cta">
                    <a href="#categories" class="btn-primary why-cta-btn">
                        Get Started &rarr;
                    </a>
                    <span class="why-cta-hint">We'll find the best categories for your budget</span>
                </div>
            </div>
        </section>

        <div class="marquee-section">
            <div class="marquee-track">
                <span class="marquee-item"><strong>75+</strong> Categories Analyzed</span>
                <span class="marquee-item"><strong>5,000+</strong> Products Tracked</span>
                <span class="marquee-item"><strong>AI-Powered</strong> Scoring Engine</span>
                <span class="marquee-item"><strong>Updated</strong> Every Monday</span>
                <span class="marquee-item"><strong>$1K–$25K</strong> Budget Range</span>
                <span class="marquee-item"><strong>5</strong> Scoring Dimensions</span>
                <span class="marquee-item"><strong>Free</strong> To Use</span>
                <span class="marquee-item"><strong>Claude AI</strong> Analysis</span>
                <!-- Duplicate for seamless loop -->
                <span class="marquee-item"><strong>75+</strong> Categories Analyzed</span>
                <span class="marquee-item"><strong>5,000+</strong> Products Tracked</span>
                <span class="marquee-item"><strong>AI-Powered</strong> Scoring Engine</span>
                <span class="marquee-item"><strong>Updated</strong> Every Monday</span>
                <span class="marquee-item"><strong>$1K–$25K</strong> Budget Range</span>
                <span class="marquee-item"><strong>5</strong> Scoring Dimensions</span>
                <span class="marquee-item"><strong>Free</strong> To Use</span>
                <span class="marquee-item"><strong>Claude AI</strong> Analysis</span>
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

    // Learn more scrolls to "Why" section
    document.getElementById('hero-learn-more').addEventListener('click', () => {
        document.getElementById('why-section').scrollIntoView({ behavior: 'smooth' });
    });
}
