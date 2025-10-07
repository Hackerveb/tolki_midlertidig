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
import { useSignIn } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';
import { NavigationParamList } from '../types';
import { validateEmail, validatePassword, getPasswordStrengthColor, getPasswordRequirementsList } from '../utils/validation';
import { hapticFeedback } from '../utils/haptics';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<NavigationParamList, 'ForgotPassword'>;

type ResetStep = 'email' | 'code' | 'password' | 'success';

export const ForgotPasswordScreen: React.FC = () => {
  const { signIn, isLoaded } = useSignIn();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const [currentStep, setCurrentStep] = useState<ResetStep>('email');
  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Validate email on blur
  const handleEmailBlur = () => {
    if (emailAddress.trim().length > 0) {
      const validation = validateEmail(emailAddress);
      setEmailError(validation.isValid ? null : validation.message || 'Invalid email');
    }
  };

  // Clear email error on focus
  const handleEmailFocus = () => {
    setEmailError(null);
  };

  // Show password requirements when password field is focused
  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  // Hide password requirements when password field loses focus
  const handlePasswordBlur = () => {
    setShowPasswordRequirements(false);
  };

  // Get current password validation
  const passwordValidation = validatePassword(password);
  const emailValidation = validateEmail(emailAddress);

  const onSendCodePress = async () => {
    if (!isLoaded) return;

    if (!emailAddress) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!emailValidation.isValid) {
      await hapticFeedback.error();
      Alert.alert('Invalid Email', emailValidation.message || 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Start the password reset flow
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });

      await hapticFeedback.success();
      setCurrentStep('code');
    } catch (err: any) {
      console.error('Send code error:', err);
      console.error('Error details:', {
        message: err?.message,
        code: err?.code,
        errors: err?.errors,
      });

      await hapticFeedback.error();
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Unable to send reset code. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });

      await hapticFeedback.success();
      Alert.alert('Success', 'A new verification code has been sent to your email.');
      setCode('');
    } catch (err: any) {
      console.error('Resend code error:', err);
      await hapticFeedback.error();
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCodePress = async () => {
    if (!isLoaded) return;

    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Verify the code
      await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
      });

      await hapticFeedback.success();
      setCurrentStep('password');
    } catch (err: any) {
      console.error('Verify code error:', err);
      console.error('Error details:', {
        message: err?.message,
        code: err?.code,
        errors: err?.errors,
      });

      await hapticFeedback.error();
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid verification code. Please try again.';
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResetPasswordPress = async () => {
    if (!isLoaded) return;

    if (!password) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!passwordValidation.isValid) {
      await hapticFeedback.warning();
      Alert.alert('Weak Password', 'Please ensure your password meets all requirements');
      return;
    }

    setLoading(true);

    try {
      // Reset the password
      await signIn.resetPassword({
        password,
      });

      await hapticFeedback.success();
      setCurrentStep('success');
    } catch (err: any) {
      console.error('Reset password error:', err);
      console.error('Error details:', {
        message: err?.message,
        code: err?.code,
        errors: err?.errors,
      });

      await hapticFeedback.error();
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Unable to reset password. Please try again.';
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onBackToSignIn = () => {
    navigation.navigate('Onboarding', { initialPage: 2 });
  };

  // Email Step
  if (currentStep === 'email') {
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
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a verification code
              </Text>
            </View>

            <NeumorphicCard style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
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

              <NeumorphicButton
                onPress={onSendCodePress}
                style={[
                  styles.primaryButton,
                  (!emailValidation.isValid || loading) && styles.primaryButtonDisabled,
                ]}
                disabled={!emailValidation.isValid || loading}
                variant="primary"
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[
                    styles.primaryButtonText,
                    !emailValidation.isValid && styles.primaryButtonTextDisabled,
                  ]}>
                    Send Code
                  </Text>
                )}
              </NeumorphicButton>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Remember your password?</Text>
                <Pressable onPress={onBackToSignIn} disabled={loading}>
                  <Text style={styles.linkText}>Sign In</Text>
                </Pressable>
              </View>
            </NeumorphicCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Code Verification Step
  if (currentStep === 'code') {
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
              <Text style={styles.title}>Enter Code</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to {emailAddress}
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
                onPress={onVerifyCodePress}
                style={[
                  styles.primaryButton,
                  (code.length !== 6 || loading) && styles.primaryButtonDisabled,
                ]}
                disabled={code.length !== 6 || loading}
                variant="primary"
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[
                    styles.primaryButtonText,
                    code.length !== 6 && styles.primaryButtonTextDisabled,
                  ]}>
                    Verify Code
                  </Text>
                )}
              </NeumorphicButton>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Didn't receive the code?</Text>
                <Pressable onPress={onResendCode} disabled={loading}>
                  <Text style={styles.linkText}>Resend</Text>
                </Pressable>
              </View>
            </NeumorphicCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // New Password Step
  if (currentStep === 'password') {
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
              <Text style={styles.title}>New Password</Text>
              <Text style={styles.subtitle}>
                Create a strong password for your account
              </Text>
            </View>

            <NeumorphicCard style={styles.formCard}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  {password.length > 0 && (
                    <View style={[styles.strengthBadge, { backgroundColor: getPasswordStrengthColor(passwordValidation.strength) }]}>
                      <Text style={styles.strengthText}>
                        {passwordValidation.strength === 'weak' && 'Weak'}
                        {passwordValidation.strength === 'medium' && 'Good'}
                        {passwordValidation.strength === 'strong' && 'Strong'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    placeholder="Create a strong password"
                    placeholderTextColor={colors.silverAlpha(0.5)}
                    secureTextEntry
                    onChangeText={setPassword}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    autoComplete="new-password"
                    editable={!loading}
                  />
                </View>

                {/* Password requirements - shown when focused or has errors */}
                {(showPasswordRequirements || (password.length > 0 && !passwordValidation.isValid)) && (
                  <View style={styles.passwordRequirements}>
                    <Text style={styles.requirementsTitle}>Password must contain:</Text>
                    {getPasswordRequirementsList().map((requirement, index) => {
                      const isMet = !passwordValidation.errors.includes(requirement);
                      return (
                        <View key={index} style={styles.requirementRow}>
                          <View style={[styles.requirementDot, isMet && styles.requirementDotMet]} />
                          <Text style={[styles.requirementText, isMet && styles.requirementTextMet]}>
                            {requirement}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              <NeumorphicButton
                onPress={onResetPasswordPress}
                style={[
                  styles.primaryButton,
                  (!passwordValidation.isValid || loading) && styles.primaryButtonDisabled,
                ]}
                disabled={!passwordValidation.isValid || loading}
                variant="primary"
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[
                    styles.primaryButtonText,
                    !passwordValidation.isValid && styles.primaryButtonTextDisabled,
                  ]}>
                    Reset Password
                  </Text>
                )}
              </NeumorphicButton>
            </NeumorphicCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Success Step
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.successContainer}>
        <NeumorphicCard style={styles.successCard}>
          <View style={styles.successContent}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Password Reset!</Text>
            <Text style={styles.successText}>
              Your password has been successfully reset. You can now sign in with your new password.
            </Text>

            <NeumorphicButton
              onPress={onBackToSignIn}
              style={styles.primaryButton}
              variant="primary"
            >
              <Text style={styles.primaryButtonText}>Back to Sign In</Text>
            </NeumorphicButton>
          </View>
        </NeumorphicCard>
      </View>
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
    paddingHorizontal: spacing.md,
  },
  formCard: {
    padding: spacing.xl,
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    ...shadows.soft,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  input: {
    ...typography.body,
    color: colors.foreground,
    padding: spacing.md,
    minHeight: 50,
  },
  errorText: {
    ...typography.caption,
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  strengthText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  passwordRequirements: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    ...shadows.soft,
  },
  requirementsTitle: {
    ...typography.caption,
    color: colors.foreground,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.silverAlpha(0.4),
    marginRight: spacing.sm,
  },
  requirementDotMet: {
    backgroundColor: '#66BB6A',
  },
  requirementText: {
    ...typography.caption,
    color: colors.silverAlpha(0.7),
    fontSize: 12,
  },
  requirementTextMet: {
    color: '#66BB6A',
    fontWeight: '500',
  },
  primaryButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.primary,
    minHeight: 56,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.silverAlpha(0.3),
    opacity: 0.5,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  primaryButtonTextDisabled: {
    color: colors.silverAlpha(0.5),
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  successCard: {
    padding: spacing.xl * 2,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h1,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.body,
    color: colors.silverAlpha(0.7),
    textAlign: 'center',
    marginBottom: spacing.xl * 2,
  },
});
