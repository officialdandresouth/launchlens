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

        </div>

        <!-- Animated stock lines overlay -->
        <div class="stock-lines-container" id="stock-lines"></div>

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
                    <a href="#budget" class="btn-primary why-cta-btn" onclick="window.scrollTo({top:0,behavior:'smooth'}); return false;">
                        Get Started &rarr;
                    </a>
                    <span class="why-cta-hint">Set your budget above and we'll take it from there</span>
                </div>
            </div>
        </section>

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

    // Learn more scrolls to "Why" section
    document.getElementById('hero-learn-more').addEventListener('click', () => {
        document.getElementById('why-section').scrollIntoView({ behavior: 'smooth' });
    });

    // Animated stock trend lines
    startStockLines();
}

function startStockLines() {
    const container = document.getElementById('stock-lines');
    if (!container) return;

    let nextIsGreen = true; // alternate colors
    let mouseY = window.innerHeight / 2; // default to center

    // Track mouse position
    function onMouseMove(e) { mouseY = e.clientY; }
    window.addEventListener('mousemove', onMouseMove);

    function createLine() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('stock-line');

        const color = nextIsGreen ? '#00d47e' : '#ff4d4d';
        nextIsGreen = !nextIsGreen; // alternate for next time

        // Center on mouse Y with slight random offset
        const offset = (Math.random() - 0.5) * 120;
        const yPx = mouseY + offset - 150; // -150 to center the 300px-tall SVG
        svg.style.top = `${yPx}px`;

        const segments = 18 + Math.floor(Math.random() * 10);
        const segWidth = 60; // narrower segments = spikier look
        const width = segments * segWidth;
        const height = 300;

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', `${width}`);
        svg.setAttribute('height', `${height}`);

        // Build sharp, spiky upward-trending path
        let points = [];
        let y = height * 0.8; // start low
        for (let i = 0; i <= segments; i++) {
            const x = i * segWidth;
            points.push({ x, y });

            // Strong upward bias with sharp spikes
            const spike = (Math.random() - 0.35) * 55; // biased negative = upward
            const upwardPull = -6; // constant upward drift
            y += upwardPull + spike;
            y = Math.max(15, Math.min(height - 15, y));
        }

        // Sharp polyline path (no smooth curves — real stock chart feel)
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }

        // Add an arrowhead at the end pointing in the direction of the last segment
        const last = points[points.length - 1];
        const prev = points[points.length - 2];
        const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
        const arrowLen = 18;
        const arrowSpread = 0.45;
        const ax1 = last.x - arrowLen * Math.cos(angle - arrowSpread);
        const ay1 = last.y - arrowLen * Math.sin(angle - arrowSpread);
        const ax2 = last.x - arrowLen * Math.cos(angle + arrowSpread);
        const ay2 = last.y - arrowLen * Math.sin(angle + arrowSpread);

        // Glow filter
        const filterId = `glow-${Date.now()}-${Math.random()}`;
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;
        svg.appendChild(defs);

        // The line path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('stroke-linejoin', 'bevel');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('filter', `url(#${filterId})`);
        path.setAttribute('opacity', '0.45');
        svg.appendChild(path);

        // Arrowhead
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrow.setAttribute('points', `${last.x},${last.y} ${ax1},${ay1} ${ax2},${ay2}`);
        arrow.setAttribute('fill', color);
        arrow.setAttribute('filter', `url(#${filterId})`);
        arrow.setAttribute('opacity', '0.45');
        svg.appendChild(arrow);

        container.appendChild(svg);

        // Remove after animation completes
        svg.addEventListener('animationend', () => svg.remove());
    }

    // Spawn a line every ~3 seconds
    createLine();
    const interval = setInterval(() => {
        if (!document.getElementById('stock-lines')) {
            clearInterval(interval);
            return;
        }
        createLine();
    }, 3000);

    // Store interval for cleanup
    const prevCleanup = window.__cleanupBudget;
    window.__cleanupBudget = () => {
        clearInterval(interval);
        window.removeEventListener('mousemove', onMouseMove);
        if (prevCleanup) prevCleanup();
    };
}
