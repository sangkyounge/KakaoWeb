//맛 종류
//보기 편하게 한글로 정리해놨습니다.
let iceCreamFlavors = [
  { name: "초콜릿", type: "초콜릿", price: 2 },
  { name: "딸기", type: "과일", price: 1 },
  { name: "바닐라", type: "바닐라", price: 2 },
  { name: "피스타치오", type: "견과류", price: 1.5 },
  { name: "나폴리탄", type: "초콜릿", price: 2},
  { name: "민트 초코", type: "초콜릿", price: 1.5 },
  { name: "라즈베리", type: "과일", price: 1},
];

//거래 정보(맛, 가격)
let transactions = []
transactions.push({ scoops: ["초콜릿", "바닐라", "민트 초코"], total: 5.5 })
transactions.push({ scoops: ["라즈베리", "딸기"], total: 2 })
transactions.push({ scoops: ["바닐라", "바닐라"], total: 4 })

//수익 계산
const total = transactions.reduce((acc, curr) => acc + curr.total, 0);
console.log(`오늘의 총 수익: ${total}달러`);

//각 맛의 판매량
let flavorDistribution = transactions.reduce((acc, curr) => {
  //각 거래에서 선택된 모든 맛을 순회
  curr.scoops.forEach(scoop => {
    if (!acc[scoop]) {
      acc[scoop] = 0;
    }
    acc[scoop]++;
  })
  return acc;
}, {})

console.log("\n각 맛별 판매량:");
console.log(flavorDistribution);

//가장 많이 팔린 아이스크림 맛
let bestFlavor = Object.keys(flavorDistribution).reduce((a, b) =>
   flavorDistribution[a] > flavorDistribution[b] ? a : b
);

console.log(`\n가장 많이 팔린 맛은 ${bestFlavor}로, ${flavorDistribution[bestFlavor]}스쿱 판매되었습니다.`);


