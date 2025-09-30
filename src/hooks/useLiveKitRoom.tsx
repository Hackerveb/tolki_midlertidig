import { useState, useCallback, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useCurrentUser } from './useCurrentUser';
import { Language } from '../types';

interface UseLiveKitRoomParams {
  languageA: Language;
  languageB: Language;
}

interface LiveKitConnectionState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  token: string | null;
  url: string | null;
  error: string | null;
}

interface UseLiveKitRoomReturn {
  connectionState: LiveKitConnectionState;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  canConnect: boolean;
}

export const useLiveKitRoom = ({
  languageA,
  languageB,
}: UseLiveKitRoomParams): UseLiveKitRoomReturn => {
  const { clerkUser, convexUser } = useCurrentUser();
  const generateToken = useAction(api.livekit.generateToken);

  const [connectionState, setConnectionState] = useState<LiveKitConnectionState>({
    status: 'idle',
    token: null,
    url: null,
    error: null,
  });

  // Check if user has sufficient credits (minimum 0.05)
  const canConnect = Boolean(
    clerkUser &&
    convexUser &&
    convexUser.credits >= 0.05
  );

  const connect = useCallback(async () => {
    if (!clerkUser?.id) {
      setConnectionState({
        status: 'error',
        token: null,
        url: null,
        error: 'User not authenticated',
      });
      return;
    }

    if (!convexUser) {
      setConnectionState({
        status: 'error',
        token: null,
        url: null,
        error: 'User data not loaded',
      });
      return;
    }

    // Check credit requirements
    const minimumCredits = 0.05;
    if (convexUser.credits < minimumCredits) {
      setConnectionState({
        status: 'error',
        token: null,
        url: null,
        error: `Insufficient credits. Minimum ${minimumCredits} credits required. You have ${convexUser.credits.toFixed(2)} credits.`,
      });
      return;
    }

    try {
      setConnectionState({
        status: 'connecting',
        token: null,
        url: null,
        error: null,
      });

      // Generate unique room name based on user and timestamp
      const roomName = `translation_${clerkUser.id}_${Date.now()}`;

      // Call Convex action to generate LiveKit token with language metadata
      const result = await generateToken({
        clerkId: clerkUser.id,
        language1: languageA.code,
        language2: languageB.code,
        roomName,
      });

      setConnectionState({
        status: 'connected',
        token: result.token,
        url: result.url,
        error: null,
      });
    } catch (error) {
      console.error('Failed to connect to LiveKit:', error);
      setConnectionState({
        status: 'error',
        token: null,
        url: null,
        error: error instanceof Error ? error.message : 'Failed to connect to LiveKit',
      });
    }
  }, [clerkUser, convexUser, languageA, languageB, generateToken]);

  const disconnect = useCallback(() => {
    setConnectionState({
      status: 'disconnected',
      token: null,
      url: null,
      error: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionState.status === 'connected') {
        disconnect();
      }
    };
  }, [connectionState.status, disconnect]);

  return {
    connectionState,
    connect,
    disconnect,
    isConnecting: connectionState.status === 'connecting',
    isConnected: connectionState.status === 'connected',
    canConnect,
  };
};