// marketing-game.js
let marketingState = {
  currentDay: 1,
  budget: 300,
  reputation: 30,
  followers: 50,
  satisfaction: 50,
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
  nextLevelExp: 50
};

const ACTION_COST_SCALING = {
  1: 0.5,
  2: 0.4,
  3: 0.7,
  4: 0.8,
  5: 0.4,
  6: 0.3,
  7: 0.6,
  8: 0.5,
  9: 0.4,
  10: 0.9
};

function startMarketingGame() {
  marketingState = {
    currentDay: 1,
    budget: 300,
    reputation: 30,
    followers: 50,
    satisfaction: 50,
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
    nextLevelExp: 50
  };
  
  renderMarketingUI();
  generateClient();
  renderActions();
  updateUI();
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
          <div class="resource experience">📊${marketingState.experience}/${marketingState.nextLevelExp}</div>
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
          ${marketingState.officeLevel < 3 ? 
            `<button class="btn" onclick="upgradeOffice()">Улучшить ($${marketingGameData.officeLevels[marketingState.officeLevel].cost})</button>` : 
            '<div class="max-level">Максимальный уровень</div>'}
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
    const requiresPurchased = talent.requires.every(req => 
      marketingState.talents[branch].includes(req) ||
      marketingState.talents.digital.includes(req) ||
      marketingState.talents.btl.includes(req) ||
      marketingState.talents.atl.includes(req)
    );
    const canPurchase = !isPurchased && 
      marketingState.talentPoints >= talent.cost &&
      requiresPurchased;
    
    html += `
      <div class="talent ${isPurchased ? 'purchased' : ''} ${canPurchase ? 'can-purchase' : ''}" 
           onclick="${canPurchase ? `purchaseTalent('${branch}', ${talent.id})` : ''}">
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
}

function closeTalentModal() {
  document.getElementById('talentModal').style.display = 'none';
}

function purchaseTalent(branch, talentId) {
  const talent = marketingGameData.talentTree[branch].find(t => t.id === talentId);
  
  if (marketingState.talentPoints >= talent.cost) {
    marketingState.talentPoints -= talent.cost;
    marketingState.talents[branch].push(talentId);
    
    document.getElementById('talentPoints').textContent = marketingState.talentPoints;
    document.querySelector(`.talent-tree-section p`).textContent = 
      `Активные таланты: ${marketingState.talents.digital.length + marketingState.talents.btl.length + marketingState.talents.atl.length}`;
    
    // Перерисовываем ветку
    const branchElement = document.querySelector(`.talent-branch:contains('${branch.toUpperCase()}')`);
    if (branchElement) {
      branchElement.innerHTML = `
        <h3>${branch.charAt(0).toUpperCase() + branch.slice(1)}</h3>
        ${renderTalentBranch(branch)}
      `;
    }
    
    showNotification(`Приобретен талант: ${talent.name}`, "success");
  }
}

function generateClient() {
  const client = {...marketingGameData.clients[
    Math.floor(Math.random() * marketingGameData.clients.length)
  ]};
  
  const request = marketingGameData.clientRequests[
    Math.floor(Math.random() * marketingGameData.clientRequests.length)
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
    let actualCost = Math.floor(action.baseCost * ACTION_COST_SCALING[action.id] * (1 + marketingState.inflation));
    
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
      <div class="action-effect">${action.effect === 'both' ? '📈 Репутация + 👥 Подписчики' : 
        action.effect === 'followers' ? '👥 Подписчики' : 
        action.effect === 'reputation' ? '⭐ Репутация' : '😊 Удовлетворенность'}</div>
      ${marketingState.inflation > 0 ? `<div class="inflation">+${Math.floor(marketingState.inflation*100)}%</div>` : ''}
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
  
  let match = 0;
  action.keywords.forEach(keyword => {
    if (marketingState.client.preferences.some(p => p.includes(keyword))) {
      match += 25;
    }
  });
  
  if (action.creative) {
    match += marketingState.skills.creativity * 5;
  }
  
  if (action.analytical) {
    match += marketingState.skills.analytics * 3;
  }
  
  match += Math.floor(Math.random() * 20);
  match = Math.min(100, match);
  
  marketingState.budget -= cost;
  let effectValue = Math.floor(action.value * 0.6);
  
  effectValue = Math.floor(effectValue * marketingGameData.careerLevels[marketingState.careerLevel-1].incomeMultiplier);
  
  if (action.effect === 'followers') {
    marketingState.followers += effectValue;
    marketingState.client.satisfaction += Math.floor(effectValue / 2);
  } else if (action.effect === 'reputation') {
    marketingState.reputation += effectValue;
    marketingState.client.satisfaction += Math.floor(effectValue / 2);
  } else if (action.effect === 'satisfaction') {
    marketingState.satisfaction += effectValue;
    marketingState.client.satisfaction += effectValue;
  } else if (action.effect === 'both') {
    marketingState.followers += Math.floor(effectValue * 0.7);
    marketingState.reputation += Math.floor(effectValue * 0.3);
    marketingState.client.satisfaction += Math.floor(effectValue / 3);
  }
  
  let expGain = 5 + Math.floor(match / 10);
  marketingState.experience += expGain;
  
  while (marketingState.experience >= marketingState.nextLevelExp) {
    marketingState.talentPoints += 1;
    marketingState.experience -= marketingState.nextLevelExp;
    marketingState.nextLevelExp = Math.round(marketingState.nextLevelExp * 1.4);
    showNotification(`Получено очко таланта! Всего: ${marketingState.talentPoints}`, "success");
  }
  
  if (match >= 70) {
    const payment = Math.floor(marketingState.client.payment * 0.7 + marketingState.client.satisfaction * 0.2);
    marketingState.budget += payment;
    showNotification(`Клиент оплатил работу: $${payment}`, "success");
  }
  
  marketingState.followers = Math.max(0, marketingState.followers);
  marketingState.reputation = Math.max(0, Math.min(100, marketingState.reputation));
  marketingState.satisfaction = Math.max(0, Math.min(100, marketingState.satisfaction));
  marketingState.client.satisfaction = Math.max(0, Math.min(100, marketingState.client.satisfaction));
  
  const progressIncrease = 5;
  if (marketingState.client.type === 'small') {
    marketingState.storyProgress.smallBusiness = Math.min(100, marketingState.storyProgress.smallBusiness + progressIncrease);
  } else if (marketingState.client.type === 'startup') {
    marketingState.storyProgress.startup = Math.min(100, marketingState.storyProgress.startup + progressIncrease);
  } else {
    marketingState.storyProgress.corporate = Math.min(100, marketingState.storyProgress.corporate + progressIncrease);
  }
  
  checkCareerProgress();
  
  showNotification(`Эффективность: ${match}%`, match >= 70 ? "success" : match >= 40 ? "info" : "error");
  
  setTimeout(() => {
    marketingState.currentDay++;
    
    if (marketingState.currentDay > marketingGameData.days) {
      completeMarketingGame();
      return;
    }
    
    if (marketingState.currentDay % 3 === 0) {
      marketingState.inflation += 0.05;
      showEvent({ 
        type: "inflation", 
        text: `Инфляция! Цены выросли на ${Math.floor(marketingState.inflation*100)}%` 
      });
    }
    
    if (Math.random() < 0.25) {
      const event = marketingGameData.events[Math.floor(Math.random() * marketingGameData.events.length)];
      applyEvent(event);
      showEvent(event);
    }
    
    generateClient();
    updateUI();
  }, 1500);
  
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
    showNotification(`Офис улучшен до уровня: ${nextLevel.name}`, "success");
    updateUI();
  } else {
    showNotification("Недостаточно средств для улучшения офиса", "error");
  }
}

function applyEvent(event) {
  marketingState.activeEvent = event;
  
  switch(event.effect) {
    case "cost":
      marketingState.inflation += event.value;
      break;
    case "budget":
      marketingState.budget += event.value;
      break;
    case "reputation":
      marketingState.reputation += event.value;
      break;
    case "followers":
      marketingState.followers += event.value;
      break;
    case "bonus":
      if (event.value === "creative") {
        marketingState.skills.creativity = Math.min(5, marketingState.skills.creativity + 1);
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
  }, 3000);
}

function showNotification(text, type = "info") {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = text;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

function updateUI() {
  if (document.querySelector('.day-counter')) {
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
    
    const careerElement = document.querySelector('.career-info');
    if (careerElement) {
      careerElement.textContent = marketingGameData.careerLevels[marketingState.careerLevel-1].name;
    }
    
    const officeInfo = document.querySelector('.office-info h3');
    if (officeInfo) {
      officeInfo.textContent = marketingGameData.officeLevels[marketingState.officeLevel-1].name;
      officeInfo.nextElementSibling.textContent = marketingGameData.officeLevels[marketingState.officeLevel-1].description;
    }
    
    const officeImage = document.querySelector('.office-image');
    if (officeImage) {
      officeImage.style.backgroundImage = `url('office-${marketingState.officeLevel}.jpg')`;
    }
  }
  
  renderActions();
}

function completeMarketingGame() {
  gamesCompleted.marketing = true;
  showBoxAnimation(1);
  
  setTimeout(() => {
    if (navButtons && navButtons.memory) {
      navButtons.memory.click();
    }
  }, 3000);
}