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
      {id: "leo", name: "Лёша", type: "companion", effect: "Дает +1 к броскам кубика"},
      {id: "food", name: "Припасы", type: "resource", effect: "+2 еды при использовании"},
      {id: "map", name: "Карта кладбища", type: "special", effect: "Позволяет избежать загадок"},
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
  towerChallengePassed: false,
  bmzWorked: false
};

const enemies = {
  forest: [
    {name: "Странные дети", health: 3, strength: 1, reward: "food", image: "strangekids.jpg"},
    {name: "Крапива", health: 2, strength: 1, reward: "knowledge", image: "nettle.png"},
    {name: "Бабки", health: 4, strength: 2, reward: "coins", image: "grannies.jpg"}
  ],
  factory: [
    {name: "Охранник", health: 4, strength: 2, reward: "coins", image: "guard.jpg"},
    {name: "Директор", health: 5, strength: 3, reward: "key_part", image: "director.jpg"},
    {name: "Сумасшедший станок", health: 6, strength: 4, reward: "energy", image: "crazymachine.jpg"}
  ],
  mine: [
    {name: "Гопник", health: 6, strength: 4, reward: "silk", image: "gopnik.jpg"},
    {name: "Мутный тип", health: 7, strength: 5, reward: "ore", image: "mutnitip.jpg"},
    {name: "Чувак, который держит в страхе весь район", health: 8, strength: 6, reward: "strength", image: "https://via.placeholder.com/150?text=Чувак"}
  ],
  tower: [
    {name: "Страж башни", health: 8, strength: 6, reward: "final_key", image: "https://via.placeholder.com/150?text=Страж+башни"},
    {name: "Иллюзия страха", health: 9, strength: 7, reward: "knowledge", image: "https://via.placeholder.com/150?text=Иллюзия+страха"},
    {name: "Последний испытатель", health: 10, strength: 8, reward: "victory", image: "https://via.placeholder.com/150?text=Испытатель"}
  ]
};

// Инициализация игры
function initAilaGame() {
  const cardsScreen = document.getElementById('cards');
  if (!cardsScreen) return;
  
  cardsScreen.innerHTML = `
    <h2>Мини-игра 3: Эйла и Далёкий Свет</h2>
    <div id="ailaGame">
      <div class="game-header">
        <img src="tonyarabbit.png" alt="Тоня" class="character-image">
        
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
      </div>
      
      <div id="inventory-container">
        <h3>Инвентарь:</h3>
        <div class="inventory-items" id="inventory-items"></div>
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
        <div class="enemy-image-container">
          <img id="enemy-image" src="" alt="Изображение врага">
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
          <img src="sanat.jpg" alt="Берег Днепра" class="chapter-image">
          <p class="card-text">Ты стоишь на берегу Днепра. Перед тобой простирается пустынная земля, освещаемая лишь бледным светом луны. Вдали, за холмами, мерцает странный свет - тот самый Далёкий Свет, о котором ходят легенды. Что ты сделаешь?</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('explore')">🔍 Порыскать по кустам</button>
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
    </div>
  `;

  resetAilaGame();
  addToStory("🌌 Ты просыпаешься. Перед тобой - берег Днепра, а вдали мерцает таинственный Далёкий Свет...", true);
  
  // Инициализация карт
  drawCard();
  drawCard();
  updateResources();
  renderCards();
  renderInventory();
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
      addToStory("Ты решаешь осмотреть ближайшие кусты. Среди веток и листьев ты находишь несколько полезных вещей.", true);
      gameState.coins += 1;
      gameState.food += 1;
      gameState.inventory.push("Фляга с водой");
      updateResources();
      renderInventory();
      
      prologue.innerHTML = `
        <div class="card">
          <h3 class="card-title">Пролог: Находки в кустах</h3>
          <img src="sanat.jpg" alt="Кусты" class="chapter-image">
          <p class="card-text">Среди кустов ты находишь флягу с водой, немного еды и монет. Теперь ты готова отправиться к Далёкому Свету.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('light')">✨ Идти к Далёкому Свету</button>
          </div>
        </div>
      `;
      break;
      
    case "light":
      addToStory("Ты решаешь отправиться к Далёкому Свету. Путь лежит через старое кладбище...", true);
      changeChapter("chapter1");
      break;
  }
}

function handleChapter1Choice(choice) {
  const chapter1 = document.getElementById('chapter1');
  
  switch(choice) {
    case "enter_forest":
      if (gameState.inventory.includes("Карта кладбища")) {
        addToStory("Используя карту кладбища, ты находишь безопасный путь через кладбище.", true);
        changeChapter("chapter2");
      } else {
        addToStory("Ты заходишь на старое кладбище. Воздух наполнен странными звуками и шепотами.", true);
        startBattle("forest", "chapter1");
      }
      break;
      
    case "avoid_forest":
      if (gameState.inventory.includes("Карта кладбища")) {
        addToStory("Используя карту кладбища, ты обходишь опасные места и находишь безопасный путь.", true);
        changeChapter("chapter2");
      } else {
        addToStory("Ты пытаешься обойти кладбище, но без карты ты теряешься и всё равно попадаешь в опасную зону.", true);
        startBattle("forest", "chapter1");
      }
      break;
      
    case "rest":
      addToStory("Ты решаешь отдохнуть перед входом на кладбище. Ты восстанавливаешь силы.", true);
      gameState.health = Math.min(gameState.health + 2, gameState.maxHealth);
      gameState.energy = gameState.maxEnergy;
      updateResources();
      
      chapter1.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 1: Старое кладбище</h3>
          <img src="cemetery.jpg" alt="Старое кладбище" class="chapter-image">
          <p class="card-text">Отдохнув, ты чувствуешь себя лучше. Теперь ты готова пойти на старое кладбище.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('enter_forest')">☦︎ Пойти на старое кладбище</button>
            <button class="choice" onclick="makeChoice('avoid_forest')">🗺️ Попытаться обойти кладбище</button>
          </div>
        </div>
      `;
      break;
      
    case "use_map":
      if (gameState.inventory.includes("Карта кладбища")) {
        addToStory("Ты используешь карту кладбища и находишь безопасный путь.", true);
        changeChapter("chapter2");
      }
      break;
  }
}

function handleChapter2Choice(choice) {
  const chapter2 = document.getElementById('chapter2');
  
  switch(choice) {
    case "explore_factory":
      if (gameState.inventory.includes("Пропуск на склад")) {
        addToStory("Ты показываешь пропуск охраннику и беспрепятственно проходишь на завод.", true);
        addToStory("На складе ты находишь механический ключ, который может пригодиться позже.", true);
        gameState.inventory.push("Механический ключ");
        renderInventory();
        changeChapter("chapter3");
      } else {
        addToStory("Ты исследуешь БМЗ. Внутри слышны странные механические звуки.", true);
        startBattle("factory", "chapter2");
      }
      break;
      
    case "search_supplies":
      addToStory("Ты ищешь припасы вокруг завода. Ты находишь немного еды и деталь станка.", true);
      gameState.food += 2;
      gameState.inventory.push("Деталь станка");
      updateResources();
      renderInventory();
      
      chapter2.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 2: БМЗ</h3>
          <img src="bmz.jpg" alt="БМЗ" class="chapter-image">
          <p class="card-text">Найдя припасы, ты можешь продолжить путь или исследовать завод.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('explore_factory')">🏭 Исследовать БМЗ</button>
            <button class="choice" onclick="makeChoice('continue_journey')">🚶‍♀️ Продолжить путь</button>
            <button class="choice" onclick="makeChoice('work_marketing')">💼 Работать маркетологом</button>
          </div>
        </div>
      `;
      break;
      
    case "work_marketing":
      if (!gameState.bmzWorked) {
        addToStory("Ты устраиваешься маркетологом на БМЗ. За день работы ты получаешь 5 монет и восстанавливаешь энергию.", true);
        gameState.coins += 5;
        gameState.energy = gameState.maxEnergy;
        gameState.bmzWorked = true;
        updateResources();
        
        // Добавляем возможность получить карту после работы
        if (Math.random() > 0.5) {
          addToStory("За хорошую работу тебе вручают пропуск на склад!", true);
          gameState.inventory.push("Пропуск на склад");
          renderInventory();
        }
      } else {
        addToStory("Ты уже работала сегодня. Лучше отдохнуть или заняться другими делами.", true);
      }
      
      chapter2.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 2: БМЗ</h3>
          <img src="bmz.jpg" alt="БМЗ" class="chapter-image">
          <p class="card-text">После работы на заводе ты можешь продолжить путь или исследовать завод.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('explore_factory')">🏭 Исследовать БМЗ</button>
            <button class="choice" onclick="makeChoice('continue_journey')">🚶‍♀️ Продолжить путь</button>
            <button class="choice" onclick="makeChoice('rest_factory')">🛌 Отдохнуть</button>
          </div>
        </div>
      `;
      break;
      
    case "rest_factory":
      addToStory("Ты находишь тихое место и отдыхаешь. Здоровье и энергия восстановлены.", true);
      gameState.health = Math.min(gameState.health + 3, gameState.maxHealth);
      gameState.energy = gameState.maxEnergy;
      updateResources();
      
      chapter2.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 2: БМЗ</h3>
          <img src="bmz.jpg" alt="БМЗ" class="chapter-image">
          <p class="card-text">Отдохнув, ты готова продолжить путь или исследовать завод.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('explore_factory')">🏭 Исследовать БМЗ</button>
            <button class="choice" onclick="makeChoice('continue_journey')">🚶‍♀️ Продолжить путь</button>
          </div>
        </div>
      `;
      break;
      
    case "continue_journey":
      addToStory("Ты решаешь не рисковать и продолжаешь путь, оставляя завод позади.", true);
      changeChapter("chapter3");
      break;
  }
}

function handleChapter3Choice(choice) {
  const chapter3 = document.getElementById('chapter3');
  
  switch(choice) {
    case "enter_mine":
      if (gameState.inventory.includes("Карта лабиринта")) {
        addToStory("Используя карту лабиринта, ты легко находишь выход из Евроопта.", true);
        changeChapter("chapter4");
      } else {
        addToStory("Ты приходишь к Евроопту. Темнота сгущается, и слышны странные звуки.", true);
        startBattle("mine", "chapter3");
      }
      break;
      
    case "solve_riddle":
      showRiddleModal();
      break;
      
    case "buy_map":
      if (gameState.coins >= 3) {
        addToStory("Ты покупаешь карту лабиринта у странного торговца.", true);
        gameState.coins -= 3;
        gameState.inventory.push("Карта лабиринта");
        updateResources();
        renderInventory();
        chapter3.innerHTML = `
          <div class="card">
            <h3 class="card-title">Глава 3: Евроопт</h3>
            <img src="evroopt.jpg" alt="Евроопт" class="chapter-image">
            <p class="card-text">Теперь у тебя есть карта лабиринта. Что ты будешь делать?</p>
            <div class="choices">
              <button class="choice" onclick="makeChoice('enter_mine')">⛏️ Войти в Евроопт</button>
            </div>
          </div>
        `;
      } else {
        addToStory("У тебя недостаточно монет для покупки карты!", true);
      }
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
    if (answer === "молчание" || answer === "тишина") {
      modal.remove();
      addToStory("Ты правильно отвечаешь на загадку! Дверь открывается, и ты можешь пройти дальше без боя.", true);
      gameState.riddlesSolved++;
      changeChapter("chapter4");
    } else {
      modal.remove();
      addToStory("Ты отвечаешь неправильно. Из темноты появляется враг!", true);
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
      if (gameState.inventory.includes("Хрустальный ключ") || gameState.inventory.includes("Механический ключ")) {
        addToStory("Ты используешь ключ, и дверь башни открывается с глухим скрежетом.", true);
        changeChapter("chapter5");
      } else {
        addToStory("Ты подходишь к загадочной башне. Дверь заперта, и у неё нет ключа.", true);
        
        chapter4.innerHTML = `
          <div class="card">
            <h3 class="card-title">Глава 4: Башня Света</h3>
            <img src="https://via.placeholder.com/300x150?text=Башня+Светa" alt="Башня Света" class="chapter-image">
            <p class="card-text">Башня заперта. Тебе нужно найти ключ или другой способ войти.</p>
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
      if (gameState.inventory.includes("Деталь станка")) {
        addToStory("Ты используешь деталь станка, чтобы починить механизм башни. Дверь открывается!", true);
        changeChapter("chapter5");
      } else {
        addToStory("Ты изучаешь механизмы вокруг башни. Кажется, не хватает какой-то детали...", true);
      }
      break;
      
    case "search_around":
      const foundKey = Math.random() > 0.5;
      if (foundKey) {
        addToStory("Ты ищешь вокруг башни и находишь хрустальный ключ, спрятанный под камнем!", true);
        gameState.inventory.push("Хрустальный ключ");
        renderInventory();
        
        chapter4.innerHTML = `
          <div class="card">
            <h3 class="card-title">Глава 4: Башня Света</h3>
            <img src="https://via.placeholder.com/300x150?text=Башня+Света" alt="Башня Света" class="chapter-image">
            <p class="card-text">Ты нашла ключ! Теперь ты может войти в башню.</p>
            <div class="choices">
              <button class="choice" onclick="makeChoice('enter_tower')">🚪 Войти в башню</button>
            </div>
          </div>
        `;
      } else {
        addToStory("Ты обыскиваешь территорию вокруг башни, но ничего полезного не находишь.", true);
      }
      break;
      
    case "return":
      addToStory("Ты решаешь вернуться назад, чтобы поискать ключ в других местах.", true);
      changeChapter("chapter3");
      break;
  }
}

function handleChapter5Choice(choice) {
  const chapter5 = document.getElementById('chapter5');
  
  switch(choice) {
    case "climb_tower":
      // Использование фляги с водой для восстановления здоровья
      if (gameState.inventory.includes("Фляга с водой")) {
        addToStory("Ты пьешь воду из фляги и чувствуешь прилив сил перед подъемом.", true);
        gameState.health = Math.min(gameState.health + 3, gameState.maxHealth);
        gameState.inventory = gameState.inventory.filter(item => item !== "Фляга с водой");
        updateResources();
        renderInventory();
      }
      addToStory("Ты начинаешь подниматься по винтовой лестнице башни. С каждым этажом воздух становится всё более насыщенным энергией.", true);
      startBattle("tower", "chapter5");
      break;
      
    case "rest_tower":
      addToStory("Ты решаешь отдохнуть перед последним подъёмом. Она восстанавливает силы.", true);
      gameState.health = Math.min(gameState.health + 3, gameState.maxHealth);
      gameState.energy = gameState.maxEnergy;
      updateResources();
      
      chapter5.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 5: Внутри башни</h3>
          <img src="https://via.placeholder.com/300x150?text=Внутри+башни" alt="Внутри башни" class="chapter-image">
          <p class="card-text">Отдохнув, ты готова продолжить подъём на вершину башни.</p>
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
      if (gameState.inventory.includes("Финальный ключ")) {
        addToStory("Ты вставляешь финальный ключ в механизм и активируешь Далёкий Свет!", true);
      } else {
        addToStory("Ты активируешь механизм Далёкого Света. Яркий свет озаряет всё вокруг!", true);
      }
      
      chapter6.innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 6: Финал</h3>
          <img src="https://via.placeholder.com/300x150?text=Далёкий+Свет" alt="Далёкий Свет" class="chapter-image">
          <p class="card-text">Далёкий Свет активирован. Мир вокруг начинает становиться светлым и радостным. Ты выполнила свою миссию!</p>
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
  
  // Автоматический переход к детективу через 3 секунды
  setTimeout(() => {
    if (navButtons && navButtons.detective) {
      navButtons.detective.click();
    }
  }, 3000);
}

function changeChapter(newChapter) {
  // Скрываем все главы
  document.querySelectorAll('.chapter').forEach(chapter => {
    chapter.classList.remove('active');
  });
  
  // Показываем новую главу
  const chapterElement = document.getElementById(newChapter);
  if (chapterElement) {
    chapterElement.classList.add('active');
  }
  
  gameState.chapter = newChapter;
  
  // Инициализация новой главы
  switch(newChapter) {
    case "chapter1":
      document.getElementById('chapter1').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 1: Старое кладбище</h3>
          <img src="cemetery.jpg" alt="Старое кладбище" class="chapter-image">
          <p class="card-text">Ты подходишь к одной из могил. Ветер тихонько завывает, а в глубине кладбища слышны странные звуки. Что ты сделаешь?</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('enter_forest')">☦︎ Пойти на кладбище</button>
            <button class="choice" onclick="makeChoice('avoid_forest')">🗺️ Попытаться обойти кладбище</button>
            <button class="choice" onclick="makeChoice('rest')">🛌 Отдохнуть перед входом</button>
            ${gameState.inventory.includes("Карта кладбища") ? 
              '<button class="choice" onclick="makeChoice(\'use_map\')">🗺️ Использовать карту</button>' : ''}
          </div>
        </div>
      `;
      break;
      
    case "chapter2":
      document.getElementById('chapter2').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 2: БМЗ</h3>
          <img src="bmz.jpg" alt="БМЗ" class="chapter-image">
          <p class="card-text">Пройдя старое кладбище, ты наконец приходишь к БМЗ.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('explore_factory')">🏭 Исследовать БМЗ</button>
            <button class="choice" onclick="makeChoice('search_supplies')">🔍 Искать припасы вокруг</button>
            <button class="choice" onclick="makeChoice('work_marketing')">💼 Работать маркетологом</button>
            <button class="choice" onclick="makeChoice('continue_journey')">🚶‍♀️ Продолжить путь</button>
          </div>
        </div>
      `;
      break;
      
    case "chapter3":
      document.getElementById('chapter3').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 3: Евроопт</h3>
          <img src="evroopt.jpg" alt="Евроопт" class="chapter-image">
          <p class="card-text">Дорога приводит тебя к входу в Евроопт. Надпись на стене гласит: 'Евроопт | Hyper'. Рядом стоит странный торговец.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('enter_mine')">⛏️ Войти в Евроопт</button>
            <button class="choice" onclick="makeChoice('solve_riddle')">❓ Ответить на загадку</button>
            <button class="choice" onclick="makeChoice('buy_map')">🗺️ Купить карту лабиринта (3 монеты)</button>
          </div>
        </div>
      `;
      break;
      
    case "chapter4":
      document.getElementById('chapter4').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 4: Башня Света</h3>
          <img src="https://via.placeholder.com/300x150?text=Башня+Света" alt="Башня Света" class="chapter-image">
          <p class="card-text">После долгого пути ты наконец видишь перед собой Башню Света - источник Далёкого Света. Башня окружена странными механизмами.</p>
          <div class="choices">
            <button class="choice" onclick="makeChoice('enter_tower')">🚪 Попытаться войти</button>
            <button class="choice" onclick="makeChoice('study_machines')">🔧 Изучить механизмы</button>
            ${gameState.inventory.includes("Деталь станка") ? 
              '<button class="choice" onclick="makeChoice(\'study_machines\')">🔩 Использовать деталь станка</button>' : ''}
          </div>
        </div>
      `;
      break;
      
    case "chapter5":
      document.getElementById('chapter5').innerHTML = `
        <div class="card">
          <h3 class="card-title">Глава 5: Внутри башни</h3>
          <img src="https://via.placeholder.com/300x150?text=Внутри+башни" alt="Внутри башни" class="chapter-image">
          <p class="card-text">Ты входишь в башню. Внутри она видит винтовую лестницу, ведущую наверх. Воздух наполнен статическим электричеством.</p>
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
          <img src="https://via.placeholder.com/300x150?text=Сердце+Света" alt="Сердце Света" class="chapter-image">
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
  
  // Установка изображения врага
  const enemyImage = document.getElementById('enemy-image');
  if (enemyImage) {
    enemyImage.src = enemy.image;
    enemyImage.alt = enemy.name;
  }
  
  document.querySelector(`#${chapter}`).classList.remove('active');
  document.getElementById('battle-screen').style.display = 'block';
  addToStory(`⚔️ Ты встретила ${enemy.name}! Начинается бой!`, true);
  
  // Обновляем карты для боя
  renderBattleCards();
}

function renderBattleCards() {
  const container = document.getElementById('battle-cards-container');
  if (!container) return;
  
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
  if (!battleLog) return;
  
  battleLog.textContent = '';
  
  if (choice === 'attack') {
    // Игрок атакует
    let playerRoll = Math.floor(Math.random() * 6) + 1 + gameState.strength;
    
    // Бонус от активных карт
    if (gameState.cards.active.some(card => card.id === "sword")) {
      playerRoll += 1;
    }
    
    enemy.health -= playerRoll;
    addToStory(`Ты атакуешь и наносишь ${playerRoll} урона!`, false);
    
    if (enemy.health <= 0) {
      battleLog.textContent = `Ты победила ${enemy.name}!`;
      endBattle(true);
      return;
    }
    
    // Враг атакует
    let enemyRoll = Math.floor(Math.random() * 6) + 1 + enemy.strength;
    
    // Бонус защиты
    if (gameState.cards.active.some(card => card.id === "shield")) {
      enemyRoll = Math.max(0, enemyRoll - 1);
    }
    
    gameState.health -= enemyRoll;
    addToStory(`${enemy.name} атакует в ответ и наносит ${enemyRoll} урона!`, false);
    
  } else if (choice === 'defend') {
    // Защита уменьшает урон
    let enemyRoll = Math.floor(Math.random() * 6) + 1 + enemy.strength - 2;
    
    // Дополнительная защита от карт
    if (gameState.cards.active.some(card => card.id === "shield")) {
      enemyRoll = Math.max(0, enemyRoll - 1);
    }
    
    if (enemyRoll > 0) {
      gameState.health -= enemyRoll;
      addToStory(`Ты защищаетешься и получаешь ${enemyRoll} урона (вместо ${enemyRoll + 2})`, false);
    } else {
      addToStory("Ты полностью заблокировала атаку!", false);
    }
  } else if (choice === 'flee') {
    // Попытка убежать
    const fleeChance = Math.random();
    if (fleeChance > 0.5) {
      addToStory("Тебе удаётся убежать от врага!", true);
      endBattle(false);
      return;
    } else {
      addToStory("Тебе не удаётся убежать!", false);
    }
  }
  
  // Проверка здоровья игрока
  if (gameState.health <= 0) {
    battleLog.textContent = "Ты погибла! Игра начнется заново.";
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
      {id: "hide", name: "Укрытие", type: "action", effect: "Позволяет спрятаться от опасности"},
      {id: "leo", name: "Лёша", type: "companion", effect: "Дает +1 к броскам кубика"},
      {id: "food", name: "Припасы", type: "resource", effect: "+2 еды при использовании"},
      {id: "map", name: "Карта кладбища", type: "special", effect: "Позволяет избежать загадок"},
      {id: "key", name: "Хрустальный ключ", type: "special", effect: "Открывает башню"},
      {id: "sword", name: "Деревянный меч", type: "weapon", effect: "+1 к силе в бою"},
      {id: "shield", name: "Лист-щит", type: "armor", effect: "+1 к защите"}
    ],
    discard: []
  };
  gameState.chapter = "prologue";
  gameState.bmzWorked = false;
  gameState.currentEnemy = null;
  gameState.mineProgress = 0;
  gameState.spiderHealth = 5;
  gameState.riddlesSolved = 0;
  gameState.towerChallengePassed = false;
}

function endBattle(victory) {
  if (victory) {
    const enemy = gameState.currentEnemy;
    addToStory(`🎉 Ты победила ${enemy.name} и получаешь награду!`, true);
    
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
        addToStory("Ты получила часть ключа от башни!", true);
        renderInventory();
        break;
      case "energy":
        gameState.energy = Math.min(gameState.energy + 3, gameState.maxEnergy);
        break;
      case "strength":
        gameState.strength += 1;
        addToStory("Ты чувствуешь себя сильнее!", true);
        break;
      case "final_key":
        gameState.inventory.push("Финальный ключ");
        addToStory("Ты получила финальный ключ к механизму света!", true);
        renderInventory();
        break;
      case "victory":
        addToStory("Ты победила последнего врага! Путь к Далёкому Свету свободен!", true);
        break;
    }
    updateResources();
  } else {
    addToStory("Ты проиграла бой и теряешь часть ресурсов...", true);
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
      message += "Ты прячешься от опасности.";
      if (inBattle) {
        gameState.currentEnemy.health -= 1;
        message += " Враг получает 1 урон от неожиданности!";
      }
      break;
    case "leo":
      message += "Лёша присоединяется к тебе, давая +1 к броскам кубика.";
      gameState.companions.push("Лео");
      gameState.cards.active.push(card);
      break;
    case "food":
      message += "Ты используешь припасы, восстанавливая 2 единицы еды.";
      gameState.food += 2;
      break;
    case "map":
      message += "Карта кладбища помогает найти безопасный путь.";
      gameState.inventory.push("Карта кладбища");
      renderInventory();
      break;
    case "key":
      message += "Хрустальный ключ теперь в твоём инвентаре!";
      gameState.inventory.push("Хрустальный ключ");
      renderInventory();
      break;
    case "sword":
      message += "Деревянный меч увеличивает твою силу на 1.";
      gameState.strength += 1;
      gameState.cards.active.push(card);
      break;
    case "shield":
      message += "Лист-щит увеличивает твою защиту.";
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
    const enemyHealthEl = document.getElementById('enemy-health');
    if (enemyHealthEl) enemyHealthEl.textContent = Math.max(0, gameState.currentEnemy.health);
    
    const playerHealthEl = document.getElementById('player-health');
    if (playerHealthEl) playerHealthEl.textContent = gameState.health;
    
    renderBattleCards();
  }
}

function addToStory(text, isNewEntry = false) {
  const storyLogElement = document.getElementById('story-log');
  if (!storyLogElement) return;
  
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
  
  if (!handContainer || !activeContainer) return;
  
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

// Функция отображения инвентаря
function renderInventory() {
  const inventoryContainer = document.getElementById('inventory-items');
  if (!inventoryContainer) return;
  
  inventoryContainer.innerHTML = '';
  
  if (gameState.inventory.length === 0) {
    inventoryContainer.innerHTML = '<p>Инвентарь пуст</p>';
    return;
  }
  
  // Убираем дубликаты
  const uniqueItems = [...new Set(gameState.inventory)];
  
  uniqueItems.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'inventory-item';
    itemEl.textContent = item;
    inventoryContainer.appendChild(itemEl);
  });
}