import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { NavigationParamList, ConversationMessage, VoiceState } from '../types';
import VoiceButton from '../components/VoiceButton';
import openAIRealtimeService from '../services/openai-realtime';
import { createConversation, updateConversation } from '../services/api';
import { Audio } from 'expo-av';

type VoiceChatScreenProps = {
  navigation: NativeStackNavigationProp<NavigationParamList, 'VoiceChat'>;
  route: RouteProp<NavigationParamList, 'VoiceChat'>;
};

const VoiceChatScreen: React.FC<VoiceChatScreenProps> = ({ navigation, route }) => {
  const { userId } = route.params;

  const [transcript, setTranscript] = useState<ConversationMessage[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const recording = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    requestPermissions();
    setupAudio();

    // Set up event listeners
    openAIRealtimeService.onTranscriptUpdate = handleTranscriptUpdate;
    openAIRealtimeService.onVoiceStateChange = handleVoiceStateChange;
    openAIRealtimeService.onError = handleError;
    openAIRealtimeService.onAudioResponse = handleAudioResponse;

    return () => {
      // Cleanup
      cleanupSession();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'ElderCompanion needs access to your microphone for voice chat',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Microphone access is required for voice conversations. Please enable it in Settings.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (err) {
        console.error('Permission error:', err);
      }
    }
  };

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const handleStartSession = async () => {
    try {
      setIsSessionActive(true);

      // Create conversation in database
      const conversation = await createConversation();
      setConversationId(conversation.id);

      // Initialize OpenAI service
      await openAIRealtimeService.initialize();
      await openAIRealtimeService.startConversation();

      // Start recording
      await startRecording();
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.', [
        { text: 'OK' },
      ]);
      setIsSessionActive(false);
    }
  };

  const handleEndSession = async () => {
    Alert.alert(
      'End Conversation',
      'Are you sure you want to end this conversation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            await cleanupSession();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const cleanupSession = async () => {
    try {
      // Stop recording
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        recording.current = null;
      }

      // End OpenAI session
      const finalTranscript = await openAIRealtimeService.endConversation();

      // Save conversation to database
      if (conversationId && finalTranscript.length > 0) {
        const startTime = new Date(finalTranscript[0].timestamp);
        const endTime = new Date(finalTranscript[finalTranscript.length - 1].timestamp);
        const durationSeconds = Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000
        );

        await updateConversation(conversationId, {
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
          transcript: finalTranscript,
        });
      }

      setIsSessionActive(false);
    } catch (error) {
      console.error('Error cleaning up session:', error);
    }
  };

  const startRecording = async () => {
    try {
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;

      // Set up recording data callback
      recording.current.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          // Handle recording data
          // Note: In production, you would stream this to OpenAI
        }
      });
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleTranscriptUpdate = (newTranscript: ConversationMessage[]) => {
    setTranscript(newTranscript);
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleVoiceStateChange = (newState: VoiceState) => {
    setVoiceState(newState);
  };

  const handleError = (error: Error) => {
    console.error('OpenAI service error:', error);
    Alert.alert('Error', error.message, [{ text: 'OK' }]);
  };

  const handleAudioResponse = async (audioData: ArrayBuffer) => {
    try {
      // Play audio response
      // Note: In production, implement proper audio playback
      console.log('Received audio data:', audioData.byteLength, 'bytes');
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Chat</Text>
        {isSessionActive && (
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndSession}
          >
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transcript */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.transcriptContainer}
        contentContainerStyle={styles.transcriptContent}
      >
        {transcript.length === 0 && !isSessionActive && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Tap the button below to start a conversation
            </Text>
          </View>
        )}

        {transcript.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.role === 'user'
                ? styles.userMessageContainer
                : styles.assistantMessageContainer,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? styles.userMessageBubble
                  : styles.assistantMessageBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user'
                    ? styles.userMessageText
                    : styles.assistantMessageText,
                ]}
              >
                {message.content}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.role === 'user'
                    ? styles.userMessageTime
                    : styles.assistantMessageTime,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Voice Button */}
      <View style={styles.voiceButtonContainer}>
        {!isSessionActive ? (
          <TouchableOpacity
            style={styles.startSessionButton}
            onPress={handleStartSession}
          >
            <Text style={styles.startSessionButtonText}>
              Start Conversation
            </Text>
          </TouchableOpacity>
        ) : (
          <VoiceButton
            voiceState={voiceState}
            onPress={() => {
              // Handle tap to talk
              console.log('Voice button pressed');
            }}
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  endButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F44336',
    borderRadius: 8,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptContainer: {
    flex: 1,
  },
  transcriptContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  assistantMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#1A1A1A',
  },
  messageTime: {
    fontSize: 12,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  assistantMessageTime: {
    color: '#999999',
  },
  voiceButtonContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  startSessionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 50,
    minWidth: 250,
    alignItems: 'center',
  },
  startSessionButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default VoiceChatScreen;
