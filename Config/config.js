const oEnv = {
  dev: {
    PORT: process.env.PORT || 4444
  },
  prod: {
    PORT: process.env.PORT || 8888
  }
};

module.exports = oEnv[process.env.NODE_ENV || 'dev'];
