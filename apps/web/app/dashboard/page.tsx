'use client';

import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CoachGate } from '@/components/CoachGate';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { Program, UserDoc } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [athletes, setAthletes] = useState<UserDoc[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        return;
      }

      const programsSnap = await getDocs(query(collection(db, 'programs'), where('coachId', '==', user.uid)));
      const athletesSnap = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'athlete'), where('coachId', '==', user.uid)),
      );

      setPrograms(programsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Program, 'id'>) })));
      setAthletes(athletesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<UserDoc, 'id'>) })));
    };

    void load();
  }, [user]);

  return (
    <CoachGate>
      <main>
        <h1>Dashboard</h1>

        <p>
          <Link href="/programs/new">Create Program</Link> | <Link href="/athletes">View Athletes</Link>
        </p>

        <section>
          <h2>Programs</h2>
          <ul>
            {programs.map((program) => (
              <li key={program.id}>
                <Link href={`/programs/${program.id}`}>{program.name}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Athletes</h2>
          <ul>
            {athletes.map((athlete) => (
              <li key={athlete.id}>
                <Link href={`/athletes/${athlete.id}`}>{athlete.displayName ?? athlete.email ?? athlete.id}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </CoachGate>
  );
}
