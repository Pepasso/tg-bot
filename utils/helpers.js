          await delay(2000); // Задержка 2 секунды
        }

        await bot.sendMessage(chatId, `✅ Найдены сервисы для ${originalServiceKey}:\n\n${otherServicesList}`, {
          parse_mode: 'HTML',
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* function processCarDetailInput(chatId, detail, step) {
  if (step == 1) {
    bot.sendMessage(chatId, 'Теперь укажите деталь вашей машины:');
  } else if (step == 2) {
    const modelData = model;
    bot.sendMessage(chatId, 'Предлагаем вам связаться с одним из ниже перечисленных номеров:')
      .then(() => {
        if (modelData && modelData.length > 0) {
          return Promise.all(modelData.map(element => {
            const name = element.name ? element.name : 'не указано';
            const address = element.address ? element.address : 'не указано';
            const message = `Название компании: ${name},\nАдрес компании: ${address},\nНомер компании: ${element.key}`;
            return bot.sendMessage(chatId, message);
          }));
        }
      })
      .catch((error) => {
        console.log('Произошла ошибка при отправке сообщения:', error);
      });
  } else {
    bot.sendMessage(chatId, 'Можете связаться с одним из ниже перечисленных номеров:')
      .then(() => bot.sendMessage(chatId, '(тестовый номер)'))
      .catch((error) => {
        console.log('Произошла ошибка при отправке сообщения:', error);
      });
  }

  delete addMode[chatId]; // Предполагая, что 'addMode' - это структура данных для отслеживания состояния
} */