import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { User } from '@supabase/supabase-js';

export function ProtectedRoute({ user }: { user: User | null }) {
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Defer navigation check until after initial render
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, segments, isNavigationReady]);

  return null;
} 