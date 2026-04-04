import { init as initParticles, destroy as destroyParticles } from '../particles.js';

export function renderBudget(container) {
    const state = window.launchLensState;

    // Hide progress bar on the hero/landing screen
    document.querySelector('.progress-bar').classList.add('hidden');

    container.innerHTML = `
        <canvas class="hero-canvas" id="hero-canvas"></canvas>

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
                    Show Me What I Can Sell &rarr;
                </button>
                <button class="btn-secondary" id="hero-learn-more">
                    How It Works
                </button>
            </div>

            <div class="scroll-indicator">
                <div class="scroll-mouse"></div>
                <span>Scroll down</span>
            </div>
        </div>

        <div class="marquee-section">
            <div class="marquee-track">
                <span class="marquee-item"><strong>10+</strong> Categories Analyzed</span>
                <span class="marquee-item"><strong>500+</strong> Products Tracked</span>
                <span class="marquee-item"><strong>AI-Powered</strong> Scoring Engine</span>
                <span class="marquee-item"><strong>Updated</strong> Every Monday</span>
                <span class="marquee-item"><strong>$1K–$25K</strong> Budget Range</span>
                <span class="marquee-item"><strong>5</strong> Scoring Dimensions</span>
                <span class="marquee-item"><strong>Free</strong> To Use</span>
                <span class="marquee-item"><strong>Claude AI</strong> Analysis</span>
                <!-- Duplicate for seamless loop -->
                <span class="marquee-item"><strong>10+</strong> Categories Analyzed</span>
                <span class="marquee-item"><strong>500+</strong> Products Tracked</span>
                <span class="marquee-item"><strong>AI-Powered</strong> Scoring Engine</span>
                <span class="marquee-item"><strong>Updated</strong> Every Monday</span>
                <span class="marquee-item"><strong>$1K–$25K</strong> Budget Range</span>
                <span class="marquee-item"><strong>5</strong> Scoring Dimensions</span>
                <span class="marquee-item"><strong>Free</strong> To Use</span>
                <span class="marquee-item"><strong>Claude AI</strong> Analysis</span>
            </div>
        </div>
    `;

    // Initialize particle animation
    const canvas = document.getElementById('hero-canvas');
    initParticles(canvas);

    // Clean up particles when navigating away
    window.__cleanupBudget = () => {
        destroyParticles();
        delete window.__cleanupBudget;
    };

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

    // Learn more scrolls to marquee
    document.getElementById('hero-learn-more').addEventListener('click', () => {
        document.querySelector('.marquee-section').scrollIntoView({ behavior: 'smooth' });
    });
}
