const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add AsyncStorage resolution
config.resolver.sourceExts = [...config.resolver.sourceExts, 'sql'];

module.exports = withNativeWind(config, { input: './global.css' })