import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { colors } from '../styles/colors';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/global';

interface RecordButtonProps {
  onStateChange: (state: 'idle' | 'connecting' | 'recording') => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ onStateChange }) => {
  const [state, setState] = useState<'idle' | 'connecting' | 'recording'>('idle');
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;
  
  const rotateAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const scaleAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const pulseAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const connectingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (connectingTimer.current) {
        clearTimeout(connectingTimer.current);
      }
      rotateAnimation.current?.stop();
      scaleAnimation.current?.stop();
      pulseAnimation.current?.stop();
    };
  }, []);

  const startConnectingAnimation = () => {
    // Rotation animation
    rotateAnimation.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    rotateAnimation.current.start();

    // Scale pulse animation
    scaleAnimation.current = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.08,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
      }),
    ]);
    scaleAnimation.current.start();

    // Blue pulse rings
    pulseAnimation.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim1, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(pulseAnim2, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(pulseAnim3, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim3, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseAnimation.current.start();
  };

  const startRecordingAnimation = () => {
    // Stop connecting animations
    rotateAnimation.current?.stop();
    scaleAnimation.current?.stop();
    pulseAnimation.current?.stop();
    
    // Reset animations
    rotateAnim.setValue(0);
    scaleAnim.setValue(1);
    pulseAnim1.setValue(0);
    pulseAnim2.setValue(0);
    pulseAnim3.setValue(0);

    // Gentle pulse for recording
    scaleAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    scaleAnimation.current.start();

    // Red pulse rings for recording
    pulseAnimation.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim1, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(666),
          Animated.timing(pulseAnim2, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(1333),
          Animated.timing(pulseAnim3, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim3, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseAnimation.current.start();
  };

  const stopAllAnimations = () => {
    rotateAnimation.current?.stop();
    scaleAnimation.current?.stop();
    pulseAnimation.current?.stop();
    
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim1, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim2, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim3, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (state === 'idle') {
      setState('connecting');
      onStateChange('connecting');
      startConnectingAnimation();
      
      // After 3 seconds, switch to recording
      connectingTimer.current = setTimeout(() => {
        setState('recording');
        onStateChange('recording');
        startRecordingAnimation();
        
        // Haptic feedback when recording starts
        if (Platform.OS !== 'web') {
          // Haptic feedback would be added here
        }
      }, 3000);
    } else if (state === 'recording') {
      if (connectingTimer.current) {
        clearTimeout(connectingTimer.current);
      }
      setState('idle');
      onStateChange('idle');
      stopAllAnimations();
    } else if (state === 'connecting') {
      // Cancel connecting
      if (connectingTimer.current) {
        clearTimeout(connectingTimer.current);
      }
      setState('idle');
      onStateChange('idle');
      stopAllAnimations();
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getButtonColor = () => {
    switch (state) {
      case 'recording':
        return colors.recordingRed;
      case 'connecting':
        return colors.connectingBlue;
      default:
        return colors.primary;
    }
  };

  const getPulseColor = () => {
    return state === 'recording' ? colors.recordingRed : colors.connectingBlue;
  };

  return (
    <View style={styles.container}>
      {/* Pulse rings */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulseAnim1.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 0],
            }),
            transform: [
              {
                scale: pulseAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.5],
                }),
              },
            ],
            borderColor: getPulseColor(),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulseAnim2.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 0],
            }),
            transform: [
              {
                scale: pulseAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.5],
                }),
              },
            ],
            borderColor: getPulseColor(),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulseAnim3.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0],
            }),
            transform: [
              {
                scale: pulseAnim3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.5],
                }),
              },
            ],
            borderColor: getPulseColor(),
          },
        ]}
      />

      {/* Main button */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: state === 'connecting' ? rotation : '0deg' },
            ],
          },
        ]}
      >
        <Pressable onPress={handlePress} style={styles.button}>
          <View style={[styles.buttonInner, { backgroundColor: getButtonColor() }]}>
            {state === 'recording' ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={styles.micIcon} />
            )}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    ...shadows.elevated,
  },
  buttonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    width: 24,
    height: 32,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
});