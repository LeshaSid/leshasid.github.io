// ================== ОБЩИЕ ФУНКЦИИ ==================
function playSound(url) {
  if (!url) return;
  try {
    const audio = new Audio(url);
    audio.play().catch(e => console.log("Автовоспроизведение заблокировано"));
  } catch (e) {
    console.error("Ошибка воспроизведения звука:", e);
  }
}

// ================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==================
let navButtons, screens;
const gamesCompleted = {
  quiz: false,
  memory: false,
  cards: false,
  detective: false
};
const BOX_CODES = ["1984", "LAMP", "TOWE", "FINA"];

// ================== НАВИГАЦИЯ ==================
function startGames() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const container = document.getElementById('container');
  
  if (welcomeScreen && container) {
    welcomeScreen.classList.remove('active');
    container.style.display = 'block';
    
    // Инициализируем навигацию, если еще не сделано
    if (!navButtons || !screens) {
      initNavigation();
    }
    
    if (navButtons && navButtons.quiz) {
      navButtons.quiz.click();
    }
  }
}

function initNavigation() {
  navButtons = {
    quiz: document.getElementById('navQuiz'),
    memory: document.getElementById('navMemory'),
    cards: document.getElementById('navCards'),
    detective: document.getElementById('navDetective'),
  };

  screens = {
    quiz: document.getElementById('quiz'),
    memory: document.getElementById('memoryGame'),
    cards: document.getElementById('cards'),
    detective: document.getElementById('detective'),
  };

  // Назначаем обработчики только если элементы существуют
  if (navButtons.quiz && screens.quiz) {
    Object.entries(navButtons).forEach(([key, btn]) => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (canAccessGame(key)) {
            Object.values(navButtons).forEach(b => b && b.classList.remove('active'));
            Object.values(screens).forEach(s => s && s.classList.remove('active'));
            
            btn.classList.add('active');
            if (screens[key]) {
              screens[key].classList.add('active');
            }
            
            if (key === 'quiz') startQuizTimer();
            if (key === 'memory') resetMemoryGame();
            if (key === 'cards') initAilaGame(); // Инициализация игры "Эйла"
          }
        });
      }
    });
  }
}

function canAccessGame(gameKey) {
  if (location.search.includes('debug')) return true;
  
  const gameOrder = ['quiz', 'memory', 'cards', 'detective'];
  const currentIndex = gameOrder.indexOf(gameKey);
  
  if (gamesCompleted[gameKey]) return true;
  
  for (let i = 0; i < currentIndex; i++) {
    if (!gamesCompleted[gameOrder[i]]) return false;
  }
  
  return true;
}

function showBoxAnimation(boxNumber) {
  const boxAnim = document.getElementById('boxAnimation');
  if (!boxAnim) return;
  
  boxAnim.textContent = `Коробка ${boxNumber} открыта!`;
  boxAnim.style.display = 'block';
  boxAnim.style.animation = 'none';
  void boxAnim.offsetWidth;
  boxAnim.style.animation = 'openBox 1.5s ease';
  playSound('notify.wav');
  
  setTimeout(() => {
    boxAnim.style.display = 'none';
    
    if (boxNumber === 1 && gamesCompleted.quiz) {
      navButtons.memory && navButtons.memory.click();
    } else if (boxNumber === 2 && gamesCompleted.memory) {
      navButtons.cards && navButtons.cards.click();
    } else if (boxNumber === 3 && gamesCompleted.cards) {
      navButtons.detective && navButtons.detective.click();
    } else if (boxNumber === 4 && gamesCompleted.detective) {
      showFinalAnimation();
    }
  }, 1500);
}

function showFinalAnimation() {
  const finalAnim = document.getElementById('finalAnimation');
  if (finalAnim) {
    finalAnim.style.display = 'flex';
    finalAnim.classList.add('show');
    playSound('notify.wav');
  }
}

function closeFinalAnimation() {
  const finalAnim = document.getElementById('finalAnimation');
  if (finalAnim) {
    finalAnim.style.display = 'none';
    finalAnim.classList.remove('show');
  }
}

// ================== ЛАБИРИНТ ПАМЯТИ ==================
const memoryGameGrid = document.getElementById('memoryGameGrid');
const memoryFeedback = document.getElementById('memoryFeedback');
const memoryStartBtn = document.getElementById('memoryStartBtn');
const memoryDifficulty = document.getElementById('memoryDifficulty');

let sequence = [];
let userSequence = [];
let memoryLevel = 1;
let isPlayingSequence = false;
let canClick = false;
let maxLevel = 5; // По умолчанию средняя сложность

const DIFFICULTY_LEVELS = {
  easy: { levels: 3, flash: 1000, pause: 500 },
  medium: { levels: 5, flash: 800, pause: 400 },
  hard: { levels: 7, flash: 600, pause: 300 },
  expert: { levels: 10, flash: 400, pause: 200 }
};

function createMemoryGrid() {
  if (!memoryGameGrid) return;
  
  memoryGameGrid.innerHTML = '';
  memoryGameGrid.style.gridTemplateColumns = 'repeat(3, 100px)';
  
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'memoryCell';
    cell.dataset.index = i;
    
    const img = document.createElement('img');
    img.src = 'gas-lamp.png'; // Базовое изображение
    img.alt = `Лампа ${i+1}`;
    img.style.width = '80%';
    img.style.height = '80%';
    img.style.objectFit = 'contain';
    
    cell.appendChild(img);
    memoryGameGrid.appendChild(cell);

    cell.addEventListener('click', () => {
      if (canClick && !isPlayingSequence) handleMemoryClick(i, cell);
    });
  }
}

async function playSequence() {
  if (!memoryGameGrid) return;
  
  isPlayingSequence = true;
  canClick = false;
  if (memoryFeedback) memoryFeedback.textContent = 'Запоминай последовательность...';
  
  const difficulty = memoryDifficulty.value;
  const settings = DIFFICULTY_LEVELS[difficulty];
  const flashDuration = settings.flash - (memoryLevel * 50);
  const pauseDuration = settings.pause - (memoryLevel * 20);
  
  for (const idx of sequence) {
    await flashCell(idx, flashDuration);
    await new Promise(resolve => setTimeout(resolve, pauseDuration));
  }
  
  isPlayingSequence = false;
  canClick = true;
  if (memoryFeedback) memoryFeedback.textContent = 'Твой ход! Повтори последовательность.';
}

function flashCell(index, duration) {
  return new Promise((resolve) => {
    if (!memoryGameGrid || !memoryGameGrid.children[index]) {
      resolve();
      return;
    }
    
    const cell = memoryGameGrid.children[index];
    cell.classList.add('active');
    playSound('notify.wav');
    
    setTimeout(() => {
      cell.classList.remove('active');
      setTimeout(resolve, 200);
    }, duration);
  });
}

function handleMemoryClick(i, cell) {
  playSound('notify.wav');
  userSequence.push(i);
  cell.classList.add('active');
  
  setTimeout(() => {
    cell.classList.remove('active');
    checkUserSequence();
  }, 300);
}

function checkUserSequence() {
  const currentStep = userSequence.length - 1;
  
  if (userSequence[currentStep] !== sequence[currentStep]) {
    if (memoryFeedback) {
      memoryFeedback.textContent = `Ошибка! Ты дошёл до уровня ${memoryLevel}. Попробуй снова!`;
      memoryFeedback.style.color = '#f44336';
    }
    if (memoryStartBtn) memoryStartBtn.disabled = false;
    resetMemoryGame();
    return;
  }
  
  if (userSequence.length === sequence.length) {
    if (memoryLevel >= maxLevel) {
      if (memoryFeedback) {
        memoryFeedback.textContent = 'Поздравляю! Ты прошёл Лабиринт памяти!';
        memoryFeedback.style.color = '#4caf50';
      }
      gamesCompleted.memory = true;
      setTimeout(() => showBoxAnimation(2), 1500);
    } else {
      memoryLevel++;
      userSequence = [];
      if (memoryFeedback) {
        memoryFeedback.textContent = `Уровень ${memoryLevel}! Запоминай новую последовательность.`;
        memoryFeedback.style.color = '#4caf50';
      }
      setTimeout(() => startMemoryRound(), 1000);
    }
  }
}

function startMemoryRound() {
  if (memoryStartBtn) memoryStartBtn.disabled = true;
  userSequence = [];
  
  // Выбираем уникальную позицию для новой лампы
  let newPosition;
  do {
    newPosition = Math.floor(Math.random() * 9);
  } while (sequence.length > 0 && sequence[sequence.length - 1] === newPosition);
  
  sequence.push(newPosition);
  setTimeout(() => playSequence(), 800);
}

function resetMemoryGame() {
  sequence = [];
  userSequence = [];
  memoryLevel = 1;
  const difficulty = memoryDifficulty.value;
  maxLevel = DIFFICULTY_LEVELS[difficulty].levels;
  
  if (memoryFeedback) {
    memoryFeedback.textContent = 'Нажми "Начать игру" для старта';
    memoryFeedback.style.color = '';
  }
  if (memoryStartBtn) memoryStartBtn.disabled = false;
}

if (memoryStartBtn) {
  memoryStartBtn.addEventListener('click', () => {
    resetMemoryGame();
    if (memoryFeedback) {
      memoryFeedback.style.color = '#ffcc33';
      memoryFeedback.textContent = 'Игра начинается!';
    }
    startMemoryRound();
  });
}

// ================== ВИКТОРИНА ==================
let currentQuiz = 0;
let quizTimeLeft = 15;
let quizTimerInterval = null;
const quizQuestionEl = document.querySelector('#quizQuestion');
const quizImageEl = document.getElementById('quizImage');
const quizFeedback = document.getElementById('quizFeedback');
const quizTimerEl = document.getElementById('quizTimer');
const quizOptionsEl = document.getElementById('quizOptions');
let quizInput;

function loadQuiz() {
  if (!quizQuestions || !quizQuestionEl || !quizOptionsEl) return;
  
  const q = quizQuestions[currentQuiz];
  quizQuestionEl.textContent = q.question;
  if (quizImageEl) {
    quizImageEl.style.backgroundImage = q.image ? `url(${q.image})` : 'none';
  }
  
  quizOptionsEl.innerHTML = '';
  
  if (q.inputAnswer) {
    quizInput = document.createElement('input');
    quizInput.type = 'text';
    quizInput.className = 'quiz-input';
    quizInput.placeholder = 'Введите ответ...';
    
    const answerBtn = document.createElement('button');
    answerBtn.className = 'btn';
    answerBtn.textContent = 'Ответить';
    answerBtn.onclick = () => {
      const userAnswer = quizInput.value.toLowerCase().trim();
      checkQuizAnswer(userAnswer);
    };
    
    quizOptionsEl.appendChild(quizInput);
    quizOptionsEl.appendChild(answerBtn);
  } else {
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = opt;
      btn.dataset.index = i;
      quizOptionsEl.appendChild(btn);
      
      btn.addEventListener('click', () => checkQuizAnswer(i));
    });
  }
  
  if (quizFeedback) {
    quizFeedback.textContent = '';
    quizFeedback.style.color = '';
  }
  
  quizTimeLeft = 15;
  if (quizTimerEl) quizTimerEl.textContent = quizTimeLeft;
  startQuizTimer();
}

function checkQuizAnswer(answer) {
  clearInterval(quizTimerInterval);
  const q = quizQuestions[currentQuiz];
  let correct = false;
  
  if (location.search.includes('debug')) {
    correct = true;
  } else {
    if (q.inputAnswer) {
      correct = answer === q.answer.toLowerCase();
    } else {
      correct = parseInt(answer) === q.answer;
    }
  }
  
  if (quizFeedback) {
    if (correct) {
      quizFeedback.textContent = 'Правильно! Молодец!';
      quizFeedback.style.color = '#4caf50';
    } else {
      quizFeedback.textContent = q.inputAnswer ? 
        `Неправильно! Правильный ответ: ${q.answer}` : 
        'Неправильно. Попробуй ещё раз.';
      quizFeedback.style.color = '#f44336';
    }
  }
  
  disableQuizButtons();
  
  const delay = q.inputAnswer ? 1500 : 2500;
  setTimeout(() => nextQuizQuestion(), delay);
}

function disableQuizButtons() {
  const btns = quizOptionsEl.querySelectorAll('.btn');
  btns.forEach(btn => btn.disabled = true);
}

function nextQuizQuestion() {
  currentQuiz++;
  if (currentQuiz >= quizQuestions.length) {
    if (quizFeedback) {
      quizFeedback.textContent = 'Викторина завершена! Поздравляю!';
      quizFeedback.style.color = '#ffcc33';
    }
    disableQuizButtons();
    clearInterval(quizTimerInterval);
    gamesCompleted.quiz = true;
    setTimeout(() => showBoxAnimation(1), 3000);
    return;
  }
  
  setTimeout(() => loadQuiz(), 1000);
}

function startQuizTimer() {
  clearInterval(quizTimerInterval);
  quizTimeLeft = 15;
  if (quizTimerEl) quizTimerEl.textContent = quizTimeLeft;
  
  quizTimerInterval = setInterval(() => {
    quizTimeLeft--;
    if (quizTimerEl) quizTimerEl.textContent = quizTimeLeft;
    
    if (quizTimeLeft <= 0) {
      clearInterval(quizTimerInterval);
      if (quizFeedback) {
        quizFeedback.textContent = 'Время вышло! Попробуй ещё раз.';
        quizFeedback.style.color = '#f44336';
      }
      disableQuizButtons();
      setTimeout(() => loadQuiz(), 2000);
    }
  }, 1000);
}

// ================== ДЕТЕКТИВ ==================
let collectedEvidence = [];
let hintsUsed = 0;
let currentEvidence = null;
const EVIDENCE_COUNT = 6;
let selectedEvidence = null;
let codeAttempts = 0;

function examineEvidence(id) {
  if (!evidenceData[id]) return;
  
  currentEvidence = id;
  const evidence = evidenceData[id];
  
  if (!collectedEvidence.includes(id)) {
    collectedEvidence.push(id);
    const evidenceItem = document.querySelector(`.evidence-item[data-id="${id}"]`);
    if (evidenceItem) evidenceItem.classList.add('selected');
  }
  
  let clueHTML = `<strong>${evidence.name}:</strong><ul>`;
  evidence.clues.forEach((clue, index) => {
    if (index < collectedEvidence.length) {
      clueHTML += `<li>${clue}</li>`;
    }
  });
  clueHTML += "</ul>";
  
  const clueText = document.getElementById('clueText');
  if (clueText) clueText.innerHTML = clueHTML;
  playSound('page-flipping.wav');
  
  const counter = document.querySelector('.hint-counter');
  if (counter) counter.textContent = `(${collectedEvidence.length}/${EVIDENCE_COUNT})`;
  
  if (collectedEvidence.length === EVIDENCE_COUNT) {
    const detectiveFeedback = document.getElementById('detectiveFeedback');
    if (detectiveFeedback) {
      detectiveFeedback.innerHTML = 
        "Все улики собраны! <button class='btn' onclick='startMatching()'>Сопоставить улики</button>";
    }
    
    // Показываем поле для ввода кода
    document.getElementById('codeEntry').style.display = 'block';
  }
}

function startMatching() {
  const evidenceGrid = document.getElementById('evidenceGrid');
  const matchingGame = document.getElementById('matchingGame');
  const keySelection = document.getElementById('keySelection');
  
  if (evidenceGrid) evidenceGrid.style.display = 'none';
  if (matchingGame) matchingGame.style.display = 'grid';
  if (keySelection) keySelection.style.display = 'none';
  
  matchingGame.innerHTML = '<div id="matchingPairs" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;"></div>';
  const matchingContainer = document.getElementById('matchingPairs');
  
  if (!matchingContainer) return;
  
  const evidenceKeys = Object.keys(evidenceData);
  evidenceKeys.sort(() => Math.random() - 0.5);
  
  evidenceKeys.forEach(id => {
    const evidence = evidenceData[id];
    
    const nameCard = document.createElement('div');
    nameCard.className = 'matching-card';
    nameCard.textContent = evidence.name;
    nameCard.dataset.id = id;
    nameCard.onclick = () => selectCard(nameCard);
    matchingContainer.appendChild(nameCard);
    
    const solutionCard = document.createElement('div');
    solutionCard.className = 'matching-card';
    solutionCard.textContent = evidence.solution;
    solutionCard.dataset.id = id;
    solutionCard.onclick = () => selectCard(solutionCard);
    matchingContainer.appendChild(solutionCard);
  });
  
  const detectiveFeedback = document.getElementById('detectiveFeedback');
  if (detectiveFeedback) {
    detectiveFeedback.textContent = 
      "Сопоставь улики с их значениями. Выбери сначала улику, затем решение.";
  }
}

function selectCard(card) {
  if (!card) return;
  
  if (!selectedEvidence) {
    selectedEvidence = card;
    card.classList.add('selected');
    return;
  }
  
  if (selectedEvidence.dataset.id === card.dataset.id) {
    selectedEvidence.classList.add('matched');
    card.classList.add('matched');
    selectedEvidence.onclick = null;
    card.onclick = null;
    playSound('notify.wav');
    
    const unmatchedCards = document.querySelectorAll('.matching-card:not(.matched)');
    if (unmatchedCards.length === 0) {
      const detectiveFeedback = document.getElementById('detectiveFeedback');
      if (detectiveFeedback) {
        detectiveFeedback.innerHTML = 
          "Поздравляю! Ты раскрыл все связи!";
      }
    }
  } else {
    selectedEvidence.classList.remove('selected');
    card.classList.add('incorrect');
    setTimeout(() => card.classList.remove('incorrect'), 1000);
    playSound('wronganswer.mp3');
  }
  
  selectedEvidence = null;
}

function showKeySelection() {
  const matchingGame = document.getElementById('matchingGame');
  const keySelection = document.getElementById('keySelection');
  
  if (matchingGame) matchingGame.style.display = 'none';
  if (keySelection) keySelection.style.display = 'block';
}

function checkDetectiveCode() {
  const codeInput = document.getElementById('detectiveCode');
  const codeFeedback = document.getElementById('codeFeedback');
  
  if (!codeInput || !codeFeedback) return;
  
  const enteredCode = codeInput.value.trim().toUpperCase();
  const correctCode = BOX_CODES[3]; // Код из последней коробки
  
  if (location.search.includes('debug')) {
    codeFeedback.textContent = "Режим отладки: код принят!";
    codeFeedback.style.color = "#4caf50";
    showKeySelection();
    return;
  }
  
  if (enteredCode === correctCode) {
    codeFeedback.textContent = "Код верный! Шифровальный блок открыт.";
    codeFeedback.style.color = "#4caf50";
    playSound('notify.wav');
    showKeySelection();
  } else {
    codeAttempts++;
    if (codeAttempts >= 3) {
      codeFeedback.textContent = "Слишком много попыток! Начните расследование заново.";
      codeFeedback.style.color = "#f44336";
      setTimeout(() => {
        collectedEvidence = [];
        document.querySelectorAll('.evidence-item').forEach(el => el.classList.remove('selected'));
        document.getElementById('codeEntry').style.display = 'none';
        document.getElementById('clueText').textContent = "Начни расследование, выбрав одну из улик.";
        document.querySelector('.hint-counter').textContent = "(0/6)";
        codeAttempts = 0;
      }, 2000);
    } else {
      codeFeedback.textContent = `Неверный код! Попыток осталось: ${3 - codeAttempts}`;
      codeFeedback.style.color = "#f44336";
      playSound('wronganswer.mp3');
    }
  }
}

function solveDetective(key) {
  playSound('notify.wav');
  
  const detectiveFeedback = document.getElementById('detectiveFeedback');
  if (!detectiveFeedback) return;
  
  if (key === 3) {
    detectiveFeedback.textContent = "Поздравляю! Ты раскрыл тайну!";
    detectiveFeedback.style.color = "#4caf50";
    
    gamesCompleted.detective = true;
    setTimeout(() => showBoxAnimation(4), 2000);
  } else {
    detectiveFeedback.textContent = "Неправильный ключ! Попробуй еще раз.";
    detectiveFeedback.style.color = "#f44336";
  }
}

function showHint() {
  if (!currentEvidence || !evidenceData[currentEvidence]) return;
  
  const evidence = evidenceData[currentEvidence];
  const clueText = document.getElementById('clueText');
  if (!clueText) return;
  
  hintsUsed++;
  let clueHTML = `<strong>${evidence.name}:</strong><ul>`;
  
  evidence.clues.forEach((clue, index) => {
    if (index < hintsUsed) {
      clueHTML += `<li>${clue}</li>`;
    }
  });
  clueHTML += "</ul>";
  
  clueText.innerHTML = clueHTML;
  playSound('page-flipping.wav');
}

// ================== ИНИЦИАЛИЗАЦИЯ ==================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  loadQuiz();
  createMemoryGrid();
  
  // Активация режима отладки
  if (location.search.includes('debug')) {
    Object.keys(gamesCompleted).forEach(k => gamesCompleted[k] = true);
    console.log("Режим отладки активирован - все игры разблокированы");
    
    // Упрощаем игры в режиме отладки
    if (memoryDifficulty) {
      memoryDifficulty.value = 'easy';
    }
  }
});