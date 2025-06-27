// common.js
function playSound(url) {
  console.log("Playing sound:", url);
}

let navButtons, screens;
const gamesCompleted = {
  marketing: false,
  memory: false,
  cards: false,
  room246: false
};
const BOX_CODES = ["1984", "LAMP", "TOWE", "FINA"];

function startGames() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const container = document.getElementById('container');
  
  if (welcomeScreen && container) {
    welcomeScreen.classList.remove('active');
    container.style.display = 'block';
    
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      document.querySelector('meta[name="viewport"]').content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
    
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
    room246: document.getElementById('navRoom246'),
  };

  screens = {
    marketing: document.getElementById('marketingGame'),
    memory: document.getElementById('memoryGame'),
    cards: document.getElementById('cards'),
    room246: document.getElementById('room246Game'),
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
          
          // Запускаем соответствующую игру
          if (key === 'marketing') startMarketingGame();
          if (key === 'memory') resetMemoryGame();
          if (key === 'cards') initAilaGame();
          // ИСПРАВЛЕННЫЙ ВЫЗОВ: используем объект room246Game
          if (key === 'room246') room246Game.initRoom246Game(); 
        }
      });
    }
  });
}

function canAccessGame(gameKey) {
  if (location.search.includes('debug')) return true;
  
  const gameOrder = ['marketing', 'memory', 'cards', 'room246'];
  const currentIndex = gameOrder.indexOf(gameKey);
  
  // Уже завершенные игры всегда доступны
  if (gamesCompleted[gameKey]) return true;
  
  // Проверяем, пройдены ли все предыдущие игры
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
  
  setTimeout(() => {
    boxAnimation.style.display = 'none';
    
    // Логика перехода после анимации
    switch(boxNumber) {
      case 1:
        if (navButtons && navButtons.memory) navButtons.memory.click();
        break;
      case 2:
        if (navButtons && navButtons.cards) navButtons.cards.click();
        break;
      case 3:
        if (navButtons && navButtons.room246) navButtons.room246.click();
        break;
      case 4:
        const finalAnimation = document.getElementById('finalAnimation');
        if(finalAnimation) finalAnimation.classList.add('show');
        break;
    }
  }, 3000);
}

function closeFinalAnimation() {
  const finalAnimation = document.getElementById('finalAnimation');
  if(finalAnimation) finalAnimation.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
  // Инициализация навигации происходит после нажатия кнопки "Начать"
  const startButton = document.querySelector('#welcomeScreen .btn');
  if(startButton) {
      startButton.onclick = startGames;
  }
  
  if (location.search.includes('debug')) {
    Object.keys(gamesCompleted).forEach(k => gamesCompleted[k] = true);
    console.log("Режим отладки активирован - все игры разблокированы");
  }
});

// Утилита для jQuery :contains, нечувствительная к регистру
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};