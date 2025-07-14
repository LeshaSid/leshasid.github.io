// game-data.js
const marketingGameData = {
  days: 25,
  clientRequests: [
    { id: 1, text: "Нужен вирусный маркетинг для привлечения подростков", keywords: ["вирус", "подрост", "молодежь", "хайп"] },
    { id: 2, text: "Требуется креативная реклама для местного бизнеса", keywords: ["креатив", "местн", "локальный", "узнаваемость"] },
    { id: 3, text: "Как создать массовый хайп вокруг нового продукта?", keywords: ["хайп", "массов", "вирус", "шум"] },
    { id: 4, text: "Нужна эмоциональная реклама для повседневного товара", keywords: ["эмоц", "повседнев", "доверие", "уют"] },
    { id: 5, text: "Требуется престижная реклама для культурного события", keywords: ["престиж", "культ", "элитный", "имидж"] },
    { id: 6, text: "Как привлечь местных жителей в новый магазин?", keywords: ["местн", "привлечь", "трафик", "локальный"] },
    { id: 7, text: "Нужна инновационная реклама с использованием технологий", keywords: ["инновац", "технологи", "современный", "будущее"] },
    { id: 8, text: "Требуется точный таргетинг для B2B аудитории", keywords: ["таргет", "b2b", "профессионал", "эффективность"] },
    { id: 9, text: "Как создать мем, который станет вирусным?", keywords: ["мем", "вирус", "юмор", "тренды"] },
    { id: 10, text: "Нужна массовая акция с участием аудитории", keywords: ["массов", "участие", "событие", "вовлечение"] },
    { id: 11, text: "Разработать стратегию для выхода на новый рынок", keywords: ["стратегия", "рынок", "расширение", "аналитика"] },
    { id: 12, text: "Увеличить лояльность существующих клиентов", keywords: ["лояльность", "удержание", "клиент", "сервис"] }
  ],
  marketingActions: [
    { id: 1, name: "Платная реклама", baseCost: 90, keywords: ["таргет", "охват", "быстрый"], effect: "followers", baseValue: 22, type: "digital", effectDescription: "👥 Подписчики" }, // Снижена отдача
    { id: 2, name: "Баннер на остановке", baseCost: 60, keywords: ["местн", "уличн", "видимость"], effect: "reputation", baseValue: 18, type: "btl", effectDescription: "⭐ Репутация" },
    { id: 3, name: "Бартер с блогерами", baseCost: 110, keywords: ["блогер", "молодежь", "доверие", "вирус"], effect: "followers", baseValue: 26, type: "digital", communicable: true, effectDescription: "👥 Подписчики" }, // Снижена отдача
    { id: 4, name: "Вирусный ролик", baseCost: 120, keywords: ["вирус", "хайп", "креатив", "массов"], effect: "both", baseValue: 30, type: "digital", creative: true, effectDescription: "📈 Репутация + 👥 Подписчики" }, // Снижена отдача
    { id: 5, name: "Плакаты в лифтах", baseCost: 70, keywords: ["местн", "повседнев", "узнаваемость"], effect: "reputation", baseValue: 20, type: "btl", effectDescription: "⭐ Репутация" },
    { id: 6, name: "Уличный перфоманс", baseCost: 80, keywords: ["креатив", "эмоц", "вовлечение", "шум"], effect: "satisfaction", baseValue: 22, type: "btl", creative: true, effectDescription: "😊 Удовлетворенность" },
    { id: 7, name: "Флешмоб в ТЦ", baseCost: 100, keywords: ["массов", "подрост", "участие", "хайп"], effect: "followers", baseValue: 28, type: "btl", effectDescription: "👥 Подписчики" },
    { id: 8, name: "Реклама на радио", baseCost: 120, keywords: ["местн", "эмоц", "охват"], effect: "reputation", baseValue: 25, type: "atl", effectDescription: "⭐ Репутация" }, // Снижена отдача
    { id: 9, name: "Email-рассылка", baseCost: 70, keywords: ["таргет", "b2b", "лояльность", "аналитика"], effect: "satisfaction", baseValue: 18, type: "digital", analytical: true, effectDescription: "😊 Удовлетворенность" },
    { id: 10, name: "Коллаборация", baseCost: 150, keywords: ["инфлюенсер", "хайп", "престиж", "расширение"], effect: "both", baseValue: 38, type: "digital", communicable: true, effectDescription: "📈 Репутация + 👥 Подписчики" }, // Снижена отдача
    { id: 11, name: "PR-кампания", baseCost: 170, keywords: ["имидж", "престиж", "репутация", "долгосрочный"], effect: "reputation", baseValue: 42, type: "atl", communicable: true, effectDescription: "⭐ Репутация" }, // Снижена отдача
    { id: 12, name: "Анализ рынка", baseCost: 90, keywords: ["аналитика", "стратегия", "рынок", "эффективность"], effect: "knowledge", baseValue: 1, type: "digital", analytical: true, effectDescription: "📚 Знание рынка" }
  ],
  clients: [
    { 
      id: 1, 
      name: "Олег Петров", 
      type: "small", 
      description: "Владелец местного магазина", 
      story: "Малый бизнес, пытающийся выжить в условиях кризиса. Нужны недорогие, но эффективные решения.",
      preferences: ["местн", "эконом", "узнаваемость", "трафик"],
      satisfaction: 50,
      payment: 1000 // Снижен платеж
    },
    { 
      id: 2, 
      name: "Анна Ковалева", 
      type: "startup", 
      description: "Основатель IT-стартапа", 
      story: "Инновационный продукт, но нет узнаваемости. Нужны креативные и вирусные решения.",
      preferences: ["технологи", "инновац", "вирус", "хайп", "молодежь"],
      satisfaction: 50,
      payment: 2100 // Снижен платеж
    },
    { 
      id: 3, 
      name: "Дмитрий Соколов", 
      type: "corporate", 
      description: "Менеджер по маркетингу", 
      story: "Бюрократическая система, строгий бюджет. Нужны безопасные и проверенные решения.",
      preferences: ["престиж", "b2b", "репутация", "эффективность", "аналитика"],
      satisfaction: 50,
      payment: 3800 // Снижен платеж
    }
  ],
  events: [
    { type: "inflation", text: "Рыночные колебания! Инфляция немного подросла.", effect: "inflation", value: 0.05, severity: "medium" },
    { type: "boom", text: "Бум в отрасли! Вы получили грант.", effect: "budget", value: 200, severity: "low" }, // Снижен бонус
    { type: "crisis", text: "Кризис в медиа! Репутация немного пострадала.", effect: "reputation", value: -50, severity: "high" },
    { type: "viral", text: "Ваш старый проект внезапно стал вирусным!", effect: "followers", value: 65, severity: "low" }, // Снижен бонус
    { type: "bonus", text: "Вы посетили конференцию и получили бонус 'Креативное мышление'", effect: "skill", value: "creativity", severity: "low" },
    { type: "bonus", text: "Вы прошли курс по аналитике! Навык 'Аналитика' улучшен.", effect: "skill", value: "analytics", severity: "low" },
    { type: "bonus", text: "Успешные переговоры! Навык 'Коммуникация' улучшен.", effect: "skill", value: "communication", severity: "low" },
    { type: "scandal", text: "Скандал с конкурентами! Ваша репутация под угрозой.", effect: "reputation", value: -60, severity: "high" },
    { type: "investment", text: "Привлечены новые инвестиции! Бюджет пополнен.", effect: "budget", value: 300, severity: "medium" } // Снижен бонус
  ],
  officeLevels: [
    { level: 1, name: "Гараж", description: "Начало пути. +$20 в день.", cost: 0 }, // Снижен пассивный доход
    { level: 2, name: "Коворкинг", description: "Уже лучше. +$50 в день.", cost: 850 }, // Снижен пассивный доход
    { level: 3, name: "Свой Офис", description: "Собственное пространство! +$100 в день.", cost: 2200 } // Снижен пассивный доход
  ],
  careerLevels: [
    { level: 1, name: "Фрилансер", incomeMultiplier: 1.05, requirements: { reputation: 0, followers: 0 } },
    { level: 2, name: "Менеджер", incomeMultiplier: 1.2, requirements: { reputation: 100, followers: 400 } }, // Снижен множитель
    { level: 3, name: "Владелец агентства", incomeMultiplier: 1.5, requirements: { reputation: 200, followers: 800 } } // Снижен множитель
  ],
  talentTree: {
    digital: [
      { id: 1, name: "Таргет. реклама", cost: 1, effect: "+15% к эффективности Digital-кампаний", requires: [] },
      { id: 2, name: "SMM экспертиза", cost: 2, effect: "+25% к росту подписчиков от всех источников", requires: [1] },
      { id: 3, name: "Performance маркетинг", cost: 3, effect: "Успешные проекты приносят на 20% больше денег", requires: [2] }
    ],
    btl: [
      { id: 4, name: "Организация ивентов", cost: 1, effect: "+20% к росту удовлетворенности от всех источников", requires: [] },
      { id: 5, name: "Промо-акции", cost: 2, effect: "+30% к охвату BTL-акций", requires: [4] },
      { id: 6, name: "Мерчандайзинг", cost: 3, effect: "+25% к росту репутации от BTL-акций", requires: [5] }
    ],
    atl: [
      { id: 7, name: "Медиапланирование", cost: 1, effect: "+15% к эффективности ATL-кампаний", requires: [] },
      { id: 8, name: "ТВ-реклама", cost: 2, effect: "+35% к охвату ATL-кампаний", requires: [7] },
      { id: 9, name: "Бренд-менеджмент", cost: 3, effect: "+30% к росту репутации от всех источников", requires: [8] }
    ]
  }
};
