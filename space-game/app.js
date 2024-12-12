// 1. 이미지 로딩 함수
// 15페이지부터 다시
// Life 뜨게 수정 필요

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

    clear() {
        this.listeners = {};
    }

}

// 3. 메시지 상수
const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    KEY_EVENT_T: "KEY_EVENT_T",         // 추가
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    COLLISION_COMPANION_LASER: "COLLISION_COMPANION_LASER",
    GAME_END_WIN: "GAME_END_WIN",
    GAME_END_LOSS: "GAME_END_LOSS",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    STAGE_START: "STAGE_START",         // 추가
    STAGE_CLEAR: "STAGE_CLEAR"          // 추가
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

function drawLife() {
    const START_POS = canvas.width - 180;
    for (let i = 0; i < hero.life; i++) {
        ctx.drawImage(
            lifeImg,
            START_POS + (45 * (i + 1)),
            canvas.height - 37);
    }
}
function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height - 20);
}
function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}

// 5. 영웅 클래스
class Hero extends GameObject {


    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = 'Hero';
        this.cooldown = 0;

        this.life = 3;
        this.points = 0;

        this.normalCooldown = 0;
        this.specialCooldown = 0;


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

    fireMultiLaser() {
        // specialCooldown 조건 제거
        for (let i = 0; i < 5; i++) {
            const angle = (i - 2) * Math.PI / 18;
            const laser = new GreenLaser(this.x + 45, this.y - 10, angle);
            gameObjects.push(laser);
        }
    }

    canFire() {
        return this.normalCooldown === 0;  // 일반 공격은 normalCooldown만 체크
    }

    canFireSpecial() {
        return this.specialCooldown === 0;  // 특수 공격은 specialCooldown 체크
    }

    // 점수 누적을 위해 points 초기화 제거

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

    decrementLife() {
        this.life--;
        if (this.life === 0) {
            this.dead = true;
        }
    }

    incrementPoints() {
        this.points += 100;
        console.log('Score increased! Current points:', this.points);
    }



    updateImage() {
        if (this.life === 1) {
            this.img = playerDamagedImg;
        }
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
        this.collisionCooldown = 0; // 충돌 쿨다운 추가

        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
                if (this.collisionCooldown > 0) {
                    this.collisionCooldown--;
                }
            } else {
                console.log('Stopped at', this.y);
                clearInterval(id);
            }
        }, 300);
    }
}




// 7-2. 움직이는 적 클래스
function createMovingEnemies() {
    const V_FORMATION = [
        { x: canvas.width * 0.5, y: 50 },  // 탑
        { x: canvas.width * 0.3, y: 100 }, // 왼쪽 윙
        { x: canvas.width * 0.7, y: 100 }, // 오른쪽 윙
        { x: canvas.width * 0.2, y: 150 }, // 왼쪽 끝
        { x: canvas.width * 0.8, y: 150 }  // 오른쪽 끝
    ];

    V_FORMATION.forEach((pos) => {
        const enemy = new MovingEnemy(pos.x, pos.y);
        enemy.img = enemyImg;
        gameObjects.push(enemy);
    });
}
// UFO 보스 클래스 추가 (Enemy 클래스 다음에 추가)
class BossEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.width = 150;
        this.height = 150;
        this.type = "Boss";
        this.health = 50;
        this.direction = 1;
        this.meteorCooldown = 0;
        this.moveInterval = null;  // interval을 저장할 변수 추가
        
        this.startMoving();
    }

    startMoving() {
        this.moveInterval = setInterval(() => {
            if (this.dead) {
                clearInterval(this.moveInterval);
                return;
            }

            this.x += 2 * this.direction;
            if (this.x > canvas.width - this.width || this.x < 0) {
                this.direction *= -1;
            }
            
            if (this.meteorCooldown > 0) {
                this.meteorCooldown--;
            } else if (hero && !this.dead) {
                this.fireMeteor();
                this.meteorCooldown = 50;
            }
        }, 50);
    }

    die() {
        this.dead = true;
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
    }

    takeDamage() {
        this.health -= 1;
        if (this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    fireMeteor() {
        if (hero && !this.dead) {
            const meteor = new Meteor(
                this.x + this.width/2,
                this.y + this.height,
                hero.x + hero.width/2,
                hero.y + hero.height/2
            );
            meteor.img = meteorBigImg;
            gameObjects.push(meteor);
        }
    }
}
    

function createBoss() {
    const boss = new BossEnemy(canvas.width/2 - 75, 50);
    boss.img = enemyUFOImg;
    gameObjects.push(boss);
}

// Meteor 클래스 추가
class Meteor extends GameObject {
    constructor(x, y, targetX, targetY) {
        super(x, y);
        this.width = 40;
        this.height = 40;
        this.type = 'Meteor';
        
        // 플레이어 방향으로 발사
        const dx = targetX - x;
        const dy = targetY - y;
        const angle = Math.atan2(dy, dx);
        this.speedX = Math.cos(angle) * 3;  // 속도 조절
        this.speedY = Math.sin(angle) * 3;

        this.moveInterval = setInterval(() => {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
                this.dead = true;
                clearInterval(this.moveInterval);
            }
        }, 20);
    }
}

// createBoss 함수 추가
function createBoss() {
    const boss = new BossEnemy(canvas.width / 2 - 75, 50);
    boss.img = enemyUFOImg;
    gameObjects.push(boss);
}

// MovingEnemy 클래스도 수정
class MovingEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.initialX = x;
        this.direction = 1;
        this.speed = 1;  // 속도 감소

        clearInterval(this.moveInterval);
        this.moveInterval = setInterval(() => {
            this.x += this.speed * this.direction;
            if (this.x > this.initialX + 100 || this.x < this.initialX - 100) {
                this.direction *= -1;
            }
            this.y += 0.5;  // 아래로 이동하는 속도도 감소
        }, 50);
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
class GreenLaser extends Laser {
    constructor(x, y, angle) {
        super(x, y);
        this.img = laserGreenImg;
        this.angle = angle;
        this.speed = 15;
        
        // interval을 새로 설정
        clearInterval(this.moveInterval);  // 부모 클래스의 interval 제거
        this.moveInterval = setInterval(() => {
            this.x += Math.sin(this.angle) * this.speed;
            this.y -= Math.cos(this.angle) * this.speed;
            if (this.y < 0 || this.x < 0 || this.x > canvas.width) {
                this.dead = true;
                clearInterval(this.moveInterval);
            }
        }, 50);
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
    const enemies = gameObjects.filter(go => go.type === "Enemy" || go.type === "Boss");
    const lasers = gameObjects.filter(go => go.type === "Laser" || go.type === "CompanionLaser");

    if (hero) {
        hero.updateCompanions();
    }

    // 레이저 충돌 처리
    lasers.forEach(laser => {
        enemies.forEach(enemy => {
            if (!enemy.dead && intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())) {
                gameObjects.push(new Explosion(enemy.x, enemy.y));
                
                if (enemy.type === "Boss") {
                    if (enemy.takeDamage()) {  // 보스 처치 시
                        enemy.dead = true;
                        laser.dead = true;
                        hero.incrementPoints();
                        clearInterval(gameLoopId);
                        gameLoopId = null;
                        endGame(true);  // 최종 승리
                    }
                } else {
                    enemy.dead = true;
                    laser.dead = true;
                    hero.incrementPoints();
                    
                    // 일반 적 모두 처치 시 다음 스테이지로
                    if (isEnemiesDead()) {
                        if (currentStage === 2) {  // 2라운드 클리어 시
                            currentStage = 3;  // 3라운드로 직접 설정
                            clearInterval(gameLoopId);
                            gameLoopId = null;
                            setTimeout(() => {
                                displayStageMessage(currentStage);
                            }, 500);
                        } else if (currentStage === 1) {  // 1라운드 클리어 시
                            currentStage = 2;
                            clearInterval(gameLoopId);
                            gameLoopId = null;
                            setTimeout(() => {
                                displayStageMessage(currentStage);
                            }, 500);
                        }
                    }
                }
            }
        });
    });

    gameObjects = gameObjects.filter(go => !go.dead);

    // 영웅과 적/메테오 충돌 처리
    enemies.forEach(enemy => {
        if (!enemy.dead && enemy.collisionCooldown === 0) {
            const heroRect = hero.rectFromGameObject();
            if (intersectRect(heroRect, enemy.rectFromGameObject())) {
                enemy.collisionCooldown = 10;
                hero.decrementLife();
                hero.updateImage();
            }
        }
    });

    // 메테오 충돌 처리 유지
    const meteors = gameObjects.filter(go => go.type === "Meteor");
    meteors.forEach(meteor => {
        if (intersectRect(hero.rectFromGameObject(), meteor.rectFromGameObject())) {
            meteor.dead = true;
            hero.decrementLife();
            hero.updateImage();
        }
    });

    if (isHeroDead()) {
        eventEmitter.emit(Messages.GAME_END_LOSS);
    }
}
// 14.5
function endGame(win) {
    clearInterval(gameLoopId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "30px Arial";
    ctx.textAlign = "center";

    if (win) {
        ctx.fillStyle = "green";
        ctx.fillText(
            "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
            canvas.width / 2,
            canvas.height / 2
        );
    } else {
        ctx.fillStyle = "red";
        ctx.fillText(
            "You died !!! Press [Enter] to start a new game Captain Pew Pew",
            canvas.width / 2,
            canvas.height / 2
        );
    }
}

function displayStageMessage(stageNum) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Stage ${stageNum}`, canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press [Enter] to start", canvas.width / 2, canvas.height / 2 + 40);
}

function startStage(stageNum) {
    console.log(`Starting stage ${stageNum}`);
    gameObjects = [];
    createHero();
    
    switch(stageNum) {
        case 1:
            createEnemies();
            break;
        case 2:
            createMovingEnemies();
            break;
        case 3:
            createBoss();
            break;
    }

    gameLoopId = setInterval(gameLoop, 100);
}



// 15. 게임 초기화 함수
function initGame() {
    
    if (currentStage === 0) {  // 처음 시작할 때만
        currentStage = 1;
        displayStageMessage(currentStage);
    }
    
    gameObjects = [];
    createEnemies();
    createHero();

    // 움직임 관련 이벤트
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
    eventEmitter.on(Messages.KEY_EVENT_T, () => {
        if (hero && hero.canFire()) {
            hero.fireMultiLaser();
        }
    });

    // 충돌 관련 이벤트
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        hero.incrementPoints();
        
        if (isEnemiesDead()) {
            if (currentStage === 3) {  // 보스 스테이지 클리어
                clearInterval(gameLoopId);
                gameLoopId = null;
                endGame(true);  // 게임 클리어
            } else {  // 다음 스테이지로
                currentStage++;
                clearInterval(gameLoopId);
                gameLoopId = null;
                displayStageMessage(currentStage);
            }
        }
    });

    eventEmitter.on(Messages.COLLISION_COMPANION_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        hero.incrementPoints();
    });

    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();
        hero.updateImage();  // HP가 1일 때 이미지 변경
        if (isHeroDead()) {
            eventEmitter.emit(Messages.GAME_END_LOSS);
            return;
        }
    });

    // 게임 종료 관련 이벤트
    eventEmitter.on(Messages.GAME_END_WIN, () => {
        endGame(true);
    });

    eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false);
    });

    // 스테이지 관련 이벤트
    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        if (!gameLoopId) {
            startStage(currentStage);
        }
    });

    eventEmitter.on(Messages.STAGE_CLEAR, () => {
        currentStage++;
        if (currentStage <= 3) {
            startStage(currentStage);
        }
    });
    eventEmitter.on(Messages.KEY_EVENT_T, () => {
        if (hero && hero.canFireSpecial()) {  // specialCooldown 체크
            hero.fireMultiLaser();
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGameObjects(ctx);
    updateGameObjects();
    drawPoints();
    drawLife();
}


// 16. 전역 변수 선언
let canvas, ctx, heroImg, enemyImg, laserImg, explosionImg, lifeImg, gameLoopId,
    playerDamagedImg, laserGreenImg, enemyUFOImg, meteorBigImg;
let gameObjects = [];
let hero;
let currentStage = 0;                   // 스테이지 변수 추가
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
    else if (evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    }
    else if (evt.key.toLowerCase() === 't') {
        eventEmitter.emit(Messages.KEY_EVENT_T);
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
    lifeImg = await loadTexture("asset/life.png");
    playerDamagedImg = await loadTexture("asset/playerDamaged.png");
    laserGreenImg = await loadTexture("asset/laserGreen.png");
    enemyUFOImg = await loadTexture("asset/enemyUFO.png");
    meteorBigImg = await loadTexture("asset/meteorBig.png"); 

   // let enemyUFOImg, meteorBigImg;
    initGame();

    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGameObjects(ctx);
        updateGameObjects();
        drawPoints();  // 게임 루프 안으로 이동
        drawLife();    // drawLife 추가
        // 디버깅을 위한 콘솔 로그 추가
        console.log('Current Life:', hero.life);
        console.log('Current Points:', hero.points);
    }, 100);

    // drawPoints() 호출 제거 (이미 게임 루프 안에 있으므로)


};

function isHeroDead() {
    return hero.life <= 0;
}
function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" &&
        !go.dead);
    return enemies.length === 0;
}

function displayMessage(message, color = "red") {
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function endGame(win) {
    clearInterval(gameLoopId);
    gameLoopId = null;

    // 모든 interval 정리
    gameObjects.forEach(obj => {
        if (obj.moveInterval) {
            clearInterval(obj.moveInterval);
            obj.moveInterval = null;
        }
    });
    
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        
        if (win && currentStage === 3) {
            ctx.fillStyle = "gold";
            ctx.fillText("Mission Clear!", canvas.width / 2, canvas.height / 2);
            ctx.font = "30px Arial";
            ctx.fillText(`Final Score: ${hero.points}`, canvas.width / 2, canvas.height / 2 + 50);
            ctx.fillText("Press F5 to play again", canvas.width / 2, canvas.height / 2 + 100);
            gameObjects = [];  // 게임 오브젝트 초기화
        } else if (!win) {
            ctx.fillStyle = "red";
            ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
            ctx.font = "30px Arial";
            ctx.fillText(`Score: ${hero.points}`, canvas.width / 2, canvas.height / 2 + 50);
        }
    }, 200);
}