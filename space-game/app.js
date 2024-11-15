function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    })
}

// 역삼각형 형태로 적 배치하는 함수
function createEnemies2(ctx, canvas, enemyImg) {
    const ROWS = 5; // 역삼각형 높이
    const ENEMY_SPACING = 10; // 적군 간 간격
    
    for (let row = 0; row < ROWS; row++) {
        const enemiesInRow = ROWS - row; // 맨 위에 가장 많은 적을 배치
        const rowWidth = enemiesInRow * (enemyImg.width + ENEMY_SPACING);
        const startX = (canvas.width - rowWidth) / 2;
        
        for (let col = 0; col < enemiesInRow; col++) {
            const x = startX + col * (enemyImg.width + ENEMY_SPACING);
            const y = row * (enemyImg.height + ENEMY_SPACING) + 50; // 상단 여백
            ctx.drawImage(enemyImg, x, y);
        }
    }
}

// 배경 패턴 생성 함수
function createBackgroundPattern(ctx, canvas, backgroundImg) {
    // createPattern을 사용하여 배경 이미지를 반복 패턴으로 만듦
    const pattern = ctx.createPattern(backgroundImg, 'repeat');
    
    // 패턴을 fillStyle로 설정
    ctx.fillStyle = pattern;
    
    // 캔버스 전체를 패턴으로 채움
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 플레이어와 보조 우주선 그리기
function drawPlayerWithWings(ctx, canvas, heroImg) {
    const mainShipY = canvas.height - (canvas.height / 4);
    const mainShipX = canvas.width / 2 - heroImg.width / 2;
    
    // 메인 우주선
    ctx.drawImage(heroImg, mainShipX, mainShipY);
    
    // 왼쪽 보조 우주선 (크기를 0.5배로)
    const wingScale = 0.5;
    const wingSpacing = 40;
    ctx.drawImage(
        heroImg, 
        mainShipX - wingSpacing - (heroImg.width * wingScale), 
        mainShipY + 10,
        heroImg.width * wingScale,
        heroImg.height * wingScale
    );
    
    // 오른쪽 보조 우주선
    ctx.drawImage(
        heroImg,
        mainShipX + heroImg.width + wingSpacing,
        mainShipY + 10,
        heroImg.width * wingScale,
        heroImg.height * wingScale
    );
}

window.onload = async () => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    
    // 이미지 로드
    const heroImg = await loadTexture('asset/player.png');
    const enemyImg = await loadTexture('asset/enemyShip.png');
    const backgroundImg = await loadTexture('asset/starBackground.png');
    
    // 배경 패턴 생성 및 그리기
    createBackgroundPattern(ctx, canvas, backgroundImg);
    
    // 적군 역삼각형 배치
    createEnemies2(ctx, canvas, enemyImg);
    
    // 플레이어와 보조 우주선 그리기
    drawPlayerWithWings(ctx, canvas, heroImg);
};