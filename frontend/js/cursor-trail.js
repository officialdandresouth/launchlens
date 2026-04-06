/**
 * Cursor trail — spawns small transparent green-tinted cubes that follow
 * the mouse and fade out in place. pointer-events: none on everything
 * so it never blocks clicks or navigation.
 */

let lastSpawnTime = 0;
const THROTTLE_MS = 35; // one cube every ~35ms while moving

function spawnCube(x, y) {
    const size = 22 + Math.random() * 10;         // 22–32 px
    const rotation = (Math.random() - 0.5) * 40;  // ±20°

    const cube = document.createElement('div');
    Object.assign(cube.style, {
        position:      'fixed',
        left:          `${x - size / 2}px`,
        top:           `${y - size / 2}px`,
        width:         `${size}px`,
        height:        `${size}px`,
        background:    'rgba(34, 197, 94, 0.10)',
        border:        '1px solid rgba(34, 197, 94, 0.22)',
        borderRadius:  '3px',
        pointerEvents: 'none',
        zIndex:        '8000',
        willChange:    'opacity, transform',
    });

    document.body.appendChild(cube);

    cube.animate(
        [
            { opacity: 0.75, transform: `rotate(${rotation}deg) scale(1)` },
            { opacity: 0,    transform: `rotate(${rotation}deg) scale(0.55)` },
        ],
        { duration: 650, easing: 'ease-out', fill: 'forwards' }
    ).onfinish = () => cube.remove();
}

export function initCursorTrail() {
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSpawnTime < THROTTLE_MS) return;
        lastSpawnTime = now;
        spawnCube(e.clientX, e.clientY);
    });
}
