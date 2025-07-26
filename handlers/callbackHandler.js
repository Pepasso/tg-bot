bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const command = query.data;

  switch (command) {
    case 'find_command':
      bot.deleteMessage(chatId, query.message.message_id);
      currentPage = 0; // Сброс пагинации
      showCategoryKeyboard(chatId);
      // showBrandsPage(chatId, 0);
      break;

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // Обработка пагинации
  if (data.startsWith('page_')) {
    const page = parseInt(data.split('_')[1]);
    currentPage = page;
    bot.deleteMessage(chatId, query.message.message_id);
    showBrandsPage(chatId, page);
  }

  // Обработка пагинации сервисов
