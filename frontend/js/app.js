import { renderBudget } from './screens/budget.js';
import { renderCategories } from './screens/categories.js';
import { renderDeepDive } from './screens/deep_dive.js';
import { renderSpec } from './screens/spec.js';
import { renderEconomics } from './screens/economics.js';
import { renderSuppliers } from './screens/suppliers.js';
import { renderLaunchPlan } from './screens/launch_plan.js';
import { init as initPrism } from './prism.js';
import { initMascot } from './mascot.js';

// Global state — accumulates user selections as they move through screens
window.launchLensState = {
    budget: 5000,
    categoryId: null,
    categoryName: null,
    productSpec: null,
};

// Screen registry — maps hash routes to render functions
const screens = {
    'budget': renderBudget,
    'categories': renderCategories,
    'deep-dive': renderDeepDive,
    'spec': renderSpec,
    'economics': renderEconomics,
    'suppliers': renderSuppliers,
    'launch': renderLaunchPlan,
};

// Update the progress bar to reflect current screen
function updateProgressBar(screenName) {
    const steps = document.querySelectorAll('.step');
    const screenOrder = ['budget', 'categories', 'deep-dive', 'spec', 'economics', 'suppliers', 'launch'];
    const currentIndex = screenOrder.indexOf(screenName);

    steps.forEach((step, i) => {
        step.classList.remove('active', 'completed');
        if (i < currentIndex) step.classList.add('completed');
        if (i === currentIndex) step.classList.add('active');
    });
}

// Router — reads hash and renders the matching screen
function navigate() {
    const hash = window.location.hash.slice(1) || 'budget';
    const screenName = hash.split('/')[0];
    const renderFn = screens[screenName];

    if (renderFn) {
        // Clean up previous screen if needed
        if (window.__cleanupBudget) window.__cleanupBudget();

        const app = document.getElementById('app');
        app.innerHTML = '';
        renderFn(app);
        updateProgressBar(screenName);

        // Show progress bar on all screens except budget (hero page)
        const progressBar = document.querySelector('.progress-bar');
        const navbar = document.querySelector('.navbar');
        if (screenName === 'budget') {
            progressBar.classList.add('hidden');
            navbar.classList.remove('navbar-solid');
        } else {
            progressBar.classList.remove('hidden');
            navbar.classList.add('navbar-solid');
        }
    } else {
        window.location.hash = '#budget';
    }
}

// Navbar link handlers
document.getElementById('nav-home').addEventListener('click', (e) => {
    e.preventDefault();
    if (window.location.hash === '#budget' || window.location.hash === '' || window.location.hash === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.location.hash = '#budget';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

document.getElementById('nav-about').addEventListener('click', (e) => {
    e.preventDefault();
    if (window.location.hash !== '#budget' && window.location.hash !== '' && window.location.hash !== '#') {
        window.location.hash = '#budget';
        setTimeout(() => {
            const why = document.getElementById('why-section');
            if (why) why.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const why = document.getElementById('why-section');
        if (why) why.scrollIntoView({ behavior: 'smooth' });
    }
});

// On hero screen, solidify navbar when scrolled past the fold
window.addEventListener('scroll', () => {
    const hash = window.location.hash.slice(1) || 'budget';
    if (hash.split('/')[0] !== 'budget') return;
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('navbar-solid');
    } else {
        navbar.classList.remove('navbar-solid');
    }
});

// Initialize global 3D prism background (persists across all screens)
initPrism(document.getElementById('prism-canvas'));

// Initialize mascot
initMascot();

// Listen for hash changes
window.addEventListener('hashchange', navigate);

// Initial render
navigate();
