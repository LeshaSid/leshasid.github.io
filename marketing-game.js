// marketing-game.js

// Начальное состояние игры (вынесено для предотвращения дублирования)
const INITIAL_MARKETING_STATE = {
  currentDay: 1,
  budget: 750, // Снижен стартовый бюджет для повышения сложности
  reputation: 30, // Снижена стартовая репутация
  followers: 35, // Снижены стартовые подписчики
  satisfaction: 45,
  inflation: 0,
  skills: {
    creativity: 1,
    analytics: 1,
    communication: 1
  },
  officeLevel: 1,
  careerLevel: 1,
  client: null,
  history: [],
  activeEvent: null,
  storyProgress: {
    smallBusiness: 0,
    startup: 0,
    corporate: 0
  },
  talents: {
    digital: [],
    btl: [],
    atl: []
  },
  talentPoints: 0,
  experience: 0,
  nextLevelExp: 70, // Увеличено требование к опыту для первого уровня
  wasWarnedOnce: false, // Флаг для буферной зоны при проигрыше
  lastEvents: [], // Для отслеживания последовательности событий
  actionUsage: {} // НОВОЕ: Объект для отслеживания использования каждого действия
};

// Текущее состояние игры
let marketingState = { ...INITIAL_MARKETING_STATE
};

// Пассивный доход от офиса (увеличен, чтобы сделать улучшение более ценным)
const OFFICE_PASSIVE_INCOME = [0, 25, 60, 120];

function startMarketingGame() {
  // Сброс состояния игры к начальным параметрам путем создания глубокой копии
  marketingState = JSON.parse(JSON.stringify(INITIAL_MARKETING_STATE));

  renderMarketingUI();
  generateClient();
  renderActions();
  updateUI(); // Добавлен вызов updateUI() для корректного отображения начального состояния
}

function renderMarketingUI() {
  document.getElementById('marketingGame').innerHTML = `
    <div class="marketing-container">
      <div class="header">
        <div class="career-info">${marketingGameData.careerLevels[marketingState.careerLevel-1].name}</div>
        <div class="day-counter">День ${marketingState.currentDay}/${marketingGameData.days}</div>
        <div class="resources">
          <div class="resource budget">$${Math.floor(marketingState.budget)}</div>
          <div class="resource reputation">⭐${marketingState.reputation}</div>
          <div class="resource followers">👥${marketingState.followers}</div>
          <div class="resource satisfaction">😊${marketingState.satisfaction}</div>
          <div class="resource experience">�${marketingState.experience}/${marketingState.nextLevelExp}</div>
          <div class="resource talent">🎯${marketingState.talentPoints}</div>
        </div>
      </div>
      
      <div class="client-card">
        <div class="client-info">
          <div class="client-portrait">${marketingState.client?.name.charAt(0) || 'К'}</div>
          <div class="client-details">
            <h3>${marketingState.client?.name || 'Клиент'}</h3>
            <p>${marketingState.client?.description || 'Выберите действие'}</p>
            <div class="client-type ${marketingState.client?.type || ''}">
              ${marketingState.client?.type === 'small' ? '🏪 Малый бизнес' :
                marketingState.client?.type === 'startup' ? '🚀 Стартап' :
                '🏢 Корпорация'}
            </div>
          </div>
        </div>
        <div class="client-request">
          <p>"${marketingState.client?.currentRequest || 'Загрузка...'}"</p>
        </div>
        <div class="satisfaction-bar">
          <div class="satisfaction-fill" style="width: ${Math.min(100, marketingState.client?.satisfaction || 0)}%"></div>
        </div>
      </div>
      
      <div class="actions-container" id="actionsContainer"></div>
      
      <div class="progress-container">
        <div class="progress-section">
          <h3>Прогресс сюжета</h3>
          <div class="progress-bars">
            <div class="progress-bar">
              <div class="progress-label">Малый бизнес</div>
              <div class="progress-track"><div class="progress-fill" style="width: ${marketingState.storyProgress.smallBusiness}%"></div></div>
              <div class="progress-value">${marketingState.storyProgress.smallBusiness}%</div>
            </div>
            <div class="progress-bar">
              <div class="progress-label">Стартапы</div>
              <div class="progress-track"><div class="progress-fill" style="width: ${marketingState.storyProgress.startup}%"></div></div>
              <div class="progress-value">${marketingState.storyProgress.startup}%</div>
            </div>
            <div class="progress-bar">
              <div class="progress-label">Корпорации</div>
              <div class="progress-track"><div class="progress-fill" style="width: ${marketingState.storyProgress.corporate}%"></div></div>
              <div class="progress-value">${marketingState.storyProgress.corporate}%</div>
            </div>
          </div>
        </div>
        
        <div class="progress-section">
          <h3>Навыки</h3>
          <div class="skills-grid">
            <div class="skill">
              <div class="skill-name">Креативность</div>
              <div class="skill-level">${marketingState.skills.creativity}/5</div>
              <div class="skill-bar"><div style="width: ${marketingState.skills.creativity*20}%"></div></div>
            </div>
            <div class="skill">
              <div class="skill-name">Аналитика</div>
              <div class="skill-level">${marketingState.skills.analytics}/5</div>
              <div class="skill-bar"><div style="width: ${marketingState.skills.analytics*20}%"></div></div>
            </div>
            <div class="skill">
              <div class="skill-name">Коммуникация</div>
              <div class="skill-level">${marketingState.skills.communication}/5</div>
              <div class="skill-bar"><div style="width: ${marketingState.skills.communication*20}%"></div></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="office-view">
        <div class="office-image" style="background-image: url('office-${marketingState.officeLevel}.jpg')"></div>
        <div class="office-info">
          <h3>${marketingGameData.officeLevels[marketingState.officeLevel-1].name}</h3>
          <p>${marketingGameData.officeLevels[marketingState.officeLevel-1].description}</p>
          <div id="officeUpgradeButtonContainer">
            ${marketingState.officeLevel < 3 ?
              `<button class="btn" onclick="upgradeOffice()">Улучшить ($${marketingGameData.officeLevels[marketingState.officeLevel].cost})</button>` :
              '<div class="max-level">Максимальный уровень</div>'}
          </div>
        </div>
      </div>
      
      <div class="talent-tree-section">
        <h3>Дерево талантов</h3>
        <p>Активные таланты: ${marketingState.talents.digital.length + marketingState.talents.btl.length + marketingState.talents.atl.length}</p>
        <button class="btn" onclick="openTalentTree()">Открыть таланты</button>
      </div>
      
      <div class="event-notice" id="eventNotice"></div>
    </div>
    
    <div id="talentModal" class="modal" style="display:none">
      <div class="modal-content">
        <span class="close" onclick="closeTalentModal()">&times;</span>
        <h2>Дерево талантов</h2>
        <p>Очков талантов: <span id="talentPoints">${marketingState.talentPoints}</span></p>
        <div class="talent-tree">
          <div class="talent-branch">
            <h3>Digital</h3>
            ${renderTalentBranch('digital')}
          </div>
          <div class="talent-branch">
            <h3>BTL</h3>
            ${renderTalentBranch('btl')}
          </div>
          <div class="talent-branch">
            <h3>ATL</h3>
            ${renderTalentBranch('atl')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTalentBranch(branch) {
  let html = '';
  marketingGameData.talentTree[branch].forEach(talent => {
    const isPurchased = marketingState.talents[branch].includes(talent.id);
    const requiresPurchased = talent.requires.length === 0 || talent.requires.every(reqId => {
        // Проверяем наличие таланта во всех ветках
        return marketingState.talents.digital.includes(reqId) ||
               marketingState.talents.btl.includes(reqId) ||
               marketingState.talents.atl.includes(reqId);
    });
    const canPurchase = !isPurchased &&
      marketingState.talentPoints >= talent.cost &&
      requiresPurchased;
    
    html += `
      <div class="talent ${isPurchased ? 'purchased' : ''} ${!requiresPurchased ? 'locked' : ''} ${canPurchase ? 'can-purchase' : ''}"
           onclick="${canPurchase ? `purchaseTalent('${branch}', ${talent.id})` : ''}"
           title="${talent.effect}">
        <div class="talent-icon">${isPurchased ? '✓' : talent.cost}</div>
        <div class="talent-details">
          <h4>${talent.name}</h4>
          <p>${talent.effect}</p>
        </div>
      </div>
    `;
  });
  return html;
}


function openTalentTree() {
  document.getElementById('talentModal').style.display = 'block';
  // Перерисовываем дерево талантов при каждом открытии, чтобы обновить состояние кнопок
  document.querySelector('.talent-tree').innerHTML = `
      <div class="talent-branch">
        <h3>Digital</h3>
        ${renderTalentBranch('digital')}
      </div>
      <div class="talent-branch">
        <h3>BTL</h3>
        ${renderTalentBranch('btl')}
      </div>
      <div class="talent-branch">
        <h3>ATL</h3>
        ${renderTalentBranch('atl')}
      </div>
  `;
}

function closeTalentModal() {
  document.getElementById('talentModal').style.display = 'none';
}

function purchaseTalent(branch, talentId) {
  const talent = marketingGameData.talentTree[branch].find(t => t.id === talentId);
  
  if (talent && marketingState.talentPoints >= talent.cost && !marketingState.talents[branch].includes(talentId)) {
    // Проверка зависимостей талантов
    const requiresPurchased = talent.requires.length === 0 || talent.requires.every(reqId =>
        marketingState.talents.digital.includes(reqId) ||
        marketingState.talents.btl.includes(reqId) ||
        marketingState.talents.atl.includes(reqId)
    );

    if (!requiresPurchased) {
        showNotification(`Для этого таланта требуются предыдущие таланты!`, "error");
        return;
    }

    marketingState.talentPoints -= talent.cost;
    marketingState.talents[branch].push(talentId);
    
    // Обновляем UI после покупки
    openTalentTree(); // Перерисовываем модальное окно, чтобы обновить все состояния
    document.getElementById('talentPoints').textContent = marketingState.talentPoints; // Обновляем счетчик очков
    document.querySelector('.talent-tree-section p').textContent =
      `Активные таланты: ${marketingState.talents.digital.length + marketingState.talents.btl.length + marketingState.talents.atl.length}`;
    
    showNotification(`Приобретен талант: ${talent.name}`, "success");
    updateUI(); // Обновляем основной UI
  } else if (marketingState.talents[branch].includes(talentId)) {
      showNotification(`Талант "${talent.name}" уже приобретен!`, "info");
  } else {
      showNotification(`Недостаточно очков для таланта: ${talent.name}`, "error");
  }
}

function generateClient() {
  const client = {...marketingGameData.clients[
    Math.floor(Math.random() * marketingGameData.clients.length)
  ]};
  
  // Выбираем запрос, который соответствует типу клиента
  let availableRequests = marketingGameData.clientRequests.filter(request =>
    request.keywords.some(keyword => client.preferences.includes(keyword))
  );

  // Если нет подходящих запросов, выбираем случайный
  if (availableRequests.length === 0) {
    availableRequests = marketingGameData.clientRequests;
  }

  const request = availableRequests[
    Math.floor(Math.random() * availableRequests.length)
  ];
  client.currentRequest = request.text;
  client.satisfaction = 50;
  
  marketingState.client = client;
}

function renderActions() {
  const container = document.getElementById('actionsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  marketingGameData.marketingActions.forEach(action => {
    // Множитель, который зависит от текущего дня, чтобы увеличить стоимость действий по ходу игры.
    // Используем Math.pow для экспоненциального роста. База 1.1 означает 10% рост за день.
    const exponentialMultiplier = Math.pow(1.1, marketingState.currentDay - 1);
    
    let actualCost = Math.floor(action.baseCost * (1 + marketingState.inflation) * exponentialMultiplier);
    
    // НОВОЕ: Увеличение цены в зависимости от частоты выбора действия
    const usageCount = marketingState.actionUsage[action.id] || 0;
    const usageMultiplier = 1 + (usageCount * 0.05); // 5% увеличение за каждое использование
    actualCost = Math.floor(actualCost * usageMultiplier);

    // Бонус от коммуникации на стоимость
    if (action.communicable) {
      actualCost = Math.floor(actualCost * (1 - marketingState.skills.communication * 0.05));
    }
    
    const actionEl = document.createElement('div');
    actionEl.className = 'marketing-action';
    actionEl.innerHTML = `
      <div class="action-header">
        <div class="action-name">${action.name}</div>
        <div class="action-cost">$${actualCost}</div>
      </div>
      <div class="action-effect">${action.effectDescription}</div>
      ${marketingState.inflation > 0.01 ? `<div class="inflation">+${Math.floor(marketingState.inflation*100)}%</div>` : ''}
      ${action.creative ? `<div class="creative-bonus">Креатив +${marketingState.skills.creativity * 10}%</div>` : ''}
      ${action.analytical ? `<div class="analytics-bonus">Аналитика +${marketingState.skills.analytics * 5}%</div>` : ''}
    `;
    actionEl.onclick = () => selectAction(action.id, actualCost);
    container.appendChild(actionEl);
  });
}

function selectAction(actionId, cost) {
  if (marketingState.budget < cost) {
    showNotification("Недостаточно бюджета!", "error");
    return;
  }
  
  const action = marketingGameData.marketingActions.find(a => a.id === actionId);
  if (!action) return;

  // НОВОЕ: Увеличиваем счетчик использования для выбранного действия
  marketingState.actionUsage[actionId] = (marketingState.actionUsage[actionId] || 0) + 1;
  
  marketingState.budget -= cost;
  
  // --- Расчет эффективности и бонусов ---
  let match = 0;
  const clientKeywords = marketingState.client.preferences;
  const actionKeywords = action.keywords;

  // Базовое совпадение ключевых слов
  actionKeywords.forEach(actionKw => {
    if (clientKeywords.includes(actionKw)) {
      match += 20;
    }
  });

  // Дополнительные бонусы от навыков
  if (action.creative) match += marketingState.skills.creativity * 10;
  if (action.analytical) match += marketingState.skills.analytics * 7;
  if (action.communicable) match += marketingState.skills.communication * 7;

  match += Math.floor(Math.random() * 20); // Элемент случайности
  match = Math.min(100, Math.max(0, match)); // Ограничиваем эффективность от 0 до 100

  let effectValue = action.baseValue;
  
  // Бонус от уровня карьеры
  effectValue *= marketingGameData.careerLevels[marketingState.careerLevel-1].incomeMultiplier;

  // --- Применение эффектов талантов ---
  let talentBonus = 1.0;
  if (action.type === 'digital' && marketingState.talents.digital.includes(1)) talentBonus += 0.15;
  if (action.type === 'atl' && marketingState.talents.atl.includes(7)) talentBonus += 0.15;
  if (action.type === 'btl' && marketingState.talents.btl.includes(5)) talentBonus += 0.30;
  
  if (action.effect.includes('followers') && marketingState.talents.digital.includes(2)) talentBonus += 0.25;
  if (action.effect.includes('reputation') && marketingState.talents.atl.includes(9)) talentBonus += 0.30;
  if (action.effect.includes('reputation') && action.type === 'btl' && marketingState.talents.btl.includes(6)) talentBonus += 0.25;
  if (action.effect.includes('satisfaction') && marketingState.talents.btl.includes(4)) talentBonus += 0.20;

  effectValue *= talentBonus;
  
  // Применение эффектов действия
  if (action.effect === 'followers') {
    marketingState.followers += Math.floor(effectValue * (match / 100));
  } else if (action.effect === 'reputation') {
    marketingState.reputation += Math.floor(effectValue * (match / 100));
  } else if (action.effect === 'satisfaction') {
    marketingState.satisfaction += Math.floor(effectValue * (match / 100));
  } else if (action.effect === 'both') {
    marketingState.followers += Math.floor(effectValue * 0.6 * (match / 100));
    marketingState.reputation += Math.floor(effectValue * 0.4 * (match / 100));
  } else if (action.effect === 'knowledge') {
    marketingState.skills.analytics = Math.min(5, marketingState.skills.analytics + action.baseValue);
    showNotification(`Навык "Аналитика" улучшен!`, "info");
  }

  // Удовлетворенность клиента растет от успешных действий
  let clientSatisfactionGain = 0;
  if (match >= 75) {
      clientSatisfactionGain = 10;
  } else if (match >= 50) {
      clientSatisfactionGain = 5;
  } else if (match >= 30) {
      clientSatisfactionGain = 2;
  } else {
      clientSatisfactionGain = -15; // Смягчен штраф
  }
  marketingState.client.satisfaction += clientSatisfactionGain;

  // Опыт и уровни
  let expGain = 15 + Math.floor(match / 5); // Увеличен прирост опыта
  marketingState.experience += expGain;
  
  while (marketingState.experience >= marketingState.nextLevelExp) {
    marketingState.talentPoints += 1;
    marketingState.experience -= marketingState.nextLevelExp;
    marketingState.nextLevelExp = Math.round(marketingState.nextLevelExp * 1.7);
    showNotification(`Получено очко таланта! Всего: ${marketingState.talentPoints}`, "success");
    openTalentTree();
  }
  
  // Оплата от клиента
  if (match >= 50) {
    const paymentMultiplier = 0.5 + (marketingState.client.satisfaction / 100) * 0.3;
    let payment = Math.floor(marketingState.client.payment * paymentMultiplier);

    if (marketingState.talents.digital.includes(3)) {
        payment *= 1.20;
    }
    marketingState.budget += payment;
    showNotification(`Клиент доволен и оплатил работу: $${Math.floor(payment)}`, "success");
  } else if (match < 30) {
     showNotification(`Клиент недоволен результатом. Оплаты не будет.`, "error");
  }
  
  // Нормализация значений
  marketingState.followers = Math.max(0, marketingState.followers);
  marketingState.reputation = Math.max(0, Math.min(100, marketingState.reputation));
  marketingState.satisfaction = Math.max(0, Math.min(100, marketingState.satisfaction));
  marketingState.client.satisfaction = Math.max(0, Math.min(100, marketingState.client.satisfaction));
  
  // Прогресс сюжета
  const progressIncrease = Math.floor(match / 15);
  if (marketingState.client.type === 'small') {
    marketingState.storyProgress.smallBusiness = Math.min(100, marketingState.storyProgress.smallBusiness + progressIncrease);
  } else if (marketingState.client.type === 'startup') {
    marketingState.storyProgress.startup = Math.min(100, marketingState.storyProgress.startup + progressIncrease);
  } else {
    marketingState.storyProgress.corporate = Math.min(100, marketingState.storyProgress.corporate + progressIncrease);
  }
  
  checkCareerProgress();
  
  showNotification(`Эффективность: ${match}%`, match >= 65 ? "success" : match >= 40 ? "info" : "error");
  
  // Переход к следующему дню
  setTimeout(() => {
    endDay();
  }, 1800);
  
  updateUI();
}

function getWeightedRandomEvent() {
  const allEvents = marketingGameData.events;
  const negativeEvents = allEvents.filter(e => (e.effect === "reputation" && e.value < 0) || e.type === "inflation" || e.type === "crisis" || e.type === "scandal");
  const positiveEvents = allEvents.filter(e => e.effect === "budget" || e.effect === "followers" || e.effect === "skill" || e.type === "boom" || e.type === "viral" || e.type === "investment");
  const neutralEvents = allEvents.filter(e => e.severity === "low" && e.effect !== "budget" && e.effect !== "followers" && e.effect !== "reputation");

  let availableEvents = [...allEvents];

  const lastTwoNegative = marketingState.lastEvents.length >= 2 &&
                          marketingState.lastEvents.every(e => e.value < 0 || e.type === "inflation" || e.type === "crisis" || e.type === "scandal");

  if (lastTwoNegative) {
    availableEvents = [...positiveEvents, ...neutralEvents, ...positiveEvents];
    showNotification("Последовательность негативных событий. Шанс на позитивное событие увеличен!", "info");
  }

  const minDayForHarshEvents = 8;
  if (marketingState.currentDay < minDayForHarshEvents) {
    availableEvents = availableEvents.filter(e => e.severity !== "high");
  }

  if (availableEvents.length === 0) {
    return allEvents[Math.floor(Math.random() * allEvents.length)];
  }

  return availableEvents[Math.floor(Math.random() * availableEvents.length)];
}


function endDay() {
    marketingState.currentDay++;

    // Проверка условий проигрыша с буферной зоной
    if (marketingState.budget <= 0) {
        if (!marketingState.wasWarnedOnce) {
            marketingState.budget = 50; // Небольшой буфер
            marketingState.reputation = Math.max(0, marketingState.reputation - 10); // Штраф к репутации
            marketingState.wasWarnedOnce = true;
            showNotification("Бюджет на исходе! Вы получили небольшой кредит, но ваша репутация пострадала!", "error");
        } else {
            completeMarketingGame(false); // Проигрыш при повторном банкротстве
            return;
        }
    }

    // Проверка на конец игры
    if (marketingState.currentDay > marketingGameData.days) {
      completeMarketingGame(true); // Победа
      return;
    }

    // Пассивный доход от офиса
    const dailyIncome = OFFICE_PASSIVE_INCOME[marketingState.officeLevel-1];
    if (dailyIncome > 0) {
        marketingState.budget += dailyIncome;
        showNotification(`Пассивный доход от офиса: +$${dailyIncome}`, "info");
    }

    // Инфляция (раз в 2 дня)
    if (marketingState.currentDay % 2 === 0) {
      marketingState.inflation = Math.min(0.7, marketingState.inflation + 0.05); // Снижена скорость инфляции
      showEvent({
        type: "inflation",
        text: `Рыночные колебания! Инфляция немного подросла. Текущая инфляция: ${Math.floor(marketingState.inflation*100)}%`,
        value: marketingState.inflation,
        effect: "inflation"
      });
    }
    
    // Случайное событие
    if (Math.random() < 0.55) {
      const event = getWeightedRandomEvent();
      applyEvent(event);
      showEvent(event);

      marketingState.lastEvents.push({ type: event.type, value: event.value });
      if (marketingState.lastEvents.length > 2) {
        marketingState.lastEvents.shift();
      }
    } else {
        marketingState.lastEvents = [];
    }

    // --- Изменено: Проверка, может ли игрок позволить себе хоть одно действие ---
    let minCostOfAnyAction = Infinity;

    for (const action of marketingGameData.marketingActions) {
        const exponentialMultiplier = Math.pow(1.1, marketingState.currentDay - 1);
        let actualCost = Math.floor(action.baseCost * (1 + marketingState.inflation) * exponentialMultiplier);
        
        // НОВОЕ: Учет множителя использования при расчете минимальной стоимости
        const usageCount = marketingState.actionUsage[action.id] || 0;
        const usageMultiplier = 1 + (usageCount * 0.05);
        actualCost = Math.floor(actualCost * usageMultiplier);

        if (action.communicable) {
            actualCost = Math.floor(actualCost * (1 - marketingState.skills.communication * 0.05));
        }

        minCostOfAnyAction = Math.min(minCostOfAnyAction, actualCost);
    }

    // Отладочное сообщение
    console.log(`[Marketing Game Debug] День: ${marketingState.currentDay}, Бюджет: $${Math.floor(marketingState.budget)}, Минимальная стоимость действия: $${minCostOfAnyAction}, Может позволить себе действие: ${marketingState.budget >= minCostOfAnyAction}`);


    if (marketingState.budget < minCostOfAnyAction) {
        showNotification("У вас недостаточно средств для выполнения каких-либо действий. Игра окончена!", "error");
        completeMarketingGame(false); // Проигрыш, если нет доступных действий
        return;
    }
    // --- Конец измененного блока ---
    
    generateClient();
    updateUI();
}


function checkCareerProgress() {
  const currentLevel = marketingGameData.careerLevels[marketingState.careerLevel-1];
  const nextLevel = marketingGameData.careerLevels[marketingState.careerLevel];
  
  if (nextLevel &&
      marketingState.reputation >= nextLevel.requirements.reputation &&
      marketingState.followers >= nextLevel.requirements.followers) {
    marketingState.careerLevel++;
    showNotification(`Поздравляем! Вы получили повышение до ${nextLevel.name}`, "success");
  }
}

function upgradeOffice() {
  const nextLevel = marketingGameData.officeLevels[marketingState.officeLevel];
  if (!nextLevel) return;
  
  if (marketingState.budget >= nextLevel.cost) {
    marketingState.budget -= nextLevel.cost;
    marketingState.officeLevel++;
    showNotification(`Офис улучшен до уровня: ${nextLevel.name}!`, "success");
    updateUI();
  } else {
    showNotification("Недостаточно средств для улучшения офиса", "error");
  }
}

function applyEvent(event) {
  marketingState.activeEvent = event;
  
  switch(event.effect) {
    case "inflation":
      marketingState.inflation = Math.min(0.7, marketingState.inflation + event.value);
      break;
    case "budget":
      if (event.value < 0) {
        const maxLoss = marketingState.budget * 0.4;
        event.value = Math.max(event.value, -maxLoss);
      }
      marketingState.budget += event.value;
      break;
    case "reputation":
      if (event.value < 0) {
        const maxLoss = marketingState.reputation * 0.4;
        event.value = Math.max(event.value, -maxLoss);
      }
      marketingState.reputation = Math.min(100, marketingState.reputation + event.value);
      break;
    case "followers":
      marketingState.followers += event.value;
      break;
    case "skill":
      if (event.value === "creativity" && marketingState.skills.creativity < 5) {
        marketingState.skills.creativity++;
        showNotification(`Навык "Креативность" улучшен!`, "info");
      } else if (event.value === "analytics" && marketingState.skills.analytics < 5) {
        marketingState.skills.analytics++;
        showNotification(`Навык "Аналитика" улучшен!`, "info");
      } else if (event.value === "communication" && marketingState.skills.communication < 5) {
        marketingState.skills.communication++;
        showNotification(`Навык "Коммуникация" улучшен!`, "info");
      }
      break;
  }
}

function showEvent(event) {
  const container = document.getElementById('eventNotice');
  if (!container) return;
  
  container.innerHTML = `
    <div class="event ${event.type}">
      ${event.text}
    </div>
  `;
  
  setTimeout(() => {
    container.innerHTML = '';
  }, 3500);
}

function showNotification(text, type = "info") {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = text;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2500);
}

function updateUI() {
    if (!document.querySelector('.day-counter')) return;
    
    document.querySelector('.day-counter').textContent = `День ${marketingState.currentDay}/${marketingGameData.days}`;
    document.querySelector('.budget').textContent = `$${Math.floor(marketingState.budget)}`;
    document.querySelector('.reputation').textContent = `⭐${marketingState.reputation}`;
    document.querySelector('.followers').textContent = `👥${marketingState.followers}`;
    document.querySelector('.satisfaction').textContent = `😊${marketingState.satisfaction}`;
    document.querySelector('.experience').textContent = `📊${marketingState.experience}/${marketingState.nextLevelExp}`;
    document.querySelector('.talent').textContent = `🎯${marketingState.talentPoints}`;
    
    if (marketingState.client) {
      document.querySelector('.client-details h3').textContent = marketingState.client.name;
      document.querySelector('.client-details p').textContent = marketingState.client.description;
      document.querySelector('.client-request p').textContent = `"${marketingState.client.currentRequest}"`;
      document.querySelector('.client-portrait').textContent = marketingState.client.name.charAt(0);
      
      const typeElement = document.querySelector('.client-type');
      if (typeElement) {
        typeElement.className = `client-type ${marketingState.client.type}`;
        typeElement.textContent =
          marketingState.client.type === 'small' ? '🏪 Малый бизнес' :
          marketingState.client.type === 'startup' ? '🚀 Стартап' : '🏢 Корпорация';
      }
      
      const satisfactionFill = document.querySelector('.satisfaction-fill');
      if (satisfactionFill) {
        satisfactionFill.style.width = `${Math.min(100, marketingState.client.satisfaction)}%`;
      }
    }
    
    document.querySelectorAll('.progress-fill')[0].style.width = `${marketingState.storyProgress.smallBusiness}%`;
    document.querySelectorAll('.progress-fill')[1].style.width = `${marketingState.storyProgress.startup}%`;
    document.querySelectorAll('.progress-fill')[2].style.width = `${marketingState.storyProgress.corporate}%`;
    document.querySelectorAll('.progress-value')[0].textContent = `${marketingState.storyProgress.smallBusiness}%`;
    document.querySelectorAll('.progress-value')[1].textContent = `${marketingState.storyProgress.startup}%`;
    document.querySelectorAll('.progress-value')[2].textContent = `${marketingState.storyProgress.corporate}%`;
    
    document.querySelectorAll('.skill-level')[0].textContent = `${marketingState.skills.creativity}/5`;
    document.querySelectorAll('.skill-level')[1].textContent = `${marketingState.skills.analytics}/5`;
    document.querySelectorAll('.skill-level')[2].textContent = `${marketingState.skills.communication}/5`;
    document.querySelectorAll('.skill-bar > div')[0].style.width = `${marketingState.skills.creativity*20}%`;
    document.querySelectorAll('.skill-bar > div')[1].style.width = `${marketingState.skills.analytics*20}%`;
    document.querySelectorAll('.skill-bar > div')[2].style.width = `${marketingState.skills.communication*20}%`;
    
    document.querySelector('.career-info').textContent = marketingGameData.careerLevels[marketingState.careerLevel-1].name;
    
    document.querySelector('.office-info h3').textContent = marketingGameData.officeLevels[marketingState.officeLevel-1].name;
    document.querySelector('.office-info p').textContent = marketingGameData.officeLevels[marketingState.officeLevel-1].description;
    document.querySelector('.office-image').style.backgroundImage = `url('office-${marketingState.officeLevel}.jpg')`;

    const upgradeButtonContainer = document.getElementById('officeUpgradeButtonContainer');
    let upgradeButton = upgradeButtonContainer.querySelector('button');
    let maxLevelDiv = upgradeButtonContainer.querySelector('.max-level');

    if (marketingState.officeLevel < marketingGameData.officeLevels.length) {
        if (maxLevelDiv) {
            maxLevelDiv.remove();
            maxLevelDiv = null;
        }
        if (!upgradeButton) {
            upgradeButton = document.createElement('button');
            upgradeButton.className = 'btn';
            upgradeButton.onclick = upgradeOffice;
            upgradeButtonContainer.appendChild(upgradeButton);
        }
        upgradeButton.style.display = 'block';
        upgradeButton.textContent = `Улучшить ($${marketingGameData.officeLevels[marketingState.officeLevel].cost})`;
    } else {
        if (upgradeButton) upgradeButton.style.display = 'none';
        if (!maxLevelDiv) {
            maxLevelDiv = document.createElement('div');
            maxLevelDiv.className = 'max-level';
            maxLevelDiv.textContent = 'Максимальный уровень';
            upgradeButtonContainer.appendChild(maxLevelDiv);
        }
    }
  
  renderActions();
}

function completeMarketingGame(win) {
  gamesCompleted.marketing = true;
  const marketingGameDiv = document.getElementById('marketingGame');
  if (!marketingGameDiv) return;

  if (win) {
    marketingGameDiv.innerHTML = `
      <div class="ending-screen" style="display:block; text-align:center; padding: 40px;">
          <h2>Поздравляем!</h2>
          <p>Вы успешно завершили карьеру маркетолога, достигнув вершины!</p>
          <p>Ваш итоговый счет:</p>
          <p>Бюджет: $${Math.floor(marketingState.budget)}</p>
          <p>Репутация: ${marketingState.reputation}</p>
          <p>Подписчики: ${marketingState.followers}</p>
          <button class="btn" onclick="navButtons.memory.click()">Продолжить</button>
      </div>
    `;
    showBoxAnimation(1);
  } else {
    marketingGameDiv.innerHTML = `
      <div class="ending-screen" style="display:block; text-align:center; padding: 40px;">
          <h2>Игра окончена!</h2>
          <p>Вы не смогли удержать свой бизнес на плаву.</p>
          <p>Попробуйте снова, чтобы достичь успеха!</p>
          <button class="btn" onclick="startMarketingGame()">Начать заново</button>
      </div>
    `;
  }
}
