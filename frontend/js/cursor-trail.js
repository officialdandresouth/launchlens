/**
 * Cursor trail — spawns small transparent green-tinted cubes that follow
 * the mouse and fade out in place. pointer-events: none on everything
 * so it never blocks clicks or navigation.
 */

let lastSpawnTime = 0;
let spawnIndex = 0;
const THROTTLE_MS = 18;  // spawn more often → longer visible trail

// Light → dark green cycle, repeating
const GREEN_SHADES = [
    { bg: 'rgba(187, 247, 208, 0.30)', border: 'rgba(187, 247, 208, 0.60)' }, // green-200
    { bg: 'rgba(134, 239, 172, 0.27)', border: 'rgba(134, 239, 172, 0.55)' }, // green-300
    { bg: 'rgba(74,  222, 128, 0.24)', border: 'rgba(74,  222, 128, 0.50)' }, // green-400
    { bg: 'rgba(34,  197, 94,  0.20)', border: 'rgba(34,  197, 94,  0.42)' }, // green-500
    { bg: 'rgba(22,  163, 74,  0.16)', border: 'rgba(22,  163, 74,  0.35)' }, // green-600
    { bg: 'rgba(21,  128, 61,  0.12)', border: 'rgba(21,  128, 61,  0.28)' }, // green-700
];

function spawnCube(x, y) {
    const size = 64 + Math.random() * 36;          // 64–100 px
    const rotation = (Math.random() - 0.5) * 50;   // ±25°
    const shade = GREEN_SHADES[spawnIndex % GREEN_SHADES.length];
    spawnIndex++;

    const cube = document.createElement('div');
    Object.assign(cube.style, {
        position:      'fixed',
        left:          `${x - size / 2}px`,
        top:           `${y - size / 2}px`,
        width:         `${size}px`,
        height:        `${size}px`,
        background:    shade.bg,
        border:        `1.5px solid ${shade.border}`,
        borderRadius:  '6px',
        pointerEvents: 'none',
        zIndex:        '8000',
        willChange:    'opacity, transform',
    });

    document.body.appendChild(cube);

    cube.animate(
        [
            { opacity: 0.85, transform: `rotate(${rotation}deg) scale(1)` },
            { opacity: 0,    transform: `rotate(${rotation + 15}deg) scale(0.4)` },
        ],
        { duration: 1100, easing: 'ease-out', fill: 'forwards' }
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
