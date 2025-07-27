// core/initHandlers.js

const {
  registerStartCommand
} = require('../handlers/startHandler');
const {
  registerCallbackHandler
} = require('../handlers/callbackHandler');
const {
  registerMessageHandler
} = require('../handlers/messageHandler');
const {
  registerAdminCommands
} = require('../handlers/adminHandler');

function initBotMenus(bot) {
  bot.setMyCommands([{
      command: '/start',
      description: 'Главное меню'
    },
    {
      command: '/list',
      description: 'Список записей (только админ)'
    },
    {
      command: '/add',
      description: 'Добавить запись (только админ)'
    },
    {
      command: '/remove',
      description: 'Удалить запись (только админ)'
    },
  ]);
}

function registerCallbackHandlers(bot, state) {
  registerCallbackHandler(bot, state);
}

function registerMessageHandlers(bot, state) {
  registerMessageHandler(bot, state);
  registerStartCommand(bot, state);
}

module.exports = {
  initBotMenus,
  registerCallbackHandlers,
  registerMessageHandlers,
  registerAdminCommands
};