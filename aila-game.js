// Расширенное состояние игры
const gameState = {
  chapter: "prologue",
  health: 8,
  maxHealth: 12,
  energy: 5,
  maxEnergy: 10,
  coins: 3,
  food: 2,
  knowledge: 0,
  strength: 2,
  storyFlags: {},
  inventory: [],
  companions: [],
  enemies: [],
  cards: {
    hand: [],
    active: [],
    deck: [
      {id: "hide", name: "Укрытие", type: "action", effect: "Позволяет спрятаться от опасности"},
      {id: "leo", name: "Лео", type: "companion", effect: "Дает +1 к броскам кубика"},
      {id: "food", name: "Припасы", type: "resource", effect: "+2 еды при использовании"},
      {id: "map", name: "Карта леса", type: "special", effect: "Позволяет избежать загадок"},
      {id: "key", name: "Хрустальный ключ", type: "special", effect: "Открывает башню"},
      {id: "sword", name: "Деревянный меч", type: "weapon", effect: "+1 к силе в бою"},
      {id: "shield", name: "Лист-щит", type: "armor", effect: "+1 к защите"}
    ],
    discard: []
  },
  currentEnemy: null,
  mineProgress: 0,
  spiderHealth: 5,
  riddlesSolved: 0,
  towerChallengePassed: false
};

// Враги для разных глав
const enemies = {
  forest: [
    {name: "Серый волк", health: 3, strength: 1, reward: "food"},
    {name: "Хищные растения", health: 2, strength: 1, reward: "knowledge"},
    {name: "Болотный дух", health: 4, strength: 2, reward: "coins"}
  ],
  factory: [
    {name: "Охранник фабрики", health: 4, strength: 2, reward: "coins"},
    {name: "Механический паук", health: 5, strength: 3, reward: "key_part"},
    {name: "Автоматический защитник", health: 6, strength: 4, reward: "energy"}
  ],
  mine: [
    {name: "Гигантский паук", health: 6, strength: 4, reward: "silk"},
    {name: "Каменный голем", health: 7, strength: 5, reward: "ore"},
    {name: "Темный дух шахты", health: 8, strength: 6, reward: "strength"}
  ],
  tower: [
    {name: "Страж башни", health: 8, strength: 6, reward: "final_key"},
    {name: "Иллюзия страха", health: 9, strength: 7, reward: "knowledge"},
    {name: "Последний испытатель", health: 10, strength: 8, reward: "victory"}
  ]
};

// Инициализация игры
function initAilaGame() {
  const ailaGame = document.getElementById('ailaGame');
  if (!ailaGame) return;
  const currentChapter = gameState.chapter;
  
  ailaGame.innerHTML = `
    <img src="https://i.imgur.com/JtQJjJN.png" alt="Эйла" class="character-image">
    
    <div class="resources">
      <div class="resource" id="health">
        <span class="resource-icon">❤️</span>
        <span class="resource-value">${gameState.health}</span>/<span class="resource-max">${gameState.maxHealth}</span>
      </div>
      <div class="resource" id="energy">
        <span class="resource-icon">⚡</span>
        <span class="resource-value">${gameState.energy}</span>/<span class="resource-max">${gameState.maxEnergy}</span>
      </div>
      <div class="resource" id="coins">
        <span class="resource-icon">💰</span>
        <span class="resource-value">${gameState.coins}</span>
      </div>
      <div class="resource" id="food">
        <span class="resource-icon">🍞</span>
        <span class="resource-value">${gameState.food}</span>
      </div>
      <div class="resource" id="knowledge">
        <span class="resource-icon">📚</span>
        <span class="resource-value">${gameState.knowledge}</span>
      </div>
      <div class="resource" id="strength">
        <span class="resource-icon">⚔️</span>
        <span class="resource-value">${gameState.strength}</span>
      </div>
    </div>
    
    <div id="story-log"></div>
    
    <div id="card-inventory">
      <h3>Карты в руке:</h3>
      <div class="cards-container" id="hand-cards"></div>
      <h3>Активные карты:</h3>
      <div class="cards-container" id="active-cards"></div>
    </div>
    
    <div id="battle-screen" class="mini-game" style="display:none">
      <h3>Бой с <span id="enemy-name"></span></h3>
      <div class="battle-stats">
        <div>Эйла: ❤️ <span id="player-health">${gameState.health}</span>/${gameState.maxHealth} ⚔️ ${gameState.strength}</div>
        <div><span id="enemy-name2"></span>: ❤️ <span id="enemy-health"></span> ⚔️ <span id="enemy-strength"></span></div>
      </div>
      <div class="battle-choices">
        <button class="choice" onclick="battleChoice('attack')">Атаковать</button>
        <button class="choice" onclick="battleChoice('defend')">Защищаться</button>
        <button class="choice" onclick="battleChoice('flee')">Попытаться убежать</button>
      </div>
      <h4>Карты:</h4>
      <div class="battle-cards" id="battle-cards-container"></div>
      <div id="battle-log" class="hint"></div>
    </div>
    
    <div id="prologue" class="chapter active">
      <div class="card">
        <h3 class="card-title">Пролог: Начало пути</h3>
        <p class="card-text">Эйла стоит на краю своего разрушенного дома. Перед ней простирается пустынная земля, освещаемая лишь бледным светом луны. Вдали, за холмами, мерцает странный свет - тот самый Далёкий Свет, о котором ходят легенды. Что она сделает?</p>
        <div class="choices">
          <button class="choice" onclick="makeChoice('explore')">🔍 Исследовать руины</button>
          <button class="choice" onclick="makeChoice('light')">✨ Идти к свету</button>
        </div>
      </div>
    </div>
    
    <div id="chapter1" class="chapter"></div>
    <div id="chapter2" class="chapter"></div>
    <div id="chapter3" class="chapter"></div>
    <div id="chapter4" class="chapter"></div>
    <div id="chapter5" class="chapter"></div>
    <div id="chapter6" class="chapter"></div>
  `;

  if (currentChapter !== "prologue") {
    changeChapter(currentChapter);
    addToStory("🌌 Эйла продолжает свой путь к Далёкому Свету...", true);
  } else {
    addToStory("🌌 Эйла просыпается в разрушенном мире. Перед ней лежат руины её дома, а вдали мерцает таинственный Далёкий Свет...", true);
  }
  
  drawCard();
  drawCard();
  updateResources();
  renderCards();
}

// Основная функция выбора
function makeChoice(choice) {
  switch(gameState.chapter) {
    case "prologue":
      handlePrologueChoice(choice);
      break;
    case "chapter1":
      handleChapter1Choice(choice);
      break;
    case "chapter2":
      handleChapter2Choice(choice);
      break;
    case "chapter3":
      handleChapter3Choice(choice);
      break;
    case "chapter4":
      handleChapter4Choice(choice);
      break;
    case "chapter5":
      handleChapter5Choice(choice);
      break;
    case "chapter6":
      handleChapter6Choice(choice);
      break;
  }
}

// Обработчики выбора для каждой главы
function handlePrologueChoice(choice) {
  const prologue = document.getElementById('prologue');
  
  switch(choice) {
    case "explore":
      addToStory("Эйла решает осмотреть руины своего дома. Среди обломков она находит несколько полезных вещей.", true);
      gameState.coins += 1;
      gameState.food += 1;
      gameState.inventory.push("Фляга с водой");
      updateResources();
      
      prologue.innerHTML = `
        <div class="card">
          <h3 class="card-title">Пролог: Находки в руинах</h3>
          <p class="card-text">Среди обломков Эйла находит флягу с водой, немного еды и монет. Теперь она готова отправиться к Далёкому Свету.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('light')">✨ Идти к Далёкому Свету</button>
          </div>
        </div>
      `;
      break;
      
    case "light":
      addToStory("Эйла решает отправиться к Далёкому Свету. Путь лежит через тёмный лес...", true);
      changeChapter("chapter1");
      break;
  }
}

function handleChapter1Choice(choice) {
  const chapter1 = document.getElementById('chapter1');
  
  switch(choice) {
    case "enter_forest":
      addToStory("Эйла входит в тёмный лес. Воздух наполнен странными звуками и шепотами.", true);
      startBattle("forest", "chapter1");
      break;
      
    case "avoid_forest":
      if (gameState.inventory.includes("Карта леса")) {
        addToStory("Используя карту леса, Эйла обходит опасные места и находит безопасный путь.", true);
        changeChapter("chapter2");
      } else {
        addToStory("Эйла пытается обойти лес, но без карты она теряется и всё равно попадает в опасную зону.", true);
        startBattle("forest", "chapter1");
      }
      break;
      
    case "rest":
      addToStory("Эйла решает отдохнуть перед входом в лес. Она восстанавливает силы.", true);
      gameState.health = Math.min(gameState.health + 2, gameState.maxHealth);
      gameState.energy = gameState.maxEnergy;
      updateResources();
      
      chapter1.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 1: Тёмный лес</h3>
          <p class="card-text">Отдохнув, Эйла чувствует себя лучше. Теперь она готова войти в лес.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('enter_forest')">🌲 Войти в лес</button>
            <button class="choice" onclick="makeChoice('avoid_forest')">🗺️ Попытаться обойти лес</button>
          </div>
        </div>
      `;
      break;
  }
}

function handleChapter2Choice(choice) {
  const chapter2 = document.getElementById('chapter2');
  
  switch(choice) {
    case "explore_factory":
      addToStory("Эйла исследует заброшенную фабрику. Внутри слышны странные механические звуки.", true);
      startBattle("factory", "chapter2");
      break;
      
    case "search_supplies":
      addToStory("Эйла ищет припасы вокруг фабрики. Она находит немного еды и деталь механизма.", true);
      gameState.food += 2;
      gameState.inventory.push("Деталь механизма");
      updateResources();
      
      chapter2.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 2: Заброшенная фабрика</h3>
          <p class="card-text">Найдя припасы, Эйла может продолжить путь или исследовать фабрику.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('explore_factory')">🏭 Исследовать фабрику</button>
            <button class="choice" onclick="makeChoice('continue_journey')">🚶‍♀️ Продолжить путь</button>
          </div>
        </div>
      `;
      break;
      
    case "continue_journey":
      addToStory("Эйла решает не рисковать и продолжает путь, оставляя фабрику позади.", true);
      changeChapter("chapter3");
      break;
  }
}

function handleChapter3Choice(choice) {
  const chapter3 = document.getElementById('chapter3');
  
  switch(choice) {
    case "enter_mine":
      addToStory("Эйла входит в старую шахту. Темнота сгущается, и слышны странные звуки.", true);
      startBattle("mine", "chapter3");
      break;
      
    case "solve_riddle":
      showRiddleModal();
      break;
  }
}

function showRiddleModal() {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';
  
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#333';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '10px';
  modalContent.style.border = '2px solid #ffcc33';
  modalContent.style.boxShadow = '0 0 20px #ffcc33';
  modalContent.style.textAlign = 'center';
  modalContent.style.width = '80%';
  modalContent.style.maxWidth = '500px';
  
  const riddleText = document.createElement('p');
  riddleText.textContent = "Что можно сломать, даже не касаясь этого?";
  riddleText.style.fontSize = '1.2rem';
  riddleText.style.marginBottom = '20px';
  riddleText.style.color = '#ffcc33';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.style.padding = '12px';
  input.style.fontSize = '1rem';
  input.style.marginBottom = '20px';
  input.style.width = '90%';
  input.style.borderRadius = '6px';
  input.style.border = '2px solid #ffcc33';
  input.style.background = '#222';
  input.style.color = '#fff';
  input.style.textAlign = 'center';
  
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Ответить';
  submitBtn.className = 'btn';
  submitBtn.style.marginTop = '10px';
  submitBtn.onclick = () => {
    const answer = input.value.toLowerCase().trim();
    if (answer === "молчание") {
      modal.remove();
      addToStory("Эйла правильно отвечает на загадку! Дверь открывается, и она может пройти дальше без боя.", true);
      gameState.riddlesSolved++;
      changeChapter("chapter4");
    } else {
      modal.remove();
      addToStory("Эйла отвечает неправильно. Из темноты появляется враг!", true);
      startBattle("mine", "chapter3");
    }
  };
  
  modalContent.appendChild(riddleText);
  modalContent.appendChild(input);
  modalContent.appendChild(submitBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  input.focus();
}

function handleChapter4Choice(choice) {
  const chapter4 = document.getElementById('chapter4');
  
  switch(choice) {
    case "enter_tower":
      if (gameState.inventory.includes("Хрустальный ключ")) {
        addToStory("Эйла использует хрустальный ключ, и дверь башни открывается с глухим скрежетом.", true);
        changeChapter("chapter5");
      } else {
        addToStory("Эйла подходит к загадочной башне. Дверь заперта, и у неё нет ключа.", true);
        
        chapter4.innerHTML = `
          <div class="card">
            <h3 class="card-title">Глава 4: Башня Света</h3>
            <p class="card-text">Башня заперта. Эйле нужно найти ключ или другой способ войти.</p>
            <div class="choices">
              <button class="choice" onclick="makeChoice('search_around')">🔍 Искать вокруг башни</button>
              <button class="choice" onclick="makeChoice('study_machines')">🔧 Изучить механизмы</button>
              <button class="choice" onclick="makeChoice('return')">↩️ Вернуться назад</button>
            </div>
          </div>
        `;
      }
      break;
      
    case "study_machines":
      addToStory("Эйла изучает механизмы вокруг башни. Она находит чертежи и понимает, как управлять светом. Это знание может пригодиться позже.", true);
      gameState.knowledge += 2;
      gameState.inventory.push("Чертежи механизма");
      updateResources();
      break;
      
    case "search_around":
      addToStory("Эйла ищет вокруг башни и находит хрустальный ключ, спрятанный под камнем!", true);
      gameState.inventory.push("Хрустальный ключ");
      updateResources();
      
      chapter4.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 4: Башня Света</h3>
          <p class="card-text">Эйла нашла ключ! Теперь она может войти в башню.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('enter_tower')">🚪 Войти в башню</button>
          </div>
        </div>
      `;
      break;
      
    case "return":
      addToStory("Эйла решает вернуться назад, чтобы поискать ключ в других местах.", true);
      changeChapter("chapter3");
      break;
  }
}

function handleChapter5Choice(choice) {
  const chapter5 = document.getElementById('chapter5');
  
  switch(choice) {
    case "climb_tower":
      addToStory("Эйла начинает подниматься по винтовой лестнице башни. С каждым этажом воздух становится всё более насыщенным энергией.", true);
      startBattle("tower", "chapter5");
      break;
      
    case "rest_tower":
      addToStory("Эйла решает отдохнуть перед последним подъёмом. Она восстанавливает силы.", true);
      gameState.health = Math.min(gameState.health + 3, gameState.maxHealth);
      gameState.energy = gameState.maxEnergy;
      updateResources();
      
      chapter5.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 5: Внутри башни</h3>
          <p class="card-text">Отдохнув, Эйла готова продолжить подъём на вершину башни.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('climb_tower')">⬆️ Подняться на вершину</button>
          </div>
        </div>
      `;
      break;
  }
}

function handleChapter6Choice(choice) {
  const chapter6 = document.getElementById('chapter6');
  
  switch(choice) {
    case "activate_light":
      addToStory("Эйла активирует механизм Далёкого Света. Яркий свет озаряет всё вокруг, и мир начинает меняться...", true);
      
      chapter6.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 6: Финал</h3>
          <p class="card-text">Далёкий Свет активирован. Мир вокруг начинает восстанавливаться. Эйла выполнила свою миссию!</p>
          <div class="choices">
            <button class="choice" onclick="initAilaGame()">🔄 Начать заново</button>
            <button class="choice" onclick="completeAilaGame()">🎁 Завершить игру</button>
          </div>
        </div>
      `;
      break;
  }
}

function completeAilaGame() {
  gamesCompleted.cards = true;
  showBoxAnimation(3);
}

function changeChapter(newChapter) {
  document.querySelector('.chapter.active')?.classList.remove('active');
  document.getElementById(newChapter).classList.add('active');
  gameState.chapter = newChapter;
  
  // Сохраняем прогресс в localStorage
  localStorage.setItem('ailaGameState', JSON.stringify(gameState));
  
  // Инициализация новой главы
  switch(newChapter) {
    case "chapter1":
      document.getElementById('chapter1').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 1: Тёмный лес</h3>
          <p class="card-text">Эйла подходит к опушке тёмного леса. Деревья шепчутся на ветру, а в глубине слышны странные звуки. Что она сделает?</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('enter_forest')">🌲 Войти в лес</button>
            <button class="choice" onclick="makeChoice('avoid_forest')">🗺️ Попытаться обойти лес</button>
            <button class="choice" onclick="makeChoice('rest')">🛌 Отдохнуть перед входом</button>
          </div>
        </div>
      `;
      break;
      
    case "chapter2":
      document.getElementById('chapter2').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 2: Заброшенная фабрика</h3>
          <p class="card-text">Пройдя через лес, Эйла выходит к огромной заброшенной фабрике. Из труб всё ещё идёт дым, хотя здание выглядит покинутым.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('explore_factory')">🏭 Исследовать фабрику</button>
            <button class="choice" onclick="makeChoice('search_supplies')">🔍 Искать припасы вокруг</button>
            <button class="choice" onclick="makeChoice('continue_journey')">🚶‍♀️ Продолжить путь</button>
          </div>
        </div>
      `;
      break;
      
    case "chapter3":
      document.getElementById('chapter3').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 3: Старая шахта</h3>
          <p class="card-text">Дорога приводит Эйлу к входу в старую шахту. Надпись на стене гласит: "Только достойный найдёт путь".</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('enter_mine')">⛏️ Войти в шахту</button>
            <button class="choice" onclick="makeChoice('solve_riddle')">❓ Ответить на загадку</button>
          </div>
        </div>
      `;
      break;
      
    case "chapter4":
      document.getElementById('chapter4').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 4: Башня Света</h3>
          <p class="card-text">После долгого пути Эйла наконец видит перед собой Башню Света - источник Далёкого Света. Башня окружена странными механизмами.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('enter_tower')">🚪 Попытаться войти</button>
            <button class="choice" onclick="makeChoice('study_machines')">🔧 Изучить механизмы</button>
          </div>
        </div>
      `;
      break;
      
    case "chapter5":
      document.getElementById('chapter5').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 5: Внутри башни</h3>
          <p class="card-text">Эйла входит в башню. Внутри она видит винтовую лестницу, ведущую наверх. Воздух наполнен статическим электричеством.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('climb_tower')">⬆️ Подняться наверх</button>
            <button class="choice" onclick="makeChoice('rest_tower')">🛌 Отдохнуть перед подъёмом</button>
          </div>
        </div>
      `;
      break;
      
    case "chapter6":
      document.getElementById('chapter6').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 6: Сердце Света</h3>
          <p class="card-text">Эйла достигает вершины башни. Перед ней огромный механизм, излучающий Далёкий Свет. Что она сделает?</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('activate_light')">✨ Активировать свет</button>
          </div>
        </div>
      `;
      break;
  }
}

// Новая функция для начала боя
function startBattle(enemyType, chapter) {
  const enemyList = enemies[enemyType];
  if (!enemyList || enemyList.length === 0) return;
  
  const enemy = {...enemyList[Math.floor(Math.random() * enemyList.length)]};
  gameState.currentEnemy = enemy;
  
  document.getElementById('enemy-name').textContent = enemy.name;
  document.getElementById('enemy-name2').textContent = enemy.name;
  document.getElementById('enemy-health').textContent = enemy.health;
  document.getElementById('enemy-strength').textContent = enemy.strength;
  document.getElementById('player-health').textContent = gameState.health;
  
  document.querySelector(`#${chapter}`).classList.remove('active');
  document.getElementById('battle-screen').style.display = 'block';
  addToStory(`⚔️ Эйла встретила ${enemy.name}! Начинается бой!`, true);
  
  // Обновляем карты для боя
  renderBattleCards();
}

function renderBattleCards() {
  const container = document.getElementById('battle-cards-container');
  container.innerHTML = '';
  
  if (gameState.cards.hand.length === 0) {
    container.innerHTML = '<p>У вас нет карт в руке</p>';
    return;
  }
  
  gameState.cards.hand.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'battle-card';
    cardEl.textContent = card.name;
    cardEl.title = card.effect;
    cardEl.onclick = () => useCard(index, true);
    container.appendChild(cardEl);
  });
}

// Функция выбора в бою
function battleChoice(choice) {
  const enemy = gameState.currentEnemy;
  let battleLog = document.getElementById('battle-log');
  battleLog.textContent = '';
  
  if (choice === 'attack') {
    // Игрок атакует
    const playerRoll = Math.floor(Math.random() * 6) + 1 + gameState.strength;
    enemy.health -= playerRoll;
    addToStory(`Эйла атакует и наносит ${playerRoll} урона!`, false);
    
    if (enemy.health <= 0) {
      battleLog.textContent = `Вы победили ${enemy.name}!`;
      endBattle(true);
      return;
    }
    
    // Враг атакует
    const enemyRoll = Math.floor(Math.random() * 6) + 1 + enemy.strength;
    gameState.health -= enemyRoll;
    addToStory(`${enemy.name} атакует в ответ и наносит ${enemyRoll} урона!`, false);
    
  } else if (choice === 'defend') {
    // Защита уменьшает урон
    const enemyRoll = Math.floor(Math.random() * 6) + 1 + enemy.strength - 2;
    if (enemyRoll > 0) {
      gameState.health -= enemyRoll;
      addToStory(`Вы защищаетесь и получаете ${enemyRoll} урона (вместо ${enemyRoll + 2})`, false);
    } else {
      addToStory("Вы полностью заблокировали атаку!", false);
    }
  } else if (choice === 'flee') {
    // Попытка убежать
    const fleeChance = Math.random();
    if (fleeChance > 0.5) {
      addToStory("Эйле удаётся убежать от врага!", true);
      endBattle(false);
      return;
    } else {
      addToStory("Эйле не удаётся убежать!", false);
    }
  }
  
  // Проверка здоровья игрока
  if (gameState.health <= 0) {
    battleLog.textContent = "Эйла погибла! Игра начнется заново.";
    setTimeout(() => {
      resetAilaGame();
    }, 3000);
    return;
  }
  // Обновление интерфейса
  document.getElementById('enemy-health').textContent = Math.max(0, enemy.health);
  document.getElementById('player-health').textContent = gameState.health;
  updateResources();
}

// Новая функция сброса игры
function resetAilaGame() {
  // Сброс состояния игры
  gameState.health = 8;
  gameState.energy = 5;
  gameState.coins = 3;
  gameState.food = 2;
  gameState.knowledge = 0;
  gameState.strength = 2;
  gameState.inventory = [];
  gameState.companions = [];
  gameState.cards = {
    hand: [],
    active: [],
    deck: [
      // ... начальные карты ...
    ],
    discard: []
  };
  gameState.chapter = "prologue";
  
  // Перезапуск игры
  initAilaGame();
  addToStory("Эйла начинает свой путь заново...", true);
}

function endBattle(victory) {
  if (victory) {
    const enemy = gameState.currentEnemy;
    addToStory(`🎉 Вы победили ${enemy.name} и получаете награду!`, true);
    
    // Награда за победу
    switch(enemy.reward) {
      case "food": 
        gameState.food += 2; 
        break;
      case "coins": 
        gameState.coins += 3; 
        break;
      case "knowledge": 
        gameState.knowledge += 1; 
        break;
      case "key_part": 
        gameState.inventory.push("Часть ключа");
        addToStory("Вы получили часть ключа от башни!", true);
        break;
      case "energy":
        gameState.energy = Math.min(gameState.energy + 3, gameState.maxEnergy);
        break;
      case "strength":
        gameState.strength += 1;
        addToStory("Вы чувствуете себя сильнее!", true);
        break;
      case "final_key":
        gameState.inventory.push("Финальный ключ");
        addToStory("Вы получили финальный ключ к механизму света!", true);
        break;
      case "victory":
        addToStory("Вы победили последнего врага! Путь к Далёкому Свету свободен!", true);
        break;
    }
    updateResources();
  } else {
    addToStory("Вы проиграли бой и теряете часть ресурсов...", true);
    gameState.food = Math.max(0, gameState.food - 1);
    gameState.coins = Math.max(0, gameState.coins - 1);
    updateResources();
  }
  
  document.getElementById('battle-screen').style.display = 'none';
  
  // Переходы между главами при победе
  if (victory) {
    if (gameState.chapter === "chapter1") {
      changeChapter("chapter2");
    } else if (gameState.chapter === "chapter2") {
      changeChapter("chapter3");
    } else if (gameState.chapter === "chapter3") {
      changeChapter("chapter4");
    } else if (gameState.chapter === "chapter4") {
      changeChapter("chapter5");
    } else if (gameState.chapter === "chapter5") {
      changeChapter("chapter6");
    } else {
      document.querySelector(`#${gameState.chapter}`).classList.add('active');
    }
  } else {
    document.querySelector(`#${gameState.chapter}`).classList.add('active');
  }
  
  gameState.currentEnemy = null;
}

function useCard(index, inBattle = false) {
  if (index >= gameState.cards.hand.length) return;
  
  const card = gameState.cards.hand[index];
  let message = `Использована карта: ${card.name}. `;
  
  switch(card.id) {
    case "hide":
      message += "Эйла прячется от опасности.";
      if (inBattle) {
        gameState.currentEnemy.health -= 1; // Маленький урон при использовании в бою
        message += " Враг получает 1 урон от неожиданности!";
      }
      break;
    case "leo":
      message += "Лео присоединяется к Эйле, давая +1 к броскам кубика.";
      gameState.companions.push("Лео");
      gameState.cards.active.push(card);
      break;
    case "food":
      message += "Эйла использует припасы, восстанавливая 2 единицы еды.";
      gameState.food += 2;
      break;
    case "map":
      message += "Карта леса помогает найти безопасный путь.";
      gameState.inventory.push("Карта леса");
      break;
    case "key":
      message += "Хрустальный ключ теперь в инвентаре Эйлы!";
      gameState.inventory.push("Хрустальный ключ");
      break;
    case "sword":
      message += "Деревянный меч увеличивает силу Эйлы на 1.";
      gameState.strength += 1;
      gameState.cards.active.push(card);
      break;
    case "shield":
      message += "Лист-щит увеличивает защиту Эйлы.";
      gameState.cards.active.push(card);
      break;
  }
  
  // Удаляем карту из руки и добавляем в сброс
  gameState.cards.hand.splice(index, 1);
  gameState.cards.discard.push(card);
  
  addToStory(message, true);
  renderCards();
  updateResources();
  
  // Если это было в бою, обновляем интерфейс
  if (inBattle) {
    document.getElementById('enemy-health').textContent = Math.max(0, gameState.currentEnemy.health);
    document.getElementById('player-health').textContent = gameState.health;
    renderBattleCards();
  }
}

function addToStory(text, isNewEntry = false) {
  const storyLogElement = document.getElementById('story-log');
  if (isNewEntry) {
    const entry = document.createElement('div');
    entry.className = 'story-entry';
    entry.textContent = text;
    storyLogElement.appendChild(entry);
  } else {
    const lastEntry = storyLogElement.lastChild;
    if (lastEntry) {
      lastEntry.textContent += ' ' + text;
    } else {
      addToStory(text, true);
    }
  }
  storyLogElement.scrollTop = storyLogElement.scrollHeight;
}

function updateResources() {
  ['health', 'energy', 'coins', 'food', 'knowledge', 'strength'].forEach(res => {
    const valueEl = document.querySelector(`#${res} .resource-value`);
    if (valueEl) valueEl.textContent = gameState[res];
    const maxEl = document.querySelector(`#${res} .resource-max`);
    if (maxEl && gameState[`max${res.charAt(0).toUpperCase() + res.slice(1)}`]) {
      maxEl.textContent = gameState[`max${res.charAt(0).toUpperCase() + res.slice(1)}`];
    }
  });
}

function drawCard() {
  if (gameState.cards.deck.length === 0) {
    if (gameState.cards.discard.length === 0) return false;
    // Перемешиваем сброс в колоду
    gameState.cards.deck = [...gameState.cards.discard];
    gameState.cards.discard = [];
    addToStory("Колода перетасована заново!", true);
  }

  const card = gameState.cards.deck.pop();
  gameState.cards.hand.push(card);
  renderCards();
  addToStory(`Получена карта: ${card.name} (${card.effect})`, true);
  return true;
}

function renderCards() {
  const handContainer = document.getElementById('hand-cards');
  const activeContainer = document.getElementById('active-cards');
  
  handContainer.innerHTML = '';
  activeContainer.innerHTML = '';
  
  gameState.cards.hand.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-item';
    cardEl.textContent = card.name;
    cardEl.title = card.effect;
    cardEl.onclick = () => useCard(index);
    handContainer.appendChild(cardEl);
  });
  
  gameState.cards.active.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-item';
    cardEl.textContent = card.name;
    cardEl.title = card.effect;
    activeContainer.appendChild(cardEl);
  });
}

// Загрузка сохраненного состояния
window.addEventListener('DOMContentLoaded', () => {
  const savedState = localStorage.getItem('ailaGameState');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      Object.assign(gameState, parsed);
    } catch (e) {
      console.log("Не удалось загрузить сохранение");
    }
  }
});