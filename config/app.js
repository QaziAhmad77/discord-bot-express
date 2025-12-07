/**
 * Application configuration
 */
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  discord: {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
  },
};
