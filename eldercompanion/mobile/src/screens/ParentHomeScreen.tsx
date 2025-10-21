import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationParamList } from '../types';
import { getStoredUser, checkAPIHealth } from '../services/api';

type ParentHomeScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'ParentHome'>;
};

const ParentHomeScreen: React.FC<ParentHomeScreenProps> = ({ navigation }) => {
  const [userName, setUserName] = useState<string>('');
  const [isAPIHealthy, setIsAPIHealthy] = useState<boolean>(true);

  useEffect(() => {
    loadUserData();
    checkAPI();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getStoredUser();
      if (user) {
        setUserName(user.full_name);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkAPI = async () => {
    const healthy = await checkAPIHealth();
    setIsAPIHealthy(healthy);
    if (!healthy) {
      Alert.alert(
        'Connection Issue',
        'Unable to connect to the server. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleStartConversation = async () => {
    if (!isAPIHealthy) {
      Alert.alert(
        'No Connection',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const user = await getStoredUser();
      if (user) {
        navigation.navigate('VoiceChat', { userId: user.id });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{userName || 'Friend'}</Text>
          <Text style={styles.subtitle}>
            I'm here to chat and keep you company
          </Text>
        </View>

        {/* Main action button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.startButton,
              !isAPIHealthy && styles.startButtonDisabled,
            ]}
            onPress={handleStartConversation}
            activeOpacity={0.8}
            disabled={!isAPIHealthy}
          >
            <Text style={styles.startButtonText}>Start Conversation</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Tap the button above to start talking with me
          </Text>
        </View>

        {/* Info cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>💬</Text>
            <Text style={styles.infoCardText}>Natural Conversation</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>🎯</Text>
            <Text style={styles.infoCardText}>Activity Suggestions</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>❤️</Text>
            <Text style={styles.infoCardText}>Emotional Support</Text>
          </View>
        </View>

        {/* Connection status */}
        {!isAPIHealthy && (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>⚠️ Offline - Check Connection</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '400',
    color: '#666666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#888888',
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  startButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 280,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hint: {
    marginTop: 16,
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  infoCardTitle: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  statusBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFA726',
    padding: 12,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ParentHomeScreen;
