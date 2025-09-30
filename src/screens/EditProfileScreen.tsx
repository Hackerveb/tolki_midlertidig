import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser as useClerkUser } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Header } from '../components/Header';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { LanguageDropdown } from '../components/LanguageDropdown';
import { Language } from '../types';
import { languages } from '../constants/languages';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useClerkUser();
  const { fullName, email: userEmail, initials, convexUser } = useCurrentUser();
  const updateDefaultLanguage = useMutation(api.users.updateDefaultLanguage);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email] = useState(userEmail);
  const [phone] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]); // Default to English
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }

    // Set default language from database if available
    if (convexUser?.defaultLanguage) {
      const savedLanguage = languages.find(lang => lang.code === convexUser.defaultLanguage);
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    }
  }, [user, convexUser]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update Clerk profile
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Update default language in Convex database
      if (user.id && selectedLanguage) {
        await updateDefaultLanguage({
          clerkId: user.id,
          language: selectedLanguage.code,
        });
      }

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Edit Profile"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Pressable style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <NeumorphicCard style={[styles.formCard, { overflow: 'visible' }]}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                editable={!loading}
                placeholder="Enter your first name"
                placeholderTextColor={colors.silverAlpha(0.5)}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                editable={!loading}
                placeholder="Enter your last name"
                placeholderTextColor={colors.silverAlpha(0.5)}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Read-only)</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={email}
                editable={false}
                placeholder="Enter your email"
                placeholderTextColor={colors.silverAlpha(0.5)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={phone}
                editable={false}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.silverAlpha(0.5)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.separator} />

            <View style={[styles.inputGroup, { overflow: 'visible', zIndex: 9999 }]}>
              <Text style={styles.inputLabel}>Default Language</Text>
              <View style={styles.languageDropdownContainer}>
                <LanguageDropdown
                  selectedLanguage={selectedLanguage}
                  onLanguageSelect={setSelectedLanguage}
                />
              </View>
            </View>
          </NeumorphicCard>


          {/* Save Button */}
          <View style={[styles.buttonContainer, { position: 'relative' }]}>
            <NeumorphicButton
              title={loading ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              variant="primary"
              style={styles.saveButton}
              disabled={loading}
            />
            <NeumorphicButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.cancelButton}
            />
          </View>
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
  content: {
    flex: 1,
    paddingBottom: 100, // Extra padding to ensure dropdown is fully visible
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.elevated,
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
  },
  changeAvatarButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  changeAvatarText: {
    ...typography.button,
    color: colors.primary,
  },
  formCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0,
    zIndex: 1, // Lower z-index than dropdown
  },
  inputGroup: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  inputLabel: {
    ...typography.labelSmall,
    color: colors.silverAlpha(0.8),
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    ...typography.body,
    color: colors.foreground,
    paddingVertical: spacing.xs,
  },
  readOnlyInput: {
    color: colors.silverAlpha(0.7),
  },
  languageDropdownContainer: {
    marginTop: spacing.xs,
    zIndex: 9999, // Maximum z-index to overlay everything
    elevation: 999, // For Android
  },
  separator: {
    height: 1,
    backgroundColor: colors.silverAlpha(0.1),
    marginHorizontal: spacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    zIndex: 1, // Lower z-index than dropdown
  },
  saveButton: {
    marginBottom: spacing.sm,
  },
  cancelButton: {
    backgroundColor: colors.background,
  },
});