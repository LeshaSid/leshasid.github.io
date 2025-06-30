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
    currentPageOrder: [], // Used for checking order during stapling
    staplerJammed: false,
    staplerClicksRemaining: 0,
    professorCallActive: false,
    correctProfessorPageId: null,
    windActive: false,
    nextInterferenceTimeoutId: null,
    draggedElement: null, // Unified variable for the currently dragged DOM element
    initialTouchX: 0, // Initial touch X for dragging
    initialTouchY: 0, // Initial touch Y for dragging
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
            return;
        }
        // Lockpicking Minigame HTML
        minigameContainer.innerHTML = `
            <div class="game-container">
                <h1>Взлом замка скрепкой</h1>
                <p>
                    Цель: Открыть замок, правильно поднимая пины.
                    Используйте &larr; &rarr; для перемещения скрепки, &uarr; для поднятия пина, и <kbd>Пробел</kbd> для натяжения.
                    <br>
                    Чтобы поднять пин, натяжение должно быть в его "идеальной точке" (индикатор натяжения станет фиолетовым). Замок блокируется только при максимальном натяжении.
                </p>

                <div class="lock-mechanism" id="lockMechanism">
                    <!-- Pins will be dynamically added here by JavaScript -->
                    <div class="paperclip" id="paperclip">
                        <div class="paperclip-tip"></div>
                    </div>
                </div>

                <div class="tension-indicator-container">
                    <div class="tension-bar" id="tensionBar"></div>
                </div>
                <p class="text-sm text-center mt-2 text-gray-400">Натяжение пружины (удерживайте Пробел)</p>

                <div class="message-box" id="messageBox">
                    Начните взлом!
                </div>

                <div class="controls">
                    <button class="control-button" id="moveLeftBtn">&larr; Влево</button>
                    <button class="control-button" id="liftPinBtn">&uarr; Поднять Пин</button>
                    <button class="control-button" id="moveRightBtn">&rarr; Вправо</button>
                    <button class="control-button" id="applyTensionBtn">Натяжение</button>
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
                        <!-- Pages will be dynamically loaded here by JS -->
                    </div>
                    <div id="stapling-panel" class="coursework-stapling-panel">
                        <p class="text-gray-500">Перетащите страницы сюда в правильном порядке</p>
                        <!-- Stapled pages will appear here -->
                    </div>
                    <button id="stapler-button" class="coursework-stapler-button" disabled>Подшить!</button>
                    <p id="stapler-jammed-message" class="coursework-stapler-jammed-text hidden">Степлер заело! Нажми ещё <span id="stapler-clicks-needed"></span> раз(а)!</p>
                </div>

                <button id="start-button" class="coursework-stapler-button mt-4 mx-auto block">Начать игру</button>

                <!-- Professor's Call Pop-up -->
                <div id="professor-popup-overlay" class="coursework-popup-overlay">
                    <div class="coursework-popup-content">
                        <h3>Звонок от препода!</h3>
                        <p id="professor-question"></p>
                        <button id="professor-popup-ok">Понял!</button>
                    </div>
                </div>

                <!-- Game End Screen -->
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
            tensionBar.style.backgroundColor = '#f6ad55'; // Orange
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
    document.getElementById('moveLeftBtn').disabled = true;
    document.getElementById('liftPinBtn').disabled = true;
    document.getElementById('moveRightBtn').disabled = true;
    document.getElementById('applyTensionBtn').disabled = true;
    document.getElementById('openLockBtn').disabled = true;
  }

  function enableLockpickingControls() {
    document.getElementById('moveLeftBtn').disabled = false;
    document.getElementById('liftPinBtn').disabled = false;
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
  function initCourseworkGame() {
    // Game elements
    const pagesContainer = document.getElementById('pages-container');
    const staplingPanel = document.getElementById('stapling-panel');
    const staplerButton = document.getElementById('stapler-button');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const timerDisplay = document.getElementById('timer');
    const stapledCountDisplay = document.getElementById('stapled-count');
    const totalPagesDisplay = document.getElementById('total-pages');
    const professorPopupOverlay = document.getElementById('professor-popup-overlay');
    const professorQuestion = document.getElementById('professor-question');
    const professorPopupOkButton = document.getElementById('professor-popup-ok');
    const gameEndScreen = document.getElementById('game-end-screen');
    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');
    const staplerJammedMessage = document.getElementById('stapler-jammed-message');
    const staplerClicksNeededDisplay = document.getElementById('stapler-clicks-needed');

    // Reset game state variables
    courseworkGame.gameStarted = false;
    courseworkGame.timeLeft = 150;
    courseworkGame.stapledPages = [];
    courseworkGame.currentPageOrder = [];
    courseworkGame.staplerJammed = false;
    courseworkGame.staplerClicksRemaining = 0;
    courseworkGame.professorCallActive = false;
    courseworkGame.correctProfessorPageId = null;
    courseworkGame.windActive = false;
    courseworkGame.nextInterferenceTimeoutId = null;
    courseworkGame.draggedElement = null; // Reset dragged element

    clearInterval(courseworkGame.timerInterval);
    clearTimeout(courseworkGame.nextInterferenceTimeoutId);

    timerDisplay.textContent = formatTimeCoursework(courseworkGame.timeLeft);
    stapledCountDisplay.textContent = 0;
    totalPagesDisplay.textContent = courseworkGame.pagesData.length;
    staplerButton.disabled = true;
    staplerJammedMessage.classList.add('hidden');
    professorPopupOverlay.classList.remove('active');
    gameEndScreen.classList.remove('active');
    pagesContainer.classList.remove('wind-active');

    // Ensure stapling panel has its initial placeholder
    staplingPanel.innerHTML = '<p class="text-gray-500">Перетащите страницы сюда в правильном порядке</p>';
    pagesContainer.innerHTML = ''; // Clear pages container

    createPagesCoursework();
    // Use requestAnimationFrame to ensure layout is ready before positioning
    requestAnimationFrame(() => {
        randomizePagePositionsCoursework();
    });

    startButton.style.display = 'block';
    restartButton.style.display = 'none';
    staplerButton.textContent = 'Подшить!';

    // Re-attach listeners for Coursework Filing game
    startButton.onclick = () => {
        courseworkGame.gameStarted = true;
        startButton.style.display = 'none';
        startTimerCoursework();
        courseworkGame.nextInterferenceTimeoutId = setTimeout(triggerInterferenceCoursework, Math.random() * 10000 + 5000);
    };

    restartButton.onclick = () => initCourseworkGame();

    staplerButton.onclick = () => {
        if (!courseworkGame.gameStarted || courseworkGame.professorCallActive) return;

        staplerButton.classList.add('clicked');
        setTimeout(() => {
            staplerButton.classList.remove('clicked');
        }, 100);

        if (courseworkGame.staplerJammed) {
            courseworkGame.staplerClicksRemaining--;
            staplerClicksNeededDisplay.textContent = courseworkGame.staplerClicksRemaining;
            if (courseworkGame.staplerClicksRemaining <= 0) {
                courseworkGame.staplerJammed = false;
                staplerJammedMessage.classList.add('hidden');
                checkStaplerReadyCoursework();
                staplerButton.textContent = 'Подшить!';
            }
        } else {
            performStaplingCoursework();
        }
    };

    professorPopupOkButton.onclick = () => {
        if (courseworkGame.professorCallActive) {
            showFeedback('Время уходит! Будь внимательнее!', 'error');
            resolveProfessorCallCoursework(false);
        }
        removeAllProfessorClickListenersCoursework();
    };

    // Add drag/drop and touch listeners for pagesContainer and staplingPanel
    pagesContainer.addEventListener('dragover', (event) => event.preventDefault());
    pagesContainer.addEventListener('drop', handlePagesContainerDropCoursework);
    staplingPanel.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    });
    staplingPanel.addEventListener('drop', handleStaplingPanelDropCoursework);

    // Ensure cleanup when minigame ends
    minigameContainer.dataset.activeGame = 'stitching';
  }

  function cleanupCourseworkGame() {
    clearInterval(courseworkGame.timerInterval);
    clearTimeout(courseworkGame.nextInterferenceTimeoutId);
    // Remove specific listeners if they were added dynamically
    const pagesContainer = document.getElementById('pages-container');
    const staplingPanel = document.getElementById('stapling-panel');
    const staplerButton = document.getElementById('stapler-button');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const professorPopupOkButton = document.getElementById('professor-popup-ok');

    if (startButton) startButton.onclick = null;
    if (restartButton) restartButton.onclick = null;
    if (staplerButton) staplerButton.onclick = null;
    if (professorPopupOkButton) professorPopupOkButton.onclick = null;

    if (pagesContainer) {
        pagesContainer.removeEventListener('dragover', (event) => event.preventDefault());
        pagesContainer.removeEventListener('drop', handlePagesContainerDropCoursework);
        pagesContainer.querySelectorAll('.coursework-page').forEach(pageElement => {
            pageElement.removeEventListener('dragstart', handleDragStartCoursework);
            pageElement.removeEventListener('dragend', handleDragEndCoursework);
            pageElement.removeEventListener('touchstart', handleTouchStartCoursework);
            pageElement.removeEventListener('touchmove', handleTouchMoveCoursework);
            pageElement.removeEventListener('touchend', handleTouchEndCoursework);
            pageElement.removeEventListener('click', handleProfessorPageClickCoursework);
        });
    }
    if (staplingPanel) {
        staplingPanel.removeEventListener('dragover', (event) => { event.preventDefault(); });
        staplingPanel.removeEventListener('drop', handleStaplingPanelDropCoursework);
        staplingPanel.querySelectorAll('.coursework-stapled-page').forEach(pageElement => {
            pageElement.removeEventListener('dragstart', handleDragStartCoursework);
            pageElement.removeEventListener('dragend', handleDragEndCoursework);
            pageElement.removeEventListener('touchstart', handleTouchStartCoursework);
            pageElement.removeEventListener('touchmove', handleTouchMoveCoursework);
            pageElement.removeEventListener('touchend', handleTouchEndCoursework);
        });
    }
    document.getElementById('minigame-container').removeAttribute('dataset.activeGame');
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
        pageElement.draggable = true;
        pageElement.dataset.order = page.order;

        pageElement.addEventListener('dragstart', handleDragStartCoursework);
        pageElement.addEventListener('dragend', handleDragEndCoursework);
        pageElement.addEventListener('touchstart', handleTouchStartCoursework);
        pageElement.addEventListener('touchmove', handleTouchMoveCoursework);
        pageElement.addEventListener('touchend', handleTouchEndCoursework);

        pagesContainer.appendChild(pageElement);
    });
  }

  function randomizePagePositionsCoursework() {
    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer) return;
    const containerRect = pagesContainer.getBoundingClientRect();
    // Ensure container has dimensions before trying to position
    if (containerRect.width === 0 || containerRect.height === 0) {
        setTimeout(randomizePagePositionsCoursework, 100); // Retry after a short delay
        return;
    }

    const pages = Array.from(pagesContainer.children);

    pages.forEach(page => {
        const pageRect = page.getBoundingClientRect();
        // Ensure page has dimensions
        if (pageRect.width === 0 || pageRect.height === 0) {
            return; // Skip if page size is not yet computed
        }

        const padding = 20; // Padding from the edges of the container in pixels
        
        // Calculate maximum X and Y coordinates in pixels, respecting padding
        const maxX_px = Math.max(0, containerRect.width - pageRect.width - padding * 2);
        const maxY_px = Math.max(0, containerRect.height - pageRect.height - padding * 2);

        // Generate random pixel positions within the allowed range
        const randomX_px = Math.random() * maxX_px + padding;
        const randomY_px = Math.random() * maxY_px + padding;

        // Convert pixel positions to percentages relative to container dimensions
        const randomX_percent = (randomX_px / containerRect.width) * 100;
        const randomY_percent = (randomY_px / containerRect.height) * 100;

        page.style.left = `${randomX_percent}%`;
        page.style.top = `${randomY_percent}%`;
        page.style.transform = `rotate(${Math.random() * 6 - 3}deg)`; // Random rotation for visual flair
    });
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

  function handleDragStartCoursework(event) {
    if (!courseworkGame.gameStarted || courseworkGame.professorCallActive) {
        event.preventDefault();
        return;
    }
    courseworkGame.draggedElement = event.target;
    event.dataTransfer.setData('text/plain', courseworkGame.draggedElement.id);
    event.dataTransfer.effectAllowed = 'move';
    courseworkGame.draggedElement.classList.add('dragging'); // Add dragging class
  }

  function handleDragEndCoursework(event) {
    if (courseworkGame.draggedElement) {
        courseworkGame.draggedElement.classList.remove('dragging'); // Remove dragging class
        courseworkGame.draggedElement = null;
    }
  }

  function handleStaplingPanelDropCoursework(event) {
    event.preventDefault();
    if (!courseworkGame.gameStarted || courseworkGame.professorCallActive || !courseworkGame.draggedElement) return;

    const droppedPage = courseworkGame.draggedElement;
    const staplingPanel = document.getElementById('stapling-panel');
    const pagesContainer = document.getElementById('pages-container');

    // Only allow dropping if the page is currently in the pages container
    if (droppedPage && droppedPage.parentElement === pagesContainer) {
        const placeholder = staplingPanel.querySelector('p');
        if (placeholder && placeholder.textContent === 'Перетащите страницы сюда в правильном порядке') {
            placeholder.remove();
        }

        // Move the actual DOM element
        staplingPanel.appendChild(droppedPage);
        droppedPage.classList.remove('coursework-page');
        droppedPage.classList.add('coursework-stapled-page');
        // Remove inline styles set for absolute positioning in pagesContainer
        droppedPage.style.left = '';
        droppedPage.style.top = '';
        droppedPage.style.transform = '';

        courseworkGame.stapledPages.push({
            id: droppedPage.id,
            order: parseInt(droppedPage.dataset.order)
        });
        updateStapledCountCoursework();
        checkStaplerReadyCoursework();
    }
    courseworkGame.draggedElement = null; // Reset dragged element after drop
  }

  function handlePagesContainerDropCoursework(event) {
    event.preventDefault();
    if (!courseworkGame.gameStarted || courseworkGame.professorCallActive || !courseworkGame.draggedElement) return;

    const droppedPage = courseworkGame.draggedElement;
    const pagesContainer = document.getElementById('pages-container');
    const staplingPanel = document.getElementById('stapling-panel');

    // Only allow dropping if the page is currently in the stapling panel
    if (droppedPage && droppedPage.parentElement === staplingPanel) {
        // Remove from stapledPages array
        courseworkGame.stapledPages = courseworkGame.stapledPages.filter(page => page.id !== droppedPage.id);

        // Move the actual DOM element
        pagesContainer.appendChild(droppedPage);
        droppedPage.classList.remove('coursework-stapled-page');
        droppedPage.classList.add('coursework-page');

        // Randomize position for the dropped page within its new container
        randomizePagePositionsForOneCoursework(droppedPage);
        
        updateStapledCountCoursework();
        checkStaplerReadyCoursework();

        // If no pages are left in stapling panel, add placeholder back
        if (courseworkGame.stapledPages.length === 0) {
            if (!staplingPanel.querySelector('p')) {
                const placeholder = document.createElement('p');
                placeholder.classList.add('text-gray-500');
                placeholder.textContent = 'Перетащите страницы сюда в правильном порядке';
                staplingPanel.appendChild(placeholder);
            }
        }
    }
    courseworkGame.draggedElement = null; // Reset dragged element after drop
  }

  let touchDraggedPageCoursework = null; // This variable is now redundant, use courseworkGame.draggedElement
  let initialTouchOffsetXCoursework, initialTouchOffsetYCoursework;

  function handleTouchStartCoursework(event) {
    if (!courseworkGame.gameStarted || courseworkGame.professorCallActive) {
        event.preventDefault();
        return;
    }
    // Set the draggedElement
    courseworkGame.draggedElement = event.target.closest('.coursework-page, .coursework-stapled-page');
    if (!courseworkGame.draggedElement) {
        return;
    }

    event.preventDefault(); // Prevent scrolling/zooming
    courseworkGame.draggedElement.classList.add('dragging'); // Add dragging class
    courseworkGame.draggedElement.style.position = 'absolute';
    courseworkGame.draggedElement.style.zIndex = '1000';

    const touch = event.touches[0];
    const pageRect = courseworkGame.draggedElement.getBoundingClientRect();
    courseworkGame.initialTouchX = touch.clientX - pageRect.left;
    courseworkGame.initialTouchY = touch.clientY - pageRect.top;

    // Append to body temporarily to allow dragging over other containers
    document.body.appendChild(courseworkGame.draggedElement);
  }

  function handleTouchMoveCoursework(event) {
    if (!courseworkGame.gameStarted || !courseworkGame.draggedElement || courseworkGame.professorCallActive) return;
    event.preventDefault(); // Prevent scrolling during drag

    const touch = event.touches[0];
    
    // Calculate new position relative to the viewport
    const newX = touch.clientX - courseworkGame.initialTouchX;
    const newY = touch.clientY - courseworkGame.initialTouchY;

    courseworkGame.draggedElement.style.left = `${newX}px`;
    courseworkGame.draggedElement.style.top = `${newY}px`;
  }

  function handleTouchEndCoursework(event) {
    if (!courseworkGame.gameStarted || !courseworkGame.draggedElement || courseworkGame.professorCallActive) return;

    courseworkGame.draggedElement.classList.remove('dragging');
    courseworkGame.draggedElement.style.zIndex = '';
    courseworkGame.draggedElement.style.position = ''; // Reset position to allow normal flow or re-positioning

    const touch = event.changedTouches[0];
    // Use document.elementFromPoint to determine the drop target
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const pagesContainer = document.getElementById('pages-container');
    const staplingPanel = document.getElementById('stapling-panel');

    const droppedPage = courseworkGame.draggedElement;
    
    // Check if dropped onto the stapling panel
    if (targetElement && (targetElement === staplingPanel || staplingPanel.contains(targetElement))) {
        // Move to stapling panel
        const placeholder = staplingPanel.querySelector('p');
        if (placeholder && placeholder.textContent === 'Перетащите страницы сюда в правильном порядке') {
            placeholder.remove();
        }

        staplingPanel.appendChild(droppedPage);
        droppedPage.classList.remove('coursework-page');
        droppedPage.classList.add('coursework-stapled-page');
        // Clear any inline positioning styles from touch-move
        droppedPage.style.left = '';
        droppedPage.style.top = '';
        droppedPage.style.transform = '';


        // Add to stapledPages array if not already there
        if (!courseworkGame.stapledPages.some(p => p.id === droppedPage.id)) {
            courseworkGame.stapledPages.push({
                id: droppedPage.id,
                order: parseInt(droppedPage.dataset.order)
            });
        }
        updateStapledCountCoursework();
        checkStaplerReadyCoursework();
    } else if (targetElement && (targetElement === pagesContainer || pagesContainer.contains(targetElement))) {
        // Move back to pages container (if it was from stapling panel)
        if (droppedPage.parentElement === staplingPanel) {
            courseworkGame.stapledPages = courseworkGame.stapledPages.filter(page => page.id !== droppedPage.id);
        }
        pagesContainer.appendChild(droppedPage);
        droppedPage.classList.remove('coursework-stapled-page');
        droppedPage.classList.add('coursework-page');
        randomizePagePositionsForOneCoursework(droppedPage); // Reposition randomly

        updateStapledCountCoursework();
        checkStaplerReadyCoursework();

        // If no pages are left in stapling panel, add placeholder back
        if (courseworkGame.stapledPages.length === 0) {
            if (!staplingPanel.querySelector('p')) {
                const placeholder = document.createElement('p');
                placeholder.classList.add('text-gray-500');
                placeholder.textContent = 'Перетащите страницы сюда в правильном порядке';
                staplingPanel.appendChild(placeholder);
            }
        }
    } else {
        // If dropped outside valid areas, return to original container
        if (droppedPage.classList.contains('coursework-page')) {
            pagesContainer.appendChild(droppedPage);
            randomizePagePositionsForOneCoursework(droppedPage);
        } else if (droppedPage.classList.contains('coursework-stapled-page')) {
            staplingPanel.appendChild(droppedPage);
            // No need to re-add to stapledPages as it was never removed
        }
    }
    courseworkGame.draggedElement = null; // Reset dragged element
  }

  function randomizePagePositionsForOneCoursework(pageElement) {
    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer) return;
    const containerRect = pagesContainer.getBoundingClientRect();
    const pageRect = pageElement.getBoundingClientRect();
    const padding = 20;

    const maxX_px = Math.max(0, containerRect.width - pageRect.width - padding * 2);
    const maxY_px = Math.max(0, containerRect.height - pageRect.height - padding * 2);

    const randomX_px = Math.random() * maxX_px + padding;
    const randomY_px = Math.random() * maxY_px + padding;

    pageElement.style.left = `${(randomX_px / containerRect.width) * 100}%`;
    pageElement.style.top = `${(randomY_px / containerRect.height) * 100}%`;
    pageElement.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
  }

  function checkStaplerReadyCoursework() {
    const staplerButton = document.getElementById('stapler-button');
    if (!staplerButton) return;
    if (courseworkGame.stapledPages.length > 0 && !courseworkGame.staplerJammed) {
        staplerButton.disabled = false;
    } else {
        staplerButton.disabled = true;
    }
  }

  function performStaplingCoursework() {
    const staplingPanel = document.getElementById('stapling-panel');
    const pagesContainer = document.getElementById('pages-container');
    if (!staplingPanel || !pagesContainer) return;

    // Get current order from the DOM elements in the stapling panel
    const currentStapledElements = Array.from(staplingPanel.querySelectorAll('.coursework-stapled-page'));
    courseworkGame.currentPageOrder = currentStapledElements.map(el => ({
        id: el.dataset.id,
        order: parseInt(el.dataset.order)
    }));

    if (courseworkGame.currentPageOrder.length !== courseworkGame.pagesData.length) {
        showFeedback('Не все страницы собраны!', 'info');
        return;
    }

    // Sort the stapled pages by their original order to check correctness
    const sortedStapledPages = [...courseworkGame.currentPageOrder].sort((a, b) => a.order - b.order);
    const isCorrectOrder = sortedStapledPages.every((page, index) => page.order === index);


    if (isCorrectOrder) {
        endGameCoursework(true);
    } else {
        showFeedback('Неправильный порядок! Попробуйте снова.', 'error');
        // Move all pages back to the pages container and re-randomize
        currentStapledElements.forEach(pageElement => {
            pagesContainer.appendChild(pageElement);
            pageElement.classList.remove('coursework-stapled-page');
            pageElement.classList.add('coursework-page');
            randomizePagePositionsForOneCoursework(pageElement);
        });
        // Clear the stapledPages array and add the placeholder back
        courseworkGame.stapledPages = [];
        courseworkGame.currentPageOrder = [];
        staplingPanel.innerHTML = '<p class="text-gray-500">Перетащите страницы сюда в правильном порядке</p>';
        updateStapledCountCoursework();
        checkStaplerReadyCoursework();
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
        case 0:
            activateWindCoursework();
            break;
        case 1:
            activateStaplerJamCoursework();
            break;
        case 2:
            activateProfessorCallCoursework();
            break;
    }
    courseworkGame.nextInterferenceTimeoutId = setTimeout(triggerInterferenceCoursework, Math.random() * 20000 + 10000);
  }

  function activateWindCoursework() {
    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer || courseworkGame.windActive) return;
    courseworkGame.windActive = true;
    pagesContainer.classList.add('wind-active');
    const pages = Array.from(pagesContainer.children);
    pages.sort(() => Math.random() - 0.5); // Shuffle existing pages
    pages.forEach(page => pagesContainer.appendChild(page)); // Re-append in new order
    requestAnimationFrame(() => {
        randomizePagePositionsCoursework(); // Randomize positions again
    });

    showFeedback('Ветер! Страницы перемешались!', 'info');
    setTimeout(() => {
        pagesContainer.classList.remove('wind-active');
        courseworkGame.windActive = false;
    }, 3000);
  }

  function activateStaplerJamCoursework() {
    const staplerJammedMessage = document.getElementById('stapler-jammed-message');
    const staplerClicksNeededDisplay = document.getElementById('stapler-clicks-needed');
    const staplerButton = document.getElementById('stapler-button');
    if (!staplerJammedMessage || !staplerClicksNeededDisplay || !staplerButton || courseworkGame.staplerJammed) return;

    courseworkGame.staplerJammed = true;
    courseworkGame.staplerClicksRemaining = Math.floor(Math.random() * 3) + 2;
    staplerJammedMessage.classList.remove('hidden');
    staplerClicksNeededDisplay.textContent = courseworkGame.staplerClicksRemaining;
    staplerButton.disabled = true;
    staplerButton.textContent = 'Заел!';
    showFeedback('Степлер заело!', 'error');
  }

  function activateProfessorCallCoursework() {
    const professorPopupOverlay = document.getElementById('professor-popup-overlay');
    const professorQuestion = document.getElementById('professor-question');
    const pagesContainer = document.getElementById('pages-container');
    if (!professorPopupOverlay || !professorQuestion || !pagesContainer || courseworkGame.professorCallActive) return;

    courseworkGame.professorCallActive = true;
    courseworkGame.gameStarted = false; // Pause game timer and interactions

    const availablePages = courseworkGame.pagesData.filter(page => !courseworkGame.stapledPages.some(sp => sp.id === page.id));
    if (availablePages.length === 0) {
        // All pages are stapled, no question to ask
        courseworkGame.professorCallActive = false;
        courseworkGame.gameStarted = true;
        return;
    }

    const randomPage = availablePages[Math.floor(Math.random() * availablePages.length)];
    courseworkGame.correctProfessorPageId = randomPage.id;
    professorQuestion.textContent = `Где "${randomPage.name}"?!`;
    professorPopupOverlay.classList.add('active');

    // Add click listeners to all pages in the container
    pagesContainer.querySelectorAll('.coursework-page').forEach(pageElement => {
        // Use { once: true } to ensure the listener is removed after one click
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
    // Ensure all listeners are removed regardless of correctness
    removeAllProfessorClickListenersCoursework();
  }

  function removeAllProfessorClickListenersCoursework() {
    const pagesContainer = document.getElementById('pages-container');
    if (pagesContainer) {
        // Remove event listeners that were added with { once: true }
        // This loop is primarily for safety/redundancy if { once: true } somehow fails
        pagesContainer.querySelectorAll('.coursework-page').forEach(pageElement => {
            pageElement.removeEventListener('click', handleProfessorPageClickCoursework);
        });
    }
  }

  function resolveProfessorCallCoursework(isCorrect) {
    const professorPopupOverlay = document.getElementById('professor-popup-overlay');
    if (professorPopupOverlay) professorPopupOverlay.classList.remove('active');
    courseworkGame.professorCallActive = false;
    courseworkGame.gameStarted = true; // Resume game timer and interactions

    if (!isCorrect) {
        courseworkGame.timeLeft = Math.max(0, courseworkGame.timeLeft - 15); // Penalty for incorrect answer
        document.getElementById('timer').textContent = formatTimeCoursework(courseworkGame.timeLeft);
    }
    courseworkGame.correctProfessorPageId = null; // Reset correct page ID
  }

  function endGameCoursework(win) {
    courseworkGame.gameStarted = false;
    clearInterval(courseworkGame.timerInterval);
    clearTimeout(courseworkGame.nextInterferenceTimeoutId);
    const staplerButton = document.getElementById('stapler-button');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const gameEndScreen = document.getElementById('game-end-screen');
    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');

    if (staplerButton) staplerButton.disabled = true;
    if (startButton) startButton.style.display = 'none';
    if (restartButton) restartButton.style.display = 'block';

    if (gameEndScreen) gameEndScreen.classList.add('active');
    if (win) {
        if (endTitle) {
            endTitle.textContent = 'Победа!';
            endTitle.classList.remove('text-red-600');
            endTitle.classList.add('text-green-600');
        }

        let bonusMessage = '';
        const timeTaken = 150 - courseworkGame.timeLeft;
        if (timeTaken < 60) {
            bonusMessage = 'Успел до дедлайна!';
        } else if (timeTaken < 90) {
            bonusMessage = 'Отличник подшивки!';
        } else {
            bonusMessage = 'Подшивка от души!';
        }
        if (endMessage) {
            endMessage.textContent = `Курсовая подшита! ${bonusMessage}`;
            endMessage.classList.remove('text-red-500');
            endMessage.classList.add('text-green-700');
        }
        // Call the main game's complete function
        completeRoom246Game();
    } else {
        // If the game ends without winning (e.g., time runs out), it will now simply reset.
        if (endTitle) {
            endTitle.textContent = 'Поражение!';
            endTitle.classList.remove('text-green-600');
            endTitle.classList.add('text-red-600');
        }
        if (endMessage) {
            endMessage.textContent = 'К сожалению, вы не успели сделать подшивку вовремя. Попробуйте еще раз.';
            endMessage.classList.remove('text-green-700');
            endMessage.classList.add('text-red-500');
        }
        // Automatically restart the minigame if the player loses
        setTimeout(() => {
            initCourseworkGame(); // Re-initialize the minigame
            gameEndScreen.classList.remove('active'); // Hide the end screen
        }, 3000); // Give player time to read the message
    }
    cleanupCourseworkGame(); // Clean up listeners and intervals
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
    const room246Feedback = document.getElementById('room246Feedback'); // Get feedback element
    const dialogBox = document.getElementById('dialog-box'); // Get dialog box

    if (!endingScreen) return;

    // Hide all game elements
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
    // Clean up any active minigame listeners/intervals
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
