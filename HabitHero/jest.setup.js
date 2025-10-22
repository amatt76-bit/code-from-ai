/**
 * Jest Setup File
 * Configures the test environment before running tests
 */

// Mock OP-SQLite
jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(),
    executeAsync: jest.fn(),
    executeBatch: jest.fn(),
    close: jest.fn(),
  })),
}));

// Mock Notifee
jest.mock('@notifee/react-native', () => ({
  createChannel: jest.fn(),
  displayNotification: jest.fn(),
  cancelNotification: jest.fn(),
  requestPermission: jest.fn(() => Promise.resolve({ authorizationStatus: 1 })),
  onBackgroundEvent: jest.fn(),
  onForegroundEvent: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  createNavigationContainerRef: jest.fn(),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  PanGestureHandler: ({ children }) => children,
  State: {},
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock UUID
jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234-5678-90ab-cdef'),
}));

// Suppress console warnings in tests (optional)
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Set timezone for consistent date testing
process.env.TZ = 'UTC';
