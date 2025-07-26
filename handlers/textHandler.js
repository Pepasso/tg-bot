const TelegramBot = require('node-telegram-bot-api');
const sqlite = require('sqlite-sync');
const config = require('./config.json');
const cron = require('node-cron');
//import('.add-db.js');
//import('.add-numbers.js');
//Connecting - if the file does not exist it will be created

sqlite.connect(config.db);

// replace the value below with the Telegram token you receive from @BotFather
const token = config.token;
const admin = config.admin;
const allowedTables = [
  'Acura',
  'AlfaRomeo',
  'AstonMartin',
  'Audi',
  'Bentley',
  'BMW',
  'Bugatti',
  'Buick',
  'Cadillac',
  'Canoo',
  'Chevrolet',
  'Chrysler',
  'DeLorean',
  'Dodge',
  'Ferrari',
  'Fiat',
  'Fisker',
  'Ford',
  'Genesis',
  'GMC',
  'Honda',
  'Hummer',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Karma',
  'Kia',
  'Lamborghini',
  'LandRover',
  'Lexus',
  'Lincoln',
  'Lotus',
  'Maserati',
  'Maybach',
  'Mazda',
  'McLaren',
  'Mercedes',
  'Mercury',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Oldsmobile',
  'Polestar',
  'Pontiac',
  'Porsche',
  'Plymouth',
  'Ram',
  'Rivian',
  'RollsRoyce',
  'Saab',
  'Saturn',
  'Scion',
  'Smart',
  'Subaru',
  'Suzuki',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'VinFast',
  'Volvo',
  'Vaz',
  'Volga',
  'Gaz',
  'Gazel',
  'Uaz'
]; // Список разрешенных имен таблиц


const allowedServices = [
  'шиномонтаж',
  'техническое_обслуживание',
  'автозвук',
  'чип_тюнинг',
  'ремонт_подвески',
  'ремонт_генератора',
  'кузовной_ремонт',
  'ремонт_КПП',
  'диагностика',
  'эвакуатор',
  'ремонт_дисков'
];

const allowedLawyers = [
  'независимая_экспертиза',
  'оценка_автомобиля',
  'автоюрист',
  'осаго',
  'авайриные_комиссары'
];

// Добавляем переменные для пагинации
const CARS_PER_PAGE = 10; // Количество машин на странице
let currentPage = 0;
// Добавляем константы для пагинации сервисов
const SERVICES_PER_PAGE = 10; // Количество сервисов на странице
let currentServicePage = 0;
// Добавляем константы для пагинации юристов
const LAWYERS_PER_PAGE = 10; // Количество юристов на странице
let currentLawyersPage = 0;
let selectedCarCategory = null;
let selectedFresh = null;
let sellTCType = '';
let productType = '';
let sellHow = '';
let serviceTypeOrg = null;
let serviceRegion = null;
let lawyerRegion = null;


const bot = new TelegramBot(token, {
  polling: true,
  filepath: false
});

// Выносим логику стартового сообщения в отдельную функцию
function sendMainMenu(chatId, messageIdToDelete = null) {
  // Удаляем предыдущее сообщение если нужно
  if (messageIdToDelete) {
    bot.deleteMessage(chatId, messageIdToDelete).catch(error => {
      console.log('Не удалось удалить сообщение:', error.message);
    });
  }

  const keyboard = {
      bot.on('message', contactHandler);
    } else {
      // Если сообщение не отправлено
      bot.sendMessage(chatId, '❌ Не удалось отправить заявку. Попробуйте позже.', {
