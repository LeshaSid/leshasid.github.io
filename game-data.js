// game-data.js
const marketingGameData = {
  days: 20,
  clientRequests: [
    { id: 1, text: "Нужен вирусный маркетинг для привлечения подростков", keywords: ["вирус", "подрост"] },
    { id: 2, text: "Требуется креативная реклама для местного бизнеса", keywords: ["креатив", "местн"] },
    { id: 3, text: "Как создать массовый хайп вокруг нового продукта?", keywords: ["хайп", "массов"] },
    { id: 4, text: "Нужна эмоциональная реклама для повседневного товара", keywords: ["эмоц", "повседнев"] },
    { id: 5, text: "Требуется престижная реклама для культурного события", keywords: ["престиж", "культ"] },
    { id: 6, text: "Как привлечь местных жителей в новый магазин?", keywords: ["местн", "привлечь"] },
    { id: 7, text: "Нужна инновационная реклама с использованием технологий", keywords: ["инновац", "технологи"] },
    { id: 8, text: "Требуется точный таргетинг для B2B аудитории", keywords: ["таргет", "b2b"] },
    { id: 9, text: "Как создать мем, который станет вирусным?", keywords: ["мем", "вирус"] },
    { id: 10, text: "Нужна массовая акция с участием аудитории", keywords: ["массов", "участие"] }
  ],
  marketingActions: [
    { id: 1, name: "Платная реклама", baseCost: 50, keywords: ["вирус", "хайп", "подрост"], effect: "followers", value: 20, scaling: 1.1 },
    { id: 2, name: "Баннер на остановке", baseCost: 30, keywords: ["местн", "уличн"], effect: "reputation", value: 15, scaling: 1.0 },
    { id: 3, name: "Бартер с блогерами", baseCost: 70, keywords: ["блогер", "подрост"], effect: "followers", value: 25, scaling: 1.2, communicable: true },
    { id: 4, name: "Вирусный ролик", baseCost: 90, keywords: ["вирус", "хайп"], effect: "both", value: 30, scaling: 1.3, creative: true },
    { id: 5, name: "Плакаты в лифтах", baseCost: 40, keywords: ["местн", "повседнев"], effect: "reputation", value: 10, scaling: 0.9 },
    { id: 6, name: "Уличный перфоманс", baseCost: 20, keywords: ["креатив", "эмоц"], effect: "satisfaction", value: 20, scaling: 1.1, creative: true },
    { id: 7, name: "Флешмоб в ТЦ", baseCost: 60, keywords: ["массов", "подрост"], effect: "followers", value: 15, scaling: 1.0 },
    { id: 8, name: "Реклама на радио", baseCost: 50, keywords: ["местн", "эмоц"], effect: "reputation", value: 10, scaling: 0.8 },
    { id: 9, name: "Email-рассылка", baseCost: 30, keywords: ["таргет", "b2b"], effect: "satisfaction", value: 10, scaling: 0.7, analytical: true },
    { id: 10, name: "Коллаборация", baseCost: 80, keywords: ["инфлюенсер", "хайп"], effect: "both", value: 25, scaling: 1.4, communicable: true }
  ],
  clients: [
    { 
      id: 1, 
      name: "Олег Петров", 
      type: "small", 
      description: "Владелец местного магазина", 
      story: "Малый бизнес, пытающийся выжить в условиях кризиса. Нужны недорогие, но эффективные решения.",
      preferences: ["местн", "эконом"],
      satisfaction: 50,
      payment: 300
    },
    { 
      id: 2, 
      name: "Анна Ковалева", 
      type: "startup", 
      description: "Основатель IT-стартапа", 
      story: "Инновационный продукт, но нет узнаваемости. Нужны креативные и вирусные решения.",
      preferences: ["технологи", "инновац"],
      satisfaction: 50,
      payment: 1000
    },
    { 
      id: 3, 
      name: "Дмитрий Соколов", 
      type: "corporate", 
      description: "Менеджер по маркетингу", 
      story: "Бюрократическая система, строгий бюджет. Нужны безопасные и проверенные решения.",
      preferences: ["престиж", "b2b"],
      satisfaction: 50,
      payment: 2000
    }
  ],
  events: [
    { type: "inflation", text: "Инфляция! Цены выросли на 10%", effect: "cost", value: 0.1 },
    { type: "boom", text: "Бум в отрасли! Бюджет увеличен", effect: "budget", value: 50 },
    { type: "crisis", text: "Кризис! Репутация снижена", effect: "reputation", value: -10 },
    { type: "viral", text: "Ваш пост стал вирусным!", effect: "followers", value: 30 },
    { type: "bonus", text: "Получен бонус 'Креативное мышление'", effect: "bonus", value: "creative" }
  ],
  officeLevels: [
    { level: 1, name: "Гараж", description: "Начинаем с малого", cost: 500 },
    { level: 2, name: "Коворкинг", description: "Уже лучше", cost: 1000 },
    { level: 3, name: "Офис", description: "Собственное пространство", cost: 1500 }
  ],
  careerLevels: [
    { level: 1, name: "Фрилансер", incomeMultiplier: 1.0, requirements: { reputation: 30, followers: 50 } },
    { level: 2, name: "Менеджер", incomeMultiplier: 1.3, requirements: { reputation: 60, followers: 100 } },
    { level: 3, name: "Владелец агентства", incomeMultiplier: 1.6, requirements: { reputation: 90, followers: 200 } }
  ],
  talentTree: {
    digital: [
      { id: 1, name: "Таргетированная реклама", cost: 1, effect: "+10% к эффективности digital-кампаний", requires: [] },
      { id: 2, name: "SMM экспертиза", cost: 2, effect: "+20% к росту подписчиков", requires: [1] },
      { id: 3, name: "Performance маркетинг", cost: 3, effect: "+15% к конверсии", requires: [2] }
    ],
    btl: [
      { id: 4, name: "Организация ивентов", cost: 1, effect: "+15% к удовлетворенности клиентов", requires: [] },
      { id: 5, name: "Промо-акции", cost: 2, effect: "+25% к охвату локальных акций", requires: [4] },
      { id: 6, name: "Мерчандайзинг", cost: 3, effect: "+20% к узнаваемости бренда", requires: [5] }
    ],
    atl: [
      { id: 7, name: "Медиапланирование", cost: 1, effect: "+10% к эффективности ATL-кампаний", requires: [] },
      { id: 8, name: "ТВ-реклама", cost: 2, effect: "+30% к охвату", requires: [7] },
      { id: 9, name: "Бренд-менеджмент", cost: 3, effect: "+25% к репутации", requires: [8] }
    ]
  }
};