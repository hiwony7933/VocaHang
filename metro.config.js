const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ["jsx", "js", "ts", "tsx", "json"];
config.transformer.unstable_allowRequireContext = true;

// Disable Hermes for web platform
config.transformer.unstable_transformProfile =
  process.env.PLATFORM === "web" ? undefined : "hermes-stable";

module.exports = config;
