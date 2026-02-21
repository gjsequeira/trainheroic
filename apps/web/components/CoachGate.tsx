'use client';

import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { UserDoc } from '@/lib/types';

export function CoachGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (loading) {
        return;
      }

      if (!user) {
        router.replace('/login');
        setCheckingRole(false);
        return;
      }

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const userData = userSnap.data() as Omit<UserDoc, 'id'> | undefined;

      if (!userData || userData.role !== 'coach') {
        router.replace('/login');
        setCheckingRole(false);
        return;
      }

      setAuthorized(true);
      setCheckingRole(false);
    };

    void check();
  }, [loading, router, user]);

  if (loading || checkingRole) {
    return <p>Loading...</p>;
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
