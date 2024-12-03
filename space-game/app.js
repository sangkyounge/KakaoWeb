// 1. 이미지 로딩 함수
function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}

// 2. 이벤트 관리 클래스
class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }

    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((l) => l(message, payload));
        }
    }
}

// 3. 메시지 상수
const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    COLLISION_COMPANION_LASER: "COLLISION_COMPANION_LASER",
};

// 4. 기본 게임 객체 클래스
class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;
    }

    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

// 5. 영웅 클래스
class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = 'Hero';
        this.cooldown = 0;
        
        // 메인 우주선과의 간격과 크기 비율 설정
        const WING_SPACING = 40;
        const WING_SCALE = 0.5;
        const companionWidth = this.width * WING_SCALE;
        
        this.companions = [
            new Companion(x - WING_SPACING - companionWidth, y + 10, true),
            new Companion(x + this.width + WING_SPACING, y + 10, false)
        ];
        gameObjects.push(...this.companions);
    }

    moveX(distance) {
        this.x += distance;
        this.companions.forEach(companion => {
            companion.x += distance;
        });
    }

    moveY(distance) {
        this.y += distance;
        this.companions.forEach(companion => {
            companion.y += distance;
        });
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 45, this.y - 10));
            this.cooldown = 500;
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0;
    }

    updateCompanions() {
        this.companions.forEach(companion => {
            if (companion.canFire()) {
                companion.fire();
            }
        });
    }
}

// 6. 컴패니언 클래스
class Companion extends GameObject {
    constructor(x, y, isLeft) {
        super(x, y);
        this.width = 99 * 0.5;  // 메인 우주선 크기의 0.5배
        this.height = 75 * 0.5;
        this.type = 'Companion';
        this.isLeft = isLeft;
        this.cooldown = 0;
        this.img = heroImg;
    }

    fire() {
        if (this.canFire()) {
            const laserX = this.x + this.width / 2 - 2;
            gameObjects.push(new CompanionLaser(laserX, this.y - 10));
            this.cooldown = 1000;
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0;
    }
}

// 7. 적 클래스
class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                console.log('Stopped at', this.y);
                clearInterval(id);
            }
        }, 300);
    }
}

// 8. 레이저 클래스
class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

// 9. 컴패니언 레이저 클래스
class CompanionLaser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 5;
        this.height = 15;
        this.type = 'CompanionLaser';
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

// 10. 폭발 클래스
class Explosion extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 50;
        this.height = 50;
        this.type = 'Explosion';
        this.frame = 0;
        this.totalFrames = 10;
        this.img = explosionImg;
        
        let id = setInterval(() => {
            this.frame++;
            if (this.frame >= this.totalFrames) {
                this.dead = true;
                clearInterval(id);
            }
        }, 50);
    }
}

// 11. 충돌 감지 함수
function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

// 12. 게임 객체 생성 함수들
function createEnemies() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;
    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function createHero() {
    hero = new Hero(
        canvas.width / 2 - 45,
        canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    gameObjects.push(hero);
}

// 13. 게임 객체 그리기 함수
function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}

// 14. 게임 객체 업데이트 함수
function updateGameObjects() {
    const enemies = gameObjects.filter(go => go.type === "Enemy");
    const lasers = gameObjects.filter(go => go.type === "Laser" || go.type === "CompanionLaser");
    
    if (hero) {
        hero.updateCompanions();
    }

    lasers.forEach(laser => {
        enemies.forEach(enemy => {
            if (intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())) {
                gameObjects.push(new Explosion(enemy.x, enemy.y));
                eventEmitter.emit(
                    laser.type === "Laser" ? Messages.COLLISION_ENEMY_LASER : Messages.COLLISION_COMPANION_LASER,
                    { first: laser, second: enemy }
                );
            }
        });
    });

    gameObjects = gameObjects.filter(go => !go.dead);
}

// 15. 게임 초기화 함수
function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();

    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.moveY(-5);
    });
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.moveY(5);
    });
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.moveX(-5);
    });
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.moveX(5);
    });
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }
    });
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
    });
    eventEmitter.on(Messages.COLLISION_COMPANION_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
    });
}

// 16. 전역 변수 선언
let canvas, ctx, heroImg, enemyImg, laserImg, explosionImg;
let gameObjects = [];
let hero;
let eventEmitter = new EventEmitter();

// 17. 키보드 이벤트 리스너
window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if (evt.keyCode === 32) {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    }
});

// 18. 게임 시작
window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    heroImg = await loadTexture("asset/player.png");
    enemyImg = await loadTexture("asset/enemyShip.png");
    laserImg = await loadTexture("asset/laserRed.png");
    explosionImg = await loadTexture("asset/laserGreenShot.png");
    
    initGame();
    
    let gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGameObjects(ctx);
        updateGameObjects();
    }, 100);
};