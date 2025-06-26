// ================== ОБЩИЕ ФУНКЦИИ ==================
function playSound(url) {
  // Заглушка для воспроизведения звука
  console.log("Playing sound:", url);
}

// ================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==================
let navButtons, screens;
const gamesCompleted = {
  marketing: false,
  memory: false,
  cards: false,
  detective: false
};
const BOX_CODES = ["1984", "LAMP", "TOWE", "FINA"];

// Добавлено в common.js в функцию startGames()
function startGames() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const container = document.getElementById('container');
  
  if (welcomeScreen && container) {
    welcomeScreen.classList.remove('active');
    container.style.display = 'block';
    
    // Проверка мобильного устройства
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      document.querySelector('meta[name="viewport"]').content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
    
    // Инициализируем навигацию
    initNavigation();
    
    if (navButtons && navButtons.marketing) {
      navButtons.marketing.click();
    }
  }
}

function initNavigation() {
  navButtons = {
    marketing: document.getElementById('navMarketing'),
    memory: document.getElementById('navMemory'),
    cards: document.getElementById('navCards'),
    detective: document.getElementById('navDetective'),
  };

  screens = {
    marketing: document.getElementById('marketingGame'),
    memory: document.getElementById('memoryGame'),
    cards: document.getElementById('cards'),
    detective: document.getElementById('detective'),
  };

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
          
          if (key === 'marketing') startMarketingGame();
          if (key === 'memory') resetMemoryGame();
          if (key === 'cards') initAilaGame();
          if (key === 'detective') initDetectiveGame();
        }
      });
    }
  });
}

function initDetectiveGame() {
  // Сброс состояния детективной игры
  collectedEvidence = [];
  hintsUsed = 0;
  currentEvidence = null;
  selectedEvidence = null;
  codeAttempts = 0;
  
  // Очистка интерфейса
  const clueText = document.getElementById('clueText');
  if (clueText) clueText.innerHTML = "Начни расследование, выбрав одну из улик.";
  
  const evidenceItems = document.querySelectorAll('.evidence-item');
  evidenceItems.forEach(item => item.classList.remove('selected'));
  
  const counter = document.querySelector('.hint-counter');
  if (counter) counter.textContent = "(0/6)";
  
  const detectiveFeedback = document.getElementById('detectiveFeedback');
  if (detectiveFeedback) detectiveFeedback.innerHTML = "";
  
  const codeEntry = document.getElementById('codeEntry');
  if (codeEntry) codeEntry.style.display = 'none';
  
  const keySelection = document.getElementById('keySelection');
  if (keySelection) keySelection.style.display = 'none';
  
  const matchingGame = document.getElementById('matchingGame');
  if (matchingGame) {
    matchingGame.style.display = 'none';
    matchingGame.innerHTML = '';
  }
}

function canAccessGame(gameKey) {
  if (location.search.includes('debug')) return true;
  
  const gameOrder = ['marketing', 'memory', 'cards', 'detective'];
  const currentIndex = gameOrder.indexOf(gameKey);
  
  if (gamesCompleted[gameKey]) return true;
  
  for (let i = 0; i < currentIndex; i++) {
    if (!gamesCompleted[gameOrder[i]]) return false;
  }
  
  return true;
}

function showBoxAnimation(boxNumber) {
  const boxAnimation = document.getElementById('boxAnimation');
  if (!boxAnimation) return;
  
  const boxMessages = [
    "Коробка 1: Ключ к воспоминаниям",
    "Коробка 2: Лампа знаний",
    "Коробка 3: Карта пути",
    "Коробка 4: Финальный код"
  ];
  
  boxAnimation.textContent = `🎉 ${boxMessages[boxNumber-1]} открыта!`;
  boxAnimation.style.display = 'block';
  
  // Анимация
  boxAnimation.style.animation = 'openBox 1.5s ease';
  
  // Скрываем анимацию через 3 секунды
  setTimeout(() => {
    boxAnimation.style.display = 'none';
    
    // Автоматический переход к следующей игре
    switch(boxNumber) {
      case 1:
        if (navButtons && navButtons.memory) {
          navButtons.memory.click();
        }
        break;
      case 2:
        if (navButtons && navButtons.cards) {
          navButtons.cards.click();
        }
        break;
      case 3:
        if (navButtons && navButtons.detective) {
          navButtons.detective.click();
        }
        break;
      case 4:
        // Показываем финальную анимацию
        document.getElementById('finalAnimation').classList.add('show');
        break;
    }
  }, 3000);
}

function closeFinalAnimation() {
  document.getElementById('finalAnimation').classList.remove('show');
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  
  // Активация режима отладки
  if (location.search.includes('debug')) {
    Object.keys(gamesCompleted).forEach(k => gamesCompleted[k] = true);
    console.log("Режим отладки активирован - все игры разблокированы");
  }
});


// Добавлено в конец файла
// Вспомогательная функция для дерева талантов
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};