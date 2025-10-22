import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import navigation
import RootNavigator from '@navigation/RootNavigator';

// Import services
import { initializeDatabase } from '@database/schema';
import { seedInitialData } from '@database/seeders/initialData';
import { initializeNotifications } from '@services/NotificationService';
import { startMidnightResetService } from '@services/MidnightResetService';

// Import stores
import { initializeStores } from '@store';

// Import theme
import { colors } from '@theme';

const App = () => {
  useEffect(() => {
    // Initialize app services
    const initializeApp = async () => {
      try {
        // Initialize database with migrations
        await initializeDatabase();
        console.log('✓ Database initialized');

        // Seed initial data (user, achievements, etc.)
        await seedInitialData();
        console.log('✓ Initial data seeded');

        // Initialize Zustand stores (load data into state)
        await initializeStores();
        console.log('✓ Stores initialized');

        // Initialize notifications
        await initializeNotifications();
        console.log('✓ Notifications initialized');

        // Start midnight reset service
        startMidnightResetService();
        console.log('✓ Midnight reset service started');

        console.log('🎉 App initialization complete!');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <RootNavigator />
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
