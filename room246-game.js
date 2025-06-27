// room246-game.js
const room246Game = (() => {
  // Данные игры, которые отсутствовали
  const room246Data = {
    states: {
      room: {
        image: 'room.jpg',
        description: 'Вы в комнате 246. Дверь заперта. На столе лежит ноутбук, под столом — системный блок. В углу видна вентиляционная решетка.',
        hotspots: [
          { x: '25%', y: '40%', width: '20%', height: '25%', action: 'changeState', target: 'desk' },
          { x: '65%', y: '60%', width: '15%', height: '20%', action: 'changeState', target: 'vent' }
        ]
      },
      desk: {
        image: 'desk.jpg',
        description: 'Стол с ноутбуком. На экране виден запрос пароля. Рядом лежит записка.',
        hotspots: [
          { x: '30%', y: '30%', width: '40%', height: '30%', action: 'startDialog', dialogId: 'laptopPassword' },
          { x: '75%', y: '55%', width: '15%', height: '10%', action: 'takeItem', itemId: 'note' },
          { x: '0%', y: '0%', width: '15%', height: '15%', action: 'changeState', target: 'room' } // Кнопка назад
        ]
      },
      vent: {
        image: 'vent.jpg',
        description: 'Вентиляционная решетка, прикрученная на четыре винта. Кажется, ее можно открыть, если найти подходящий инструмент.',
        hotspots: [
          { x: '0%', y: '0%', width: '15%', height: '15%', action: 'changeState', target: 'room' }, // Кнопка назад
          { x: '20%', y: '20%', width: '60%', height: '60%', action: 'startDialog', dialogId: 'ventLocked' }
        ]
      },
      vent_open: {
        image: 'vent_open.jpg',
        description: 'Вентиляция открыта! Внутри виден кейс с проектом.',
        hotspots: [
           { x: '0%', y: '0%', width: '15%', height: '15%', action: 'changeState', target: 'room' },
           { x: '30%', y: '30%', width: '40%', height: '40%', action: 'takeItem', itemId: 'project_case' }
        ]
      }
    },
    items: {
      note: { name: 'Записка', image: 'note.png', description: 'На записке написано: "Пароль — год основания БМЗ"' },
      screwdriver: { name: 'Отвертка', image: 'screwdriver.png', description: 'Простая крестовая отвертка. Идеальна для откручивания винтов.' },
      project_case: { name: 'Кейс с проектом', image: 'case.png', description: 'Главный приз! Секретный проект найден.' }
    },
    dialogs: {
      laptopPassword: {
        speaker: 'Ноутбук',
        lines: [
          { text: 'Введите пароль:', type: 'prompt', promptKey: 'password' }
        ]
      },
      ventLocked: {
        speaker: 'Система',
        lines: [
          { text: 'Решетка крепко прикручена. Нужен инструмент.' },
          { text: 'У вас есть отвертка?', type: 'choice', choices: [
              { text: 'Да, использовать', condition: 'inventory_screwdriver', nextNode: 'ventUnlock' },
              { text: 'Нет', nextNode: 'end' }
          ]}
        ]
      },
      ventUnlock: {
          speaker: 'Система',
          lines: [
            { text: 'Вы использовали отвертку и открыли решетку!', type: 'action', action: 'changeState', target: 'vent_open' }
          ]
      }
    },
    endings: {
      good: {
        title: 'Победа!',
        image: 'maingift.gif',
        text: 'Вы нашли кейс с секретным проектом и успешно выбрались из комнаты! Поздравляем!'
      },
      bad: {
        title: 'Время вышло!',
        image: 'fail.gif',
        text: 'К сожалению, вы не успели найти проект вовремя. Попробуйте еще раз.'
      }
    }
  };

  let gameState = {};

  function initRoom246Game() {
    const room246Screen = document.getElementById('room246Game');
    if (!room246Screen) return;
    
    // Сброс состояния игры
    gameState = {
      currentState: "room",
      inventory: ['screwdriver'], // Начинаем с отверткой для простоты
      flags: { ventOpen: false },
      startTime: Date.now(),
      timeLimit: 10 * 60 * 1000, // 10 минут
      timerId: null
    };
    
    room246Screen.innerHTML = `
      <div class="game-container" id="room246Container">
        <div id="game-screen" class="game-screen"></div>
        <div id="dialog-box" class="dialog-box" style="display:none;"></div>
        <div class="inventory-bar">
          <h3>Инвентарь:</h3>
          <div id="inventory-items" class="inventory-items"></div>
        </div>
        <div id="ending-screen" class="ending-screen" style="display:none;"></div>
        <div id="game-timer" class="game-timer"></div>
        <div id="room246Feedback" class="hint"></div>
      </div>
    `;
    
    renderState();
    startTimer();
  }

  function renderState() {
    const state = room246Data.states[gameState.currentState];
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) return;
    
    gameScreen.innerHTML = `
      <img src="${state.image}" alt="${state.description}" class="room-image">
      <p class="room-description">${state.description}</p>
    `;
    
    state.hotspots.forEach(spot => {
      const hotspot = document.createElement('div');
      hotspot.className = 'hotspot';
      hotspot.style.cssText = `left:${spot.x}; top:${spot.y}; width:${spot.width}; height:${spot.height};`;
      hotspot.title = spot.target || spot.itemId || 'Интерактивная зона';
      hotspot.addEventListener('click', () => handleAction(spot.action, spot));
      gameScreen.appendChild(hotspot);
    });
    
    renderInventory();
  }

  function handleAction(action, data) {
    switch(action) {
      case "changeState":
        gameState.currentState = data.target;
        renderState();
        break;
      case "takeItem":
        if (!gameState.inventory.includes(data.itemId)) {
          gameState.inventory.push(data.itemId);
          showFeedback(`Получен предмет: ${room246Data.items[data.itemId].name}`, "success");
          renderInventory();
          checkEnding();
        }
        break;
      case "startDialog":
        startDialog(data.dialogId);
        break;
    }
  }

  function renderInventory() {
    const itemsContainer = document.getElementById('inventory-items');
    if (!itemsContainer) return;
    
    itemsContainer.innerHTML = '';
    gameState.inventory.forEach(itemId => {
      const item = room246Data.items[itemId];
      if (!item) return;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'inventory-item';
      itemEl.innerHTML = `<img src="${item.image}" alt="${item.name}" title="${item.name}: ${item.description}">`;
      itemsContainer.appendChild(itemEl);
    });
  }
  
  function startDialog(dialogId, nodeId = 0) {
      const dialogBox = document.getElementById('dialog-box');
      const dialogData = room246Data.dialogs[dialogId];
      if (!dialogData || !dialogBox) return;

      dialogBox.style.display = 'block';
      const currentNode = dialogData.lines[nodeId];

      let choicesHTML = '';
      if (currentNode.type === 'choice') {
          currentNode.choices.forEach(choice => {
              // Проверка условия для отображения выбора
              const conditionMet = !choice.condition || (choice.condition === 'inventory_screwdriver' && gameState.inventory.includes('screwdriver'));
              if (conditionMet) {
                  choicesHTML += `<button class="dialog-choice" onclick="room246Game.progressDialog('${dialogId}', '${choice.nextNode}')">${choice.text}</button>`;
              }
          });
      } else if (currentNode.type === 'prompt') {
          choicesHTML = `
              <input type="text" id="dialog-prompt-input" class="quiz-input" placeholder="Введите ответ...">
              <button class="dialog-next" onclick="room246Game.checkPrompt('${dialogId}', '${currentNode.promptKey}')">Ответить</button>
          `;
      } else if (currentNode.nextNode) {
           choicesHTML = `<button class="dialog-next" onclick="room246Game.progressDialog('${dialogId}', '${currentNode.nextNode}')">Далее</button>`;
      } else {
          choicesHTML = `<button class="dialog-next" onclick="room246Game.closeDialog()">Закрыть</button>`;
      }
      
      dialogBox.innerHTML = `
          <div class="dialog-speaker">${dialogData.speaker}</div>
          <p class="dialog-text">${currentNode.text}</p>
          <div class="dialog-choices">${choicesHTML}</div>
      `;

      if (currentNode.type === 'action') {
          handleAction(currentNode.action, { target: currentNode.target });
          closeDialog();
      }
  }
  
    function progressDialog(dialogId, nextNode) {
        if (nextNode === 'end') {
            closeDialog();
            return;
        }
        const dialogData = room246Data.dialogs[dialogId];
        const nextNodeIndex = dialogData.lines.findIndex(line => line.id === nextNode || dialogData.lines.indexOf(line).toString() === nextNode); // find by custom id or index
        
        // Quick fix for named nodes logic.
        let targetNodeId = -1;
        if (nextNode === 'ventUnlock') {
            targetNodeId = findNodeByCustomId(dialogData.lines, 'ventUnlock');
        } else {
            targetNodeId = parseInt(nextNode, 10);
        }

        const node = dialogData.lines.find(l => l.id === nextNode);
        const nodeIndex = dialogData.lines.indexOf(node);

        if (nodeIndex !== -1) {
            startDialog(dialogId, nodeIndex);
        } else {
            closeDialog();
        }
    }


    function findNodeByCustomId(lines, id) {
        for(let i = 0; i < lines.length; i++) {
            // A bit of a hack: let's assume if a choice has a nextNode string, it refers to another line's 'id' property.
            if(lines[i].id === id) return i;
        }
        // Let's also check if any choice points to this id
        for(let i = 0; i < lines.length; i++) {
            if(lines[i].choices) {
                for(const choice of lines[i].choices) {
                    if(choice.nextNode === id) {
                         const nextLine = lines.find(l => l.id === id);
                         return lines.indexOf(nextLine);
                    }
                }
            }
        }
        return -1;
    }


  function checkPrompt(dialogId, promptKey) {
      const input = document.getElementById('dialog-prompt-input');
      if (!input) return;

      if (promptKey === 'password' && input.value === '1984') {
          showFeedback('Пароль верный! Вы получаете доступ к файлам и находите отвертку.', "success");
          gameState.inventory.push('screwdriver');
          renderInventory();
          closeDialog();
      } else {
          showFeedback('Пароль неверный.', "error");
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
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    timerElement.textContent = `Осталось: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (remaining <= 0) {
      showEnding("bad");
    }
  }

  function checkEnding() {
    if (gameState.inventory.includes("project_case")) {
      showEnding("good");
    }
  }

  function showEnding(endingId) {
    if (gameState.timerId) clearInterval(gameState.timerId);
    gameState.ending = true;

    const ending = room246Data.endings[endingId];
    const endingScreen = document.getElementById('ending-screen');
    const gameContainer = document.getElementById('room246Container');
    
    if (!endingScreen || !gameContainer) return;

    // Скрываем игровой интерфейс
    ['game-screen', 'dialog-box', 'inventory-bar', 'game-timer'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    endingScreen.style.display = 'block';
    endingScreen.innerHTML = `
      <h2>${ending.title}</h2>
      <img src="${ending.image}" alt="${ending.title}">
      <p>${ending.text}</p>
      ${endingId === "good" ? 
        `<button class="btn" onclick="room246Game.completeRoom246Game()">Завершить и открыть коробку</button>` : 
        `<button class="btn" onclick="room246Game.initRoom246Game()">Попробовать снова</button>`}
    `;
  }
  
  function showFeedback(message, type = "info") {
    const feedbackEl = document.getElementById('room246Feedback');
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.style.color = type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#ffcc33";
    setTimeout(() => {
        if (feedbackEl) feedbackEl.textContent = '';
    }, 3000);
  }

  function completeRoom246Game() {
    gamesCompleted.room246 = true;
    showBoxAnimation(4);
  }
  
  return {
    initRoom246Game,
    completeRoom246Game,
    progressDialog,
    checkPrompt,
    closeDialog
  };
})();