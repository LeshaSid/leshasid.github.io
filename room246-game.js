// room246-game.js
const room246Game = (() => {
  const room246Data = {
    states: {
      room: {
        image: 'room.png', // Изображение комнаты
        description: 'Вы заходите в комнату 246. Вам нужно срочно сделать подшивку для курсовой. В руках у вас листы для курсовой, но вот незадача - ниток нет.',
        hotspots: [
          { x: '40%', y: '50%', width: '18%', height: '26%', action: 'changeState', target: 'desk', title: 'Осмотреть стол' },
          { x: '0%', y: '0%', width: '24%', height: '100%', action: 'startDialog', dialogId: 'wardrobe', title: 'Осмотреть шкаф' },
          { x: '60%', y: '55%', width: '39%', height: '44%', action: 'takeItem', itemId: 'paperclip', title: 'Осмотреть кровати' } // Скрепка на кровати
        ]
      },
      desk: {
        image: 'desk.png', // Изображение стола
        description: 'На столе стоит ноутбук, кружка с остывшим напитком и какая-то записка.',
        hotspots: [
          { x: '36%', y: '15%', width: '50%', height: '36%', action: 'startDialog', dialogId: 'laptop', title: 'Использовать ноутбук' },
          { x: '70%', y: '65%', width: '25%', height: '20%', action: 'startDialog', dialogId: 'note_clue', title: 'Осмотреть записку' }, // Записка на столе
          { x: '0%', y: '0%', width: '15%', height: '15%', action: 'changeState', target: 'room', title: 'Вернуться в комнату' },
          { x: '2%', y: '33%', width: '23%', height: '32%', action: 'startMinigame', minigameId: 'stitching', title: 'Сделать подшивку' } // Мини-игра подшивка
        ]
      }
    },
    items: {
      paperclip: { name: 'Скрепка', image: 'paperclip.png', description: 'Обычная канцелярская скрепка.' },
      thread_and_scissors: { name: 'Нитки и ножницы', image: 'thread_scissors.png', description: 'Моток ниток и острые ножницы. Идеально для подшивки.' },
      coursework_sheets: { name: 'Листы для курсовой', image: 'coursework.png', description: 'Ваши листы для курсовой работы.' } // Добавлено для инвентаря
    },
    dialogs: {
      laptop: {
        speaker: 'Ноутбук',
        lines: [
          { id: 'start', text: 'Ноутбук заблокирован. Требуется пароль.', condition: '!checkFlag_laptop_unlocked', type: 'prompt', promptKey: 'password' },
          { id: 'unlocked', text: 'Вы уже вошли в систему. На рабочем столе лежит файл с инструкцией по взлому замка на шкафу.', condition: 'checkFlag_laptop_unlocked' }
        ]
      },
      note_clue: {
        speaker: 'Записка',
        lines: [
          { id: 'start', text: 'На записке написана загадка: "Я всегда перед вами, но вы меня не видите. Что это?". Отгадка - пароль от ноутбука.', condition: '!checkFlag_note_read' },
          { id: 'read', text: 'Вы уже прочитали записку.', condition: 'checkFlag_note_read' }
        ]
      },
      wardrobe: {
        speaker: 'Шкаф',
        lines: [
          { id: 'start', text: 'Массивный шкаф заперт на замок.', condition: '!checkFlag_wardrobe_unlocked, checkInventory_paperclip', type: 'action', action: 'startMinigame', minigameId: 'lockpicking' }, // Запуск мини-игры взлома
          { id: 'no_paperclip', text: 'Массивный шкаф заперт на замок. Кажется, его можно отпереть чем-то тонким.', condition: '!checkInventory_paperclip' },
          { id: 'unlocked', text: 'Шкаф открыт. Внутри вы находите моток ниток и ножницы.', condition: 'checkFlag_wardrobe_unlocked', type: 'action', action: 'takeItem', itemId: 'thread_and_scissors' },
          { id: 'empty', text: 'Шкаф пуст.', condition: 'checkFlag_wardrobe_unlocked, checkInventory_thread_and_scissors' }
        ]
      }
    },
    endings: {
      good: {
        title: 'Курсовая готова!',
        image: 'maingift.gif', // Используем существующий GIF
        text: 'Вы успешно сделали подшивку для курсовой! Игра окончена!'
      }
      // Removed bad ending as per user request
    }
  };

  let gameState = {};
  
  // Variables for the Lockpicking Minigame
  let lockpickGame = {
    numPins: 6,
    pins: [],
    pinElements: [],
    paperclipPosition: 0,
    tension: 0,
    lockoutTimer: 0,
    gameLocked: false,
    gameWon: false,
    isApplyingTension: false,
    gameLoopInterval: null,
    tensionInterval: null,
    // Constants
    MAX_PIN_HEIGHT: 80,
    MIN_PIN_HEIGHT: 10,
    PIN_LIFT_AMOUNT: 2,
    TENSION_INCREASE_RATE: 5,
    TENSION_DECREASE_RATE: 1,
    MAX_TENSION: 100,
    TENSION_OVERLOAD_THRESHOLD: 100,
    LOCKOUT_DURATION: 3000,
    PIN_TOLERANCE: 2,
    SWEET_SPOT_RANGE_SIZE: 25,
    WIN_ANIMATION_DURATION: 2000
  };

  // Variables for the Coursework Filing Minigame
  let courseworkGame = {
    gameStarted: false,
    timerInterval: null,
    timeLeft: 150, // 2 minutes 30 seconds
    stapledPages: [], // Stores {id, order} of pages in the stapling panel
    threadTangled: false, // NEW: Replaced staplerJammed
    untangleClicksRemaining: 0, // NEW: Replaced staplerClicksRemaining
    professorCallActive: false,
    correctProfessorPageId: null,
    windActive: false,
    windInterval: null, // NEW: For continuous wind effect
    nextInterferenceTimeoutId: null,
    // NEW Drag and Drop state
    draggedElement: null, 
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    pagesData: [
      { id: 'page-title', name: 'Заголовок', order: 0 },
      { id: 'page-contents', name: 'Оглавление', order: 1 },
      { id: 'page-intro', name: 'Введение', order: 2 },
      { id: 'page-chapter1', name: 'Глава 1', order: 3 },
      { id: 'page-chapter2', name: 'Глава 2', order: 4 },
      { id: 'page-graphs', name: 'Графики', order: 5 },
      { id: 'page-conclusion', name: 'Заключение', order: 6 },
      { id: 'page-refs', name: 'Список литературы', order: 7 }
    ]
  };

  function initRoom246Game() {
    const room246Screen = document.getElementById('room246Game');
    if (!room246Screen || room246Screen.querySelector('.game-container')) return;
    
    gameState = {
      currentState: "room",
      inventory: ['coursework_sheets'], // Игрок начинает с листами для курсовой
      flags: { laptop_unlocked: false, note_read: false, wardrobe_unlocked: false },
      startTime: Date.now(),
      timeLimit: 10 * 60 * 1000, // 10 minutes
      timerId: null,
      ending: false
    };
    
    room246Screen.innerHTML = `
      <div class="game-container" id="room246Container">
        <div id="game-timer" class="game-timer"></div>
        <div id="game-screen" class="game-screen"></div>
        <div id="game-info-panel" class="game-info-panel"></div>
        <div class="inventory-bar">
          <h3>Инвентарь:</h3>
          <div id="inventory-items" class="inventory-items"></div>
        </div>
        <div id="minigame-container" class="minigame-container" style="display:none;"></div>
        <div id="ending-screen" class="ending-screen" style="display:none;"></div>
        <div id="room246Feedback" class="hint" style="text-align: center; margin-top: 10px;"></div>
      </div>
      <div id="dialog-box" class="dialog-box" style="display:none;"></div>
    `;
    
    renderState();
    startTimer();
  }

  function renderState() {
    const stateData = room246Data.states[gameState.currentState];
    const gameScreen = document.getElementById('game-screen');
    const infoPanel = document.getElementById('game-info-panel');
    if (!gameScreen || !infoPanel) return;
    
    gameScreen.innerHTML = `<img src="${stateData.image}" alt="${stateData.description}" class="room-image">`;
    infoPanel.textContent = stateData.description;
    
    stateData.hotspots.forEach(spot => {
      // Don't render the hotspot for an item that has already been taken
      if (spot.action === 'takeItem' && gameState.inventory.includes(spot.itemId)) {
        return;
      }
      const hotspot = document.createElement('div');
      hotspot.className = 'hotspot';
      hotspot.style.cssText = `left:${spot.x}; top:${spot.y}; width:${spot.width}; height:${spot.height};`;
      hotspot.title = spot.title || 'Интерактивная зона';
      hotspot.addEventListener('click', () => handleAction(spot.action, spot));
      gameScreen.appendChild(hotspot);
    });
    
    renderInventory();
    closeDialog();
  }

  function handleAction(action, data) {
    if (gameState.ending) return;

    switch(action) {
      case "changeState":
        gameState.currentState = data.target;
        renderState();
        break;
      case "takeItem":
        // Find the hotspot element to hide it after taking the item
        const itemHotspot = Array.from(document.querySelectorAll('.hotspot')).find(h => h.title === data.title);
        if (itemHotspot) itemHotspot.style.display = 'none';

        if (!gameState.inventory.includes(data.itemId)) {
          gameState.inventory.push(data.itemId);
          showFeedback(`Получен предмет: ${room246Data.items[data.itemId].name}`, "success");
          renderInventory();
        }
        // Special handling for thread and scissors to allow stitching
        if (data.itemId === 'thread_and_scissors' && gameState.inventory.includes('coursework_sheets')) {
            // Automatically start stitching minigame if both items are present
            startMinigame('stitching');
        }
        break;
      case "startDialog":
        startDialog(data.dialogId);
        break;
      case "startMinigame":
        startMinigame(data.minigameId);
        break;
      case "addFlag":
        if (!gameState.flags[data.flag]) {
            gameState.flags[data.flag] = true;
            if (data.flag === 'note_read') showFeedback('Вы прочитали записку.', 'info');
            if (data.flag === 'wardrobe_unlocked') {
                showFeedback('Шкаф успешно взломан!', 'success');
                // Directly add "Нитки и ножницы" to inventory here
                if (!gameState.inventory.includes('thread_and_scissors')) {
                    gameState.inventory.push('thread_and_scissors');
                    showFeedback(`Получен предмет: ${room246Data.items['thread_and_scissors'].name}`, "success");
                    renderInventory();
                }
                // If coursework sheets are already in inventory, start stitching game
                if (gameState.inventory.includes('coursework_sheets')) {
                    startMinigame('stitching');
                }
            }
        }
        closeDialog();
        break;
      case "endGame":
        checkEnding();
        break;
    }
  }

  function renderInventory() {
    const itemsContainer = document.getElementById('inventory-items');
    if (!itemsContainer) return;
    itemsContainer.innerHTML = '';
    if (gameState.inventory.length === 0) {
        itemsContainer.innerHTML = '<span>Инвентарь пуст</span>';
    } else {
        gameState.inventory.forEach(itemId => {
            const item = room246Data.items[itemId];
            if (!item) return;
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.innerHTML = `<img src="${item.image}" alt="${item.name}" title="${item.name}: ${item.description}">`;
            itemsContainer.appendChild(itemEl);
        });
    }
  }
  
  function startDialog(dialogId) {
      const dialogBox = document.getElementById('dialog-box');
      const dialogData = room246Data.dialogs[dialogId];
      if (!dialogData) return;

      // Find the correct line to display based on conditions
      let currentNode = dialogData.lines.find(line => {
          if (!line.condition) return !line.type; // Default line without condition
          const conditions = line.condition.split(', ').filter(Boolean); // Filter out empty strings
          return conditions.every(cond => {
              const not = cond.startsWith('!');
              const cleanCond = not ? cond.substring(1) : cond;
              const [type, key] = cleanCond.split('_');
              let result;
              if (type === 'checkFlag') result = !!gameState.flags[key];
              if (type === 'checkInventory') result = gameState.inventory.includes(key);
              return not ? !result : result;
          });
      }) || dialogData.lines.find(line => line.id === 'fail' || !line.condition);
      
      if (!currentNode) { closeDialog(); return; }

      dialogBox.style.display = 'block';

      let choicesHTML = '';
      if (currentNode.type === 'prompt') {
          choicesHTML = `
              <input type="text" id="dialog-prompt-input" class="quiz-input" placeholder="Введите пароль...">
              <button class="dialog-next" onclick="room246Game.checkPrompt('${dialogId}', '${currentNode.promptKey}')">Ввод</button>
          `;
      } else if (currentNode.type === 'action') {
        handleAction(currentNode.action, { flag: currentNode.flag, itemId: currentNode.itemId, minigameId: currentNode.minigameId });
        if(currentNode.text) showFeedback(currentNode.text, 'info'); // Show feedback for action text
        closeDialog();
        return;
      }
      
      choicesHTML += `<button class="dialog-next" onclick="room246Game.closeDialog()">Закрыть</button>`;

      dialogBox.innerHTML = `
          <div class="dialog-speaker">${dialogData.speaker}</div>
          <p class="dialog-text">${currentNode.text}</p>
          <div class="dialog-choices">${choicesHTML}</div>
      `;
  }

  function checkPrompt(dialogId, promptKey) {
      const inputEl = document.getElementById('dialog-prompt-input');
      const input = inputEl.value.trim().toLowerCase(); // Приводим к нижнему регистру для сравнения
      let correct = false;

      if (promptKey === 'password' && input === 'будущее') { // Отгадка на "Я всегда перед вами, но вы меня не видите. Что это?"
          gameState.flags.laptop_unlocked = true;
          showFeedback('Пароль верный! Файл с инструкцией доступен.', "success");
          correct = true;
      }

      if (correct) {
        closeDialog();
      } else {
        showFeedback('Неверный пароль.', 'error');
        inputEl.value = '';
      }
  }
  
  function closeDialog() {
      const dialogBox = document.getElementById('dialog-box');
      if (dialogBox) dialogBox.style.display = 'none';
  }

  function startTimer() {
    if (gameState.timerId) clearInterval(gameState.timerId);
    gameState.timerId = setInterval(updateTimer, 1000);
    updateTimer();
  }

  function updateTimer() {
    const timerElement = document.getElementById('game-timer');
    if (!timerElement || gameState.ending) {
      if(gameState.timerId) clearInterval(gameState.timerId);
      return;
    }
    const elapsed = Date.now() - gameState.startTime;
    const remaining = Math.max(0, gameState.timeLimit - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
    timerElement.textContent = `Осталось: ${minutes}:${seconds}`;
    // Removed the "time's up" ending check here
  }

  function startMinigame(minigameId) {
    const minigameContainer = document.getElementById('minigame-container');
    const gameScreen = document.getElementById('game-screen');
    const infoPanel = document.getElementById('game-info-panel');
    const inventoryBar = document.querySelector('.inventory-bar');
    const gameTimer = document.getElementById('game-timer');
    const dialogBox = document.getElementById('dialog-box'); // Get dialog box

    if (!minigameContainer || !gameScreen || !infoPanel || !inventoryBar || !gameTimer || !dialogBox) return;

    // Block page scrolling only for mobile devices when starting this specific minigame
    if (minigameId === 'stitching' && /Mobi|Android/i.test(navigator.userAgent)) {
        document.body.style.overflow = 'hidden';
    } else if (minigameId === 'lockpicking') { // Lockpicking also blocks scroll
        document.body.style.overflow = 'hidden';
    }


    gameScreen.style.display = 'none';
    infoPanel.style.display = 'none';
    inventoryBar.style.display = 'none';
    gameTimer.style.display = 'none'; // Hide main game timer
    dialogBox.style.display = 'none'; // Hide dialog box
    minigameContainer.style.display = 'block';
    minigameContainer.innerHTML = ''; // Clear previous minigame

    if (minigameId === 'lockpicking') {
        if (!gameState.inventory.includes('paperclip')) {
            showFeedback('Вам нужна скрепка, чтобы взломать замок!', 'error');
            minigameContainer.style.display = 'none';
            gameScreen.style.display = 'block';
            infoPanel.style.display = 'block';
            inventoryBar.style.display = 'flex'; // Assuming inventory is flex
            gameTimer.style.display = 'block'; // Show main game timer
            document.body.style.overflow = ''; // Re-enable scrolling
            return;
        }
        // Lockpicking Minigame HTML
        minigameContainer.innerHTML = `
            <div class="game-container">
                <h1>Взлом замка скрепкой</h1>
                <p class="minigame-description">
                    Цель: Открыть замок, правильно поднимая пины.
                    <br>
                    Используйте кнопки для перемещения скрепки и поднятия пина. Удерживайте "Натяжение" для применения силы.
                    Натяжение должно быть в "идеальной точке" (индикатор натяжения станет фиолетовым). Замок блокируется только при максимальном натяжении.
                </p>

                <div class="lock-mechanism" id="lockMechanism">
                    <div class="paperclip" id="paperclip">
                        <div class="paperclip-tip"></div>
                    </div>
                </div>

                <div class="tension-indicator-container">
                    <div class="tension-bar" id="tensionBar"></div>
                </div>
                <p class="text-sm text-center mt-2 text-gray-400">Натяжение пружины (удерживайте кнопку)</p>

                <div class="message-box" id="messageBox">
                    Начните взлом!
                </div>

                <div class="controls lockpicking-controls">
                    <button class="control-button lock-button-up" id="liftPinBtn" aria-label="Поднять Пин"></button>
                    <div class="horizontal-controls">
                        <button class="control-button lock-button-left" id="moveLeftBtn" aria-label="Влево"></button>
                        <button class="control-button lock-button-tension" id="applyTensionBtn" aria-label="Натяжение"></button>
                        <button class="control-button lock-button-right" id="moveRightBtn" aria-label="Вправо"></button>
                    </div>
                </div>
                <button class="control-button reset-button" id="openLockBtn" style="display: none;">Открыть Замок</button>
            </div>
        `;
        initLockpickingGame();

    } else if (minigameId === 'stitching') {
        if (!gameState.inventory.includes('coursework_sheets') || !gameState.inventory.includes('thread_and_scissors')) {
            showFeedback('Вам нужны листы для курсовой и нитки с ножницами, чтобы сделать подшивку!', 'error');
            minigameContainer.style.display = 'none';
            gameScreen.style.display = 'block';
            infoPanel.style.display = 'block';
            inventoryBar.style.display = 'flex';
            gameTimer.style.display = 'block'; // Show main game timer
            document.body.style.overflow = ''; // Re-enable scrolling
            return;
        }
        // Coursework Filing Minigame HTML
        minigameContainer.innerHTML = `
            <div class="coursework-game-container">
                <div class="coursework-game-header">
                    <h1 class="coursework-game-title">Собери подшивку</h1>
                    <p class="text-gray-600">Успей подшить курсовую до дедлайна!</p>
                </div>

                <div class="coursework-game-info">
                    <div class="time-left">Время: <span id="timer">02:30</span></div>
                    <div class="pages-count">Собрано: <span id="stapled-count">0</span> / <span id="total-pages">0</span></div>
                </div>

                <div class="coursework-game-area">
                    <div id="pages-container" class="coursework-pages-container">
                        </div>
                    <div id="stapling-panel" class="coursework-stapling-panel">
                        <p class="text-gray-500">Перетащите страницы сюда в правильном порядке</p>
                        </div>
                    <button id="stitch-button" class="coursework-stapler-button" disabled>Подшить!</button>
                    <p id="thread-tangled-message" class="coursework-stapler-jammed-text hidden">Нить запуталась! Нажми ещё <span id="untangle-clicks-needed"></span> раз(а)!</p>
                </div>

                <button id="start-button" class="coursework-stapler-button mt-4 mx-auto block">Начать игру</button>

                <div id="professor-popup-overlay" class="coursework-popup-overlay">
                    <div class="coursework-popup-content">
                        <h3>Звонок от препода!</h3>
                        <p id="professor-question"></p>
                        <button id="professor-popup-ok">Понял!</button>
                    </div>
                </div>

                <div id="game-end-screen" class="coursework-game-end-screen">
                    <h2 id="end-title"></h2>
                    <p id="end-message"></p>
                    <button id="restart-button">Играть снова</button>
                </div>
            </div>
        `;
        initCourseworkGame();
    }
  }

  // --- Lockpicking Minigame Logic ---
  function initLockpickingGame() {
    // DOM elements for lockpicking
    const lockMechanism = document.getElementById('lockMechanism');
    const paperclip = document.getElementById('paperclip');
    const tensionBar = document.getElementById('tensionBar');
    const messageBox = document.getElementById('messageBox');
    const moveLeftBtn = document.getElementById('moveLeftBtn');
    const liftPinBtn = document.getElementById('liftPinBtn');
    const moveRightBtn = document.getElementById('moveRightBtn');
    const applyTensionBtn = document.getElementById('applyTensionBtn');
    const openLockBtn = document.getElementById('openLockBtn');

    // Clear existing pins
    lockpickGame.pinElements.forEach(el => el.remove());
    lockpickGame.pins.length = 0;
    lockpickGame.pinElements.length = 0;

    // Create pins
    for (let i = 0; i < lockpickGame.numPins; i++) {
        const pinSlot = document.createElement('div');
        pinSlot.className = 'pin-slot';
        lockMechanism.appendChild(pinSlot);

        const pin = document.createElement('div');
        pin.className = 'pin';
        pinSlot.appendChild(pin);
        lockpickGame.pinElements.push(pin);

        // Generate sweet spot for each pin
        const sweetSpotMin = Math.floor(Math.random() * (lockpickGame.MAX_TENSION - lockpickGame.SWEET_SPOT_RANGE_SIZE - 10)) + 10;
        const sweetSpotMax = sweetSpotMin + lockpickGame.SWEET_SPOT_RANGE_SIZE;

        // Each pin has a target height, hardness, and sweet spot for tension
        lockpickGame.pins.push({
            currentHeight: lockpickGame.MIN_PIN_HEIGHT,
            targetHeight: Math.floor(Math.random() * (lockpickGame.MAX_PIN_HEIGHT - lockpickGame.MIN_PIN_HEIGHT - 20)) + lockpickGame.MIN_PIN_HEIGHT + 10,
            hardness: Math.random() * 0.5 + 0.5,
            isSet: false,
            sweetSpotMin: sweetSpotMin,
            sweetSpotMax: sweetSpotMax
        });

        // Set initial visual height
        pin.style.height = `${lockpickGame.MIN_PIN_HEIGHT}%`;
    }

    // Set initial paperclip position to the first pin
    lockpickGame.paperclipPosition = 0;
    updatePaperclipPosition();

    lockpickGame.tension = 0;
    updateTensionBar();
    lockpickGame.lockoutTimer = 0;
    lockpickGame.gameLocked = false;
    lockpickGame.gameWon = false;
    showMessageLockpicking("Начните взлом!");
    enableLockpickingControls();
    openLockBtn.style.display = 'none';
    openLockBtn.disabled = true;

    // Clear any existing intervals before starting new ones
    if (lockpickGame.gameLoopInterval) clearInterval(lockpickGame.gameLoopInterval);
    if (lockpickGame.tensionInterval) clearInterval(lockpickGame.tensionInterval);

    startGameLoopLockpicking();

    // Add event listeners for lockpicking game
    moveLeftBtn.onclick = () => {
      if (lockpickGame.gameLocked || lockpickGame.gameWon) return;
      lockpickGame.paperclipPosition = Math.max(0, lockpickGame.paperclipPosition - 1);
      updatePaperclipPosition();
    };

    moveRightBtn.onclick = () => {
      if (lockpickGame.gameLocked || lockpickGame.gameWon) return;
      lockpickGame.paperclipPosition = Math.min(lockpickGame.numPins - 1, lockpickGame.paperclipPosition + 1);
      updatePaperclipPosition();
    };

    liftPinBtn.onclick = () => {
      if (lockpickGame.gameLocked || lockpickGame.gameWon) return;
      const currentPin = lockpickGame.pins[lockpickGame.paperclipPosition];
      const currentPinEl = lockpickGame.pinElements[lockpickGame.paperclipPosition];

      if (currentPin.isSet) {
          showMessageLockpicking("Этот пин уже установлен!");
          return;
      }

      const inSweetSpot = lockpickGame.tension >= currentPin.sweetSpotMin && lockpickGame.tension <= currentPin.sweetSpotMax;
      if (!inSweetSpot) {
          showMessageLockpicking("Натяжение не в нужной точке для этого пина!", 'locked');
          resetLockAttemptLockpicking();
          return;
      }

      currentPin.currentHeight += lockpickGame.PIN_LIFT_AMOUNT * currentPin.hardness;
      currentPin.currentHeight = Math.min(currentPin.currentHeight, lockpickGame.MAX_PIN_HEIGHT);
      currentPinEl.style.height = `${currentPin.currentHeight}%`;

      const diff = Math.abs(currentPin.currentHeight - currentPin.targetHeight);
      if (diff < lockpickGame.PIN_TOLERANCE * 2) {
          currentPinEl.style.backgroundColor = '#68d391';
      } else if (diff < lockpickGame.PIN_TOLERANCE * 5) {
          currentPinEl.style.backgroundColor = '#f6e05e';
      } else {
          currentPinEl.style.backgroundColor = '#cbd5e0';
      }

      if (currentPin.currentHeight >= currentPin.targetHeight - lockpickGame.PIN_TOLERANCE && currentPin.currentHeight <= currentPin.targetHeight + lockpickGame.PIN_TOLERANCE) {
          currentPin.isSet = true;
          currentPinEl.classList.add('set');
          currentPinEl.style.height = `${currentPin.targetHeight}%`;
          showMessageLockpicking(`Пин ${lockpickGame.paperclipPosition + 1} установлен!`);
          checkAllPinsSetLockpicking();
      } else if (currentPin.currentHeight > currentPin.targetHeight + (lockpickGame.PIN_TOLERANCE * 5)) {
          showMessageLockpicking("Слишком высоко! Замок сброшен.", 'locked');
          resetLockAttemptLockpicking();
      }
    };

    applyTensionBtn.addEventListener('mousedown', () => {
      if (lockpickGame.gameLocked || lockpickGame.gameWon) return;
      lockpickGame.isApplyingTension = true;
      tensionLoopLockpicking();
    });
    applyTensionBtn.addEventListener('mouseup', () => {
      lockpickGame.isApplyingTension = false;
      updateTensionBar();
    });
    applyTensionBtn.addEventListener('mouseleave', () => {
      lockpickGame.isApplyingTension = false;
      updateTensionBar();
    });
    applyTensionBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (lockpickGame.gameLocked || lockpickGame.gameWon) return;
      lockpickGame.isApplyingTension = true;
      tensionLoopLockpicking();
    });
    applyTensionBtn.addEventListener('touchend', () => {
      lockpickGame.isApplyingTension = false;
      updateTensionBar();
    });

    openLockBtn.onclick = () => {
      openLockLockpicking();
    };

    document.addEventListener('keydown', handleLockpickingKeydown);
    document.addEventListener('keyup', handleLockpickingKeyup);

    // Ensure cleanup when minigame ends
    minigameContainer.dataset.activeGame = 'lockpicking';
  }

  function handleLockpickingKeydown(e) {
    if (document.getElementById('minigame-container').dataset.activeGame !== 'lockpicking' || lockpickGame.gameLocked || lockpickGame.gameWon) return;
    switch (e.key) {
        case 'ArrowLeft':
            document.getElementById('moveLeftBtn').click();
            break;
        case 'ArrowRight':
            document.getElementById('moveRightBtn').click();
            break;
        case 'ArrowUp':
            document.getElementById('liftPinBtn').click();
            break;
        case ' ': // Spacebar for tension
            if (!lockpickGame.isApplyingTension) {
                document.getElementById('applyTensionBtn').dispatchEvent(new MouseEvent('mousedown'));
            }
            e.preventDefault();
            break;
    }
  }

  function handleLockpickingKeyup(e) {
    if (document.getElementById('minigame-container').dataset.activeGame !== 'lockpicking') return;
    if (e.key === ' ') {
        document.getElementById('applyTensionBtn').dispatchEvent(new MouseEvent('mouseup'));
    }
  }

  function cleanupLockpickingGame() {
    clearInterval(lockpickGame.gameLoopInterval);
    clearInterval(lockpickGame.tensionInterval);
    document.removeEventListener('keydown', handleLockpickingKeydown);
    document.removeEventListener('keyup', handleLockpickingKeyup);
    document.getElementById('minigame-container').removeAttribute('dataset.activeGame');
    document.body.style.overflow = ''; // Re-enable scrolling
  }

  function updatePaperclipPosition() {
    const lockMechanism = document.getElementById('lockMechanism');
    const paperclip = document.getElementById('paperclip');
    if (!lockMechanism || !paperclip) return;

    const pinSlotWidth = lockMechanism.offsetWidth / lockpickGame.numPins;
    const paperclipWidth = paperclip.offsetWidth;
    const newLeft = (lockpickGame.paperclipPosition * pinSlotWidth) + (pinSlotWidth / 2) - (paperclipWidth / 2);
    paperclip.style.left = `${newLeft}px`;
    updateTensionBar();
  }

  function updateTensionBar() {
    const tensionBar = document.getElementById('tensionBar');
    if (!tensionBar) return;
    tensionBar.style.width = `${lockpickGame.tension}%`;

    const currentPin = lockpickGame.pins[lockpickGame.paperclipPosition];
    let inSweetSpot = false;

    if (currentPin && !currentPin.isSet) {
        inSweetSpot = lockpickGame.tension >= currentPin.sweetSpotMin && lockpickGame.tension <= currentPin.sweetSpotMax;
    }

    if (inSweetSpot) {
        tensionBar.style.backgroundColor = '#667eea'; // Purple for sweet spot
    } else {
        if (lockpickGame.tension >= lockpickGame.TENSION_OVERLOAD_THRESHOLD) {
            tensionBar.style.backgroundColor = '#e53e3e'; // Red
        } else if (lockpickGame.tension > lockpickGame.MAX_TENSION / 2) {
            tensionBar.style.backgroundColor = '#f6ad5e'; // Orange
        } else {
            tensionBar.style.backgroundColor = '#48bb78'; // Green
        }
    }
  }

  function showMessageLockpicking(msg, type = '') {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
    messageBox.textContent = msg;
    messageBox.className = 'message-box';
    if (type === 'locked') {
        messageBox.classList.add('locked-message');
    } else if (type === 'win') {
        messageBox.classList.add('win-message');
    }
  }

  function disableLockpickingControls() {
    document.getElementById('liftPinBtn').disabled = true;
    document.getElementById('moveLeftBtn').disabled = true;
    document.getElementById('moveRightBtn').disabled = true;
    document.getElementById('applyTensionBtn').disabled = true;
    document.getElementById('openLockBtn').disabled = true;
  }

  function enableLockpickingControls() {
    document.getElementById('liftPinBtn').disabled = false;
    document.getElementById('moveLeftBtn').disabled = false;
    document.getElementById('moveRightBtn').disabled = false;
    document.getElementById('applyTensionBtn').disabled = false;
    document.getElementById('openLockBtn').disabled = true;
    document.getElementById('openLockBtn').style.display = 'none';
  }

  function startGameLoopLockpicking() {
    if (lockpickGame.gameLoopInterval) clearInterval(lockpickGame.gameLoopInterval);
    lockpickGame.gameLoopInterval = setInterval(() => {
        if (!lockpickGame.isApplyingTension && lockpickGame.tension > 0) {
            lockpickGame.tension = Math.max(0, lockpickGame.tension - lockpickGame.TENSION_DECREASE_RATE);
            updateTensionBar();
        }

        if (lockpickGame.lockoutTimer > 0) {
            lockpickGame.lockoutTimer -= 100;
            showMessageLockpicking(`Замок заблокирован: ${Math.ceil(lockpickGame.lockoutTimer / 1000)}с`, 'locked');
            disableLockpickingControls();
            lockpickGame.gameLocked = true;
            if (lockpickGame.lockoutTimer <= 0) {
                lockpickGame.gameLocked = false;
                enableLockpickingControls();
                showMessageLockpicking("Замок снова доступен.");
            }
        }
    }, 100);
  }

  function tensionLoopLockpicking() {
    if (lockpickGame.tensionInterval) clearInterval(lockpickGame.tensionInterval);
    lockpickGame.tensionInterval = setInterval(() => {
        if (lockpickGame.isApplyingTension && !lockpickGame.gameLocked && !lockpickGame.gameWon) {
            lockpickGame.tension = Math.min(lockpickGame.MAX_TENSION, lockpickGame.tension + lockpickGame.TENSION_INCREASE_RATE);
            updateTensionBar();
            if (lockpickGame.tension >= lockpickGame.MAX_TENSION) {
                showMessageLockpicking("Слишком резкое натяжение! Замок заблокирован.", 'locked');
                resetLockAttemptLockpicking();
                lockpickGame.lockoutTimer = lockpickGame.LOCKOUT_DURATION;
                lockpickGame.isApplyingTension = false;
                clearInterval(lockpickGame.tensionInterval);
            }
        } else {
            clearInterval(lockpickGame.tensionInterval);
        }
    }, 100);
  }

  function resetLockAttemptLockpicking() {
    lockpickGame.pins.forEach((pin, index) => {
        pin.currentHeight = lockpickGame.MIN_PIN_HEIGHT;
        pin.isSet = false;
        lockpickGame.pinElements[index].style.height = `${lockpickGame.MIN_PIN_HEIGHT}%`;
        lockpickGame.pinElements[index].style.backgroundColor = '#cbd5e0';
        lockpickGame.pinElements[index].classList.remove('set');
    });
    lockpickGame.tension = 0;
    updateTensionBar();
  }

  function checkAllPinsSetLockpicking() {
    const allPinsAreSet = lockpickGame.pins.every(pin => pin.isSet);
    if (allPinsAreSet) {
        showMessageLockpicking("Все пины установлены! Нажмите 'Открыть Замок'.", 'win');
        disableLockpickingControls();
        document.getElementById('openLockBtn').style.display = 'block';
        document.getElementById('openLockBtn').disabled = false;
    }
  }

  function openLockLockpicking() {
    lockpickGame.gameWon = true;
    showMessageLockpicking("Замок открыт!", 'win');
    document.getElementById('messageBox').classList.add('win-animation');
    disableLockpickingControls();

    setTimeout(() => {
        document.getElementById('messageBox').classList.remove('win-animation');
        document.getElementById('messageBox').textContent = "Замок открыт!";
        // Transition back to main game
        const minigameContainer = document.getElementById('minigame-container');
        const gameScreen = document.getElementById('game-screen');
        const infoPanel = document.getElementById('game-info-panel');
        const inventoryBar = document.querySelector('.inventory-bar');
        const gameTimer = document.getElementById('game-timer');
        const dialogBox = document.getElementById('dialog-box'); // Get dialog box

        minigameContainer.style.display = 'none';
        gameScreen.style.display = 'block';
        infoPanel.style.display = 'block';
        inventoryBar.style.display = 'flex';
        gameTimer.style.display = 'block'; // Show main game timer
        dialogBox.style.display = 'none'; // Hide dialog box

        // Set flag for main game and add item
        gameState.flags.wardrobe_unlocked = true;
        if (!gameState.inventory.includes('thread_and_scissors')) {
            gameState.inventory.push('thread_and_scissors');
            showFeedback(`Получен предмет: ${room246Data.items['thread_and_scissors'].name}`, "success");
            renderInventory();
        }
        
        renderState(); // Re-render main game state
        cleanupLockpickingGame(); // Clean up listeners and intervals
    }, lockpickGame.WIN_ANIMATION_DURATION);
  }

  // --- Coursework Filing Minigame Logic ---
  // NEW: Unified Drag and Drop handler functions
  function onDragStartCoursework(event) {
      if (!courseworkGame.gameStarted || courseworkGame.professorCallActive) return;
  
      const target = event.target.closest('.coursework-page, .coursework-stapled-page');
      if (!target) return;
  
      event.preventDefault();
  
      courseworkGame.draggedElement = target;
      courseworkGame.isDragging = true;
  
      const rect = target.getBoundingClientRect();
      const touch = event.touches ? event.touches[0] : event;
  
      courseworkGame.dragOffsetX = touch.clientX - rect.left;
      courseworkGame.dragOffsetY = touch.clientY - rect.top;
  
      target.classList.add('dragging');
      target.style.position = 'fixed';
      target.style.zIndex = '1001';
      
      onDragMoveCoursework(event);
  
      document.addEventListener('mousemove', onDragMoveCoursework);
      document.addEventListener('touchmove', onDragMoveCoursework, { passive: false });
      document.addEventListener('mouseup', onDragEndCoursework);
      document.addEventListener('touchend', onDragEndCoursework);
  }
  
  function onDragMoveCoursework(event) {
      if (!courseworkGame.isDragging || !courseworkGame.draggedElement) return;
  
      event.preventDefault();
  
      const touch = event.touches ? event.touches[0] : event;
      const element = courseworkGame.draggedElement;
      
      let newX = touch.clientX - courseworkGame.dragOffsetX;
      let newY = touch.clientY - courseworkGame.dragOffsetY;
  
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
  }
  
  function onDragEndCoursework(event) {
      if (!courseworkGame.isDragging || !courseworkGame.draggedElement) return;
  
      const element = courseworkGame.draggedElement;
      element.style.visibility = 'hidden';
      const touch = event.changedTouches ? event.changedTouches[0] : event;
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      element.style.visibility = 'visible';
  
      const pagesContainer = document.getElementById('pages-container');
      const staplingPanel = document.getElementById('stapling-panel');
  
      element.classList.remove('dragging');
      element.style.zIndex = '';
  
      const isDroppedOnStaplingPanel = staplingPanel.contains(dropTarget);
  
      if (isDroppedOnStaplingPanel) {
          element.style.position = 'relative';
          element.style.left = '';
          element.style.top = '';
          staplingPanel.appendChild(element);
          element.classList.remove('coursework-page');
          element.classList.add('coursework-stapled-page');
          const placeholder = staplingPanel.querySelector('p');
          if (placeholder) placeholder.remove();
      } else {
          element.style.position = 'absolute';
          pagesContainer.appendChild(element);
          element.classList.remove('coursework-stapled-page');
          element.classList.add('coursework-page');
          randomizePagePositionsForOneCoursework(element);
      }
      
      courseworkGame.stapledPages = Array.from(staplingPanel.querySelectorAll('.coursework-stapled-page'))
          .map(el => ({ id: el.id, order: parseInt(el.dataset.order) }));
          
      if (staplingPanel.querySelectorAll('.coursework-stapled-page').length === 0 && !staplingPanel.querySelector('p')) {
          staplingPanel.innerHTML = '<p class="text-gray-500">Перетащите страницы сюда в правильном порядке</p>';
      }
  
      updateStapledCountCoursework();
      checkStitchButtonReadyCoursework(); // Updated function name
  
      courseworkGame.isDragging = false;
      courseworkGame.draggedElement = null;
  
      document.removeEventListener('mousemove', onDragMoveCoursework);
      document.removeEventListener('touchmove', onDragMoveCoursework);
      document.removeEventListener('mouseup', onDragEndCoursework);
      document.removeEventListener('touchend', onDragEndCoursework);
  }

  function initCourseworkGame() {
    // Game elements
    const pagesContainer = document.getElementById('pages-container');
    const staplingPanel = document.getElementById('stapling-panel');
    const stitchButton = document.getElementById('stitch-button'); // Renamed stapler-button
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const timerDisplay = document.getElementById('timer');
    const stapledCountDisplay = document.getElementById('stapled-count');
    const totalPagesDisplay = document.getElementById('total-pages');
    const professorPopupOverlay = document.getElementById('professor-popup-overlay');
    const professorQuestion = document.getElementById('professor-question');
    const professorPopupOkButton = document.getElementById('professor-popup-ok');
    const gameEndScreen = document.getElementById('game-end-screen');
    const threadTangledMessage = document.getElementById('thread-tangled-message'); // Renamed stapler-jammed-message
    const untangleClicksNeededDisplay = document.getElementById('untangle-clicks-needed'); // Renamed stapler-clicks-needed

    // Reset game state variables
    courseworkGame.gameStarted = false;
    courseworkGame.timeLeft = 150;
    courseworkGame.stapledPages = [];
    courseworkGame.threadTangled = false; // Reset thread tangled state
    courseworkGame.untangleClicksRemaining = 0; // Reset untangle clicks
    courseworkGame.professorCallActive = false;
    courseworkGame.correctProfessorPageId = null;
    courseworkGame.windActive = false;
    courseworkGame.nextInterferenceTimeoutId = null;
    courseworkGame.draggedElement = null; 
    courseworkGame.isDragging = false;

    clearInterval(courseworkGame.timerInterval);
    clearTimeout(courseworkGame.nextInterferenceTimeoutId);
    if (courseworkGame.windInterval) clearInterval(courseworkGame.windInterval); // Clear wind interval

    timerDisplay.textContent = formatTimeCoursework(courseworkGame.timeLeft);
    stapledCountDisplay.textContent = 0;
    totalPagesDisplay.textContent = courseworkGame.pagesData.length;
    stitchButton.disabled = true;
    threadTangledMessage.classList.add('hidden');
    professorPopupOverlay.classList.remove('active');
    gameEndScreen.classList.remove('active');
    pagesContainer.classList.remove('wind-active');

    staplingPanel.innerHTML = '<p class="text-gray-500">Перетащите страницы сюда в правильном порядке</p>';
    pagesContainer.innerHTML = ''; 

    createPagesCoursework();
    requestAnimationFrame(() => {
        randomizePagePositionsCoursework();
    });

    startButton.style.display = 'block';
    restartButton.style.display = 'none';
    stitchButton.textContent = 'Подшить!';

    // Re-attach listeners for Coursework Filing game
    startButton.onclick = () => {
        courseworkGame.gameStarted = true;
        startButton.style.display = 'none';
        startTimerCoursework();
        courseworkGame.nextInterferenceTimeoutId = setTimeout(triggerInterferenceCoursework, Math.random() * 10000 + 5000);
    };

    restartButton.onclick = () => initCourseworkGame();

    stitchButton.onclick = () => { // Updated button variable
        if (!courseworkGame.gameStarted || courseworkGame.professorCallActive) return;

        stitchButton.classList.add('clicked');
        setTimeout(() => {
            stitchButton.classList.remove('clicked');
        }, 100);

        if (courseworkGame.threadTangled) { // Updated logic for thread tangling
            courseworkGame.untangleClicksRemaining--;
            // Update text immediately
            document.getElementById('untangle-clicks-needed').textContent = courseworkGame.untangleClicksRemaining;
            stitchButton.textContent = `Распутать нить! (${courseworkGame.untangleClicksRemaining} раз)`;

            if (courseworkGame.untangleClicksRemaining <= 0) {
                courseworkGame.threadTangled = false;
                threadTangledMessage.classList.add('hidden');
                checkStitchButtonReadyCoursework(); // Updated function name
                showFeedback('Нить распутана!', 'success');
            }
        } else {
            performStaplingCoursework(); // This will now be stitching
        }
    };

    professorPopupOkButton.onclick = () => {
        if (courseworkGame.professorCallActive) {
            showFeedback('Время уходит! Будь внимательнее!', 'error');
            resolveProfessorCallCoursework(false);
        }
        removeAllProfessorClickListenersCoursework();
    };

    minigameContainer.dataset.activeGame = 'stitching';
  }

  function cleanupCourseworkGame() {
    clearInterval(courseworkGame.timerInterval);
    clearTimeout(courseworkGame.nextInterferenceTimeoutId);
    if (courseworkGame.windInterval) clearInterval(courseworkGame.windInterval); // Clear wind interval
    
    document.removeEventListener('mousemove', onDragMoveCoursework);
    document.removeEventListener('touchmove', onDragMoveCoursework);
    document.removeEventListener('mouseup', onDragEndCoursework);
    document.removeEventListener('touchend', onDragEndCoursework);

    document.getElementById('minigame-container').removeAttribute('dataset.activeGame');
    document.body.style.overflow = ''; // Re-enable scrolling
  }

  function createPagesCoursework() {
    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer) return;
    const shuffledPagesData = [...courseworkGame.pagesData].sort(() => Math.random() - 0.5);

    shuffledPagesData.forEach(page => {
        const pageElement = document.createElement('div');
        pageElement.classList.add('coursework-page');
        pageElement.id = page.id;
        pageElement.textContent = page.name;
        pageElement.dataset.order = page.order;

        pageElement.addEventListener('mousedown', onDragStartCoursework);
        pageElement.addEventListener('touchstart', onDragStartCoursework, { passive: false });
        pageElement.addEventListener('click', handleProfessorPageClickCoursework);

        pagesContainer.appendChild(pageElement);
    });
  }

  function randomizePagePositionsCoursework() {
    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer) return;
    const pages = Array.from(pagesContainer.children);
    pages.forEach(page => randomizePagePositionsForOneCoursework(page));
  }

  function randomizePagePositionsForOneCoursework(pageElement) {
    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer) return;
    const containerRect = pagesContainer.getBoundingClientRect();
    const pageRect = pageElement.getBoundingClientRect();
    const padding = 10; // Padding from the edges

    const maxX = Math.max(0, containerRect.width - pageRect.width - padding * 2);
    const maxY = Math.max(0, containerRect.height - pageRect.height - padding * 2);

    const randomX = Math.random() * maxX + padding;
    const randomY = Math.random() * maxY + padding;

    pageElement.style.left = `${randomX}px`;
    pageElement.style.top = `${randomY}px`;
    pageElement.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
  }

  function formatTimeCoursework(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function startTimerCoursework() {
    const timerDisplay = document.getElementById('timer');
    if (!timerDisplay) return;
    courseworkGame.timerInterval = setInterval(() => {
        if (courseworkGame.gameStarted) {
            courseworkGame.timeLeft--;
            timerDisplay.textContent = formatTimeCoursework(courseworkGame.timeLeft);

            if (courseworkGame.timeLeft <= 0) {
                clearInterval(courseworkGame.timerInterval);
                endGameCoursework(false);
            }
        }
    }, 1000);
  }

  function checkStitchButtonReadyCoursework() { // Renamed function
    const stitchButton = document.getElementById('stitch-button'); // Renamed variable
    if (!stitchButton) return;

    if (courseworkGame.professorCallActive) {
        stitchButton.disabled = true;
        stitchButton.textContent = 'Ожидание ответа профессора...'; // Added specific text
        return;
    }

    if (courseworkGame.threadTangled) { // Updated logic for thread tangling
        stitchButton.disabled = false; // Enable to untangle
        stitchButton.textContent = `Распутать нить! (${courseworkGame.untangleClicksRemaining} раз)`; // Updated button text
    } else {
        stitchButton.disabled = (courseworkGame.stapledPages.length === 0 || courseworkGame.stapledPages.length !== courseworkGame.pagesData.length); // Disable if no pages or not all pages are in panel
        stitchButton.textContent = 'Подшить!'; // Reset text
    }
  }

  function performStaplingCoursework() { // This function now represents stitching
    const staplingPanel = document.getElementById('stapling-panel');
    const pagesContainer = document.getElementById('pages-container');
    if (!staplingPanel || !pagesContainer) return;

    const currentStapledElements = Array.from(staplingPanel.querySelectorAll('.coursework-stapled-page'));
    const currentPageOrder = currentStapledElements.map(el => parseInt(el.dataset.order));

    if (currentPageOrder.length !== courseworkGame.pagesData.length) {
        showFeedback('Не все страницы собраны!', 'info');
        return;
    }

    const isCorrectOrder = currentPageOrder.every((order, index) => order === index);

    if (isCorrectOrder) {
        endGameCoursework(true);
    } else {
        showFeedback('Неправильный порядок! Попробуйте снова.', 'error');
        currentStapledElements.forEach(pageElement => {
            pagesContainer.appendChild(pageElement);
            pageElement.classList.remove('coursework-stapled-page');
            pageElement.classList.add('coursework-page');
            pageElement.style.position = 'absolute';
            randomizePagePositionsForOneCoursework(pageElement);
        });
        courseworkGame.stapledPages = [];
        staplingPanel.innerHTML = '<p class="text-gray-500">Перетащите страницы сюда в правильном порядке</p>';
        updateStapledCountCoursework();
        checkStitchButtonReadyCoursework(); // Updated function name
    }
  }

  function updateStapledCountCoursework() {
    const stapledCountDisplay = document.getElementById('stapled-count');
    if (stapledCountDisplay) {
        stapledCountDisplay.textContent = courseworkGame.stapledPages.length;
    }
  }

  function triggerInterferenceCoursework() {
    if (!courseworkGame.gameStarted || courseworkGame.professorCallActive) return;

    const interferenceType = Math.floor(Math.random() * 3);

    switch (interferenceType) {
        case 0: activateWindCoursework(); break;
        case 1: activateThreadTangleCoursework(); break; // Renamed function
        case 2: activateProfessorCallCoursework(); break;
    }
    courseworkGame.nextInterferenceTimeoutId = setTimeout(triggerInterferenceCoursework, Math.random() * 20000 + 10000);
  }

  function activateWindCoursework() {
    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer || courseworkGame.windActive) return;
    
    courseworkGame.windActive = true;
    pagesContainer.classList.add('wind-active');
    showFeedback('Ветер! Страницы перемешались!', 'info');

    // Start continuous random movement
    courseworkGame.windInterval = setInterval(() => {
        const pages = Array.from(pagesContainer.children).filter(el => el.classList.contains('coursework-page'));
        pages.forEach(page => {
            const currentX = parseFloat(page.style.left) || 0;
            const currentY = parseFloat(page.style.top) || 0;
            const containerRect = pagesContainer.getBoundingClientRect();
            const pageRect = page.getBoundingClientRect();
            const padding = 10;

            let newX = currentX + (Math.random() * 6 - 3); // -3 to 3 pixels horizontal drift
            let newY = currentY + (Math.random() * 6 - 3); // -3 to 3 pixels vertical drift

            // Keep pages within bounds
            newX = Math.max(padding, Math.min(newX, containerRect.width - pageRect.width - padding));
            newY = Math.max(padding, Math.min(newY, containerRect.height - pageRect.height - padding));

            page.style.left = `${newX}px`;
            page.style.top = `${newY}px`;
            page.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
        });
    }, 100); // Update position every 100ms

    setTimeout(() => {
        pagesContainer.classList.remove('wind-active');
        courseworkGame.windActive = false;
        if (courseworkGame.windInterval) clearInterval(courseworkGame.windInterval); // Stop movement
        showFeedback('Ветер стих.', 'info');
    }, 5000); // Wind lasts for 5 seconds
  }

  function activateThreadTangleCoursework() { // Renamed function
    const threadTangledMessage = document.getElementById('thread-tangled-message'); // Renamed variable
    const untangleClicksNeededDisplay = document.getElementById('untangle-clicks-needed'); // Renamed variable
    const stitchButton = document.getElementById('stitch-button'); // Renamed variable
    if (!threadTangledMessage || !untangleClicksNeededDisplay || !stitchButton || courseworkGame.threadTangled) return;

    courseworkGame.threadTangled = true;
    courseworkGame.untangleClicksRemaining = Math.floor(Math.random() * 3) + 2; // 2-4 clicks to untangle
    threadTangledMessage.classList.remove('hidden');
    untangleClicksNeededDisplay.textContent = courseworkGame.untangleClicksRemaining;
    showFeedback('Нить запуталась!', 'error');
    checkStitchButtonReadyCoursework(); // Call to update button state and text
  }

  function activateProfessorCallCoursework() {
    const professorPopupOverlay = document.getElementById('professor-popup-overlay');
    const professorQuestion = document.getElementById('professor-question');
    const pagesContainer = document.getElementById('pages-container');
    if (!professorPopupOverlay || !professorQuestion || !pagesContainer || courseworkGame.professorCallActive) return;

    courseworkGame.professorCallActive = true;
    courseworkGame.gameStarted = false; // Pause game

    const availablePages = courseworkGame.pagesData.filter(page => !courseworkGame.stapledPages.some(sp => sp.id === page.id));
    if (availablePages.length === 0) {
        courseworkGame.professorCallActive = false;
        courseworkGame.gameStarted = true;
        return;
    }

    const randomPage = availablePages[Math.floor(Math.random() * availablePages.length)];
    courseworkGame.correctProfessorPageId = randomPage.id;
    professorQuestion.textContent = `Где "${randomPage.name}"?!`;
    professorPopupOverlay.classList.add('active');

    pagesContainer.querySelectorAll('.coursework-page').forEach(pageElement => {
        pageElement.addEventListener('click', handleProfessorPageClickCoursework, { once: true });
    });
  }

  function handleProfessorPageClickCoursework(event) {
    if (!courseworkGame.professorCallActive) return;

    const clickedPageId = event.target.id;
    if (clickedPageId === courseworkGame.correctProfessorPageId) {
        showFeedback('Правильно! Продолжай!', 'success');
        resolveProfessorCallCoursework(true);
    } else {
        showFeedback('Неверно! Поторопись!', 'error');
        resolveProfessorCallCoursework(false);
    }
    removeAllProfessorClickListenersCoursework();
  }

  function removeAllProfessorClickListenersCoursework() {
    const pagesContainer = document.getElementById('pages-container');
    if (pagesContainer) {
        pagesContainer.querySelectorAll('.coursework-page').forEach(pageElement => {
            pageElement.removeEventListener('click', handleProfessorPageClickCoursework);
        });
    }
  }

  function resolveProfessorCallCoursework(isCorrect) {
    document.getElementById('professor-popup-overlay').classList.remove('active');
    courseworkGame.professorCallActive = false;
    courseworkGame.gameStarted = true; // Resume game

    if (!isCorrect) {
        courseworkGame.timeLeft = Math.max(0, courseworkGame.timeLeft - 15);
        document.getElementById('timer').textContent = formatTimeCoursework(courseworkGame.timeLeft);
    }
    courseworkGame.correctProfessorPageId = null;
  }

  function endGameCoursework(win) {
    courseworkGame.gameStarted = false;
    clearInterval(courseworkGame.timerInterval);
    clearTimeout(courseworkGame.nextInterferenceTimeoutId);
    if (courseworkGame.windInterval) clearInterval(courseworkGame.windInterval); // Clear wind interval
    
    const gameEndScreen = document.getElementById('game-end-screen');
    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');
    document.getElementById('restart-button').style.display = 'block';
    
    gameEndScreen.classList.add('active');
    if (win) {
        endTitle.textContent = 'Победа!';
        endTitle.className = 'coursework-game-end-screen h2 text-green-600';
        endMessage.textContent = 'Курсовая подшита! Отлично!';
        endMessage.className = 'coursework-game-end-screen p text-green-700';
        completeRoom246Game();
    } else {
        endTitle.textContent = 'Поражение!';
        endTitle.className = 'coursework-game-end-screen h2 text-red-600';
        endMessage.textContent = 'Вы не успели. Попробуйте снова.';
        endMessage.className = 'coursework-game-end-screen p text-red-500';
        setTimeout(() => {
            initCourseworkGame();
            gameEndScreen.classList.remove('active');
        }, 3000);
    }
    cleanupCourseworkGame();
  }

  function showEnding(endingId) {
    if (gameState.ending) return;
    gameState.ending = true;
    if (gameState.timerId) clearInterval(gameState.timerId);

    const ending = room246Data.endings[endingId];
    const endingScreen = document.getElementById('ending-screen');
    const minigameContainer = document.getElementById('minigame-container');
    const gameScreen = document.getElementById('game-screen');
    const infoPanel = document.getElementById('game-info-panel');
    const inventoryBar = document.querySelector('.inventory-bar');
    const gameTimer = document.getElementById('game-timer');
    const room246Feedback = document.getElementById('room246Feedback');
    const dialogBox = document.getElementById('dialog-box');

    if (!endingScreen) return;

    if (gameScreen) gameScreen.style.display = 'none';
    if (dialogBox) dialogBox.style.display = 'none';
    if (inventoryBar) inventoryBar.style.display = 'none';
    if (gameTimer) gameTimer.style.display = 'none';
    if (room246Feedback) room246Feedback.style.display = 'none';
    if (infoPanel) infoPanel.style.display = 'none';
    if (minigameContainer) minigameContainer.style.display = 'none';
    
    endingScreen.style.display = 'block';
    endingScreen.innerHTML = `
      <h2>${ending.title}</h2>
      <img src="${ending.image}" alt="${ending.title}">
      <p>${ending.text}</p>
      ${endingId === "good" ? 
        `<button class="btn" onclick="room246Game.completeRoom246Game()">Завершить и открыть главный подарок!</button>` : 
        `<button class="btn" onclick="room246Game.initRoom246Game()">Попробовать снова</button>`}
    `;
    document.body.style.overflow = ''; // Re-enable scrolling
  }
  
  function showFeedback(message, type = "info") {
    const feedbackEl = document.getElementById('room246Feedback');
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.className = `hint ${type}`;
    setTimeout(() => {
        if (feedbackEl) {
            feedbackEl.textContent = '';
            feedbackEl.className = 'hint';
        }
    }, 3000);
  }

  function completeRoom246Game() {
    gamesCompleted.room246 = true;
    showBoxAnimation(4); // Triggers final gift animation
    cleanupLockpickingGame();
    cleanupCourseworkGame();
  }
  
  return {
    initRoom246Game,
    completeRoom246Game,
    checkPrompt,
    closeDialog
  };
})();
