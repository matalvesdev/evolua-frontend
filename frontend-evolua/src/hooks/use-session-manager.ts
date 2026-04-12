'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SessionManagerConfig {
  idleTimeout?: number; // default: 30 * 60 * 1000 (30 min)
  warningBefore?: number; // default: 5 * 60 * 1000 (5 min)
}

interface SessionManagerState {
  isIdle: boolean;
  showWarning: boolean;
  timeRemaining: number; // seconds remaining before logout
}

const DEFAULT_IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const DEFAULT_WARNING_BEFORE = 5 * 60 * 1000; // 5 minutes

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
];

export function useSessionManager(
  config?: SessionManagerConfig
): SessionManagerState & { extendSession: () => void } {
  const idleTimeout = config?.idleTimeout ?? DEFAULT_IDLE_TIMEOUT;
  const warningBefore = config?.warningBefore ?? DEFAULT_WARNING_BEFORE;

  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(Math.floor(warningBefore / 1000));

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningActiveRef = useRef(false);

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const performLogout = useCallback(async () => {
    clearAllTimers();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Force redirect even if signOut fails
    }
    window.location.href = '/auth/login';
  }, [clearAllTimers]);

  const startWarningCountdown = useCallback(() => {
    warningActiveRef.current = true;
    setIsIdle(true);
    setShowWarning(true);

    const totalSeconds = Math.floor(warningBefore / 1000);
    setTimeRemaining(totalSeconds);

    // Countdown every second
    let remaining = totalSeconds;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }
    }, 1000);

    // Schedule logout after warning period
    logoutTimerRef.current = setTimeout(() => {
      performLogout();
    }, warningBefore);
  }, [warningBefore, performLogout]);

  const resetIdleTimer = useCallback(() => {
    // Don't reset if warning is actively showing — user must call extendSession
    if (warningActiveRef.current) return;

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      startWarningCountdown();
    }, idleTimeout);
  }, [idleTimeout, startWarningCountdown]);

  const extendSession = useCallback(() => {
    clearAllTimers();
    warningActiveRef.current = false;
    setIsIdle(false);
    setShowWarning(false);
    setTimeRemaining(Math.floor(warningBefore / 1000));
    resetIdleTimer();
  }, [clearAllTimers, warningBefore, resetIdleTimer]);

  // Activity event listeners
  useEffect(() => {
    const handleActivity = () => {
      resetIdleTimer();
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the initial idle timer
    resetIdleTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [resetIdleTimer, clearAllTimers]);

  // Supabase auth event listeners
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearAllTimers();
        warningActiveRef.current = false;
        setIsIdle(false);
        setShowWarning(false);
        window.location.href = '/auth/login';
      }
      // TOKEN_REFRESHED: silently update — no visible action needed
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearAllTimers]);

  return {
    isIdle,
    showWarning,
    timeRemaining,
    extendSession,
  };
}
