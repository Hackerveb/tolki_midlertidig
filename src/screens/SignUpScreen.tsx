import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';
import { NavigationParamList } from '../types';

type SignUpScreenNavigationProp = StackNavigationProp<NavigationParamList, 'SignUp'>;

export const SignUpScreen: React.FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigation = useNavigation<SignUpScreenNavigationProp>();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Try with firstName and lastName first
      console.log('Creating account with:', { emailAddress, firstName, lastName });

      const result = await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      if (!result) {
        console.error('No result returned from signUp.create');
        throw new Error('Sign up failed - no result returned');
      }

      console.log('Sign up create result - status:', signUp.status);
      console.log('Sign up verifications:', signUp.verifications);
      console.log('Sign up id:', signUp.id);

      // Check if user was actually created
      if (signUp.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } else if (signUp.status === 'complete') {
        // Already complete, set session
        await setActive({ session: signUp.createdSessionId });
      } else {
        console.error('Unexpected sign up status:', signUp.status);
        Alert.alert('Error', 'Unexpected sign up status. Please try again.');
      }
    } catch (err: any) {
      // Log error in multiple ways to capture all details
      console.error('Sign up error object:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err?.message || 'No message');
      console.error('Error code:', err?.code);
      console.error('Error status:', err?.status);
      console.error('Clerk errors:', err?.errors);
      console.error('Full error details:', {
        message: err?.message,
        code: err?.code,
        status: err?.status,
        errors: err?.errors,
        clerkError: err?.clerkError,
        stack: err?.stack?.substring(0, 500), // First 500 chars of stack
      });

      // If firstName/lastName parameters are still not accepted, try without them
      if (err.errors?.some((e: any) => e.code === 'form_param_unknown' &&
          (e.meta?.paramName === 'first_name' || e.meta?.paramName === 'last_name'))) {
        try {
          console.log('Retrying without firstName/lastName');
          const fallbackResult = await signUp.create({
            emailAddress,
            password,
          });

          console.log('Fallback sign up result - status:', signUp.status);

          if (signUp.status === 'missing_requirements') {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
          } else if (signUp.status === 'complete') {
            await setActive({ session: signUp.createdSessionId });
          }
        } catch (fallbackErr: any) {
          console.error('Fallback sign up error:', fallbackErr);
          console.error('Fallback error details:', {
            message: fallbackErr?.message,
            code: fallbackErr?.code,
            status: fallbackErr?.status,
            errors: fallbackErr?.errors,
          });
          const errorMessage = fallbackErr.errors?.[0]?.longMessage || fallbackErr.errors?.[0]?.message || 'Unable to create account';
          Alert.alert('Sign Up Failed', errorMessage);
        }
      } else {
        const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Unable to create account';
        Alert.alert('Sign Up Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setLoading(true);
    try {
      console.log('Resending verification code');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert('Success', 'A new verification code has been sent to your email.');
      setCode(''); // Clear the old code
    } catch (err: any) {
      console.error('Resend code error:', err);
      console.error('Resend error details:', {
        message: err?.message,
        errors: err?.errors,
      });
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    // Check if signUp session exists
    if (!signUp || !signUp.status) {
      console.error('No active sign up session');
      Alert.alert('Session Expired', 'Please sign up again.');
      setPendingVerification(false);
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting verification with code:', code);
      console.log('Current signUp status:', signUp.status);

      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log('Verification result - status:', signUpAttempt.status);
      console.log('Verification session ID:', signUpAttempt.createdSessionId);

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        // Navigation will be handled by AppNavigator auth check
      } else {
        console.error('Verification incomplete - status:', signUpAttempt.status);
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      console.error('Verification error details:', {
        message: err?.message,
        code: err?.code,
        errors: err?.errors,
      });

      // Handle already verified case
      if (err.errors?.[0]?.code === 'verification_already_verified') {
        console.log('Email already verified, attempting to set session');

        // Try to set the session if it exists
        if (signUp.createdSessionId) {
          try {
            await setActive({ session: signUp.createdSessionId });
            console.log('Session activated successfully');
          } catch (sessionErr) {
            console.error('Failed to set session:', sessionErr);
            Alert.alert(
              'Already Verified',
              'Your email is already verified. Please sign in instead.',
              [{ text: 'OK', onPress: () => navigation.navigate('SignIn' as any) }]
            );
          }
        } else {
          Alert.alert(
            'Already Verified',
            'Your email is already verified. Please sign in instead.',
            [{ text: 'OK', onPress: () => navigation.navigate('SignIn' as any) }]
          );
        }
      } else {
        const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid verification code';
        Alert.alert('Verification Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subtitle}>
                We've sent a verification code to {emailAddress}
              </Text>
            </View>

            <NeumorphicCard style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={code}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={colors.silverAlpha(0.5)}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                </View>
              </View>

              <NeumorphicButton
                onPress={onVerifyPress}
                style={styles.signInButton}
                disabled={loading}
                variant="primary"
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.signInButtonText}>Verify Email</Text>
                )}
              </NeumorphicButton>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Didn't receive the code?</Text>
                <Pressable
                  onPress={onResendCode}
                  disabled={loading}
                >
                  <Text style={styles.linkText}>Resend</Text>
                </Pressable>
              </View>
            </NeumorphicCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <NeumorphicCard style={styles.formCard}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    placeholder="John"
                    placeholderTextColor={colors.silverAlpha(0.5)}
                    onChangeText={setFirstName}
                    autoComplete="given-name"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    placeholder="Doe"
                    placeholderTextColor={colors.silverAlpha(0.5)}
                    onChangeText={setLastName}
                    autoComplete="family-name"
                    editable={!loading}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.silverAlpha(0.5)}
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={password}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor={colors.silverAlpha(0.5)}
                  secureTextEntry
                  onChangeText={setPassword}
                  autoComplete="new-password"
                  editable={!loading}
                />
              </View>
            </View>

            <NeumorphicButton
              onPress={onSignUpPress}
              style={styles.signInButton}
              disabled={loading}
              variant="primary"
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.signInButtonText}>Sign Up</Text>
              )}
            </NeumorphicButton>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable
                onPress={() => navigation.navigate('SignIn' as any)}
                disabled={loading}
              >
                <Text style={styles.linkText}>Sign In</Text>
              </Pressable>
            </View>
          </NeumorphicCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
    paddingTop: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  title: {
    ...typography.h1,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.silverAlpha(0.7),
    textAlign: 'center',
  },
  formCard: {
    padding: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.foreground,
    marginBottom: spacing.sm,
    fontWeight: '600',
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
  },
  signInButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.primary,
    minHeight: 56,
  },
  signInButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.body,
    color: colors.silverAlpha(0.7),
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});