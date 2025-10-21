import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
  Text,
  Vibration,
} from 'react-native';
import { VoiceState } from '../types';

interface VoiceButtonProps {
  voiceState: VoiceState;
  onPress: () => void;
  disabled?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  voiceState,
  onPress,
  disabled = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (voiceState.isListening || voiceState.isSpeaking) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      // Reset animation
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.3);
    }
  }, [voiceState.isListening, voiceState.isSpeaking]);

  const handlePress = () => {
    if (!disabled) {
      // Haptic feedback
      Vibration.vibrate(50);
      onPress();
    }
  };

  const getButtonColor = () => {
    if (disabled) return '#CCCCCC';
    if (voiceState.isSpeaking) return '#4CAF50'; // Green when AI is speaking
    if (voiceState.isListening) return '#2196F3'; // Blue when listening
    if (voiceState.isProcessing) return '#FF9800'; // Orange when processing
    return '#2196F3'; // Default blue
  };

  const getButtonText = () => {
    if (voiceState.isSpeaking) return 'Speaking...';
    if (voiceState.isListening) return 'Listening...';
    if (voiceState.isProcessing) return 'Processing...';
    return 'Tap to Talk';
  };

  return (
    <View style={styles.container}>
      {/* Pulsing ring */}
      {(voiceState.isListening || voiceState.isSpeaking) && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: getButtonColor(),
              opacity: opacityAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* Main button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: getButtonColor(),
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {voiceState.isListening && (
            <View style={styles.micIcon}>
              <View style={styles.micBody} />
              <View style={styles.micBase} />
            </View>
          )}
          {voiceState.isSpeaking && (
            <View style={styles.soundWaves}>
              <View style={[styles.soundWave, styles.soundWave1]} />
              <View style={[styles.soundWave, styles.soundWave2]} />
              <View style={[styles.soundWave, styles.soundWave3]} />
            </View>
          )}
          {voiceState.isProcessing && (
            <View style={styles.processingDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          )}
          {!voiceState.isListening &&
            !voiceState.isSpeaking &&
            !voiceState.isProcessing && (
              <View style={styles.micIcon}>
                <View style={styles.micBody} />
                <View style={styles.micBase} />
              </View>
            )}
        </View>
      </TouchableOpacity>

      {/* Status text */}
      <Text style={styles.statusText}>{getButtonText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBody: {
    width: 30,
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 5,
  },
  micBase: {
    width: 50,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  soundWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundWave: {
    width: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginHorizontal: 3,
  },
  soundWave1: {
    height: 30,
  },
  soundWave2: {
    height: 50,
  },
  soundWave3: {
    height: 35,
  },
  processingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  statusText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
});

export default VoiceButton;
