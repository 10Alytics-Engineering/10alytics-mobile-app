const { withAppDelegate, withXcodeProject } = require('@expo/config-plugins');

const expoModulesImport = 'internal import ExpoModulesCore';
const registrationCall = '    ensureExpoAppDelegateSubscribersRegistered()';
const registrationHelper = `
  private func ensureExpoAppDelegateSubscribersRegistered() {
#if DEBUG
    guard ExpoAppDelegateSubscriberRepository.reactDelegateHandlers.isEmpty else {
      return
    }

    let modulesProvider = ExpoModulesProvider()
    ExpoAppDelegateSubscriberRepository.registerSubscribersFrom(modulesProvider: modulesProvider)
    ExpoAppDelegateSubscriberRepository.registerReactDelegateHandlersFrom(modulesProvider: modulesProvider)
#endif
  }
`;

const withDisableIosDebugDylib = (config) =>
  withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const buildConfigurations = xcodeProject.pbxXCBuildConfigurationSection();

    for (const [key, buildConfiguration] of Object.entries(buildConfigurations)) {
      if (key.endsWith('_comment') || buildConfiguration.name !== 'Debug') {
        continue;
      }

      buildConfiguration.buildSettings = {
        ...buildConfiguration.buildSettings,
        ENABLE_DEBUG_DYLIB: 'NO',
      };
    }

    return config;
  });

const withExpoDevClientRegistrationGuard = (config) =>
  withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      return config;
    }

    let contents = config.modResults.contents;

    if (!contents.includes(expoModulesImport)) {
      contents = contents.replace(
        'internal import Expo\n',
        `internal import Expo\n${expoModulesImport}\n`,
      );
    }

    if (!contents.includes(registrationCall)) {
      contents = contents.replace(
        '  ) -> Bool {\n    let delegate = ReactNativeDelegate()',
        `  ) -> Bool {\n${registrationCall}\n\n    let delegate = ReactNativeDelegate()`,
      );
    }

    if (!contents.includes('ensureExpoAppDelegateSubscribersRegistered() {')) {
      contents = contents.replace('\n  // Linking API\n', `${registrationHelper}\n\n  // Linking API\n`);
    }

    config.modResults.contents = contents;
    return config;
  });

const withIosDevClientFixes = (config) => {
  config = withDisableIosDebugDylib(config);
  config = withExpoDevClientRegistrationGuard(config);
  return config;
};

module.exports = withIosDevClientFixes;
