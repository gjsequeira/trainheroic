'use client';

import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { CoachGate } from '@/components/CoachGate';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { Program } from '@/lib/types';

export default function AthleteDetailPage() {
  const params = useParams<{ id: string }>();
  const athleteId = params.id;
  const { user } = useAuth();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [weeks, setWeeks] = useState(4);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPrograms = async () => {
      if (!user) {
        return;
      }

      const snap = await getDocs(query(collection(db, 'programs'), where('coachId', '==', user.uid)));
      const nextPrograms = snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Program, 'id'>) }));
      setPrograms(nextPrograms);

      if (nextPrograms.length > 0) {
        setProgramId(nextPrograms[0].id);
      }
    };

    void loadPrograms();
  }, [user]);

  const onAssign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    await addDoc(collection(db, 'assignments'), {
      athleteId,
      coachId: user.uid,
      programId,
      startDate,
      weeks,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    setMessage('Assignment created. Schedule generation trigger will process it.');
  };

  return (
    <CoachGate>
      <main>
        <h1>Athlete Assignment</h1>
        <p>Athlete ID: {athleteId}</p>

        <form onSubmit={onAssign}>
          <label htmlFor="program">Program</label>
          <select id="program" value={programId} onChange={(event) => setProgramId(event.target.value)} required>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>

          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />

          <label htmlFor="weeks">Weeks</label>
          <input
            id="weeks"
            type="number"
            min={1}
            value={weeks}
            onChange={(event) => setWeeks(Number(event.target.value))}
            required
          />

          <button type="submit" disabled={!programId}>
            Create Assignment
          </button>
        </form>

        {message ? <p>{message}</p> : null}
      </main>
    </CoachGate>
  );
}
