const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const game = document.getElementById("game");
const startButton = document.getElementById("startButton");

const healthText = document.getElementById("health");
const ammoText = document.getElementById("ammo");
const coinsText = document.getElementById("coins");
const cluesText = document.getElementById("clues");

const objective = document.getElementById("objective");
const interaction = document.getElementById("interaction");

const houseInterior = document.getElementById("houseInterior");
const interiorNumber = document.getElementById("interiorNumber");
const interiorText = document.getElementById("interiorText");

const searchHouse = document.getElementById("searchHouse");
const leaveHouse = document.getElementById("leaveHouse");

const cluePanel = document.getElementById("cluePanel");
const clueTitle = document.getElementById("clueTitle");
const clueText = document.getElementById("clueText");
const closeClue = document.getElementById("closeClue");

const bossPanel = document.getElementById("bossPanel");
const enterBossFight = document.getElementById("enterBossFight");

const endingPanel = document.getElementById("endingPanel");
const endingTitle = document.getElementById("endingTitle");
const endingText = document.getElementById("endingText");
const restartButton = document.getElementById("restartButton");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

/* =========================
   GAME STATE
========================= */

const WORLD_W = 3200;
const WORLD_H = 2400;

const player = {
    x: 400,
    y: 400,
    speed: 4,
    health: 100,
    ammo: 30,
    coins: 0,
    angle: 0
};

const camera = {
    x: 0,
    y: 0
};

let houses = [];
let enemies = [];
let bullets = [];

let clues = 0;
let currentHouse = null;

let started = false;
let inHouse = false;
let bossFight = false;
let bossDefeated = false;
let finished = false;

const keys = {};

const mouse = {
    x: 0,
    y: 0,
    down: false
};

/* =========================
   CLUES
========================= */

const clueList = [
    "A note says: THEY TOOK HIM IN A BLACK CAR.",
    "A photograph shows Eli's brother with three strangers.",
    "A receipt mentions the old warehouse.",
    "Someone wrote: THE MEN WERE WEARING BLACK SUITS.",
    "A phone number is written on a piece of paper.",
    "A map points toward the east side.",
    "A newspaper has the mafia symbol circled.",
    "A note says: KEEP LOOKING.",
    "A witness saw three men near the road.",
    "A broken phone contains a strange location.",
    "The location points toward the industrial district.",
    "A note says: DO NOT TRUST THE DRIVER.",
    "A business card belongs to someone named Victor.",
    "Victor is connected to the mafia.",
    "A warehouse number is written on the wall.",
    "Someone says the factory is still active.",
    "A security report mentions mafia guards.",
    "A photograph shows an old factory.",
    "A note says: HE WAS MOVED.",
    "Another note says: HE IS STILL ALIVE.",
    "A map shows a hidden factory entrance.",
    "Someone wrote: THE BOSS KNOWS WHERE HE IS.",
    "A guard badge has the factory symbol.",
    "A document mentions a prisoner.",
    "The prisoner description matches Eli's brother.",
    "The factory location appears again.",
    "A final route points to the industrial district.",
    "The mafia has been using the factory.",
    "The last note says: FIND THE BOSS.",
    "THE FINAL CLUE: YOUR BROTHER IS INSIDE THE FACTORY."
];

/* =========================
   START
========================= */

startButton.addEventListener("click", () => {

    startScreen.style.display = "none";
    game.style.display = "block";

    started = true;

    createWorld();
    updateHUD();
});

/* =========================
   WORLD
========================= */

function createWorld() {

    houses = [];
    enemies = [];
    bullets = [];

    let number = 1;

    for (let row = 0; row < 5; row++) {

        for (let col = 0; col < 6; col++) {

            houses.push({
                x: 250 + col * 480,
                y: 250 + row * 400,

                width: 220,
                height: 170,

                number: number,
                searched: false
            });

            number++;
        }
    }

    // 24 detailed mafia enemies
    for (let i = 0; i < 24; i++) {

        const house = houses[i];

        enemies.push({
            x: house.x + 290,
            y: house.y + 80,

            health: 3,
            maxHealth: 3,

            speed: 1.1,

            angle: 0,
            hitCooldown: 0
        });
    }
}

/* =========================
   CONTROLS
========================= */

window.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "e") {

        if (inHouse) return;

        if (bossFight) return;

        enterHouse();
    }

    if (e.key.toLowerCase() === "r") {

        player.ammo = 30;

        updateHUD();
    }
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", e => {

    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

canvas.addEventListener("mousedown", () => {
    mouse.down = true;
});

window.addEventListener("mouseup", () => {
    mouse.down = false;
});

/* =========================
   HOUSE SYSTEM
========================= */

function getNearestHouse() {

    let closest = null;
    let closestDistance = Infinity;

    for (const house of houses) {

        const cx = house.x + house.width / 2;
        const cy = house.y + house.height / 2;

        const d = Math.hypot(
            player.x - cx,
            player.y - cy
        );

        if (d < closestDistance) {

            closestDistance = d;
            closest = house;
        }
    }

    return {
        house: closest,
        distance: closestDistance
    };
}

function enterHouse() {

    const result = getNearestHouse();

    if (!result.house) return;

    // Big range so E definitely works
    if (result.distance <= 210) {

        currentHouse = result.house;

        inHouse = true;

        houseInterior.style.display = "flex";

        interiorNumber.textContent =
            "HOUSE #" + currentHouse.number;

        if (currentHouse.searched) {

            interiorText.textContent =
                "You already searched this house.";

            searchHouse.style.display = "none";

        } else {

            interiorText.textContent =
                "Search the room. There could be a clue about your brother.";

            searchHouse.style.display = "inline-block";
        }
    }
}

function updateInteraction() {

    if (!started || inHouse || finished) {

        interaction.style.display = "none";
        return;
    }

    const result = getNearestHouse();

    if (result.house && result.distance <= 210) {

        interaction.style.display = "block";

        interaction.textContent =
            "E — ENTER HOUSE";

        return;
    }

    if (
        clues >= 30 &&
        !bossDefeated &&
        Math.hypot(
            player.x - WORLD_W + 300,
            player.y - WORLD_H + 300
        ) < 200
    ) {

        interaction.style.display = "block";
        interaction.textContent = "E — ENTER FACTORY";

        return;
    }

    interaction.style.display = "none";
}

/* =========================
   SEARCH HOUSE
========================= */

searchHouse.addEventListener("click", () => {

    if (!currentHouse) return;

    if (currentHouse.searched) return;

    currentHouse.searched = true;

    clues++;

    const foundCoins =
        10 + Math.floor(Math.random() * 30);

    const foundAmmo =
        3 + Math.floor(Math.random() * 8);

    player.coins += foundCoins;

    player.ammo =
        Math.min(30, player.ammo + foundAmmo);

    interiorText.textContent =
        `LOOT FOUND: ${foundCoins} COINS + ${foundAmmo} AMMO`;

    searchHouse.style.display = "none";

    updateHUD();

    setTimeout(() => {

        cluePanel.style.display = "flex";

        clueTitle.textContent =
            "CLUE " + clues + "/30";

        clueText.textContent =
            clueList[clues - 1];

    }, 500);
});

leaveHouse.addEventListener("click", () => {

    houseInterior.style.display = "none";

    inHouse = false;
    currentHouse = null;

    updateObjective();
});

closeClue.addEventListener("click", () => {

    cluePanel.style.display = "none";

    updateObjective();
});

function updateObjective() {

    if (clues >= 30) {

        objective.textContent =
            "THE FACTORY IS AT THE SOUTH-EAST CORNER. FIND YOUR BROTHER.";

    } else {

        objective.textContent =
            "SEARCH THE HOUSES — " +
            clues +
            "/30 CLUES FOUND.";
    }
}

/* =========================
   PLAYER
========================= */

function updatePlayer() {

    if (!started || inHouse || finished) return;

    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"]) dy--;
    if (keys["s"] || keys["arrowdown"]) dy++;
    if (keys["a"] || keys["arrowleft"]) dx--;
    if (keys["d"] || keys["arrowright"]) dx++;

    if (dx !== 0 || dy !== 0) {

        const length = Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        player.x += dx * player.speed;
        player.y += dy * player.speed;
    }

    player.x =
        Math.max(25, Math.min(WORLD_W - 25, player.x));

    player.y =
        Math.max(25, Math.min(WORLD_H - 25, player.y));

    const worldMouseX =
        mouse.x + camera.x;

    const worldMouseY =
        mouse.y + camera.y;

    player.angle =
        Math.atan2(
            worldMouseY - player.y,
            worldMouseX - player.x
        );
}

/* =========================
   SHOOTING
========================= */

let shootTimer = 0;

function shoot() {

    if (!started || inHouse || finished) return;

    if (shootTimer > 0) return;

    if (player.ammo <= 0) return;

    player.ammo--;

    shootTimer = 10;

    bullets.push({

        x: player.x +
            Math.cos(player.angle) * 35,

        y: player.y +
            Math.sin(player.angle) * 35,

        vx:
            Math.cos(player.angle) * 13,

        vy:
            Math.sin(player.angle) * 13,

        life: 70
    });

    updateHUD();
}

function updateShooting() {

    if (shootTimer > 0) {
        shootTimer--;
    }

    if (mouse.down) {
        shoot();
    }
}

/* =========================
   ENEMIES
========================= */

function updateEnemies() {

    if (inHouse || finished) return;

    for (const enemy of enemies) {

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;

        const d = Math.hypot(dx, dy);

        if (d < 550 && d > 55) {

            enemy.angle =
                Math.atan2(dy, dx);

            enemy.x +=
                (dx / d) * enemy.speed;

            enemy.y +=
                (dy / d) * enemy.speed;
        }

        if (d < 55 && enemy.hitCooldown <= 0) {

            player.health -= 5;

            enemy.hitCooldown = 50;

            updateHUD();

            if (player.health <= 0) {

                endGame(
                    "ELI WAS CAUGHT",
                    "The mafia stopped Eli before he could rescue his brother."
                );
            }
        }

        if (enemy.hitCooldown > 0) {
            enemy.hitCooldown--;
        }
    }
}

/* =========================
   BULLETS
========================= */

function updateBullets() {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        bullet.life--;

        let remove = false;

        for (let j = enemies.length - 1; j >= 0; j--) {

            const enemy = enemies[j];

            if (
                Math.hypot(
                    bullet.x - enemy.x,
                    bullet.y - enemy.y
                ) < 30
            ) {

                enemy.health--;

                remove = true;

                if (enemy.health <= 0) {

                    enemies.splice(j, 1);

                    player.coins += 20;

                    updateHUD();
                }

                break;
            }
        }

        if (
            remove ||
            bullet.life <= 0 ||
            bullet.x < 0 ||
            bullet.y < 0 ||
            bullet.x > WORLD_W ||
            bullet.y > WORLD_H
        ) {

            bullets.splice(i, 1);
        }
    }
}

/* =========================
   FACTORY
========================= */

const boss = {
    x: WORLD_W - 300,
    y: WORLD_H - 300,

    health: 40,
    maxHealth: 40,

    active: false
};

function updateFactory() {

    if (clues < 30 || bossDefeated || finished) return;

    const d = Math.hypot(
        player.x - boss.x,
        player.y - boss.y
    );

    if (d < 210) {

        interaction.style.display = "block";
        interaction.textContent =
            "E — ENTER FACTORY";

        if (keys["e"]) {

            keys["e"] = false;

            bossPanel.style.display = "flex";
        }
    }
}

enterBossFight.addEventListener("click", () => {

    bossPanel.style.display = "none";

    bossFight = true;

    boss.active = true;

    objective.textContent =
        "DEFEAT THE MAFIA BOSS. YOUR BROTHER IS INSIDE.";
});

function updateBoss() {

    if (!bossFight || bossDefeated || finished) return;

    const dx = player.x - boss.x;
    const dy = player.y - boss.y;

    const d = Math.hypot(dx, dy);

    if (d > 65) {

        boss.x +=
            (dx / d) * 0.8;

        boss.y +=
            (dy / d) * 0.8;
    }

    if (d < 65) {

        player.health -= 0.1;

        updateHUD();

        if (player.health <= 0) {

            endGame(
                "MISSION FAILED",
                "Eli could not reach his brother."
            );
        }
    }
}

function hitBoss(bullet) {

    if (!bossFight || bossDefeated) return false;

    const d = Math.hypot(
        bullet.x - boss.x,
        bullet.y - boss.y
    );

    if (d < 60) {

        boss.health--;

        if (boss.health <= 0) {

            bossDefeated = true;
            bossFight = false;

            endGame(
                "BROTHER FOUND",
                "Eli defeated the mafia boss and found his brother alive inside the factory. After three years, they are finally together again."
            );
        }

        return true;
    }

    return false;
}

/* =========================
   CAMERA
========================= */

function updateCamera() {

    camera.x =
        player.x - canvas.width / 2;

    camera.y =
        player.y - canvas.height / 2;

    camera.x =
        Math.max(
            0,
            Math.min(
                WORLD_W - canvas.width,
                camera.x
            )
        );

    camera.y =
        Math.max(
            0,
            Math.min(
                WORLD_H - canvas.height,
                camera.y
            )
        );
}

/* =========================
   DRAW WORLD
========================= */

function drawWorld() {

    // DAYTIME
    ctx.fillStyle = "#72ad61";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();

    ctx.translate(
        -camera.x,
        -camera.y
    );

    drawGrass();
    drawRoads();
    drawHouses();

    if (clues >= 30) {
        drawFactory();
    }

    for (const enemy of enemies) {
        drawEnemy(enemy);
    }

    if (clues >= 30 && !bossDefeated) {
        drawBoss();
    }

    drawBullets();
    drawPlayer();

    ctx.restore();
}

/* =========================
   GRASS
========================= */

function drawGrass() {

    ctx.fillStyle = "#659e57";

    for (let x = 0; x < WORLD_W; x += 70) {

        for (let y = 0; y < WORLD_H; y += 70) {

            ctx.fillRect(
                x + 12,
                y + 15,
                3,
                9
            );

            ctx.fillRect(
                x + 35,
                y + 35,
                3,
                6
            );
        }
    }
}

/* =========================
   ROADS
========================= */

function drawRoads() {

    ctx.fillStyle = "#656565";

    for (
        let x = 100;
        x < WORLD_W;
        x += 480
    ) {

        ctx.fillRect(
            x,
            0,
            100,
            WORLD_H
        );
    }

    for (
        let y = 100;
        y < WORLD_H;
        y += 400
    ) {

        ctx.fillRect(
            0,
            y,
            WORLD_W,
            100
        );
    }

    // Yellow road markings

    ctx.fillStyle = "#e7d65e";

    for (
        let x = 145;
        x < WORLD_W;
        x += 480
    ) {

        for (
            let y = 0;
            y < WORLD_H;
            y += 75
        ) {

            ctx.fillRect(
                x,
                y,
                8,
                40
            );
        }
    }

    for (
        let y = 145;
        y < WORLD_H;
        y += 400
    ) {

        for (
            let x = 0;
            x < WORLD_W;
            x += 75
        ) {

            ctx.fillRect(
                x,
                y,
                40,
                8
            );
        }
    }
}

/* =========================
   HOUSES
========================= */

function drawHouses() {

    for (const house of houses) {

        // Shadow

        ctx.fillStyle = "rgba(0,0,0,0.25)";

        ctx.fillRect(
            house.x + 12,
            house.y + 15,
            house.width,
            house.height
        );

        // Building

        ctx.fillStyle = "#c69b68";

        ctx.fillRect(
            house.x,
            house.y + 35,
            house.width,
            house.height - 35
        );

        // Roof

        ctx.fillStyle = "#75483b";

        ctx.beginPath();

        ctx.moveTo(
            house.x - 20,
            house.y + 40
        );

        ctx.lineTo(
            house.x + house.width / 2,
            house.y - 45
        );

        ctx.lineTo(
            house.x + house.width + 20,
            house.y + 40
        );

        ctx.closePath();

        ctx.fill();

        // Roof line

        ctx.fillStyle = "#9a6251";

        ctx.fillRect(
            house.x + 20,
            house.y + 10,
            house.width - 40,
            10
        );

        // Windows

        drawWindow(
            house.x + 25,
            house.y + 70
        );

        drawWindow(
            house.x + 150,
            house.y + 70
        );

        // Door

        ctx.fillStyle = "#4c3023";

        ctx.fillRect(
            house.x + 90,
            house.y + 85,
            45,
            85
        );

        ctx.fillStyle = "#e2c54d";

        ctx.fillRect(
            house.x + 125,
            house.y + 125,
            6,
            6
        );

        // Number

        ctx.fillStyle = "#fff";

        ctx.font = "bold 15px Arial";

        ctx.fillText(
            "#" + house.number,
            house.x + 103,
            house.y + 62
        );
    }
}

function drawWindow(x, y) {

    ctx.fillStyle = "#273e4a";

    ctx.fillRect(
        x,
        y,
        45,
        38
    );

    ctx.fillStyle = "#9bd4e4";

    ctx.fillRect(
        x + 4,
        y + 4,
        37,
        30
    );

    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x + 20,
        y + 4,
        4,
        30
    );

    ctx.fillRect(
        x + 4,
        y + 17,
        37,
        4
    );
}

/* =========================
   PLAYER
========================= */

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    // Shadow

    ctx.fillStyle = "rgba(0,0,0,0.3)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        25,
        25,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Legs

    ctx.fillStyle = "#202b36";

    ctx.fillRect(
        -13,
        12,
        10,
        27
    );

    ctx.fillRect(
        4,
        12,
        10,
        27
    );

    // Shoes

    ctx.fillStyle = "#111";

    ctx.fillRect(
        -16,
        36,
        15,
        7
    );

    ctx.fillRect(
        3,
        36,
        16,
        7
    );

    // Body

    ctx.fillStyle = "#294762";

    ctx.fillRect(
        -17,
        -14,
        34,
        31
    );

    // Jacket

    ctx.fillStyle = "#3c607d";

    ctx.fillRect(
        -4,
        -12,
        8,
        27
    );

    // Backpack

    ctx.fillStyle = "#17202a";

    ctx.fillRect(
        -23,
        -9,
        7,
        27
    );

    // Neck

    ctx.fillStyle = "#d69a6c";

    ctx.fillRect(
        -7,
        -22,
        14,
        10
    );

    // Head

    ctx.fillStyle = "#dba073";

    ctx.fillRect(
        -14,
        -38,
        28,
        24
    );

    // Hair

    ctx.fillStyle = "#211b19";

    ctx.fillRect(
        -15,
        -43,
        30,
        12
    );

    ctx.fillRect(
        -11,
        -47,
        22,
        8
    );

    // Eyes

    ctx.fillStyle = "#111";

    ctx.fillRect(
        -9,
        -30,
        4,
        4
    );

    ctx.fillRect(
        5,
        -30,
        4,
        4
    );

    // Arm + gun

    ctx.save();

    ctx.rotate(
        player.angle
    );

    ctx.fillStyle = "#dba073";

    ctx.fillRect(
        5,
        -5,
        25,
        8
    );

    ctx.fillStyle = "#151719";

    ctx.fillRect(
        25,
        -5,
        30,
        8
    );

    ctx.restore();

    ctx.restore();
}

/* =========================
   DETAILED MAFIA ENEMY
========================= */

function drawEnemy(enemy) {

    ctx.save();

    ctx.translate(
        enemy.x,
        enemy.y
    );

    // Shadow

    ctx.fillStyle = "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        32,
        27,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Legs

    ctx.fillStyle = "#17191d";

    ctx.fillRect(
        -15,
        13,
        11,
        28
    );

    ctx.fillRect(
        4,
        13,
        11,
        28
    );

    // Shoes

    ctx.fillStyle = "#090909";

    ctx.fillRect(
        -19,
        38,
        17,
        8
    );

    ctx.fillRect(
        3,
        38,
        18,
        8
    );

    // Suit

    ctx.fillStyle = "#181c22";

    ctx.fillRect(
        -20,
        -16,
        40,
        34
    );

    // Suit highlights

    ctx.fillStyle = "#2a3038";

    ctx.fillRect(
        -16,
        -11,
        10,
        25
    );

    ctx.fillRect(
        6,
        -11,
        10,
        25
    );

    // Shirt

    ctx.fillStyle = "#eeeeee";

    ctx.fillRect(
        -8,
        -14,
        16,
        22
    );

    // Tie

    ctx.fillStyle = "#9c252b";

    ctx.fillRect(
        -3,
        -12,
        6,
        23
    );

    // Neck

    ctx.fillStyle = "#c98c67";

    ctx.fillRect(
        -8,
        -25,
        16,
        11
    );

    // Head

    ctx.fillStyle = "#c98c67";

    ctx.fillRect(
        -15,
        -45,
        30,
        26
    );

    // Ears

    ctx.fillRect(
        -18,
        -36,
        5,
        10
    );

    ctx.fillRect(
        13,
        -36,
        5,
        10
    );

    // Hair

    ctx.fillStyle = "#161414";

    ctx.fillRect(
        -16,
        -49,
        32,
        12
    );

    ctx.fillRect(
        -11,
        -53,
        22,
        8
    );

    // Eyebrows

    ctx.fillStyle = "#222";

    ctx.fillRect(
        -10,
        -36,
        7,
        3
    );

    ctx.fillRect(
        3,
        -36,
        7,
        3
    );

    // Eyes

    ctx.fillRect(
        -9,
        -32,
        4,
        4
    );

    ctx.fillRect(
        5,
        -32,
        4,
        4
    );

    // Nose

    ctx.fillRect(
        -1,
        -28,
        3,
        6
    );

    // Mouth

    ctx.fillRect(
        -6,
        -21,
        12,
        3
    );

    // Arms + gun

    ctx.save();

    ctx.rotate(
        enemy.angle
    );

    ctx.fillStyle = "#181c22";

    ctx.fillRect(
        -3,
        7,
        30,
        11
    );

    ctx.fillStyle = "#c98c67";

    ctx.fillRect(
        22,
        8,
        10,
        10
    );

    ctx.fillStyle = "#0b0c0e";

    ctx.fillRect(
        28,
        5,
        32,
        8
    );

    ctx.fillStyle = "#292d31";

    ctx.fillRect(
        52,
        7,
        12,
        5
    );

    ctx.restore();

    // Health bar

    ctx.fillStyle = "#111";

    ctx.fillRect(
        -22,
        -64,
        44,
        6
    );

    ctx.fillStyle = "#d93434";

    ctx.fillRect(
        -21,
        -63,
        42 *
        (enemy.health / enemy.maxHealth),
        4
    );

    ctx.restore();
}

/* =========================
   FACTORY
========================= */

function drawFactory() {

    const x = WORLD_W - 500;
    const y = WORLD_H - 500;

    ctx.fillStyle = "#27292d";

    ctx.fillRect(
        x,
        y,
        400,
        280
    );

    ctx.fillStyle = "#111318";

    ctx.fillRect(
        x - 20,
        y - 20,
        440,
        35
    );

    // Windows

    for (let i = 0; i < 6; i++) {

        ctx.fillStyle = "#e0bc48";

        ctx.fillRect(
            x + 35 + i * 60,
            y + 55,
            35,
            40
        );
    }

    // Door

    ctx.fillStyle = "#080808";

    ctx.fillRect(
        x + 145,
        y + 145,
        110,
        135
    );

    ctx.fillStyle = "#d7b63f";

    ctx.font = "bold 25px Arial";

    ctx.fillText(
        "FACTORY",
        x + 145,
        y + 130
    );
}

/* =========================
   BOSS
========================= */

function drawBoss() {

    if (!bossFight || bossDefeated) return;

    ctx.save();

    ctx.translate(
        boss.x,
        boss.y
    );

    // Shadow

    ctx.fillStyle = "rgba(0,0,0,0.4)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        50,
        42,
        12,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Legs

    ctx.fillStyle = "#111";

    ctx.fillRect(
        -18,
        20,
        14,
        38
    );

    ctx.fillRect(
        5,
        20,
        14,
        38
    );

    // Coat

    ctx.fillStyle = "#16181c";

    ctx.fillRect(
        -32,
        -25,
        64,
        58
    );

    // Shirt

    ctx.fillStyle = "#ddd";

    ctx.fillRect(
        -10,
        -30,
        20,
        28
    );

    // Tie

    ctx.fillStyle = "#9c252b";

    ctx.fillRect(
        -4,
        -27,
        8,
        35
    );

    // Head

    ctx.fillStyle = "#bd825f";

    ctx.fillRect(
        -21,
        -68,
        42,
        35
    );

    // Hair

    ctx.fillStyle = "#121212";

    ctx.fillRect(
        -23,
        -74,
        46,
        14
    );

    ctx.fillRect(
        -17,
        -80,
        34,
        10
    );

    // Eyes

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        -12,
        -53,
        6,
        5
    );

    ctx.fillRect(
        6,
        -53,
        6,
        5
    );

    // Arms

    ctx.fillStyle = "#16181c";

    ctx.fillRect(
        -43,
        -18,
        18,
        45
    );

    ctx.fillRect(
        25,
        -18,
        18,
        45
    );

    // Weapon

    ctx.fillStyle = "#090909";

    ctx.fillRect(
        28,
        10,
        55,
        10
    );

    // Health bar

    ctx.fillStyle = "#111";

    ctx.fillRect(
        -60,
        -95,
        120,
        10
    );

    ctx.fillStyle = "#d83232";

    ctx.fillRect(
        -58,
        -93,
        116 *
        (boss.health / boss.maxHealth),
        6
    );

    ctx.fillStyle = "#fff";

    ctx.font = "bold 14px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "MAFIA BOSS",
        0,
        -103
    );

    ctx.restore();
}

/* =========================
   BULLETS
========================= */

function drawBullets() {

    for (const bullet of bullets) {

        ctx.fillStyle = "#ffe16a";

        ctx.fillRect(
            bullet.x - 5,
            bullet.y - 2,
            10,
            4
        );
    }
}

/* =========================
   HUD
========================= */

function updateHUD() {

    healthText.textContent =
        Math.max(0, Math.floor(player.health));

    ammoText.textContent =
        player.ammo;

    coinsText.textContent =
        player.coins;

    cluesText.textContent =
        clues + "/30";
}

/* =========================
   END
========================= */

function endGame(title, text) {

    if (finished) return;

    finished = true;

    endingTitle.textContent = title;

    endingText.textContent = text;

    endingPanel.style.display = "flex";
}

restartButton.addEventListener("click", () => {
    location.reload();
});

/* =========================
   MAIN LOOP
========================= */

function gameLoop() {

    updatePlayer();
    updateShooting();
    updateEnemies();
    updateBullets();
    updateBoss();
    updateFactory();
    updateCamera();
    updateInteraction();

    // Boss bullet damage
    for (let i = bullets.length - 1; i >= 0; i--) {

        if (hitBoss(bullets[i])) {

            bullets.splice(i, 1);
        }
    }

    drawWorld();

    requestAnimationFrame(gameLoop);
}

gameLoop();

console.log("AFTERLIGHT CLEAN BUILD LOADED");