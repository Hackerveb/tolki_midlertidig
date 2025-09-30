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

type SignInScreenNavigationProp = StackNavigationProp<NavigationParamList, 'SignIn'>;

export const SignInScreen: React.FC = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigation = useNavigation<SignInScreenNavigationProp>();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        // Navigation will be handled by AppNavigator auth check
      } else {
        console.error('Sign in incomplete:', JSON.stringify(signInAttempt, null, 2));
        Alert.alert('Error', 'Unable to sign in. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      console.error('Sign in error details:', {
        message: err?.message,
        code: err?.code,
        status: err?.status,
        errors: err?.errors,
      });
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid email or password';
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <NeumorphicCard style={styles.formCard}>
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
                  placeholder="Enter your password"
                  placeholderTextColor={colors.silverAlpha(0.5)}
                  secureTextEntry
                  onChangeText={setPassword}
                  autoComplete="current-password"
                  editable={!loading}
                />
              </View>
            </View>

            <NeumorphicButton
              onPress={onSignInPress}
              style={styles.signInButton}
              disabled={loading}
              variant="primary"
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </NeumorphicButton>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable
                onPress={() => navigation.navigate('SignUp' as any)}
                disabled={loading}
              >
                <Text style={styles.linkText}>Sign Up</Text>
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