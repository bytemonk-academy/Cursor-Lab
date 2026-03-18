const path = require('path');

function createLogger(moduleName) {
  const prefix = `[${moduleName}]`;

  return {
    info: (...args) => {
      console.log(new Date().toISOString(), prefix, '[INFO]', ...args);
    },
    error: (...args) => {
      console.error(new Date().toISOString(), prefix, '[ERROR]', ...args);
    },
  };
}

module.exports = {
  createLogger,
};
