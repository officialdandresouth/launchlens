/**
 * Cursor trail — spawns small transparent green-tinted cubes that follow
 * the mouse and fade out in place. pointer-events: none on everything
 * so it never blocks clicks or navigation.
 */

let lastSpawnTime = 0;
let spawnIndex = 0;
const THROTTLE_MS = 45;  // spawn less often → shorter trail

// Light → dark green cycle, repeating
const GREEN_SHADES = [
    { bg: 'rgba(187, 247, 208, 0.20)', border: 'rgba(187, 247, 208, 0.45)' }, // green-200
    { bg: 'rgba(134, 239, 172, 0.18)', border: 'rgba(134, 239, 172, 0.40)' }, // green-300
    { bg: 'rgba(74,  222, 128, 0.15)', border: 'rgba(74,  222, 128, 0.35)' }, // green-400
    { bg: 'rgba(34,  197, 94,  0.12)', border: 'rgba(34,  197, 94,  0.30)' }, // green-500
    { bg: 'rgba(22,  163, 74,  0.10)', border: 'rgba(22,  163, 74,  0.25)' }, // green-600
    { bg: 'rgba(21,  128, 61,  0.08)', border: 'rgba(21,  128, 61,  0.20)' }, // green-700
];

function spawnCube(x, y) {
    const size = 40 + Math.random() * 20;          // 40–60 px
    const rotation = (Math.random() - 0.5) * 40;   // ±20°
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
        border:        `1px solid ${shade.border}`,
        borderRadius:  '5px',
        pointerEvents: 'none',
        zIndex:        '8000',
        willChange:    'opacity, transform',
    });

    document.body.appendChild(cube);

    cube.animate(
        [
            { opacity: 0.70, transform: `rotate(${rotation}deg) scale(1)` },
            { opacity: 0,    transform: `rotate(${rotation + 10}deg) scale(0.5)` },
        ],
        { duration: 750, easing: 'ease-out', fill: 'forwards' }
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
