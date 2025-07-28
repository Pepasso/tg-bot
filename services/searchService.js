// services/searchService.js

const sqlite = require('sqlite-sync');
const {
  allowedTables
} = require('../core/constants');

function findModel(key, selectedCarCategory, selectedFresh, isPaidOnly = false) {
  const sanitizedKey = allowedTables.includes(key) ? key : null;
  let carCategoryTable = '';
  if (selectedCarCategory === 0) {
    carCategoryTable = 'carParts';
  } else if (selectedCarCategory === 1) {
    carCategoryTable = 'motoParts';
  } else if (selectedCarCategory === 3) {
    carCategoryTable = 'gruzParts';
  } else if (selectedCarCategory === 4) {
    carCategoryTable = 'commerParts';
  } else if (selectedCarCategory === 5) {
    carCategoryTable = 'specParts';
  }
  if (sanitizedKey) {
    let query = `SELECT key, address, name, image, chatUsername FROM ${carCategoryTable} WHERE ${sanitizedKey} = 1`;

    if (selectedCarCategory !== null && selectedCarCategory !== undefined) {
      const parsedCategory = parseInt(selectedCarCategory);
      if (!isNaN(parsedCategory)) {
        query += ` AND (whatType LIKE '%,${parsedCategory},%'
                          OR whatType LIKE '${parsedCategory},%'
                          OR whatType LIKE '%,${parsedCategory}'
                          OR whatType = '${parsedCategory}')`;
      }
    }

    if (selectedFresh !== null && selectedFresh !== undefined) {
      if (parseInt(selectedFresh) === 1) {
        query += ` AND isPartNew = ${parseInt(selectedFresh)}`;
      } else if (parseInt(selectedFresh) === 2) {
        query += ` AND isPartContract = ${parseInt(selectedFresh)}`;
      } else if (parseInt(selectedFresh) === 3) {
        query += ` AND isPartUsed = ${parseInt(selectedFresh)}`;
      }
    }

    if (isPaidOnly) {
      query += ` AND isPayd = 1`;
    } else {
      query += ` AND isPayd = 0`;
    }

    try {
      const results = sqlite.run(query);
      return results || [];
    } catch (err) {
      console.error("Ошибка при выполнении запроса:", err.message);
      return false;
    }
  } else {
    console.error("Недопустимое значение ключа:", key);
    return false;
  }
}

function findService(key, serviceTypeOrg, serviceRegion, isPaidOnly = false) {
  if (key) {
    let query = `SELECT key, address, image, additional, chatUsername, name FROM service WHERE ${key} = 1`;

    if (serviceTypeOrg !== null && serviceTypeOrg !== undefined) {
      const parsedCategory = parseInt(serviceTypeOrg);
      if (!isNaN(parsedCategory)) {
        query += ` AND (is_organization = '2' OR is_organization = '${parsedCategory}')`;
      }
    }

    if (serviceRegion !== null && serviceRegion !== undefined) {
      const parsedCategory = parseInt(serviceRegion);
      if (!isNaN(parsedCategory)) {
        query += ` AND (
          region = '${parsedCategory}' OR
          (',' || region || ',') LIKE '%,${parsedCategory},%'
        )`;
      }
    }

    query += isPaidOnly ? ` AND isPayd = 1` : ` AND isPayd = 0`;

    try {
      const results = sqlite.run(query);
      return results || [];
    } catch (err) {
      console.error("Ошибка при выполнении запроса:", err.message);
      return false;
    }
  } else {
    return false;
  }
}


function findLawyer(key, isPaidOnly = false) {
  if (key) {
    let query = `SELECT key, address, image, additional, chatUsername, name FROM lawyer WHERE ${key} = 1`;
    query += isPaidOnly ? ` AND isPayd = 1` : ` AND isPayd = 0`;

    try {
      const results = sqlite.run(query);
      return results || [];
    } catch (err) {
      console.error("Ошибка при выполнении запроса:", err.message);
      return false;
    }
  } else {
    return false;
  }
}

function findProductByType(type) {
  try {
    const query = `SELECT * FROM products WHERE type = ? ORDER BY id DESC`;
    const results = sqlite.run(query, [type]);
    return results || [];
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    return [];
  }
}

function findSellCars(type) {
  // This function is not implemented in the old code, so I'll leave it empty for now.
  return [];
}

module.exports = {
  findModel,
  findLawyer,
  findProductByType,
  findService,
  findSellCars
};