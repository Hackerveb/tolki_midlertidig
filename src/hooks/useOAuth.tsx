import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { hapticFeedback } from '../utils/haptics';

// Required for Android to warm up the browser for better OAuth performance
export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      void WebBrowser.warmUpAsync();
    }
    return () => {
      if (Platform.OS === 'android') {
        void WebBrowser.coolDownAsync();
      }
    };
  }, []);
};

export type OAuthStrategy = 'oauth_google' | 'oauth_apple';

export interface UseOAuthFlowReturn {
  startOAuthFlow: (strategy: OAuthStrategy) => Promise<void>;
  isLoading: boolean;
}

export const useOAuthFlow = (): {
  startGoogleOAuth: () => Promise<void>;
  startAppleOAuth: () => Promise<void>;
} => {
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' });

  const handleOAuthFlow = async (
    startFlow: any,
    providerName: string
  ): Promise<void> => {
    try {
      await hapticFeedback.medium();

      const { createdSessionId, setActive } = await startFlow({
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: 'tolki',
          path: 'oauth-callback',
        }),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        await hapticFeedback.success();
        // Navigation will be handled by AppNavigator auth check
      } else {
        console.warn(`${providerName} OAuth completed but no session was created`);
      }
    } catch (err: any) {
      console.error(`${providerName} OAuth error:`, err);

      // Don't show error if user cancelled
      if (err?.code === 'session_exists' || err?.code === 'user_locked') {
        await hapticFeedback.error();
        throw err;
      }

      // User cancelled the OAuth flow
      if (
        err?.message?.includes('user_cancelled') ||
        err?.message?.includes('UserCancel') ||
        err?.code === 'cancelled'
      ) {
        console.log(`${providerName} OAuth cancelled by user`);
        await hapticFeedback.light();
        return;
      }

      // Network or other errors
      await hapticFeedback.error();
      throw new Error(`Failed to sign in with ${providerName}. Please try again.`);
    }
  };

  const startGoogleOAuth = async () => {
    await handleOAuthFlow(startGoogleFlow, 'Google');
  };

  const startAppleOAuth = async () => {
    await handleOAuthFlow(startAppleFlow, 'Apple');
  };

  return {
    startGoogleOAuth,
    startAppleOAuth,
  };
};
