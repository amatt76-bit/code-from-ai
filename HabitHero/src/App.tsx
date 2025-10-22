import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

// Import navigation
import RootNavigator from '@navigation/RootNavigator';

// Import services
import { initializeDatabase } from '@database/schema';
import { initializeNotifications } from '@services/NotificationService';
import { startMidnightResetService } from '@services/MidnightResetService';

// Import theme
import { colors } from '@theme/colors';

const App = () => {
  useEffect(() => {
    // Initialize app services
    const initializeApp = async () => {
      try {
        // Initialize database
        await initializeDatabase();
        console.log('✓ Database initialized');

        // Initialize notifications
        await initializeNotifications();
        console.log('✓ Notifications initialized');

        // Start midnight reset service
        startMidnightResetService();
        console.log('✓ Midnight reset service started');
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background.light}
        />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
