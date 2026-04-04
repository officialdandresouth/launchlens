/**
 * Particle/smoke animation for hero background.
 * Draws connected particles with subtle drift on a <canvas>.
 */
const CONFIG = {
    particleCount: 80,
    maxDistance: 140,
    speed: 0.3,
    particleRadius: 1.5,
    lineOpacity: 0.08,
    particleColor: "255, 255, 255",
    mouseRadius: 180,
};

let canvas, ctx, particles, mouse, animId;

function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    mouse = { x: -500, y: -500 };
    particles = [];

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener("mouseleave", () => {
        mouse.x = -500;
        mouse.y = -500;
    });

    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(createParticle());
    }

    loop();
}

function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function createParticle() {
    return {
        x: Math.random() * (canvas?.width || 1200),
        y: Math.random() * (canvas?.height || 800),
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
        r: Math.random() * CONFIG.particleRadius + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
    };
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius) {
            const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
            p.x += (dx / dist) * force * 2;
            p.y += (dy / dist) * force * 2;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CONFIG.particleColor}, ${p.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const ddx = p.x - p2.x;
            const ddy = p.y - p2.y;
            const d = Math.sqrt(ddx * ddx + ddy * ddy);

            if (d < CONFIG.maxDistance) {
                const opacity = (1 - d / CONFIG.maxDistance) * CONFIG.lineOpacity;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(${CONFIG.particleColor}, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    animId = requestAnimationFrame(loop);
}

function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
}

export { init, destroy };
