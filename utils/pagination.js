function paginateResults(results, page, itemsPerPage) {
  if (!Array.isArray(results)) return [];
  const start = page * itemsPerPage;
  const end = start + itemsPerPage;
  return results.slice(start, end);
}

function buildPaginationButtons(entity, page, totalItems, identifier, itemsPerPage) {
  const buttons = [];
  if (page > 0) {
    buttons.push({
      text: '⬅️ Назад',
      callback_data: `${identifier}_page_${page - 1}_${entity}`
    });
  }
  if ((page + 1) * itemsPerPage < totalItems) {
    buttons.push({
      text: 'Вперед ➡️',
      callback_data: `${identifier}_page_${page + 1}_${entity}`
    });
  }
  return buttons;
}

module.exports = {
  paginateResults,
  buildPaginationButtons
};
