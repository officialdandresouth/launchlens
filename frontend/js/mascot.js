/**
 * Scroll-reactive mascot character.
 * The character tilts up when scrolling down and tilts down when scrolling up,
 * like he's riding the momentum of the page.
 */

let mascotEl = null;
let lastScrollY = 0;
let currentRotation = 0;
let targetRotation = 0;
let rafId = null;
let scrollTimeout = null;

function createMascot() {
    mascotEl = document.createElement('div');
    mascotEl.className = 'mascot';
    mascotEl.innerHTML = `<img src="/images/mascot.png" alt="" class="mascot-img" draggable="false">`;
    document.body.appendChild(mascotEl);
}

function onScroll() {
    const scrollY = window.scrollY;
    const delta = scrollY - lastScrollY;

    // Scrolling down → character tilts upward (negative rotation = pointing up)
    // Scrolling up → character tilts downward (positive rotation = pointing down)
    if (Math.abs(delta) > 1) {
        const intensity = Math.min(Math.abs(delta) / 8, 1);
        targetRotation = delta > 0 ? -25 * intensity : 25 * intensity;

        // Add a little vertical bounce
        const bounce = delta > 0 ? -4 : 4;
        mascotEl.style.setProperty('--bounce', `${bounce}px`);
    }

    lastScrollY = scrollY;

    // Return to neutral after scrolling stops
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        targetRotation = 0;
        mascotEl.style.setProperty('--bounce', '0px');
    }, 150);
}

function animate() {
    // Smooth interpolation toward target
    currentRotation += (targetRotation - currentRotation) * 0.12;

    if (Math.abs(currentRotation - targetRotation) < 0.1) {
        currentRotation = targetRotation;
    }

    mascotEl.style.transform = `translateY(var(--bounce, 0px)) rotate(${currentRotation}deg)`;

    rafId = requestAnimationFrame(animate);
}

export function initMascot() {
    createMascot();
    lastScrollY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    animate();
}

export function destroyMascot() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', onScroll);
    clearTimeout(scrollTimeout);
    if (mascotEl && mascotEl.parentNode) {
        mascotEl.parentNode.removeChild(mascotEl);
    }
    mascotEl = null;
}
