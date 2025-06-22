// ================== ДЕТЕКТИВ ==================
const evidenceData = {
  1: {
    name: "Фотография",
    clues: [
      "На фото видны странные символы: ☆○□",
      "Фото сделано ночью при лунном свете",
      "На заднем фоне силуэт башни с трещиной на западной стороне",
      "Символы соответствуют расположению улик: ☆ - маяк, ○ - озеро, □ - склад"
    ],
    solution: "Золотой ключ находится в маяке"
  },
  2: {
    name: "Записка",
    clues: [
      "Текст: 'Ищи ключ там, где светит третий свет'",
      "Почерк нервный, буквы дрожат",
      "Бумага дорогая, с водяными знаками фабрики 'Лунный свет'",
      "Третий свет - это маяк на старом доке, который включается третьим"
    ],
    solution: "Ключ находится в маяке, который зажигается третьим по счёту"
  },
  3: {
    name: "Отпечатки",
    clues: [
      "Следы ведут к старому дубовому шкафу в библиотеке",
      "Отпечатки принадлежат нескольким людям",
      "Есть следы борьбы - сдвинутая мебель и разлитые чернила",
      "В шкафу обнаружен потайной отдел с механизмом"
    ],
    solution: "Шкаф содержит потайной отдел с механизмом, открывающим проход к маяку"
  },
  4: {
    name: "Карта",
    clues: [
      "Старинная карта города с пометками",
      "Три места обведены красным: маяк, озеро и склад",
      "Возле маяка надпись 'истина в свете'",
      "На обратной стороне цифры: 3-1-2"
    ],
    solution: "Последовательность посещения: маяк (3), озеро (1), склад (2)"
  },
  5: {
    name: "Дневник",
    clues: [
      "Записи профессора Вандерштейна",
      "Последняя запись: 'Они знают, что я обнаружил тайну света...'",
      "Упоминание 'трех ключей, но только один истинный'",
      "Набросок механизма с подписью 'золото проводит свет лучше'"
    ],
    solution: "Только золотой ключ может активировать механизм"
  },
  6: {
    name: "Шифровальный блок",
    clues: [
      "Небольшое металлическое устройство с цифровыми колесиками",
      "На корпусе выгравирована надпись: 'Истина в свете'",
      "Требует 4-значный код для открытия",
      "Внутри спрятана важная подсказка"
    ],
    solution: "Код для шифровального блока указан на физическом артефакте"
  }
};

let collectedEvidence = [];
let hintsUsed = 0;
let currentEvidence = null;
const EVIDENCE_COUNT = 6;
let selectedEvidence = null;
let codeAttempts = 0;

function examineEvidence(id) {
  if (!evidenceData[id]) return;
  
  currentEvidence = id;
  const evidence = evidenceData[id];
  
  if (!collectedEvidence.includes(id)) {
    collectedEvidence.push(id);
    const evidenceItem = document.querySelector(`.evidence-item[data-id="${id}"]`);
    if (evidenceItem) evidenceItem.classList.add('selected');
  }
  
  let clueHTML = `<strong>${evidence.name}:</strong><ul>`;
  evidence.clues.forEach((clue, index) => {
    if (index < collectedEvidence.length) {
      clueHTML += `<li>${clue}</li>`;
    }
  });
  clueHTML += "</ul>";
  
  const clueText = document.getElementById('clueText');
  if (clueText) clueText.innerHTML = clueHTML;
  playSound('page-flipping.wav');
  
  const counter = document.querySelector('.hint-counter');
  if (counter) counter.textContent = `(${collectedEvidence.length}/${EVIDENCE_COUNT})`;
  
  if (collectedEvidence.length === EVIDENCE_COUNT) {
    const detectiveFeedback = document.getElementById('detectiveFeedback');
    if (detectiveFeedback) {
      detectiveFeedback.innerHTML = 
        "Все улики собраны! <button class='btn' onclick='startMatching()'>Сопоставить улики</button>";
    }
    
    // Показываем поле для ввода кода
    document.getElementById('codeEntry').style.display = 'block';
  }
}

function startMatching() {
  const evidenceGrid = document.getElementById('evidenceGrid');
  const matchingGame = document.getElementById('matchingGame');
  const keySelection = document.getElementById('keySelection');
  
  if (evidenceGrid) evidenceGrid.style.display = 'none';
  if (matchingGame) matchingGame.style.display = 'grid';
  if (keySelection) keySelection.style.display = 'none';
  
  matchingGame.innerHTML = '<div id="matchingPairs" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;"></div>';
  const matchingContainer = document.getElementById('matchingPairs');
  
  if (!matchingContainer) return;
  
  const evidenceKeys = Object.keys(evidenceData);
  evidenceKeys.sort(() => Math.random() - 0.5);
  
  evidenceKeys.forEach(id => {
    const evidence = evidenceData[id];
    
    const nameCard = document.createElement('div');
    nameCard.className = 'matching-card';
    nameCard.textContent = evidence.name;
    nameCard.dataset.id = id;
    nameCard.onclick = () => selectCard(nameCard);
    matchingContainer.appendChild(nameCard);
    
    const solutionCard = document.createElement('div');
    solutionCard.className = 'matching-card';
    solutionCard.textContent = evidence.solution;
    solutionCard.dataset.id = id;
    solutionCard.onclick = () => selectCard(solutionCard);
    matchingContainer.appendChild(solutionCard);
  });
  
  const detectiveFeedback = document.getElementById('detectiveFeedback');
  if (detectiveFeedback) {
    detectiveFeedback.textContent = 
      "Сопоставь улики с их значениями. Выбери сначала улику, затем решение.";
  }
}

function selectCard(card) {
  if (!card) return;
  
  if (!selectedEvidence) {
    selectedEvidence = card;
    card.classList.add('selected');
    return;
  }
  
  if (selectedEvidence.dataset.id === card.dataset.id) {
    selectedEvidence.classList.add('matched');
    card.classList.add('matched');
    selectedEvidence.onclick = null;
    card.onclick = null;
    playSound('notify.wav');
    
    const unmatchedCards = document.querySelectorAll('.matching-card:not(.matched)');
    if (unmatchedCards.length === 0) {
      const detectiveFeedback = document.getElementById('detectiveFeedback');
      if (detectiveFeedback) {
        detectiveFeedback.innerHTML = 
          "Поздравляю! Ты раскрыл все связи!";
      }
    }
  } else {
    selectedEvidence.classList.remove('selected');
    card.classList.add('incorrect');
    setTimeout(() => card.classList.remove('incorrect'), 1000);
    playSound('wronganswer.mp3');
  }
  
  selectedEvidence = null;
}

function showKeySelection() {
  const matchingGame = document.getElementById('matchingGame');
  const keySelection = document.getElementById('keySelection');
  
  if (matchingGame) matchingGame.style.display = 'none';
  if (keySelection) keySelection.style.display = 'block';
}

function checkDetectiveCode() {
  const codeInput = document.getElementById('detectiveCode');
  const codeFeedback = document.getElementById('codeFeedback');
  
  if (!codeInput || !codeFeedback) return;
  
  const enteredCode = codeInput.value.trim().toUpperCase();
  const correctCode = BOX_CODES[3]; // Код из последней коробки
  
  if (location.search.includes('debug')) {
    codeFeedback.textContent = "Режим отладки: код принят!";
    codeFeedback.style.color = "#4caf50";
    showKeySelection();
    return;
  }
  
  if (enteredCode === correctCode) {
    codeFeedback.textContent = "Код верный! Шифровальный блок открыт.";
    codeFeedback.style.color = "#4caf50";
    playSound('notify.wav');
    showKeySelection();
  } else {
    codeAttempts++;
    if (codeAttempts >= 3) {
      codeFeedback.textContent = "Слишком много попыток! Начните расследование заново.";
      codeFeedback.style.color = "#f44336";
      setTimeout(() => {
        collectedEvidence = [];
        document.querySelectorAll('.evidence-item').forEach(el => el.classList.remove('selected'));
        document.getElementById('codeEntry').style.display = 'none';
        document.getElementById('clueText').textContent = "Начни расследование, выбрав одну из улик.";
        document.querySelector('.hint-counter').textContent = "(0/6)";
        codeAttempts = 0;
      }, 2000);
    } else {
      codeFeedback.textContent = `Неверный код! Попыток осталось: ${3 - codeAttempts}`;
      codeFeedback.style.color = "#f44336";
      playSound('wronganswer.mp3');
    }
  }
}

function solveDetective(key) {
  playSound('notify.wav');
  
  const detectiveFeedback = document.getElementById('detectiveFeedback');
  if (!detectiveFeedback) return;
  
  if (key === 3) {
    detectiveFeedback.textContent = "Поздравляю! Ты раскрыл тайну!";
    detectiveFeedback.style.color = "#4caf50";
    
    gamesCompleted.detective = true;
    setTimeout(() => showBoxAnimation(4), 2000);
  } else {
    detectiveFeedback.textContent = "Неправильный ключ! Попробуй еще раз.";
    detectiveFeedback.style.color = "#f44336";
  }
}

function showHint() {
  if (!currentEvidence || !evidenceData[currentEvidence]) return;
  
  const evidence = evidenceData[currentEvidence];
  const clueText = document.getElementById('clueText');
  if (!clueText) return;
  
  hintsUsed++;
  let clueHTML = `<strong>${evidence.name}:</strong><ul>`;
  
  evidence.clues.forEach((clue, index) => {
    if (index < hintsUsed) {
      clueHTML += `<li>${clue}</li>`;
    }
  });
  clueHTML += "</ul>";
  
  clueText.innerHTML = clueHTML;
  playSound('page-flipping.wav');
}

// Инициализация детективной игры
document.getElementById('detective').innerHTML = `
  <h2>Мини-игра 4: Детектив</h2>
  <p>Расследуй загадочное дело. Собери улики и найди правильный ключ!</p>
  
  <div class="clue">
    <h3>Подсказки: <span class="hint-counter">(0/6)</span></h3>
    <div id="clueText">Начни расследование, выбрав одну из улик.</div>
  </div>
  
  <div class="evidence-grid" id="evidenceGrid">
    <div class="evidence-item" data-id="1" onclick="examineEvidence(1)">
      <img src="https://via.placeholder.com/100?text=Фото" alt="Фотография">
      <span>Фотография</span>
    </div>
    <div class="evidence-item" data-id="2" onclick="examineEvidence(2)">
      <img src="https://via.placeholder.com/100?text=Записка" alt="Записка">
      <span>Записка</span>
    </div>
    <div class="evidence-item" data-id="3" onclick="examineEvidence(3)">
      <img src="https://via.placeholder.com/100?text=Отпечатки" alt="Отпечатки">
      <span>Отпечатки</span>
    </div>
    <div class="evidence-item" data-id="4" onclick="examineEvidence(4)">
      <img src="https://via.placeholder.com/100?text=Карта" alt="Карта">
      <span>Карта</span>
    </div>
    <div class="evidence-item" data-id="5" onclick="examineEvidence(5)">
      <img src="https://via.placeholder.com/100?text=Дневник" alt="Дневник">
      <span>Дневник</span>
    </div>
    <div class="evidence-item" data-id="6" onclick="examineEvidence(6)">
      <img src="https://via.placeholder.com/100?text=Шифр" alt="Шифровальный блок">
      <span>Шифровальный блок</span>
    </div>
  </div>
  
  <div id="matchingGame">
    <!-- Контент для сопоставления будет добавлен динамически -->
  </div>
  
  <div id="codeEntry" style="display:none; margin-top:20px; text-align:center">
    <h3>Введите код с артефакта:</h3>
    <input type="text" id="detectiveCode" maxlength="4" placeholder="4 символа">
    <button class="btn" onclick="checkDetectiveCode()">Проверить</button>
    <p id="codeFeedback" class="hint"></p>
  </div>
  
  <div id="keySelection" class="key-selection" style="display:none">
    <h3>Выбери ключ:</h3>
    <div class="keys-container">
      <div class="key-item" onclick="solveDetective(1)">
        <img src="key.png" alt="Ключ 1">
        <span>Старый ключ</span>
      </div>
      <div class="key-item" onclick="solveDetective(2)">
        <img src="key2.png" alt="Ключ 2">
        <span>Ржавый ключ</span>
      </div>
      <div class="key-item" onclick="solveDetective(3)">
        <img src="key3.png" alt="Ключ 3">
        <span>Золотой ключ</span>
      </div>
    </div>
  </div>
  
  <p id="detectiveFeedback" class="hint" role="alert"></p>
  <button id="hintBtn" class="btn" onclick="showHint()">Показать подсказку</button>
`;