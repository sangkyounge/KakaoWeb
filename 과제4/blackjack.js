//카드 뽑기
function drawCard() {
    return Math.floor(Math.random() * 10) + 1; 
}

//카드 합계 계산
function calculateSum(cards) {
    return cards.reduce((sum, card) => sum + card, 0);
}

//무작위 두 장의 카드 뽑기
//그 후 합계 계산
//Game Start!
function playGame() {
    let playerCards = [drawCard(), drawCard()];
    let dealerCards = [drawCard(), drawCard()];
    let playerSum = calculateSum(playerCards);
    let dealerSum = calculateSum(dealerCards);
    let gameState = "playing";

    //
    console.log(`플레이어 초기 카드: ${playerCards.join(', ')}, 합계: ${playerSum}`);
    console.log(`딜러의 첫 카드: ${dealerCards[0]}`);

    //플레이어 턴
    while (gameState === "playing") {
        if (playerSum === 21) {
            gameState = "playerBlackjack";
            break;
        } else if (playerSum > 21) {
            gameState = "playerBust";
            break;
        } else if (playerSum >= 17) {
            gameState = "playerStop";
            break;
        }

        playerCards.push(drawCard());
        playerSum = calculateSum(playerCards);
        console.log(`플레이어 카드: ${playerCards.join(', ')}, 합계: ${playerSum}`);
    }

    //딜러 턴
    if (gameState === "playerStop") {
        console.log(`딜러 카드: ${dealerCards.join(', ')}, 합계: ${dealerSum}`);
        while (dealerSum < 17) {
            dealerCards.push(drawCard());
            dealerSum = calculateSum(dealerCards);
            console.log(`딜러 카드: ${dealerCards.join(', ')}, 합계: ${dealerSum}`);
        }
        
        if (dealerSum > 21) {
            gameState = "dealerBust";
        } else {
            gameState = "compare";
        }
    }

    // 결과 출력
    console.log("\n게임 결과:");
    console.log(`플레이어 최종 카드: ${playerCards.join(', ')}, 합계: ${playerSum}`);
    console.log(`딜러 최종 카드: ${dealerCards.join(', ')}, 합계: ${dealerSum}`);

    if (gameState === "playerBlackjack") {
        console.log("블랙잭! 플레이어 승리");
    } else if (gameState === "playerBust") {
        console.log("플레이어 패배");
    } else if (gameState === "dealerBust") {
        console.log("플레이어 승리");
    } else if (gameState === "compare") {
        if (playerSum > dealerSum) {
            console.log("플레이어 승리");
        } else if (playerSum < dealerSum) {
            console.log("딜러 승리");
        } else {
            console.log("무승부");
        }
    }
}

playGame();