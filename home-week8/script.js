// 초기 변수 설정
let words = [];
let wordIndex = 0;
let startTime = Date.now();
let totalCharacters = 0;
let correctCharacters = 0;
let timerInterval;

// DOM 요소 가져오기
const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const typedValueElement = document.getElementById('typed-value');
const startButton = document.getElementById('start');

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

// 올바른 입력시 폭죽 효과 함수
function fireCorrectConfetti() {
   const x = Math.random();
   const y = 0.7;
   
   const colors = [
       '#ff718d', '#71ff71', '#718dff', 
       '#FFD700', '#FF69B4', '#00FFFF',
       '#ff0000', '#00ff00', '#0000ff'
   ];

   confetti({
       particleCount: 20,
       spread: 360,
       startVelocity: 30,
       gravity: 0.5,
       origin: { x, y },
       colors: colors,
       shapes: ['star', 'circle'],
       ticks: 100
   });
}

// 단어 완성 시 폭죽 효과
function fireWordCompleteConfetti() {
   confetti({
       particleCount: 50,
       spread: 100,
       origin: { y: 0.6 },
       colors: ['#FFD700', '#FF69B4'],
       shapes: ['star']
   });
}

// 게임 완료 시 폭죽 효과
function fireGameCompleteConfetti() {
   for(let i = 0; i < 5; i++) {
       setTimeout(() => {
           confetti({
               particleCount: 100,
               spread: 160,
               origin: { x: Math.random(), y: Math.random() - 0.2 },
               colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
           });
       }, i * 300);
   }
}

// WPM 업데이트 함수
function updateWPM() {
   const currentTime = new Date().getTime();
   const timeElapsed = (currentTime - startTime) / 1000 / 60; // 분 단위
   const wordsTyped = wordIndex;
   const wpm = Math.round((wordsTyped / timeElapsed) || 0);
   document.getElementById('wpm').textContent = `Speed: ${wpm} WPM`;
   return wpm;
}

// 정확도 업데이트 함수
function updateAccuracy() {
   const accuracy = Math.round((correctCharacters / totalCharacters) * 100) || 0;
   document.getElementById('accuracy').textContent = `Accuracy: ${accuracy}%`;
   return accuracy;
}

// 타이머 함수
function startTimer() {
   let seconds = 0;
   timerInterval = setInterval(() => {
       seconds++;
       const minutes = Math.floor(seconds / 60);
       const remainingSeconds = seconds % 60;
       document.getElementById('timer').textContent = 
           `Time: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
   }, 1000);
}

// 진행 상황 바 업데이트 함수 수정
function updateProgressBar() {
   // 마지막 단어의 경우 100%로 설정
   const progress = wordIndex === words.length - 1 ? 100 : (wordIndex / words.length) * 100;
   document.getElementById('progress-bar').style.width = `${progress}%`;
}

// 최고 점수 관리 함수
function updateHighScore(wpm) {
   const currentHighScore = localStorage.getItem('highScore') || 0;
   if (wpm > currentHighScore) {
       localStorage.setItem('highScore', wpm);
       return true;
   }
   return false;
}

function getHighScore() {
   return localStorage.getItem('highScore') || 0;
}

// 모달 관련 함수
function showResultModal(time, wpm, accuracy) {
   const modal = document.getElementById('resultModal');
   const modalTime = document.getElementById('modalTime');
   const modalWpm = document.getElementById('modalWpm');
   const modalAccuracy = document.getElementById('modalAccuracy');
   const modalHighScore = document.getElementById('modalHighScore');
   const isNewHighScore = updateHighScore(wpm);

   modalTime.textContent = time;
   modalWpm.textContent = `${wpm} WPM`;
   modalAccuracy.textContent = `${accuracy}%`;
   modalHighScore.textContent = `${getHighScore()} WPM`;

   if (isNewHighScore) {
       modalHighScore.parentElement.innerHTML += ' 🏆 New Record!';
   }

   modal.style.display = 'block';
   fireGameCompleteConfetti();
}

// 키보드 애니메이션 함수
function highlightKey(key, isError = false) {
   const keyElement = document.querySelector(`[data-key="${key.toLowerCase()}"]`);
   if (keyElement) {
       keyElement.classList.add('active');
       if (isError) {
           keyElement.classList.add('error');
       }
       
       setTimeout(() => {
           keyElement.classList.remove('active');
           if (isError) {
               keyElement.classList.remove('error');
           }
       }, 100);
   }
}

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
   typedValueElement.disabled = false;
   
   // 상태 초기화
   totalCharacters = 0;
   correctCharacters = 0;
   clearInterval(timerInterval);
   startTimer();
   document.getElementById('progress-bar').style.width = '0%';
   
   // 상태 표시 초기화
   document.getElementById('wpm').textContent = 'Speed: 0 WPM';
   document.getElementById('accuracy').textContent = 'Accuracy: 100%';
   document.getElementById('timer').textContent = 'Time: 0:00';
   
   startTime = new Date().getTime();
   startButton.disabled = true;
});

// 입력 이벤트 리스너
typedValueElement.addEventListener('input', (e) => {
   const currentWord = words[wordIndex];
   const typedValue = typedValueElement.value;

   // 타이핑 통계 업데이트
   if (e.data) {
       totalCharacters++;
       if (currentWord.startsWith(typedValue)) {
           correctCharacters++;
       }
   }

   // 마지막 입력된 키 하이라이트
   const lastChar = e.data;
   if (lastChar) {
       const isCorrect = currentWord.startsWith(typedValue);
       highlightKey(lastChar, !isCorrect);
   }

   // 상태 업데이트
   const wpm = updateWPM();
   const accuracy = updateAccuracy();
   
   // 마지막 단어 체크
   if (wordIndex === words.length - 1) {
       if (currentWord === typedValue) {
           // 진행 상황 바를 100%로 업데이트
           document.getElementById('progress-bar').style.width = '100%';
           
           const elapsedTime = new Date().getTime() - startTime;
           const timeString = `${Math.floor(elapsedTime / 60000)}:${((elapsedTime % 60000) / 1000).toFixed(0).padStart(2, '0')}`;
           
           clearInterval(timerInterval);
           showResultModal(timeString, wpm, accuracy);
           startButton.disabled = false;
           return;
       }
   }

   // 일반적인 진행 상황 업데이트
   updateProgressBar();

   // 일반 단어 체크
   if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
       fireWordCompleteConfetti();
       typedValueElement.value = '';
       wordIndex++;
       
       for (const wordElement of quoteElement.childNodes) {
           wordElement.className = '';
       }
       quoteElement.childNodes[wordIndex].className = 'highlight';
       typedValueElement.className = '';
   } else if (currentWord.startsWith(typedValue)) {
       typedValueElement.className = '';
       fireCorrectConfetti();
   } else {
       typedValueElement.className = 'error';
   }
});

// 모달 이벤트 리스너
document.querySelector('.close').addEventListener('click', () => {
   document.getElementById('resultModal').style.display = 'none';
});

document.getElementById('playAgain').addEventListener('click', () => {
   document.getElementById('resultModal').style.display = 'none';
   startButton.click();
});

window.addEventListener('click', (e) => {
   const modal = document.getElementById('resultModal');
   if (e.target === modal) {
       modal.style.display = 'none';
   }
});

// 키보드 이벤트 리스너
document.addEventListener('keydown', (e) => {
   const key = e.key.toLowerCase();
   const keyElement = document.querySelector(`[data-key="${key}"]`);
   if (keyElement) {
       keyElement.classList.add('active');
   }
});

document.addEventListener('keyup', (e) => {
   const key = e.key.toLowerCase();
   const keyElement = document.querySelector(`[data-key="${key}"]`);
   if (keyElement) {
       keyElement.classList.remove('active');
       keyElement.classList.remove('error');
   }
});