'use client';

import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CoachGate } from '@/components/CoachGate';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { UserDoc } from '@/lib/types';

export default function AthletesPage() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<UserDoc[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        return;
      }

      const snap = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'athlete'), where('coachId', '==', user.uid)),
      );

      setAthletes(snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<UserDoc, 'id'>) })));
    };

    void load();
  }, [user]);

  return (
    <CoachGate>
      <main>
        <h1>Athletes</h1>
        <ul>
          {athletes.map((athlete) => (
            <li key={athlete.id}>
              <Link href={`/athletes/${athlete.id}`}>{athlete.displayName ?? athlete.email ?? athlete.id}</Link>
            </li>
          ))}
        </ul>
      </main>
    </CoachGate>
  );
}
