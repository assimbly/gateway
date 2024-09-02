module.exports = {
  __TYPE__: process.env.hasOwnProperty('TYPE') ? process.env.TYPE : 'FULL',
  __KEYSTORE_PWD__: process.env.hasOwnProperty('KEYSTORE_PWD') ? process.env.KEYSTORE_PWD : 'supersecret',
};
