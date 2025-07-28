// Начинаем пошаговый рефакторинг, с сохранением всей логики.
// Первый этап — вынос всех данных и конфигураций

const TelegramBot = require('node-telegram-bot-api');
const sqlite = require('sqlite-sync');
const config = require('./config.json');
const cron = require('node-cron');
const fs = require('fs');

// Подключение базы данных
sqlite.connect(config.db);

// Основные константы
const token = config.token;
const admin = config.admin;
const bot = new TelegramBot(token, {
  polling: true,
  filepath: false
});

// Импорты вспомогательных модулей (будем выносить)
const {
  allowedTables,
  allowedServices,
  allowedLawyers,
  CARS_PER_PAGE,
  SERVICES_PER_PAGE,
  LAWYERS_PER_PAGE
} = require('./core/constants');

const {
  initBotMenus,
  registerMessageHandlers,
  registerCallbackHandlers,
  registerAdminCommands
} = require('./core/initHandlers');

// Состояние (будет храниться в памяти — лучше вынести в хранилище позже)
const state = {};

// Инициализация стартового меню
initBotMenus(bot);

// Обработчики коллбэков и сообщений
registerCallbackHandlers(bot, state);
registerMessageHandlers(bot, state);

// Админские команды
if (admin) {
  registerAdminCommands(bot);
}

// Расписание задач (оставлено для будущей активации)
// cron.schedule('59 23 * * *', () => { /* статистика */ });