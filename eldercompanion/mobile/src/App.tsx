import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationParamList } from './types';
import ParentHomeScreen from './screens/ParentHomeScreen';
import VoiceChatScreen from './screens/VoiceChatScreen';

const Stack = createNativeStackNavigator<NavigationParamList>();

const App: React.FC = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="ParentHome"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="ParentHome"
            component={ParentHomeScreen}
            options={{
              title: 'Home',
            }}
          />
          <Stack.Screen
            name="VoiceChat"
            component={VoiceChatScreen}
            options={{
              title: 'Voice Chat',
              gestureEnabled: false, // Prevent accidental swipe back during conversation
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
