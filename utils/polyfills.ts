import 'react-native-url-polyfill/auto';

// Ensure global.location exists if web checks run
if (typeof global !== 'undefined' && !global.location) {
  // @ts-ignore
  global.location = { protocol: 'http:' };
}
