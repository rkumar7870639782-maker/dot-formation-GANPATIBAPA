const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const message = document.querySelector(".message");
const instruction = document.querySelector(".instruction");

let width;
let height;

let particles = [];

const PARTICLE_COUNT = 850;

let centerX;
let centerY;

let mouse = {
    x: -1000,
    y: -1000,
    active: false
};

let startTime = performance.now();

let phase = "start";

let phaseTime = 0;


/* =========================================
   CANVAS SETUP
========================================= */

function resizeCanvas() {

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centerX = width / 2;
    centerY = height / 2;
}

resizeCanvas();

window.addEventListener("resize", () => {

    resizeCanvas();

    createGanpatiTargets();

});


/* =========================================
   PARTICLE CLASS
========================================= */

class Particle {

    constructor() {

        this.x = centerX;
        this.y = centerY;

        this.startX = centerX;
        this.startY = centerY;

        this.targetX = centerX;
        this.targetY = centerY;

        this.vx = 0;
        this.vy = 0;

        this.angle =
            Math.random() * Math.PI * 2;

        this.distance =
            Math.random() * 500 + 50;

        this.speed =
            Math.random() * 0.8 + 0.4;

        this.size =
            Math.random() * 1.7 + 0.7;

        this.alpha =
            Math.random() * 0.7 + 0.3;

        this.twinkle =
            Math.random() * Math.PI * 2;

        this.twinkleSpeed =
            Math.random() * 0.04 + 0.01;

        this.targetAngle =
            Math.random() * Math.PI * 2;

        this.orbitRadius =
            Math.random() * 280 + 70;

        this.offset =
            Math.random() * 1000;
    }


    update(time) {

        if (phase === "start") {

            this.startAnimation(time);

        }

        else if (phase === "explode") {

            this.explosionAnimation(time);

        }

        else if (phase === "orbit") {

            this.orbitAnimation(time);

        }

        else if (phase === "form") {

            this.formGanpati(time);

        }

        else if (phase === "complete") {

            this.completeAnimation(time);

        }

    }


    /* =====================================
       PHASE 1
       SINGLE DOT
    ===================================== */

    startAnimation(time) {

        const elapsed =
            time - phaseTime;

        const pulse =
            Math.sin(elapsed * 0.005);

        this.x = centerX;
        this.y = centerY;

        this.size =
            2 + pulse * 0.8;

        this.alpha = 1;
    }


    /* =====================================
       PHASE 2
       EXPLOSION
    ===================================== */

    explosionAnimation(time) {

        const elapsed =
            time - phaseTime;

        const progress =
            Math.min(elapsed / 1800, 1);

        const eased =
            easeOutCubic(progress);

        this.x =
            centerX +
            Math.cos(this.angle) *
            this.distance *
            eased;

        this.y =
            centerY +
            Math.sin(this.angle) *
            this.distance *
            eased;

        this.alpha =
            0.35 +
            progress * 0.65;
    }


    /* =====================================
       PHASE 3
       360 DEGREE ORBIT
    ===================================== */

    orbitAnimation(time) {

        const elapsed =
            time - phaseTime;

        const progress =
            Math.min(elapsed / 3000, 1);

        const rotation =
            progress * Math.PI * 2;

        const angle =
            this.targetAngle +
            rotation;

        const radius =
            this.orbitRadius +
            Math.sin(
                this.offset + progress * 10
            ) * 15;

        this.x =
            centerX +
            Math.cos(angle) *
            radius;

        this.y =
            centerY +
            Math.sin(angle) *
            radius;

        this.alpha =
            0.7 +
            Math.sin(
                progress * Math.PI * 8
            ) * 0.3;
    }


    /* =====================================
       PHASE 4
       FORM GANPATI
    ===================================== */

    formGanpati(time) {

        const elapsed =
            time - phaseTime;

        const progress =
            Math.min(elapsed / 4500, 1);

        const eased =
            easeInOutCubic(progress);

        const tx = this.targetX;
        const ty = this.targetY;

        this.x +=
            (tx - this.x) *
            (0.025 + eased * 0.12);

        this.y +=
            (ty - this.y) *
            (0.025 + eased * 0.12);

        /*
           Small particle vibration
           makes Ganpati look alive.
        */

        const vibration =
            Math.sin(
                time * 0.003 +
                this.offset
            ) * (1 - progress) * 3;

        this.x += vibration;
        this.y += vibration;

        this.alpha =
            0.55 + progress * 0.45;
    }


    /* =====================================
       FINAL STATE
    ===================================== */

    completeAnimation(time) {

        const dx =
            this.targetX - this.x;

        const dy =
            this.targetY - this.y;

        this.x += dx * 0.035;
        this.y += dy * 0.035;

        /*
           Mouse interaction
        */

        if (mouse.active) {

            const mx =
                this.x - mouse.x;

            const my =
                this.y - mouse.y;

            const distance =
                Math.sqrt(mx * mx + my * my);

            const radius = 100;

            if (distance < radius) {

                const force =
                    (radius - distance) /
                    radius;

                this.x +=
                    (mx / distance || 0) *
                    force *
                    10;

                this.y +=
                    (my / distance || 0) *
                    force *
                    10;
            }
        }

        this.alpha = 0.9;
    }


    /* =====================================
       DRAW PARTICLE
    ===================================== */

    draw() {

        const twinkle =
            Math.sin(this.twinkle) *
            0.25;

        const alpha =
            Math.max(
                0.05,
                this.alpha + twinkle
            );

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        /*
           Golden particle
        */

        ctx.fillStyle =
            `rgba(255, ${150 + Math.random() * 70}, 45, ${alpha})`;

        ctx.shadowBlur = 12;

        ctx.shadowColor =
            "rgba(255,150,30,0.9)";

        ctx.fill();

        ctx.shadowBlur = 0;

        this.twinkle +=
            this.twinkleSpeed;
    }
}


/* =========================================
   CREATE PARTICLES
========================================= */

function createParticles() {

    particles = [];

    for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
    ) {

        particles.push(
            new Particle()
        );
    }
}


/* =========================================
   GANPATI TARGET GENERATOR
========================================= */

function createGanpatiTargets() {

    if (!particles.length)
        return;


    /*
       We create a procedural
       Ganpati silhouette using
       mathematical curves.
    */

    const targets = [];

    const scale =
        Math.min(
            width / 900,
            height / 800
        );


    const cx = centerX;

    const cy =
        centerY - 20;


    /* =====================================
       HEAD
    ===================================== */

    for (
        let a = 0;
        a < Math.PI * 2;
        a += 0.035
    ) {

        const rx = 145 * scale;
        const ry = 120 * scale;

        targets.push({
            x: cx + Math.cos(a) * rx,
            y: cy - 100 * scale +
                Math.sin(a) * ry
        });

    }


    /* =====================================
       LEFT EAR
    ===================================== */

    for (
        let a = 0;
        a < Math.PI * 2;
        a += 0.045
    ) {

        targets.push({

            x:
                cx -
                170 * scale +
                Math.cos(a) *
                75 * scale,

            y:
                cy -
                100 * scale +
                Math.sin(a) *
                95 * scale
        });
    }


    /* =====================================
       RIGHT EAR
    ===================================== */

    for (
        let a = 0;
        a < Math.PI * 2;
        a += 0.045
    ) {

        targets.push({

            x:
                cx +
                170 * scale +
                Math.cos(a) *
                75 * scale,

            y:
                cy -
                100 * scale +
                Math.sin(a) *
                95 * scale
        });
    }


    /* =====================================
       TRUNK
    ===================================== */

    for (
        let t = 0;
        t <= 1;
        t += 0.012
    ) {

        const x =
            cx +
            Math.sin(t * Math.PI * 2.2) *
            55 * scale;

        const y =
            cy -
            60 * scale +
            t *
            190 * scale;

        targets.push({
            x,
            y
        });

        /*
           Trunk thickness
        */

        for (
            let j = 0;
            j < 2;
            j++
        ) {

            targets.push({

                x:
                    x +
                    (Math.random() - 0.5) *
                    25 * scale,

                y:
                    y +
                    (Math.random() - 0.5) *
                    25 * scale
            });
        }
    }


    /* =====================================
       EYES
    ===================================== */

    addCircle(
        targets,
        cx - 58 * scale,
        cy - 115 * scale,
        14 * scale
    );

    addCircle(
        targets,
        cx + 58 * scale,
        cy - 115 * scale,
        14 * scale
    );


    /* =====================================
       TUSKS
    ===================================== */

    addCurve(
        targets,
        cx - 65 * scale,
        cy - 10 * scale,
        cx - 125 * scale,
        cy + 40 * scale
    );

    addCurve(
        targets,
        cx + 65 * scale,
        cy - 10 * scale,
        cx + 125 * scale,
        cy + 40 * scale
    );


    /* =====================================
       BODY
    ===================================== */

    for (
        let a = 0;
        a < Math.PI * 2;
        a += 0.025
    ) {

        const rx = 170 * scale;
        const ry = 200 * scale;

        targets.push({

            x:
                cx +
                Math.cos(a) * rx,

            y:
                cy +
                110 * scale +
                Math.sin(a) * ry
        });
    }


    /* =====================================
       BELLY
    ===================================== */

    for (
        let a = 0;
        a < Math.PI * 2;
        a += 0.04
    ) {

        targets.push({

            x:
                cx +
                Math.cos(a) *
                105 * scale,

            y:
                cy +
                135 * scale +
                Math.sin(a) *
                125 * scale
        });
    }


    /* =====================================
       LEFT ARM
    ===================================== */

    addLine(
        targets,

        cx - 80 * scale,
        cy + 70 * scale,

        cx - 230 * scale,
        cy + 145 * scale
    );


    /* =====================================
       RIGHT ARM
    ===================================== */

    addLine(
        targets,

        cx + 80 * scale,
        cy + 70 * scale,

        cx + 230 * scale,
        cy + 145 * scale
    );


    /* =====================================
       CROWN
    ===================================== */

    addLine(
        targets,

        cx - 100 * scale,
        cy - 210 * scale,

        cx,
        cy - 320 * scale
    );

    addLine(
        targets,

        cx,
        cy - 320 * scale,

        cx + 100 * scale,
        cy - 210 * scale
    );


    /* =====================================
       CROWN BASE
    ===================================== */

    addLine(
        targets,

        cx - 100 * scale,
        cy - 210 * scale,

        cx + 100 * scale,
        cy - 210 * scale
    );


    /* =====================================
       OM SYMBOL
    ===================================== */

    addCircle(
        targets,
        cx,
        cy - 260 * scale,
        12 * scale
    );


    /*
       Fill extra particle positions
       around the silhouette.
    */

    while (
        targets.length <
        PARTICLE_COUNT
    ) {

        const randomTarget =
            targets[
                Math.floor(
                    Math.random() *
                    targets.length
                )
            ];

        targets.push({

            x:
                randomTarget.x +
                (Math.random() - 0.5) *
                12,

            y:
                randomTarget.y +
                (Math.random() - 0.5) *
                12
        });
    }


    /*
       Assign targets
    */

    particles.forEach(
        (particle, index) => {

            const target =
                targets[index %
                    targets.length];

            particle.targetX =
                target.x;

            particle.targetY =
                target.y;
        }
    );
}


/* =========================================
   HELPER: CIRCLE
========================================= */

function addCircle(
    array,
    x,
    y,
    radius
) {

    for (
        let a = 0;
        a < Math.PI * 2;
        a += 0.08
    ) {

        array.push({

            x:
                x +
                Math.cos(a) *
                radius,

            y:
                y +
                Math.sin(a) *
                radius
        });
    }
}


/* =========================================
   HELPER: LINE
========================================= */

function addLine(
    array,
    x1,
    y1,
    x2,
    y2
) {

    const distance =
        Math.hypot(
            x2 - x1,
            y2 - y1
        );

    const steps =
        Math.max(
            10,
            Math.floor(distance / 4)
        );

    for (
        let i = 0;
        i <= steps;
        i++
    ) {

        const t =
            i / steps;

        array.push({

            x:
                x1 +
                (x2 - x1) * t,

            y:
                y1 +
                (y2 - y1) * t
        });
    }
}


/* =========================================
   HELPER: CURVE
========================================= */

function addCurve(
    array,
    x1,
    y1,
    x2,
    y2
) {

    for (
        let t = 0;
        t <= 1;
        t += 0.02
    ) {

        const curve =
            Math.sin(
                t * Math.PI
            ) * 25;

        array.push({

            x:
                x1 +
                (x2 - x1) * t,

            y:
                y1 +
                (y2 - y1) * t -
                curve
        });
    }
}


/* =========================================
   EASING FUNCTIONS
========================================= */

function easeOutCubic(t) {

    return 1 -
        Math.pow(
            1 - t,
            3
        );
}


function easeInOutCubic(t) {

    return t < 0.5

        ? 4 * t * t * t

        : 1 -
          Math.pow(
              -2 * t + 2,
              3
          ) / 2;
}


/* =========================================
   CHANGE PHASE
========================================= */

function setPhase(newPhase) {

    phase =
        newPhase;

    phaseTime =
        performance.now();
}


/* =========================================
   ANIMATION SEQUENCE
========================================= */

function animationSequence(time) {

    const elapsed =
        time - startTime;


    /*
       0 - 2500ms
       Single dot
    */

    if (
        elapsed < 2500
    ) {

        if (
            phase !== "start"
        ) {

            setPhase("start");
        }

    }


    /*
       2500 - 4500ms
       Explosion
    */

    else if (
        elapsed < 4500
    ) {

        if (
            phase !== "explode"
        ) {

            setPhase("explode");
        }

    }


    /*
       4500 - 7500ms
       360 degree orbit
    */

    else if (
        elapsed < 7500
    ) {

        if (
            phase !== "orbit"
        ) {

            setPhase("orbit");
        }

    }


    /*
       7500 - 12000ms
       Ganpati formation
    */

    else if (
        elapsed < 12000
    ) {

        if (
            phase !== "form"
        ) {

            setPhase("form");
        }

    }


    /*
       Final
    */

    else {

        if (
            phase !== "complete"
        ) {

            setPhase("complete");

            message.classList.add(
                "show"
            );

            instruction.classList.add(
                "hide"
            );
        }
    }
}


/* =========================================
   DRAW
========================================= */

function draw() {

    /*
       Slight motion trail
       instead of completely clearing
       the canvas.
    */

    ctx.fillStyle =
        "rgba(5, 2, 2, 0.18)";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
       Draw particles
    */

    particles.forEach(
        particle => {

            particle.draw();

        }
    );
}


/* =========================================
   MAIN LOOP
========================================= */

function animate(time) {

    animationSequence(time);

    particles.forEach(
        particle => {

            particle.update(time);

        }
    );

    draw();

    requestAnimationFrame(
        animate
    );
}


/* =========================================
   MOUSE EVENTS
========================================= */

window.addEventListener(
    "mousemove",
    event => {

        mouse.x =
            event.clientX;

        mouse.y =
            event.clientY;

        mouse.active = true;
    }
);


window.addEventListener(
    "mouseleave",
    () => {

        mouse.active = false;

        mouse.x = -1000;
        mouse.y = -1000;
    }
);


/* =========================================
   TOUCH SUPPORT
========================================= */

window.addEventListener(
    "touchmove",
    event => {

        const touch =
            event.touches[0];

        mouse.x =
            touch.clientX;

        mouse.y =
            touch.clientY;

        mouse.active = true;

    },
    {
        passive: true
    }
);


window.addEventListener(
    "touchend",
    () => {

        mouse.active = false;

    }
);


/* =========================================
   START
========================================= */

createParticles();

createGanpatiTargets();

requestAnimationFrame(
    animate
);
