import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TokenCache } from '@clerk/clerk-expo/dist/cache';

const createTokenCache = (): TokenCache => {
  return {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key);
        if (item) {
          console.log(`Retrieved token for key ${key}`);
        } else {
          console.log(`No token found for key ${key}`);
        }
        return item;
      } catch (error) {
        console.error('Error retrieving token:', error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        console.log(`Saving token for key ${key}`);
        return SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error('Error saving token:', error);
        return;
      }
    },
    async clearToken(key: string) {
      try {
        console.log(`Clearing token for key ${key}`);
        return SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('Error clearing token:', error);
        return;
      }
    },
  };
};

// Export the token cache for web and mobile platforms
export const tokenCache = Platform.OS === 'web' ? undefined : createTokenCache();