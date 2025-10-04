import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions,
  Animated,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSignIn } from '@clerk/clerk-expo';
import Svg, { Circle, Path } from 'react-native-svg';
import { NavigationParamList } from '../types';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';
import { hapticFeedback } from '../utils/haptics';
import { validateEmail } from '../utils/validation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingNavigationProp = StackNavigationProp<NavigationParamList, 'Onboarding'>;

// Translation Icon
const TranslationIcon = () => (
  <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
    {/* Person 1 */}
    <Circle cx="30" cy="40" r="12" stroke={colors.primary} strokeWidth="3" fill={colors.background} />
    <Path
      d="M 20 60 Q 30 55 40 60"
      stroke={colors.primary}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Speech bubble 1 */}
    <Circle cx="25" cy="25" r="2" fill={colors.primary} />
    <Circle cx="30" cy="20" r="3" fill={colors.primary} />
    <Circle cx="35" cy="25" r="2" fill={colors.primary} />

    {/* Person 2 */}
    <Circle cx="90" cy="40" r="12" stroke={colors.accent} strokeWidth="3" fill={colors.background} />
    <Path
      d="M 80 60 Q 90 55 100 60"
      stroke={colors.accent}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Speech bubble 2 */}
    <Circle cx="85" cy="25" r="2" fill={colors.accent} />
    <Circle cx="90" cy="20" r="3" fill={colors.accent} />
    <Circle cx="95" cy="25" r="2" fill={colors.accent} />

    {/* Bidirectional arrow */}
    <Path
      d="M 45 45 L 75 45"
      stroke={colors.foreground}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M 48 42 L 45 45 L 48 48"
      stroke={colors.foreground}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M 72 42 L 75 45 L 72 48"
      stroke={colors.foreground}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

// Credits Icon
const CreditsIcon = () => (
  <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
    {/* Clock face */}
    <Circle cx="60" cy="60" r="40" stroke={colors.primary} strokeWidth="4" fill={colors.background} />
    {/* Clock hands */}
    <Path d="M 60 60 L 60 35" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
    <Path d="M 60 60 L 75 60" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
    {/* Credit symbol */}
    <Circle cx="60" cy="60" r="8" fill={colors.primary} />
    <Text
      x="60"
      y="65"
      fontSize="12"
      fill={colors.white}
      textAnchor="middle"
      fontWeight="bold"
    >
      1
    </Text>
  </Svg>
);

// Start Icon
const StartIcon = () => (
  <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
    {/* Microphone */}
    <Circle cx="60" cy="50" r="15" stroke={colors.primary} strokeWidth="4" fill={colors.background} />
    <Path
      d="M 45 50 Q 45 70 60 75 Q 75 70 75 50"
      stroke={colors.primary}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <Path d="M 60 75 L 60 85" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" />
    <Path d="M 50 85 L 70 85" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" />
    {/* Sound waves */}
    <Path
      d="M 85 40 Q 90 50 85 60"
      stroke={colors.accent}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M 95 35 Q 100 50 95 65"
      stroke={colors.accent}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const creditCountAnim = useRef(new Animated.Value(10)).current;

  // Sign in state
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validate email on blur
  const handleEmailBlur = () => {
    if (emailAddress.trim().length > 0) {
      const validation = validateEmail(emailAddress);
      setEmailError(validation.isValid ? null : validation.message || 'Invalid email');
    }
  };

  // Clear error on focus
  const handleEmailFocus = () => {
    setEmailError(null);
  };

  // Check if form is valid (both fields filled AND email is valid format)
  const emailValidation = validateEmail(emailAddress);
  const isFormValid = emailValidation.isValid && password.trim().length > 0;

  const steps = [
    {
      type: 'info',
      icon: <TranslationIcon />,
      title: 'Welcome to TolKI',
      subtitle: 'Real-time voice translation',
      description: 'Speak naturally in any of 63 languages, and we\'ll translate instantly. Break down language barriers effortlessly.',
    },
    {
      type: 'info',
      icon: <CreditsIcon />,
      title: 'How Credits Work',
      subtitle: 'Simple & transparent pricing',
      description: '1 credit = 1 minute of translation. You start with 10 FREE credits (10 minutes). Minimum session: 3 seconds.',
    },
    {
      type: 'info',
      icon: <StartIcon />,
      title: 'Ready to Start?',
      subtitle: 'Try your first translation',
      description: 'Select your languages, press the button, and start speaking. It\'s that simple!',
    },
    {
      type: 'signin',
      title: 'Welcome Back',
      subtitle: 'Sign in to continue',
      description: '',
    },
  ];

  const currentStepData = steps[currentStep];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page !== currentStep) {
      setCurrentStep(page);
      hapticFeedback.light();
    }
  };

  const handleSignInPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    hapticFeedback.medium();

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        hapticFeedback.success();
        // Navigation will be handled by AppNavigator auth check
      } else {
        Alert.alert('Error', 'Unable to sign in. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid email or password';
      Alert.alert('Sign In Failed', errorMessage);
      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpLink = () => {
    hapticFeedback.light();
    navigation.navigate('SignUp');
  };

  const handleSkip = () => {
    hapticFeedback.light();
    // Scroll to last page (sign in)
    scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * 3, animated: true });
  };

  // Animate credit demo on step 2
  React.useEffect(() => {
    if (currentStep === 1) {
      // Animate credit countdown
      const interval = setInterval(() => {
        Animated.sequence([
          Animated.timing(creditCountAnim, {
            toValue: 9.95,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(creditCountAnim, {
            toValue: 9.90,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(creditCountAnim, {
            toValue: 10,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button - only show on first 3 pages */}
      {currentStep < 3 && (
        <Pressable
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Horizontal ScrollView for swipable pages */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          scrollEnabled={!loading}
        >
          {steps.map((step, index) => (
            <View key={index} style={styles.page}>
              {step.type === 'signin' ? (
                // Sign In Form (Page 4)
                <View style={styles.signInContent}>
                  <Text style={styles.title}>{step.title}</Text>
                  <Text style={styles.subtitle}>{step.subtitle}</Text>

                  <View style={styles.signInForm}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Email</Text>
                      <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                        <TextInput
                          style={styles.input}
                          autoCapitalize="none"
                          value={emailAddress}
                          placeholder="Enter your email"
                          placeholderTextColor={colors.silverAlpha(0.5)}
                          onChangeText={setEmailAddress}
                          onBlur={handleEmailBlur}
                          onFocus={handleEmailFocus}
                          keyboardType="email-address"
                          autoComplete="email"
                          editable={!loading}
                        />
                      </View>
                      {emailError && (
                        <Text style={styles.errorText}>{emailError}</Text>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Password</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          value={password}
                          placeholder="Enter your password"
                          placeholderTextColor={colors.silverAlpha(0.5)}
                          secureTextEntry
                          onChangeText={setPassword}
                          autoComplete="current-password"
                          editable={!loading}
                        />
                      </View>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.signInButton,
                        pressed && !loading && isFormValid && styles.signInButtonPressed,
                        (loading || !isFormValid) && styles.signInButtonDisabled,
                      ]}
                      onPress={handleSignInPress}
                      disabled={loading || !isFormValid}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <Text style={styles.signInButtonText}>Sign In</Text>
                      )}
                    </Pressable>

                    <View style={styles.signUpLinkContainer}>
                      <Text style={styles.signUpLinkText}>Don't have an account? </Text>
                      <Pressable onPress={handleSignUpLink} disabled={loading}>
                        <Text style={styles.signUpLink}>Sign Up</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ) : (
                // Info Pages (Pages 1-3)
                <View style={styles.content}>
                  {/* Icon */}
                  {step.icon && (
                    <View style={styles.iconContainer}>
                      {step.icon}
                    </View>
                  )}

                  {/* Title */}
                  <Text style={styles.title}>{step.title}</Text>
                  <Text style={styles.subtitle}>{step.subtitle}</Text>

                  {/* Description */}
                  <Text style={styles.description}>{step.description}</Text>

                  {/* Credit demo for step 2 */}
                  {index === 1 && (
                    <View style={styles.creditDemo}>
                      <Animated.Text style={styles.creditDemoNumber}>
                        {creditCountAnim.interpolate({
                          inputRange: [0, 10],
                          outputRange: ['0.00', '10.00'],
                        })}
                      </Animated.Text>
                      <Text style={styles.creditDemoLabel}>credits</Text>
                      <Text style={styles.creditDemoHint}>Watch them update in real-time!</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Progress dots */}
      <View style={styles.dotsContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  skipText: {
    ...typography.body,
    color: colors.silverAlpha(0.6),
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.h6,
    fontSize: 18,
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.body,
    fontSize: 16,
    color: colors.silverAlpha(0.8),
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  creditDemo: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadows.subtle,
  },
  creditDemoNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  creditDemoLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.silverAlpha(0.6),
    marginTop: spacing.xs,
  },
  creditDemoHint: {
    ...typography.caption,
    fontSize: 12,
    color: colors.accent,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.silverAlpha(0.3),
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  keyboardView: {
    flex: 1,
  },
  signInContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  signInForm: {
    width: '100%',
    maxWidth: 400,
    marginTop: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.foreground,
    marginBottom: spacing.sm,
    fontWeight: '600',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    ...shadows.soft,
  },
  input: {
    ...typography.body,
    color: colors.foreground,
    padding: spacing.md,
    minHeight: 50,
    fontSize: 16,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    ...typography.caption,
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: spacing.lg,
    ...shadows.elevated,
  },
  signInButtonPressed: {
    transform: [{ scale: 0.98 }],
    ...shadows.subtle,
  },
  signInButtonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.silverAlpha(0.3),
  },
  signInButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  signUpLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  signUpLinkText: {
    ...typography.body,
    color: colors.silverAlpha(0.7),
    fontSize: 14,
  },
  signUpLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
