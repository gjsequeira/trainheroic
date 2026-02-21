'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { CoachGate } from '@/components/CoachGate';
import { db } from '@/lib/firebase';
import { ProgramWorkout } from '@/lib/types';

export default function ProgramDetailPage() {
  const params = useParams<{ id: string }>();
  const programId = params.id;

  const [workouts, setWorkouts] = useState<ProgramWorkout[]>([]);
  const [dayIndex, setDayIndex] = useState(0);
  const [itemsInput, setItemsInput] = useState('');

  const loadWorkouts = async () => {
    const snap = await getDocs(query(collection(db, 'program_workouts'), where('programId', '==', programId)));
    const nextWorkouts = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ProgramWorkout, 'id'>),
    }));

    nextWorkouts.sort((a, b) => a.dayIndex - b.dayIndex);
    setWorkouts(nextWorkouts);
  };

  useEffect(() => {
    void loadWorkouts();
  }, [programId]);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await addDoc(collection(db, 'program_workouts'), {
      programId,
      dayIndex,
      items: itemsInput
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    });

    setItemsInput('');
    await loadWorkouts();
  };

  const onUpdate = async (workout: ProgramWorkout) => {
    const nextItems = prompt('Workout items (newline separated):', workout.items.join('\n'));
    if (nextItems === null) {
      return;
    }

    const nextDay = prompt('Day index:', String(workout.dayIndex));
    if (nextDay === null) {
      return;
    }

    await updateDoc(doc(db, 'program_workouts', workout.id), {
      dayIndex: Number(nextDay),
      items: nextItems
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    });

    await loadWorkouts();
  };

  const onDelete = async (id: string) => {
    await deleteDoc(doc(db, 'program_workouts', id));
    await loadWorkouts();
  };

  return (
    <CoachGate>
      <main>
        <h1>Program Workouts</h1>
        <p>Program ID: {programId}</p>

        <form onSubmit={onCreate}>
          <label htmlFor="dayIndex">Day Index</label>
          <input
            id="dayIndex"
            type="number"
            value={dayIndex}
            onChange={(event) => setDayIndex(Number(event.target.value))}
            min={0}
            required
          />

          <label htmlFor="items">Items (one per line)</label>
          <textarea
            id="items"
            rows={6}
            value={itemsInput}
            onChange={(event) => setItemsInput(event.target.value)}
            required
          />

          <button type="submit">Add Workout Template</button>
        </form>

        <ul>
          {workouts.map((workout) => (
            <li key={workout.id}>
              <strong>Day {workout.dayIndex}</strong>
              <ul>
                {workout.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <button type="button" onClick={() => void onUpdate(workout)}>
                Edit
              </button>
              <button type="button" onClick={() => void onDelete(workout.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </main>
    </CoachGate>
  );
}
