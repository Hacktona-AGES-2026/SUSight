/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "PulseWidgets",
  displayName: "SUSight",
  deploymentTarget: "17.0",
  bundleIdentifier: ".widgets",
  // Mesmo App Group do app, onde src/widgets/sync.ts grava o retrato.
  entitlements: {
    "com.apple.security.application-groups":
      config.ios.entitlements["com.apple.security.application-groups"],
  },
});
