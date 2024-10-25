// 초기 변수 설정
let words = [];
let wordIndex = 0;
let startTime = Date.now();

// DOM 요소 가져오기
const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const typedValueElement = document.getElementById('typed-value');
const startButton = document.getElementById('start'); // 버튼 요소 가져오기

// 인용구 배열
const quotes = [
    'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
    'There is nothing more deceptive than an obvious fact.',
    'I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.',
    'I never make exceptions. An exception disproves the rule.',
    'What one man can invent another can discover.',
    'Nothing clears up a case so much as stating it to another person.',
    'Education never ends, Watson. It is a series of lessons, with the greatest for the last.',
];

// 시작 버튼 이벤트 리스너
startButton.addEventListener('click', () => {
    const quoteIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[quoteIndex];
    words = quote.split(' ');
    wordIndex = 0;
    const spanWords = words.map(function(word) { return `<span>${word} </span>` });
    quoteElement.innerHTML = spanWords.join('');
    quoteElement.childNodes[0].className = 'highlight';
    messageElement.innerText = '';
    typedValueElement.value = '';
    typedValueElement.focus();
    typedValueElement.disabled = false;  // 시작할 때 입력 필드 활성화
    startTime = new Date().getTime();
    startButton.disabled = true; // 시작 시 버튼 비활성화
    
    if(wordIndex == words.length - 1){
        
        startButton.disabled =false; // 마지막 글자 시 버튼 활성화
        return;
    }
});

// 입력 이벤트 리스너
typedValueElement.addEventListener('input', () => {
    const currentWord = words[wordIndex];
    const typedValue = typedValueElement.value;
    
    // 마지막 단어 체크 수정
    if (wordIndex === words.length - 1) {
        if (currentWord === typedValue) {  // 마지막 단어가 일치
            const elapsedTime = new Date().getTime() - startTime;
            const message = `CONGRATULATIONS! You finished in ${elapsedTime / 1000} seconds.`; // 끝난 시간
            messageElement.innerText = message;
           
            startButton.disabled = false; // 게임 완료 시 버튼 활성화
            return;
        }
    }
    
    // 일반 단어 체크
    if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
        typedValueElement.value = '';
        wordIndex++;
        // 모든 하이라이트 제거
        for (const wordElement of quoteElement.childNodes) {
            wordElement.className = '';
        }
        // 현재 단어 하이라이트
        quoteElement.childNodes[wordIndex].className = 'highlight';
    } else if (currentWord.startsWith(typedValue)) {
        typedValueElement.className = '';
    } else {
        typedValueElement.className = 'error';
    }
});