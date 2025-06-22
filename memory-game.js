// ================== ЛАБИРИНТ ПАМЯТИ ==================
const DIFFICULTY_LEVELS = {
  easy: { levels: 3, flash: 1000, pause: 500 },
  medium: { levels: 5, flash: 800, pause: 400 },
  hard: { levels: 7, flash: 600, pause: 300 },
  expert: { levels: 10, flash: 400, pause: 200 }
};

let sequence = [];
let userSequence = [];
let memoryLevel = 1;
let isPlayingSequence = false;
let canClick = false;
let maxLevel = 5;

function createMemoryGrid() {
  const memoryGameGrid = document.getElementById('memoryGameGrid');
  if (!memoryGameGrid) return;
  
  memoryGameGrid.innerHTML = '';
  memoryGameGrid.style.gridTemplateColumns = 'repeat(3, 100px)';
  
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'memoryCell';
    cell.dataset.index = i;
    
    const img = document.createElement('img');
    img.src = 'gas-lamp.png';
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
  const memoryGameGrid = document.getElementById('memoryGameGrid');
  const memoryFeedback = document.getElementById('memoryFeedback');
  
  if (!memoryGameGrid) return;
  
  isPlayingSequence = true;
  canClick = false;
  if (memoryFeedback) memoryFeedback.textContent = 'Запоминай последовательность...';
  
  const difficulty = document.getElementById('memoryDifficulty').value;
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
    const memoryGameGrid = document.getElementById('memoryGameGrid');
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
  const memoryFeedback = document.getElementById('memoryFeedback');
  const memoryStartBtn = document.getElementById('memoryStartBtn');
  
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
  const memoryStartBtn = document.getElementById('memoryStartBtn');
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
  const difficulty = document.getElementById('memoryDifficulty').value;
  maxLevel = DIFFICULTY_LEVELS[difficulty].levels;
  
  const memoryFeedback = document.getElementById('memoryFeedback');
  const memoryStartBtn = document.getElementById('memoryStartBtn');
  
  if (memoryFeedback) {
    memoryFeedback.textContent = 'Нажми "Начать игру" для старта';
    memoryFeedback.style.color = '';
  }
  if (memoryStartBtn) memoryStartBtn.disabled = false;
}

// Инициализация игры памяти
document.getElementById('memoryGame').innerHTML = `
  <h2>Мини-игра 2: Лабиринт памяти</h2>
  <p>Запомни последовательность зажигающихся ламп и повтори её!</p>
  <div id="memoryGameGrid" aria-label="Игровое поле памяти"></div>
  <p id="memoryFeedback" class="hint" role="alert"></p>
  <button id="memoryStartBtn" class="btn">Начать игру</button>
  <div class="difficulty">
    <label>Уровень сложности:</label>
    <select id="memoryDifficulty">
      <option value="easy">Легкий (3 уровня)</option>
      <option value="medium">Средний (5 уровней)</option>
      <option value="hard">Сложный (7 уровней)</option>
      <option value="expert">Эксперт (10 уровней)</option>
    </select>
  </div>
`;

// Инициализация игры при загрузке
createMemoryGrid();

const memoryStartBtn = document.getElementById('memoryStartBtn');
if (memoryStartBtn) {
  memoryStartBtn.addEventListener('click', () => {
    resetMemoryGame();
    const memoryFeedback = document.getElementById('memoryFeedback');
    if (memoryFeedback) {
      memoryFeedback.style.color = '#ffcc33';
      memoryFeedback.textContent = 'Игра начинается!';
    }
    startMemoryRound();
  });
}