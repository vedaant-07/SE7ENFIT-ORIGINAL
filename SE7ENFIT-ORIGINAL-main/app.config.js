const appJson = require('./app.json');

const config = {
  ...appJson,
  expo: {
    ...appJson.expo,
    // Reanimated and Worklets in the current Expo/React Native stack require
    // the new architecture in native Android builds.
    newArchEnabled: true,
  },
};

module.exports = config;
