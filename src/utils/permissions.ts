import { Alert, Linking, Platform } from 'react-native';
import { Audio } from 'expo-av';

/**
 * Microphone permission handling with graceful UX
 */

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Request microphone permission with user-friendly flow
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    // Check current permission status
    const { status: existingStatus, canAskAgain } = await Audio.getPermissionsAsync();

    // Already granted
    if (existingStatus === 'granted') {
      return true;
    }

    // Permission previously denied - guide user to settings
    if (existingStatus === 'denied' && !canAskAgain) {
      showSettingsAlert();
      return false;
    }

    // Request permission
    const { status: newStatus } = await Audio.requestPermissionsAsync();

    if (newStatus === 'granted') {
      return true;
    }

    // Permission denied this time
    if (newStatus === 'denied') {
      showPermissionDeniedAlert();
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    Alert.alert(
      'Permission Error',
      'Unable to request microphone permission. Please try again.',
      [{ text: 'OK', style: 'default' }]
    );
    return false;
  }
};

/**
 * Show alert when permission is denied with option to open settings
 */
const showSettingsAlert = () => {
  Alert.alert(
    'Microphone Access Required',
    'TolKI needs microphone access to translate your voice. Please enable it in your device settings.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
};

/**
 * Show alert when permission is denied for the first time
 */
const showPermissionDeniedAlert = () => {
  Alert.alert(
    'Microphone Permission Denied',
    'TolKI cannot translate without microphone access. You can enable it anytime in Settings.',
    [
      {
        text: 'OK',
        style: 'default',
      },
    ]
  );
};

/**
 * Check if microphone permission is granted
 * @returns Promise<boolean>
 */
export const hasMicrophonePermission = async (): Promise<boolean> => {
  try {
    const { status } = await Audio.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return false;
  }
};
