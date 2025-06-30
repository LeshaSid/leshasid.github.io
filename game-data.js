// game-data.js
const marketingGameData = {
  days: 25, // Увеличена продолжительность для большего развития
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
    { id: 1, name: "Платная реклама", baseCost: 50, keywords: ["вирус", "хайп", "подрост"], effect: "followers", baseValue: 20, type: "digital", effectDescription: "👥 Подписчики" },
    { id: 2, name: "Баннер на остановке", baseCost: 30, keywords: ["местн", "уличн"], effect: "reputation", baseValue: 15, type: "btl", effectDescription: "⭐ Репутация" },
    { id: 3, name: "Бартер с блогерами", baseCost: 70, keywords: ["блогер", "подрост"], effect: "followers", baseValue: 35, type: "digital", communicable: true, effectDescription: "👥 Подписчики" },
    { id: 4, name: "Вирусный ролик", baseCost: 100, keywords: ["вирус", "хайп"], effect: "both", baseValue: 30, type: "digital", creative: true, effectDescription: "📈 Репутация + 👥 Подписчики" },
    { id: 5, name: "Плакаты в лифтах", baseCost: 40, keywords: ["местн", "повседнев"], effect: "reputation", baseValue: 18, type: "btl", effectDescription: "⭐ Репутация" },
    { id: 6, name: "Уличный перфоманс", baseCost: 25, keywords: ["креатив", "эмоц"], effect: "satisfaction", baseValue: 20, type: "btl", creative: true, effectDescription: "😊 Удовлетворенность" },
    { id: 7, name: "Флешмоб в ТЦ", baseCost: 60, keywords: ["массов", "подрост"], effect: "followers", baseValue: 25, type: "btl", effectDescription: "👥 Подписчики" },
    { id: 8, name: "Реклама на радио", baseCost: 80, keywords: ["местн", "эмоц"], effect: "reputation", baseValue: 25, type: "atl", effectDescription: "⭐ Репутация" },
    { id: 9, name: "Email-рассылка", baseCost: 30, keywords: ["таргет", "b2b"], effect: "satisfaction", baseValue: 15, type: "digital", analytical: true, effectDescription: "😊 Удовлетворенность" },
    { id: 10, name: "Коллаборация", baseCost: 120, keywords: ["инфлюенсер", "хайп"], effect: "both", baseValue: 40, type: "digital", communicable: true, effectDescription: "📈 Репутация + 👥 Подписчики" }
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
      payment: 400
    },
    { 
      id: 2, 
      name: "Анна Ковалева", 
      type: "startup", 
      description: "Основатель IT-стартапа", 
      story: "Инновационный продукт, но нет узнаваемости. Нужны креативные и вирусные решения.",
      preferences: ["технологи", "инновац", "вирус"],
      satisfaction: 50,
      payment: 1200
    },
    { 
      id: 3, 
      name: "Дмитрий Соколов", 
      type: "corporate", 
      description: "Менеджер по маркетингу", 
      story: "Бюрократическая система, строгий бюджет. Нужны безопасные и проверенные решения.",
      preferences: ["престиж", "b2b", "репутация"],
      satisfaction: 50,
      payment: 2500
    }
  ],
  events: [
    { type: "inflation", text: "Рыночные колебания! Инфляция немного подросла.", effect: "cost", value: 0.05 },
    { type: "boom", text: "Бум в отрасли! Вы получили грант.", effect: "budget", value: 150 },
    { type: "crisis", text: "Кризис в медиа! Репутация немного пострадала.", effect: "reputation", value: -10 },
    { type: "viral", text: "Ваш старый проект внезапно стал вирусным!", effect: "followers", value: 50 },
    { type: "bonus", text: "Вы посетили конференцию и получили бонус 'Креативное мышление'", effect: "skill", value: "creativity" }
  ],
  officeLevels: [
    { level: 1, name: "Гараж", description: "Начало пути. +$5 в день.", cost: 0 },
    { level: 2, name: "Коворкинг", description: "Уже лучше. +$15 в день.", cost: 800 },
    { level: 3, name: "Свой Офис", description: "Собственное пространство! +$30 в день.", cost: 2000 }
  ],
  careerLevels: [
    { level: 1, name: "Фрилансер", incomeMultiplier: 1.0, requirements: { reputation: 0, followers: 0 } },
    { level: 2, name: "Менеджер", incomeMultiplier: 1.2, requirements: { reputation: 50, followers: 150 } },
    { level: 3, name: "Владелец агентства", incomeMultiplier: 1.5, requirements: { reputation: 85, followers: 400 } }
  ],
  talentTree: {
    digital: [
      { id: 1, name: "Таргет. реклама", cost: 1, effect: "+10% к эффективности Digital-кампаний", requires: [] },
      { id: 2, name: "SMM экспертиза", cost: 2, effect: "+20% к росту подписчиков от всех источников", requires: [1] },
      { id: 3, name: "Performance маркетинг", cost: 3, effect: "Успешные проекты приносят на 15% больше денег", requires: [2] }
    ],
    btl: [
      { id: 4, name: "Организация ивентов", cost: 1, effect: "+15% к росту удовлетворенности от всех источников", requires: [] },
      { id: 5, name: "Промо-акции", cost: 2, effect: "+25% к охвату BTL-акций", requires: [4] },
      { id: 6, name: "Мерчандайзинг", cost: 3, effect: "+20% к росту репутации от BTL-акций", requires: [5] }
    ],
    atl: [
      { id: 7, name: "Медиапланирование", cost: 1, effect: "+10% к эффективности ATL-кампаний", requires: [] },
      { id: 8, name: "ТВ-реклама", cost: 2, effect: "+30% к охвату ATL-кампаний", requires: [7] },
      { id: 9, name: "Бренд-менеджмент", cost: 3, effect: "+25% к росту репутации от всех источников", requires: [8] }
    ]
  }
};