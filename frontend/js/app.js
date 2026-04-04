import { renderBudget } from './screens/budget.js';
import { renderCategories } from './screens/categories.js';

// Global state — accumulates user selections as they move through screens
window.launchLensState = {
    budget: 5000,
    categoryId: null,
    productSpec: null,
};

// Screen registry — maps hash routes to render functions
const screens = {
    'budget': renderBudget,
    'categories': renderCategories,
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
        if (screenName === 'budget') {
            progressBar.classList.add('hidden');
        } else {
            progressBar.classList.remove('hidden');
        }
    } else {
        window.location.hash = '#budget';
    }
}

// Listen for hash changes
window.addEventListener('hashchange', navigate);

// Initial render
navigate();
