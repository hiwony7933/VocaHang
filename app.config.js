const pkg = require("./package.json");

// version code는 버전 문자열에서 계산
const getVersionCode = (version) => {
  const [major, minor, patch] = version.split(".").map(Number);
  return major * 10000 + minor * 100 + patch;
};

module.exports = {
  expo: {
    name: "VocaMan",
    slug: "vocaman",
    version: pkg.version,
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    splash: {
      backgroundColor: "#F5F7FA",
    },
    web: {
      favicon: "./assets/images/logo.png",
    },
    android: {
      package: "com.hiwony.vocaman",
      versionCode: getVersionCode(pkg.version),
      permissions: [],
      jsEngine: "hermes",
    },
    extra: {
      eas: {
        projectId: "362c144d-4fb8-4faf-805f-db10f74c5452",
      },
    },
    owner: "joowonlee",
    ios: {
      bundleIdentifier: "com.hiwony.vocaman",
      buildNumber: pkg.version,
    },
  },
};
