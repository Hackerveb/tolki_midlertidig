import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AudioSession, useRoomContext, LiveKitRoom } from '@livekit/react-native';
import { Room, ConnectionState } from 'livekit-client';
import { LanguageDropdown } from '../components/LanguageDropdown';
import { Language, NavigationParamList } from '../types';
import { defaultSourceLanguage, defaultTargetLanguage, getLanguageByCode } from '../constants/languages';
import { useCredits } from '../hooks/useCredits';
import { useTrackUsage } from '../hooks/useTrackUsage';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLiveKitRoom } from '../hooks/useLiveKitRoom';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';

type MainScreenNavigationProp = StackNavigationProp<NavigationParamList, 'Main'>;

const SettingsIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

// Minimal component to handle room monitoring inside LiveKitRoom
interface RoomMonitorProps {
  recordingState: 'off' | 'connecting' | 'recording';
  sourceLanguage: Language;
  targetLanguage: Language;
  onCreditsDepletedCallback: () => void;
  onStartTracking: (lang1: string, lang2: string) => Promise<void>;
  onStopTracking: () => Promise<void>;
  onRoomReady: (room: Room) => void;
  onRoomConnected: () => void;
}

const RoomMonitor: React.FC<RoomMonitorProps> = ({
  recordingState,
  sourceLanguage,
  targetLanguage,
  onCreditsDepletedCallback,
  onStartTracking,
  onStopTracking,
  onRoomReady,
  onRoomConnected,
}) => {
  const room = useRoomContext();
  const { startTracking, stopTracking, isTracking } = useTrackUsage({
    room,
    onCreditsDepletedCallback,
  });

  // Notify parent when room is ready
  useEffect(() => {
    if (room) {
      console.log('RoomMonitor: Room object received, state:', room.state);
      onRoomReady(room);
    }
  }, [room, onRoomReady]);

  // Monitor room state changes for debugging
  useEffect(() => {
    if (room) {
      console.log('RoomMonitor: Room state changed to:', room.state);

      // Log participants when room is connected
      if (room.state === 'connected') {
        console.log('Room connected! Participants:', room.remoteParticipants.size);
      }
    }
  }, [room?.state]);

  // Listen for room connection event and trigger callback
  useEffect(() => {
    if (!room) return;

    const handleConnectionStateChange = (state: ConnectionState) => {
      console.log('[RoomMonitor] Connection state changed to:', state);
      if (state === ConnectionState.Connected) {
        console.log('[RoomMonitor] Room connected - calling onRoomConnected callback');
        onRoomConnected();
      }
    };

    // Set up listener
    room.on('connectionStateChanged', handleConnectionStateChange);

    // Check if already connected (in case we mounted after connection)
    if (room.state === ConnectionState.Connected) {
      console.log('[RoomMonitor] Room already connected on mount');
      onRoomConnected();
    }

    return () => {
      room.off('connectionStateChanged', handleConnectionStateChange);
    };
  }, [room, onRoomConnected]);

  // Handle tracking based on recording state
  useEffect(() => {
    // Debug log to track state changes
    console.log('[RoomMonitor] Recording state changed:', {
      recordingState,
      roomState: room?.state,
      isTracking,
      willStartTracking: recordingState === 'recording' && room?.state === 'connected' && !isTracking
    });

    if (recordingState === 'recording' && room?.state === 'connected' && !isTracking) {
      // Start tracking when recording begins
      startTracking(sourceLanguage.code, targetLanguage.code);
      onStartTracking(sourceLanguage.code, targetLanguage.code);
    } else if (recordingState === 'off' && isTracking) {
      // Stop tracking when recording ends
      stopTracking();
      onStopTracking();
    }

    // Cleanup: Always stop tracking when component unmounts
    return () => {
      if (isTracking) {
        console.log('[RoomMonitor] Unmounting - stopping tracking');
        stopTracking();
        onStopTracking();
      }
    };
  }, [recordingState, room?.state, isTracking, sourceLanguage, targetLanguage, startTracking, stopTracking, onStartTracking, onStopTracking]);

  return null;
};

export const MainScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [sourceLanguage, setSourceLanguage] = useState<Language>(defaultSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState<Language>(defaultTargetLanguage);
  const [recordingState, setRecordingState] = useState<'off' | 'connecting' | 'recording'>('off');
  const [seconds, setSeconds] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // User and credit system hooks
  const { convexUser } = useCurrentUser();
  const { balance, hasCredits, isLowOnCredits } = useCredits();

  // LiveKit room connection
  const { connectionState, connect, disconnect, isConnecting, isConnected } = useLiveKitRoom({
    languageA: sourceLanguage,
    languageB: targetLanguage,
  });

  // Credit tracking callback
  const handleCreditsDepletedCallback = useCallback(() => {
    // Disconnect from LiveKit room when credits are depleted
    disconnect();
    setRecordingState('off');
    stopAllAnimations();

    // Show alert to user
    Alert.alert(
      'Credits Depleted',
      'Your credits have been depleted. The session has been ended. Please purchase more credits to continue.',
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Buy Credits',
          onPress: () => navigation.navigate('BuyCredits')
        },
      ]
    );
  }, [disconnect, navigation]);

  const handleStartTracking = useCallback(async (lang1: string, lang2: string) => {
    setIsTracking(true);
  }, []);

  const handleStopTracking = useCallback(async () => {
    setIsTracking(false);
  }, []);

  const handleRoomReady = useCallback((newRoom: Room) => {
    roomRef.current = newRoom;
  }, []);

  const handleRoomConnected = useCallback(() => {
    console.log('[MainScreen] Room connected event received');
    if (recordingState === 'connecting') {
      console.log('[MainScreen] Transitioning to recording state');
      setRecordingState('recording');
      startRecordingAnimation();
    }
  }, [recordingState]);
  
  // Animation values for record button
  const buttonRotateAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;
  const timerOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation values for settings button
  const settingsRotateAnim = useRef(new Animated.Value(0)).current;
  const settingsScaleAnim = useRef(new Animated.Value(1)).current;
  
  const buttonRotateAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const iconRotateAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const pulseAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const connectingTimer = useRef<NodeJS.Timeout | null>(null);

  // Set user's default language when data loads
  useEffect(() => {
    if (convexUser?.defaultLanguage) {
      const userDefaultLanguage = getLanguageByCode(convexUser.defaultLanguage);
      if (userDefaultLanguage) {
        // Set source language to user's preference
        setSourceLanguage(userDefaultLanguage);

        // If the default language is the same as current target, swap them
        if (userDefaultLanguage.code === targetLanguage.code) {
          // Set target to English if source becomes the previous target
          // Or to Spanish if source is English
          const newTarget = userDefaultLanguage.code === 'en'
            ? getLanguageByCode('es') || defaultTargetLanguage
            : getLanguageByCode('en') || defaultSourceLanguage;
          setTargetLanguage(newTarget);
        }
      }
    }
  }, [convexUser?.defaultLanguage]); // Only run when defaultLanguage changes

  // Start AudioSession on mount
  useEffect(() => {
    let mounted = true;

    const startAudio = async () => {
      try {
        await AudioSession.startAudioSession();
      } catch (error) {
        console.error('Failed to start audio session:', error);
      }
    };

    startAudio();

    return () => {
      mounted = false;
      if (connectingTimer.current) clearTimeout(connectingTimer.current);
      buttonRotateAnimation.current?.stop();
      iconRotateAnimation.current?.stop();
      AudioSession.stopAudioSession();
    };
  }, []);

  // Timer effect - separate from recording state to avoid cleanup issues
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (recordingState === 'recording') {
      // Reset seconds when starting
      setSeconds(0);

      // Show timer
      Animated.timing(timerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start interval after a small delay to ensure state is set
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);

    } else if (recordingState === 'off') {
      // Hide timer after delay
      const hideTimeout = setTimeout(() => {
        Animated.timing(timerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setSeconds(0);
        });
      }, 500);

      // Cleanup timeout on unmount
      return () => clearTimeout(hideTimeout);
    }

    // Cleanup interval when effect re-runs or unmounts
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [recordingState]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startConnectingAnimation = () => {
    // Reset all animations
    buttonRotateAnim.setValue(0);
    buttonScaleAnim.setValue(1);
    iconRotateAnim.setValue(0);
    pulseAnim1.setValue(0);
    pulseAnim2.setValue(0);
    pulseAnim3.setValue(0);

    // SYNCHRONIZED rotation + scale animation (matching HTML exactly)
    // HTML keyframes: 0%→25%→50%→75%→100% over 1200ms
    // Each segment is 300ms (25% of 1200ms)
    buttonRotateAnimation.current = Animated.loop(
      Animated.sequence([
        // 0% → 25%: scale(1→1.05) rotate(0°→90°)
        Animated.parallel([
          Animated.timing(buttonScaleAnim, {
            toValue: 1.05,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(buttonRotateAnim, {
            toValue: 0.25, // 25% of full rotation
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // 25% → 50%: scale(1.05→1.08) rotate(90°→180°)
        Animated.parallel([
          Animated.timing(buttonScaleAnim, {
            toValue: 1.08,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(buttonRotateAnim, {
            toValue: 0.5, // 50% of full rotation
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // 50% → 75%: scale(1.08→1.05) rotate(180°→270°)
        Animated.parallel([
          Animated.timing(buttonScaleAnim, {
            toValue: 1.05,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(buttonRotateAnim, {
            toValue: 0.75, // 75% of full rotation
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // 75% → 100%: scale(1.05→1) rotate(270°→360°)
        Animated.parallel([
          Animated.timing(buttonScaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(buttonRotateAnim, {
            toValue: 1, // 100% = full rotation
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    buttonRotateAnimation.current.start();

    // Icon spins independently for shimmer effect (0.8s per rotation)
    iconRotateAnimation.current = Animated.loop(
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    );
    iconRotateAnimation.current.start();

    // Multiple pulse rings (matching HTML timing)
    pulseAnimation.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim1, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(pulseAnim2, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(800),
          Animated.timing(pulseAnim3, {
            toValue: 1,
            duration: 1200,
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
    buttonRotateAnimation.current?.stop();
    iconRotateAnimation.current?.stop();
    
    buttonRotateAnim.setValue(0);
    buttonScaleAnim.setValue(1);
    iconRotateAnim.setValue(0);
    pulseAnim1.setValue(0);
    pulseAnim2.setValue(0);
    pulseAnim3.setValue(0);

    // Gentle pulse for recording (matching HTML)
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Red pulse rings for recording
    Animated.loop(
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
          Animated.delay(667),
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
    ).start();
  };

  const stopAllAnimations = () => {
    buttonRotateAnimation.current?.stop();
    iconRotateAnimation.current?.stop();
    pulseAnimation.current?.stop();

    Animated.parallel([
      Animated.timing(buttonRotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotateAnim, {
        toValue: 0,
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


  const handleRecordPress = async () => {
    if (recordingState === 'off') {
      // Check if user has enough credits (minimum 0.05)
      if (!hasCredits() || balance < 0.05) {
        Alert.alert(
          'Insufficient Credits',
          `You need at least 0.05 credits to start a session (minimum charge). You have ${balance?.toFixed(2) || '0.00'} credits. Would you like to buy more?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Buy Credits',
              onPress: () => navigation.navigate('BuyCredits')
            },
          ]
        );
        return;
      }

      // Warning if low on credits
      if (isLowOnCredits) {
        Alert.alert(
          'Low on Credits',
          `You have ${balance?.toFixed(2) || '0.00'} credits remaining. Consider buying more credits.`,
          [
            { text: 'Continue', style: 'default' },
            {
              text: 'Buy Credits',
              onPress: () => navigation.navigate('BuyCredits')
            },
          ]
        );
      }

      setRecordingState('connecting');
      startConnectingAnimation(); // Start immediately, no delay

      // Connect to LiveKit room
      try {
        await connect();
        // Room connection will be handled by RoomMonitor's event listener
        // which will call handleRoomConnected when truly connected
      } catch (error) {
        console.error('Failed to connect to LiveKit:', error);
        setRecordingState('off');
        stopAllAnimations();
        Alert.alert('Connection Error', 'Failed to connect to translation service. Please try again.');
      }

    } else if (recordingState === 'recording') {
      setRecordingState('off');
      stopAllAnimations();

      // Disconnect from LiveKit room
      disconnect();

      // Success pulse animation
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

    } else if (recordingState === 'connecting') {
      // Cancel connection
      if (connectingTimer.current) {
        clearTimeout(connectingTimer.current);
      }
      setRecordingState('off');
      stopAllAnimations();

      // Disconnect from LiveKit room
      disconnect();

      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleSettingsPressIn = () => {
    Animated.parallel([
      Animated.timing(settingsRotateAnim, {
        toValue: 0.25, // 90 degrees
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(settingsScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSettingsPressOut = () => {
    Animated.parallel([
      Animated.timing(settingsRotateAnim, {
        toValue: 0.5, // 180 degrees
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(settingsScaleAnim, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset after animation
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(settingsRotateAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(settingsScaleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);
    });
  };

  const buttonRotation = buttonRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const settingsRotation = settingsRotateAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg', '360deg'],
  });

  const getIconColor = () => {
    if (recordingState === 'recording') return '#e74c3c';
    return colors.blueMunsell;
  };

  const getIconBorderRadius = () => {
    return recordingState === 'recording' ? 8 : 20;
  };

  // Smart language selection handlers
  const handleSourceLanguageSelect = (language: Language) => {
    setSourceLanguage(language);
    // If selected language is same as target, swap them
    if (language.code === targetLanguage.code) {
      setTargetLanguage(sourceLanguage); // Move current source to target
    }
  };

  const handleTargetLanguageSelect = (language: Language) => {
    setTargetLanguage(language);
    // If selected language is same as source, swap them
    if (language.code === sourceLanguage.code) {
      setSourceLanguage(targetLanguage); // Move current target to source
    }
  };

  // Calculate pulse ring styles separately to avoid borderWidth animation
  const getPulseRingStyle = (pulseAnim: Animated.Value, index: number) => {
    const scale = pulseAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: index === 0 ? [1, 1.3, 1] : index === 1 ? [1, 1.8, 1] : [1, 2.2, 1],
    });

    const opacity = pulseAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: index === 0 ? [0, 0.4, 0] : index === 1 ? [0, 0.2, 0] : [0, 0.1, 0],
    });

    return {
      opacity,
      transform: [{ scale }],
    };
  };

  const content = (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LanguageDropdown
          selectedLanguage={sourceLanguage}
          onLanguageSelect={handleSourceLanguageSelect}
          dropDirection="down"
        />
        <View style={styles.separatorDot} />
        <LanguageDropdown
          selectedLanguage={targetLanguage}
          onLanguageSelect={handleTargetLanguageSelect}
          dropDirection="down"
        />
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          onPressIn={handleSettingsPressIn}
          onPressOut={handleSettingsPressOut}
          style={({ pressed }) => [
            styles.settingsBtn,
            pressed && styles.settingsBtnPressed,
          ]}
        >
          <Animated.View
            style={{
              transform: [
                { rotate: settingsRotation },
                { scale: settingsScaleAnim }
              ],
            }}
          >
            <SettingsIcon />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.mainContent}>
        {/* Credit Display */}
        <View style={styles.creditDisplay}>
          <Text style={styles.creditNumber}>{balance?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.creditLabel}>credits remaining</Text>
          {isTracking && (
            <Text style={styles.usageRate}>Using ~1 credit/minute</Text>
          )}
          {!isTracking && balance > 0 && balance < 0.05 && (
            <Text style={styles.minimumChargeWarning}>Minimum charge: 0.05 credits</Text>
          )}
          {isLowOnCredits && !isTracking && (
            <Pressable
              onPress={() => navigation.navigate('BuyCredits')}
              style={styles.buyCreditsHint}
            >
              <Text style={styles.buyCreditsHintText}>Buy more credits →</Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={handleRecordPress}>
          <Animated.View
            style={[
              styles.recordButton,
              {
                transform: [
                  { scale: buttonScaleAnim },
                  { rotate: buttonRotation },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.recordIcon,
                {
                  backgroundColor: getIconColor(),
                  borderRadius: getIconBorderRadius(),
                  transform: [
                    { rotate: iconRotation },
                  ],
                },
              ]}
            />

            {/* Pulse rings - using separate styles to avoid borderWidth animation */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulseRing,
                recordingState === 'connecting' && styles.pulseRingBlue,
                recordingState === 'recording' && styles.pulseRingRed,
                getPulseRingStyle(pulseAnim1, 0),
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulseRing,
                recordingState === 'connecting' && styles.pulseRingBlue,
                recordingState === 'recording' && styles.pulseRingRed,
                getPulseRingStyle(pulseAnim2, 1),
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulseRing,
                recordingState === 'connecting' && styles.pulseRingBlue,
                recordingState === 'recording' && styles.pulseRingRed,
                getPulseRingStyle(pulseAnim3, 2),
              ]}
            />
          </Animated.View>
        </Pressable>

        <Animated.View
          style={[
            styles.recordingTimer,
            {
              opacity: timerOpacity,
            },
          ]}
        >
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );

  // Wrap with LiveKitRoom when we have a token
  if (connectionState.token && connectionState.url) {
    return (
      <LiveKitRoom
        serverUrl={connectionState.url}
        token={connectionState.token}
        connect={true}
        audio={true}
        video={false}
      >
        <RoomMonitor
          recordingState={recordingState}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onCreditsDepletedCallback={handleCreditsDepletedCallback}
          onStartTracking={handleStartTracking}
          onStopTracking={handleStopTracking}
          onRoomReady={handleRoomReady}
          onRoomConnected={handleRoomConnected}
        />
        {content}
      </LiveKitRoom>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  separatorDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.silver,
    borderRadius: 3,
    flexShrink: 0,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...shadows.subtle,
  },
  settingsBtnPressed: {
    ...shadows.pressed,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.elevated,
  },
  recordIcon: {
    width: 40,
    height: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: 'transparent',
  },
  pulseRingBlue: {
    borderColor: 'rgba(98, 146, 158, 0.4)',
  },
  pulseRingRed: {
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  recordingTimer: {
    marginTop: 60,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.blueMunsell,
    fontVariant: ['tabular-nums'],
  },
  creditDisplay: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
  },
  creditNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  creditLabel: {
    fontSize: 12,
    color: colors.silverAlpha(0.6),
    marginTop: 4,
  },
  buyCreditsHint: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primaryAlpha(0.1),
    borderRadius: 12,
  },
  buyCreditsHintText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  usageRate: {
    fontSize: 12,
    color: colors.blueMunsell,
    marginTop: 2,
    fontStyle: 'italic',
  },
  minimumChargeWarning: {
    fontSize: 11,
    color: '#FFA500',
    marginTop: 2,
  },
});