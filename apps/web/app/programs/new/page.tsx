'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { CoachGate } from '@/components/CoachGate';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';

export default function NewProgramPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const docRef = await addDoc(collection(db, 'programs'), {
      coachId: user.uid,
      name,
      description,
      createdAt: serverTimestamp(),
    });

    router.push(`/programs/${docRef.id}`);
  };

  return (
    <CoachGate>
      <main>
        <h1>Create Program</h1>
        <form onSubmit={onSubmit}>
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(event) => setName(event.target.value)} required />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
          />

          <button type="submit">Create Program</button>
        </form>
      </main>
    </CoachGate>
  );
}
