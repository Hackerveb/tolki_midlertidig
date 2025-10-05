import { useEffect, useRef, useState, useCallback } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Room, ConnectionState } from 'livekit-client';

interface UseTrackUsageParams {
  room?: Room;
  onCreditsDepletedCallback?: () => void;
}

export const useTrackUsage = (params?: UseTrackUsageParams) => {
  const { room, onCreditsDepletedCallback } = params || {};
  const { user: clerkUser } = useClerkUser();
  const [sessionId, setSessionId] = useState<Id<"usageSessions"> | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionCreditsUsed, setSessionCreditsUsed] = useState(0);
  const [sessionSecondsUsed, setSessionSecondsUsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [roomConnectionState, setRoomConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);

  // Mutations
  const startSession = useMutation(api.usageSessions.startSession);
  const endSession = useMutation(api.usageSessions.endSession);
  const updateFractionalCredits = useMutation(api.usageSessions.updateFractionalCredits);

  // Query for active session
  const activeSession = useQuery(
    api.usageSessions.getActiveSession,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  );

  // Stop tracking usage
  const stopTracking = useCallback(async () => {
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // End session in database
    if (sessionId) {
      try {
        const result = await endSession({ sessionId });
        console.log('Session ended:', result);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }

    setIsTracking(false);
    setSessionId(null);
    setSessionCreditsUsed(0);
    setSessionSecondsUsed(0);
    startTimeRef.current = null;
  }, [sessionId, endSession]);

  // Monitor LiveKit room connection state
  useEffect(() => {
    if (!room) return;

    const handleConnectionStateChange = (state: ConnectionState) => {
      setRoomConnectionState(state);

      // If room disconnects unexpectedly while tracking, stop tracking
      if (state === ConnectionState.Disconnected && isTracking) {
        console.log('Room disconnected, stopping tracking');
        stopTracking();
      }
    };

    // Set initial state
    setRoomConnectionState(room.state);

    // Listen for connection state changes
    room.on('connectionStateChanged', handleConnectionStateChange);

    return () => {
      room.off('connectionStateChanged', handleConnectionStateChange);
    };
  }, [room, isTracking, stopTracking]);

  // Start tracking usage
  const startTracking = useCallback(async (languageFrom: string, languageTo: string) => {
    if (!clerkUser?.id) {
      throw new Error('User not authenticated');
    }

    // Guard against duplicate intervals
    if (intervalRef.current) {
      console.warn('[useTrackUsage] Interval already running, clearing before starting new one');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isTracking) {
      console.warn('[useTrackUsage] Already tracking, skipping duplicate call');
      return sessionId;
    }

    try {
      // Start a new session
      const newSessionId = await startSession({
        clerkId: clerkUser.id,
        languageFrom,
        languageTo,
      });

      setSessionId(newSessionId);
      setIsTracking(true);
      setSessionCreditsUsed(0.15); // Minimum charge already applied
      setSessionSecondsUsed(3); // Minimum 3 seconds
      startTimeRef.current = Date.now();

      console.log('[useTrackUsage] Starting credit deduction interval. First deduction at session start.');

      // Start interval to deduct credits every 3 seconds
      intervalRef.current = setInterval(async () => {
        try {
          // Calculate actual seconds elapsed
          const actualSeconds = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
          const secondsToAdd = 3; // Add 3 seconds each interval

          console.log('[Credit Deduction]', new Date().toISOString(), 'Deducting 0.15 credits');

          const result = await updateFractionalCredits({
            clerkId: clerkUser.id,
            secondsToAdd,
          });

          setSessionCreditsUsed(result.sessionCreditsUsed);
          setSessionSecondsUsed(result.secondsUsed);

          // Stop tracking if credits run out
          if (result.creditsRemaining <= 0.15) {
            console.log('Credits depleted, stopping session');
            await stopTracking();
            // Notify parent component to disconnect room
            if (onCreditsDepletedCallback) {
              onCreditsDepletedCallback();
            }
          }
        } catch (error) {
          console.error('Error updating credits:', error);
          // Stop tracking if there's an error (likely insufficient credits)
          await stopTracking();
          // Notify parent component
          if (onCreditsDepletedCallback) {
            onCreditsDepletedCallback();
          }
        }
      }, 3000); // Every 3 seconds

      return newSessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }, [clerkUser?.id, isTracking, sessionId, startSession, updateFractionalCredits, stopTracking, onCreditsDepletedCallback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    sessionId,
    sessionCreditsUsed,
    sessionSecondsUsed,
    activeSession,
    startTracking,
    stopTracking,
    roomConnectionState,
  };
};