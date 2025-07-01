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

/**
 * Helper function to enable debug mode from the browser console.
 * Unlocks all games.
 */
function enableDebug() {
  localStorage.setItem('debugMode', 'true');
  console.log('Debug mode enabled. All games are unlocked. Refreshing...');
  // Applying the debug mode requires a page reload to re-evaluate access.
  window.location.reload();
}

function startGames() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const container = document.getElementById('container');
  
  if (welcomeScreen && container) {
    welcomeScreen.style.display = 'none'; // Hide instead of removing class for stability
    container.style.display = 'block';
    
    // Force mobile browsers to respect viewport scale
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      document.querySelector('meta[name="viewport"]').content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
    
    initNavigation();
    
    // Automatically click the first game's navigation button
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
          
          // Initialize the corresponding game
          if (key === 'marketing') startMarketingGame();
          if (key === 'memory') resetMemoryGame(); // This function also serves as an init
          if (key === 'cards') initAilaGame();
          if (key === 'room246') room246Game.initRoom246Game(); 
        } else {
          console.warn(`Access to game "${key}" is locked.`);
        }
      });
    }
  });
}

function canAccessGame(gameKey) {
  // Debug mode: allows access to any game at any time.
  // To activate, add ?debug=true to the URL or run enableDebug() in the console.
  const urlParams = new URLSearchParams(window.location.search);
  const isDebugMode = urlParams.has('debug') || localStorage.getItem('debugMode') === 'true';

  if (isDebugMode) {
    return true;
  }
  
  const gameOrder = ['marketing', 'memory', 'cards', 'room246'];
  const currentIndex = gameOrder.indexOf(gameKey);
  
  // The first game is always accessible
  if (currentIndex === 0) return true;
  
  // A game is accessible if it's already completed OR if the previous game is completed
  if (gamesCompleted[gameKey]) return true;
  
  // Check if the immediately preceding game has been completed
  const previousGameKey = gameOrder[currentIndex - 1];
  if (previousGameKey && gamesCompleted[previousGameKey]) {
    return true;
  }
  
  return false;
}

function showBoxAnimation(boxNumber) {
  const boxAnimation = document.getElementById('boxAnimation');
  if (!boxAnimation) return;
  
  const boxMessages = [
    "Открой коробку 1!",
    "Открой корбку 2!",
    "Открой коробку 3!",
    "Открой коробку 4!"
  ];
  
  boxAnimation.textContent = `🎉 ${boxMessages[boxNumber-1]}`;
  boxAnimation.style.display = 'block';
  
  setTimeout(() => {
    boxAnimation.style.display = 'none';
    
    // Logic for transitioning after the animation
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
  const startButton = document.querySelector('#welcomeScreen .btn');
  if (startButton) {
      startButton.onclick = startGames;
  }
  
  // If debug mode is active from a previous session or via URL parameter, unlock all games on load.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('debug') || localStorage.getItem('debugMode') === 'true') {
    Object.keys(gamesCompleted).forEach(k => gamesCompleted[k] = true);
    console.log("Debug mode is active. All games unlocked.");
  }
});

// Case-insensitive jQuery :contains utility
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};
